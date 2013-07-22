/// <reference path="../.typings/rx.js.binding.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('util/Dictionary');
import uc = require('uvis/Component');
import uhc = require('uvis/components/HTMLComponent');
import ub = require('uvis/Bundle');
import pt = require('uvis/PropertyTemplate');

export module uvis {

    declare var nextTick: (fn: () => void ) => void;

    export enum TemplateState {
        INACTIVE,
        ACTIVE,
        COMPLETED,
        DISPOSED
    }

    export class Template {
        private _state = TemplateState.INACTIVE;
        private _name: string;
        private _type: string;
        private _subtype: string;
        private _parent: Template;
        private _children: ud.Dictionary<Template>;
        private _rowCount: Rx.IObservable<number>;
        private _properties: ud.Dictionary<pt.uvis.IPropertyTemplate<any, Rx.IObservable<any>>> = new ud.Dictionary<pt.uvis.IPropertyTemplate>();
        private _rows: Rx.IObservable<any>;
        private _bundles = new Array<ub.uvis.Bundle>();
        private _componentFactory: Rx.ConnectableObservable<uc.uvis.Component>;
        private _componentFactoryConnection: Rx._IDisposable;

        constructor(name: string, type: string, parent?: Template, rows?: Rx.IObservable<any>) {
            this._name = name;
            this._type = type;            
            this._parent = parent;

            // Extract subtype and type. type#subtype
            var typeSplitter = /([a-zA-Z]+)\x23([a-zA-Z]+)/.exec(type);
            if (typeSplitter !== null) {
                this._type = typeSplitter[1];
                this._subtype = typeSplitter[2];
            }

            // Register as child template with parent
            if (parent !== undefined) {
                parent.children.add(name, this);
            }

            // Make sure we have a data source for this template
            if (parent === undefined && rows === undefined) {
                // If there are no parent and no data source, this is a form template.
                // Then we default to creating one component.
                this._rows = rows = Rx.Observable.returnValue(1);
            } else {
                // Wrap the rows observable in a publish + refcount
                this._rows = rows === undefined ? parent.rows : rows.replay(null, 1).refCount();
            }

            // Create rowCount observable, that extends the rows observable and
            // determines how many components should be created.
            this._rowCount = rows === undefined ? parent.rowCount : this._rows.select(result => {
                // If it is an array, produe as many as there
                // are elements in the array.               
                if (Array.isArray(result))
                    return result.length;
                // If it is a number, produce the amount the
                // number indicates
                else if (typeof result === 'number')
                    return result;
                // Last option, we produce a single component.
                else
                    return 1;
            });

            // Create the special 'row' property for component instances.
            // It makes the data element associated with their index
            // available to them.
            var rowPropertyTemplate = new pt.uvis.ComputedPropertyTemplate('row',
                (component: uc.uvis.Component) => {
                    // If 'rows' produces an array, 'row' selects the
                    // component.index element in the array.
                    // Otherwise it returns the the data as is.
                    return this.rows.select(data => {
                        if (Array.isArray(data)) {
                            return data[component.index];
                        } else {
                            return data;
                        }
                    });
                }, undefined, true /* internal */);           
            // ... and add it to the properties dictionary.
            this.properties.add(rowPropertyTemplate.name, rowPropertyTemplate);

            
            // Create the special 'id' property
            this.properties.add('id', new pt.uvis.ComputedPropertyTemplate<string>('id', c => {
                var bi = c.bundle.parent === undefined ? 0 : c.bundle.parent.index;
                return Rx.Observable.returnValue(this.name + '-' + bi + '-' + c.index);
            }));
        }

        get state(): TemplateState {
            return this._state;
        }

        get name(): string {
            return this._name;
        }

        get parent(): Template {
            return this._parent;
        }

        get children(): ud.Dictionary<Template> {
            if (this._children === undefined) {
                this._children = new ud.Dictionary<Template>();
            }

            return this._children;
        }

        get type(): string {
            return this._type;
        }

        get subtype(): string {
            return this._subtype;
        }

        get rows(): Rx.IObservable<any> {
            return this._rows;
        }

        get rowCount(): Rx.IObservable<number> {
            return this._rowCount;
        }

        get properties(): ud.Dictionary<pt.uvis.IPropertyTemplate<T, Rx.IObservable<T>>> {
            return this._properties;
        }

        get bundles(): ub.uvis.Bundle[] {
            return this._bundles;
        }

        get components(): Rx.IObservable<uc.uvis.Component> {
            // If the template has not been initialized,
            // we do so now, so it starts producing components.
            if (this.state === TemplateState.INACTIVE) {
                this.initialize();
            }

            return this._componentFactory.startWith.apply(this._componentFactory, this.existingComponents);
        }

