/// <reference path="../.typings/rx.js.binding.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('util/Dictionary');
import uc = require('uvis/Component');
import pt = require('uvis/PropertyTemplate');

export module uvis {

    export enum TemplateState {
        INACTIVE,
        ACTIVE,
        COMPLETED
    }

    export class Template {
        private _state: TemplateState = TemplateState.INACTIVE;
        private _name: string;
        private _type: string;
        private _parent: Template;
        private _rowCount: Rx.IObservable<number>;
        private _lastRowCount: number = 0;
        private _properties: ud.Dictionary<pt.uvis.IPropertyTemplate<any, Rx.IObservable<any>>> = new ud.Dictionary<pt.uvis.IPropertyTemplate>();
        private _rows: Rx.IObservable<any>;
        private _bundles = new Array<uc.uvis.Component>();
        private _componentFactory: Rx.ConnectableObservable<uc.uvis.Component>;
        private _componentFactoryConnection: Rx._IDisposable;
        private _nextComponent: (component: uc.uvis.Component) => void;

        constructor(name: string, type: string, parent?: Template, rows?: Rx.IObservable<any>) {
            this._name = name;
            this._type = type;
            this._parent = parent;

            // Make sure we have a data source for this template
            if (parent === undefined && rows === undefined) {
                throw new Error('Invalid arguments. Parent and rows cannot both be undefined.');
            }

            // Wrap the rows observable in a publish + refcount
            this._rows = rows === undefined ? parent.rows : rows.replay(null, 1).refCount();

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
                });

            // ... and add it to the properties dictionary.
            this.properties.add(rowPropertyTemplate.name, rowPropertyTemplate);
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

        get type(): string {
            return this._type;
        }

        get rows(): Rx.IObservable<any> {
            return this._rows;
        }

        get rowCount(): Rx.IObservable<number> {
            return this._rowCount;
        }

        get properties(): ud.Dictionary<pt.uvis.IPropertyTemplate<T, Rx.IObservable<T>>>{
            return this._properties;
        }
       
        /**
         * Multi purpose function that will retrive either:
         * 
         *  - Bundle: get(bundle: number) 
         *  - Component in a specific bundle: get(bundle: number, index: number)
         *  - Property on a component in a specific bundle: get(bundle: number, index: number, name: string)
         *
         * It will create bundles and components first if they do not exist.
         */
        get(bundle: number, index: number, name: string): Rx.IObservable<any> {            
            // We use the components observable to find the right component.
            var res = this.parent === undefined ?
                this.components.where(c => c.index === index) :
                this.components.where(c => c.parent.index === bundle && c.index === index);
            
            // Then we select the component property observable and
            // use switchLatest to subscribe to it.
            //
            // This has two purposes:
            // 1. If the property/component does not exist, we can subscribe to its creation.
            // 2. If the component is removed and added again later, switchLatest will
            //    just switch to the next property observable, selected for it.
            //    That makes it possible for a something to depend on a property on a 
            //    component that is removed and added from time to time.
            return res.select(c => c.getProperty(name)).switchLatest();
        }

        // A bundle is a component created by the parent
        // template. We can ask it for its container for
        // the components this template has created for it.
        get bundles(): uc.uvis.Component[] {
            return this._bundles;
        }

        get components(): Rx.IObservable<uc.uvis.Component> {
            if (this.state !== TemplateState.ACTIVE) {
                this.initialize();
            }
            // The startWith methed is used to send all previous,
            // still valid components to new subscribers.
            return this._componentFactory.startWith.apply(this._componentFactory, this.existingComponents);
        }

        get existingComponents(): uc.uvis.Component[] {
            if (this.parent === undefined) {
                return this.bundles;
            } else {
                var res = [];

                this.bundles.forEach(component => {
                    var bundle = component.getBundle(this);
                    res = res.concat(bundle);
                });

                return res;
            }
        }
        
