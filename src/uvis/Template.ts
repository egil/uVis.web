/// <reference path="../.typings/rx.js.binding.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('util/Dictionary');
import uc = require('uvis/Component');
import uhc = require('uvis/components/HTMLComponent');
import ub = require('uvis/Bundle');
import pt = require('uvis/TemplateProperty');

export module uvis {

    declare var nextTick: (fn: () => void ) => void;

    export enum TemplateState {
        INACTIVE,
        READY,
        ACTIVE,
        COMPLETED,
        DISPOSED
    }

    export class Template {
        private _state : TemplateState;
        private _name: string;
        private _type: string;
        private _subtype: string;
        private _parent: Template;
        private _rowsFactory: (t?: Template) => Rx.IObservable<Rx.IObservable<any>>;
        private _rows: Rx.IObservable<any>;
        private _rowCount: Rx.IObservable<number>;
        private _children: ud.Dictionary<Template>;
        private _bundles = new Array<ub.uvis.Bundle>();
        private _properties: ud.Dictionary<pt.uvis.ITemplateProperty<any, Rx.IObservable<any>>> = new ud.Dictionary<pt.uvis.ITemplateProperty>();
        private _components: Rx.ConnectableObservable<uc.uvis.Component>;
        private _componentsConnection: Rx._IDisposable;
        private _activeRequests: string[][] = [];

        constructor(name: string, type: string, parent?: Template, rowsFactory?: (template?: Template) => Rx.IObservable<any>) {
            this._state = TemplateState.INACTIVE;
            this._name = name;
            this._type = type;
            this._parent = parent;
            this._rowsFactory = rowsFactory;                

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
            if (parent === undefined && this._rowsFactory === undefined) {
                // If there are no parent and no data source, this is a form template.
                // Then we default to creating one component.
                this._rows = Rx.Observable.returnValue(1);
                this._state = TemplateState.READY;
            }            

            // Create the special 'row' property for component instances.
            // It makes the data element associated with their index
            // available to them.
            var rowTemplateProperty = new pt.uvis.ComputedTemplateProperty('row',
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
            this.properties.add(rowTemplateProperty.name, rowTemplateProperty);


            // Create the special 'id' property
            // TODO: Duplicated id's are possible...
            this.properties.add('id', new pt.uvis.ComputedTemplateProperty<string>('id', c => {
                var bi = c.bundle.parent === undefined ? 0 : c.bundle.parent.index;
                return Rx.Observable.returnValue(this.name + '-' + bi + '-' + c.index);
            }));
        }

        get state(): TemplateState {
            // If we are using the parent row, and the parent row is READY,
            // but this template has not yet been initialized, we return READY.
            if (this._rowsFactory === undefined &&
                this._state === TemplateState.INACTIVE &&
                this.parent !== undefined &&
                this.parent.state > TemplateState.INACTIVE) {
                return TemplateState.READY;
            }
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
            // Return rows if already INACTIVE or if using parent rows
            if (this._rows !== undefined) return this._rows;
            if (this._rowsFactory === undefined) return this.parent.rows;
            
            // Otherwise we try to create the rows
            this._rows = Rx.Observable.defer(() => {
                var res = this._rowsFactory(this);
                this._state = TemplateState.READY;
                return res;
            }).replay(null, 1).refCount();
            
            return this._rows;
        }

        get activeRequests(): string[][]{
            return this._activeRequests;
        }

        get rowCount(): Rx.IObservable<number> {
            if (this._rowCount !== undefined) return this._rowCount;
            
            // Create rowCount observable that extends the rows observable.
            if (this._rowsFactory === undefined && this.parent !== undefined) {
                this._rowCount = this.parent.rowCount;
            } else {            
                this._rowCount = this.rows.select(result => {
                    // If it is an array, produce as many components as there are elements in the array.               
                    if (Array.isArray(result)) return result.length;
                    // If it is a number, produce as many components as the amount the number indicates.
                    else if (typeof result === 'number') return result;
                    // Anything else, we produce a single component.
                    else return 1;
                });
            }

            return this._rowCount;
        }

        get properties(): ud.Dictionary<pt.uvis.ITemplateProperty<T, Rx.IObservable<T>>> {
            return this._properties;
        }

        get bundles(): ub.uvis.Bundle[] {
            return this._bundles;
        }

        get components(): Rx.IObservable<uc.uvis.Component> {
            // If the template has not been initialized,
            // we do so now, so it starts producing components.
            if (this._components === undefined) {
                this.initialize();
            }

            return this._components.startWith.apply(this._components, this.existingComponents);
        }

        get existingComponents(): uc.uvis.Component[] {
            return this.bundles.reduce((res, bundle) => {
                return res.concat(bundle.existing);
            }, new Array<uc.uvis.Component>());
        }

        /**
         * Retrive the root component of an instance data tree.
         */
        getTree(index: number = 0): Rx.IObservable<uc.uvis.Component> {
            // First we find the form/root of the template data tree
            var templateTreeForm = this;
            while (templateTreeForm.parent !== undefined) {
                templateTreeForm = templateTreeForm.parent;
            }

            // And make sure the form is initialized
            if (templateTreeForm.state === TemplateState.INACTIVE) {
                templateTreeForm.initialize();
            }

            // We know that the form will only have one bundle,
            // so we select it and returns its components filtered to
            // the index we want, e..g the branch of the instance data tree we want.
            return templateTreeForm.bundles[0].components.where(c=> c.index === index);
        }                

        initialize() {
            if (this._components !== undefined) {
                //throw new Error('Template already initialized.');
                //console.warn('Template "' + this.name + '" already initialized.')
                return;
            }

            this._components = Rx.Observable.createWithDisposable(observer => {
                var disposables = new Rx.CompositeDisposable();
                var latestRowCount = 0;
                var parentCompleted = false;
                var rowCountCompleted = false;

                // Internal function that keeps track of the state of the subscriptions.
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
                    var orgCount = bundle.count;

                    // Set state to ACTIVE, indicates this template has produced at least one component.
                    if (count > 0) this._state = TemplateState.ACTIVE;

                    // If count is lower than current number (orgCount),
                    // we remove the extraneous components and dispose of them.
                    if (orgCount > count) {
                        while (bundle.count > count) {
                            bundle.remove();
                        }
                    } else if (orgCount < count) {
                        // Otherwise we add additional components to the bundle
                        for (var index = orgCount; index < count; index++) {
                            var component = Template.componentFactory(this.type, this, bundle, index, bundle.parent);
                            bundle.add(component);

                            // Send the newly INACTIVE to observer
                            observer.onNext(component);
                        }
                    }
                }

                // Subscribe to parent's components observable, if there is a parent.
                // Creates bundles based on parent's components.
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
                        // Mark the parent template observable as completed.
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
                //this._state = TemplateState.ACTIVE;

                return disposables;
            }).publish();

            // Then we use the conenct method start creating components.
            this._componentsConnection = this._components.connect();
        }

        private static componentFactory(type: string, source: Template, bundle: ub.uvis.Bundle, index: number, parent?: uc.uvis.Component): uc.uvis.Component {
            // TODO: download the source code for the type and instantiate it.
            // For now, we just create an HTML component.
            var res = new uhc.uvis.component.HTMLComponent(source, bundle, index, parent);
            return <uc.uvis.Component>res;
        }

        dispose() {
            // End subscription to rows
            if (this._componentsConnection !== undefined) {
                this._componentsConnection.dispose();
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
            this._components = null;
            this._componentsConnection = null;

            this._state = TemplateState.DISPOSED;
        }
    }
}