        get existingComponents(): uc.uvis.Component[] {
            return this.bundles.reduce((res, bundle) => {
                return res.concat(bundle.existing);
            }, new Array<uc.uvis.Component>());
        }

        /**
         * Selects a single component from the first bundle. 
         * Use this method to select a form component in a instance data tree.
         * This method is only usedful when called on a form template 
         * that creates the form components.
         */
        getForm(index: number = 0): Rx.IObservable<uc.uvis.Component> {
            if (this.state === TemplateState.INACTIVE) {
                this.initialize();
            }
            return this.bundles[0].components.where(c=> c.index === index);
        }

        initialize() {
            if (this.state !== TemplateState.INACTIVE) {
                throw new Error('Template already initialized.');
            }

            this._componentFactory = Rx.Observable.createWithDisposable(observer => {
                var disposables = new Rx.CompositeDisposable();
                var latestRowCount = 0;
                var parentCompleted = false;
                var rowCountCompleted = false;

                // Internal function that keeps track of the state the of the subscriptions.
                var setCompletedState = () => {
                    if (rowCountCompleted && (parentCompleted || this.parent.state === TemplateState.COMPLETED)) {
                        this._state = TemplateState.COMPLETED;
                        observer.onCompleted();

                        // Mark all bundles as complete as well
                        this.bundles.forEach(b => b.markCompleted());
                    }
                };

                // Internal function that will update the number of components in a bundle.
                var updateComponentCountInBundle = (count: number, bundle: ub.uvis.Bundle) => {
                    var orgLength = bundle.count;

                    // If count is lower then current number (length),
                    // we remove the extraneous components and dispose of them.
                    if (orgLength > count) {
                        while (bundle.count > count) {
                            bundle.remove();
                        }
                    } else if (orgLength < count) {
                        // Otherwise we add additional components to the bundle
                        for (var index = orgLength; index < count; index++) {
                            var component = Template.componentFactory(this.type, this, bundle, index, bundle.parent);
                            bundle.add(component);

                            // Send the newly created to observer
                            observer.onNext(component);
                        }
                    }
                }

                // Subscribe to parent's component stream, if there is a parent.
                // Creates bundles based on parents components.
                if (this.parent !== undefined) {
                    disposables.add(this.parent.components.subscribe(component => {                        
                        // Create a bundle for this component, if it does
                        // not already have one.
                        var bundle = component.bundles.get(this.name);
                        if (bundle === undefined) {
                            bundle = component.createBundle(this);
                        }

                        // Add components to the bundle
                        updateComponentCountInBundle(latestRowCount, bundle);

                    }, observer.onError.bind(observer), () => {
                        // Note that parent template observable is completed.
                        parentCompleted = true;
                        nextTick(setCompletedState);
                    }));
                } else {
                    // If there are no parent, create a default bundle
                    // to hold this templates components. This template
                    // is a 'form' since it is at the top of the template data tree.
                    this.bundles[0] = new ub.uvis.Bundle(this);
                    parentCompleted = true;
                }

                // Subscribe to rowCount observable.
                disposables.add(this.rowCount.subscribe(count => {
                    // Update the number of components in each bundle
                    latestRowCount = count;
                    this.bundles.forEach(bundle => { updateComponentCountInBundle(latestRowCount, bundle); });

                }, observer.onError.bind(observer), () => {
                    // Note that rowCount observable is completed.
                    rowCountCompleted = true;
                    nextTick(setCompletedState);
                }));

                // Set state to active once we finished subscribing to our sources
                this._state = TemplateState.ACTIVE;

                return disposables;
            }).publish();

            // Then we use the conenct method start creating components.
            this._componentFactoryConnection = this._componentFactory.connect();
        }
        
        private static componentFactory(type: string, source: Template, bundle: ub.uvis.Bundle, index: number, parent?: uc.uvis.Component): uc.uvis.Component {
            // TODO: download the source code for the type and instantiate it.
            // For now, we just create an HTML component.
            var res = new uhc.uvis.component.HTMLComponent(source, bundle, index, parent);
            return <uc.uvis.Component>res;
        }

        dispose() {
            // End subscription to rows
            if (this._componentFactoryConnection !== undefined) {
                this._componentFactoryConnection.dispose();
            }

            // Dispose all components
            var bundle;
            while (bundle = this.bundles.pop()) {
                bundle.dispose();
            }

            // Dispose of all children
            this.children.forEach((_, child) => child.dispose());
            this.children.removeAll();

            // Dispose of all properties
            this.properties.forEach((_, prop) => prop.dispose());
            this.properties.removeAll();

            this._parent = null;
            this._bundles = null;
            this._rowCount = null;
            this._children = null;
            this._properties = null;
            this._rows = null;
            this._componentFactory = null;
            this._componentFactoryConnection = null;

            this._state = TemplateState.DISPOSED;
        }
    }
}