        initialize() {
            if (this.state === TemplateState.ACTIVE) {
                return;
            }

            this._state = TemplateState.ACTIVE;

            // We create a custom observable that will subscribe to the
            // parent's components observable (if there is a parent) and
            // the rowCount observable and create new components based on 
            // components form the parent and the row count.
            //
            // We use the publish method to transform the observable
            // into a ConnectableObservable, such that we can start
            // the observable even if there are no subscribers yet.
            this._componentFactory = Rx.Observable.createWithDisposable(observer => {
                var parentSubscription: Rx._IDisposable;
                var rowCountSubscription: Rx._IDisposable;
                var parentCompleted = false;
                var rowCountCompleted = false;
                var completeObserver = () => {
                    if (parentCompleted && rowCountCompleted) {
                        //observer.onCompleted();
                        this._state = TemplateState.COMPLETED;
                    }
                };

                // Create the function that takes new components
                // and pushes them to the observer.
                this._nextComponent = (component) => {
                    observer.onNext(component);
                };

                // Subscribe to parent's component stream, if there 
                // is a parent.
                if (this.parent !== undefined) {
                    parentSubscription = this.parent.components.subscribe(component => {
                        this.addBundleComponent(this._lastRowCount, component);
                    }, observer.onError.bind(observer), () => {
                            parentCompleted = true;
                            completeObserver();
                        });
                } else {
                    parentCompleted = true;
                }

                // Subscribe to rowCount observable.
                rowCountSubscription = this.rowCount.subscribe(newCount => {
                    this._lastRowCount = newCount;
                    this.updateComponentCount(newCount);
                }, observer.onError.bind(observer), () => {
                    rowCountCompleted = true;
                    completeObserver();
                });

                // Then create a disposable that can unsubscribe to the 
                // parent components and rowCount observable when needed.
                return Rx.Disposable.create(() => {
                    if (parentSubscription !== undefined) {
                        parentSubscription.dispose();
                        parentSubscription = undefined;
                    }
                    rowCountSubscription.dispose();
                    rowCountSubscription = undefined;
                    observer.onCompleted();
                });
            }).publish();

            // Then we use the conenct method start creating components.
            this._componentFactoryConnection = this._componentFactory.connect();
        }

        dispose() {
            // End subscription to rows
            if (this._componentFactoryConnection !== undefined) {
                this._componentFactoryConnection.dispose();
            }

            //// Dispose all components
            //var subjectValue;
            //while (subjectValue = this._components.q.pop()) {
            //    subjectValue.value.dispose();
            //}

            //// dispose of components observable
            //this._components.onCompleted();
            //this._components.dispose();
            //this._components = undefined;
            //this._components = undefined;


            this._state = TemplateState.COMPLETED;
        }

        // This is triggered when the rowCount observable produces a new 'count'
        private updateComponentCount(count: number) {
            // If there are no parent, this is the form template,
            // i.e. we are at the top of the template tree.
            if (this.parent === undefined) {
                this.updateComponentCountInBundle(count, this.bundles);
            } else {

                // Get all of the parent templates components
                this.parent.bundles.forEach(component => {
                    // Then for each component, get the bundle that holds
                    // the components this template has created.
                    var bundle = component.getBundle(this);

                    // And update the bundle with more/less components.
                    this.updateComponentCountInBundle(count, bundle, component);
                });
            }
        }

        // This is triggered when a the parent template produces new components
        private addBundleComponent(count: number, component: uc.uvis.Component) {
            // At, by calling createBundle, the component will be making a
            // bundle for us that it will track the lifetime of.
            var bundle = component.createBundle(this);

            // Then we can add components created by this template to the bundle
            this.updateComponentCountInBundle(count, bundle, component);
        }

        private updateComponentCountInBundle(count: number, bundle: uc.uvis.Component[], parent?: uc.uvis.Component) {
            var orgLength = bundle.length;

            // If count is lower then current number (length),
            // we remove the extraneous components and dispose of them.
            if (orgLength > count) {
                // Remove components starting from the new length (count)
                var removedComponents = bundle.splice(count);

                // Then we iterate over each removed component, starting with the
                // last, and dipose each one. It is important that we start with the
                // last component, since it will remove itself from the child template's
                // bundles array it is associated with, and we want to make sure it 
                // that components are removed from the end of the bundle array, otherwise 
                // there can become problems when other components try to remove themselves, 
                // because they expect to be at a certain index, which they might not be at 
                // anymore.
                var removedComp;
                while (removedComp = removedComponents.pop()) {
                    // Calling dispose will trigger the component
                    // to signal to components under it in the
                    // instance data tree to also dispose of themselves.
                    // Thus emptying bundles that this component is the
                    // parent of.
                    removedComp.dispose();
                }

            } else if (orgLength < count) {
                // Otherwise we add additional components to the bundle
                for (var index = orgLength; index < count; index++) {
                    // TODO: Create component based on this.type                    
                    var component = new uc.uvis.Component(this, index, parent);
                    bundle[index] = component;
                }
                // Notify child templates (subscribers) that we
                // have created new components that might need children.
                var newComponents = bundle.slice(orgLength);
                newComponents.forEach(this._nextComponent.bind(this));
            }
        }
    }
}