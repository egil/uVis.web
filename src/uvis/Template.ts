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
        private _children: ud.Dictionary<Template>;
        private _rowCount: Rx.IObservable<number>;
        private _lastRowCount: number = 0;
        private _properties: ud.Dictionary<pt.uvis.IPropertyTemplate<any, Rx.IObservable<any>>> = new ud.Dictionary<pt.uvis.IPropertyTemplate>();
        private _rows: Rx.IObservable<any>;
        private _bundles = new Array<uc.uvis.Bundle>();
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

        get children(): ud.Dictionary<Template> {
            if (this._children === undefined) {
                this._children = new ud.Dictionary<Template>();
            }

            return this._children;
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

        // A bundle is a component created by the parent
        // template. We can ask it for its container for
        // the components this template has created for it.
        get bundles(): uc.uvis.Bundle[] {
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
        
        initialize() {
            if (this.state !== TemplateState.INACTIVE) {
                throw new Error('Cannot initialize when state is not INACTIVE. Call dispose() first to put template into an inactive state.');
            }

            this._state = TemplateState.ACTIVE;

            this._componentFactory = Rx.Observable.createWithDisposable(observer => {
                var group = new Rx.CompositeDisposable();
                var parentCompleted = false;
                var rowCountCompleted = false;
                var setCompletedState = () => {
                    if (rowCountCompleted && (parentCompleted || this.parent.state === TemplateState.COMPLETED)) {
                        this._state = TemplateState.COMPLETED;
                        observer.onCompleted();
                    }
                };

                // Create the function that takes new components
                // and pushes them to the observer.
                this._nextComponent = (component) => {
                    observer.onNext(component);
                };

                // Subscribe to parent's component stream, if there is a parent.
                // Create bundles based on parents components
                if (this.parent !== undefined) {
                    group.add(this.parent.components.subscribe(component => {                        
                        // Create a bundle for this component, if it does
                        // not already have one.
                        var bundle = component.bundles.get(this.name);
                        if (bundle === undefined) {
                            bundle = component.createBundle(this);
                        }
                                        
                        // Add components to bundle
                        this.updateComponentCountInBundle(this._lastRowCount, bundle);

                    }, observer.onError.bind(observer), () => {
                        parentCompleted = true;
                        setCompletedState();
                    }));
                } else {
                    // If there are no parent, create a default bundle
                    // to hold this templates components. This template
                    // is a 'form' since it is at the top of the template data tree.
                    this.bundles[0] = new uc.uvis.Bundle(this);
                    
                    parentCompleted = true;
                }

                // Subscribe to rowCount observable.
                group.add(this.rowCount.subscribe(newCount => {
                    this._lastRowCount = newCount;
                    this.updateComponentCount(newCount);
                }, observer.onError.bind(observer), () => {
                    rowCountCompleted = true;
                    setCompletedState();
                }));

                return group;
            }).publish();

            //// We create a custom observable that will subscribe to the
            //// parent's components observable (if there is a parent) and
            //// the rowCount observable and create new components based on 
            //// components form the parent and the row count.
            ////
            //// We use the publish method to transform the observable
            //// into a ConnectableObservable, such that we can start
            //// the observable even if there are no subscribers yet.
            //this._componentFactory = Rx.Observable.createWithDisposable(observer => {
            //    var parentSubscription: Rx._IDisposable;
            //    var rowCountSubscription: Rx._IDisposable;
            //    var parentCompleted = false;
            //    var rowCountCompleted = false;
            //    var setCompletedState = () => {
            //        if (parentCompleted || this.parent.state === TemplateState.COMPLETED && rowCountCompleted) {
            //            this._state = TemplateState.COMPLETED;
            //            observer.onCompleted();
            //        }
            //    };

            //    // Create the function that takes new components
            //    // and pushes them to the observer.
            //    this._nextComponent = (component) => {
            //        observer.onNext(component);
            //    };

            //    // Subscribe to parent's component stream, if there 
            //    // is a parent.
            //    if (this.parent !== undefined) {
            //        parentSubscription = this.parent.components.subscribe(component => {
            //            this.addBundleComponent(this._lastRowCount, component);
            //        }, observer.onError.bind(observer), () => {
            //            parentCompleted = true;
            //            setCompletedState();
            //        });
            //    } else {
            //        parentCompleted = true;
            //    }

            //    // Subscribe to rowCount observable.
            //    rowCountSubscription = this.rowCount.subscribe(newCount => {
            //        this._lastRowCount = newCount;
            //        this.updateComponentCount(newCount);
            //    }, observer.onError.bind(observer), () => {
            //        rowCountCompleted = true;
            //        setCompletedState();
            //    });

            //    // Then create a disposable that can unsubscribe to the 
            //    // parent components and rowCount observable when needed.
            //    return Rx.Disposable.create(() => {
            //        if (parentSubscription !== undefined) {
            //            parentSubscription.dispose();
            //            parentSubscription = undefined;
            //        }
            //        rowCountSubscription.dispose();
            //        rowCountSubscription = undefined;
            //        observer.onCompleted();
            //    });
            //}).publish();

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

            this._state = TemplateState.INACTIVE;
        }

        // This is triggered when the rowCount observable produces a new 'count'
        private updateComponentCount(count: number) {
            this.bundles.forEach(bundle => {
                this.updateComponentCountInBundle(count, bundle);
            });
        }

        //// This is triggered when a the parent template produces new components
        //private addBundleComponent(count: number, component: uc.uvis.Component) {
        //    // At, by calling createBundle, the component will be making a
        //    // bundle for us that it will track the lifetime of.
        //    var bundle = component.createBundle(this);

        //    // Then we can add components created by this template to the bundle
        //    this.updateComponentCountInBundle(count, bundle, component);
        //}

        private updateComponentCountInBundle(count: number, bundle: uc.uvis.Bundle) {
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
                    // TODO: Create component based on this.type                    
                    var component = new uc.uvis.Component(this, bundle, index, bundle.parent);
                    bundle.add(component);
                    this._nextComponent(component);
                }
            }
        }
    }
}