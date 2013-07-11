/// <reference path="../.typings/rx.js.binding.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('util/Dictionary');
import uc = require('uvis/Component');

export module uvis {
    
    export class Template {
        private _name: string;
        private _type: string;
        private _parent: Template;
        private _rowCount: Rx.IObservable<number>;
        private _rows: Rx.IObservable<any>;
        private _bundles = new Array<uc.uvis.Component>();
        private _components: Rx.IObservable<uc.uvis.Component>;

        constructor(name: string, type: string, parent?: Template, rows?: Rx.IObservable<any>) {
            this._name = name;
            this._type = type;
            this._parent = parent;

            // Make sure we have a data source for this template
            if (parent === undefined && rows === undefined) {
                throw new Error('Invalid arguments. Parent and rows cannot both be undefined.');
            }

            // Wrap the rows observable in a publish + refcount
            this._rows = rows === undefined ? parent.rows : rows.publish().refCount();
            
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

            //// Add special 'row' property for component instances
            //this._properties.add('row', (instance: uc.uvis.Component) => {
            //    // If 'rows' produces an array, 'row' selects the
            //    // instance.index element in the array.
            //    // Otherwise it returns the the data as is.
            //    return instance.get('rows').select(data => {
            //        if (Array.isArray(data)) {
            //            return data[instance.index];
            //        } else {
            //            return data;
            //        }
            //    });
            //});            
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

        // A bundle is a component created by the parent
        // template. We can ask it for its container for
        // the components this template has created for it.
        get bundles(): uc.uvis.Component[] {
            return this._bundles;
        }

        get components(): Rx.IObservable<uc.uvis.Component> {
            // TODO: This inits the generation of components
            // http://stackoverflow.com/questions/17545046/reactive-extensions-how-to-create-a-placeholder-observable/17553861
            return this._components;
        }

        // This is triggered when the rowCount observable produces a new 'count'
        private updateComponentCount(count: number) {
            // If there are no parent, this is the form template,
            // i.e. we are at the top of the template tree.
            if (this.parent === undefined) {
                this.updateComponentCountInBundle(count, this.bundles);
            }

            // Get all of the parent templates components
            this.parent.bundles.forEach(component => {
                // Then for each component, get the bundle that holds
                // the components this template has created.
                var bundle = component.getBundle(this);

                // And update the bundle with more/less components.
                this.updateComponentCountInBundle(count, bundle, component);
            });
        }

        // This is triggered when a the parent template produces new components
        private addBundle(count: number, component: uc.uvis.Component) {
            // At, by calling createBundle, the component will be making a
            // bundle for us that it will track the lifetime of.
            var bundle = component.createBundle(this);

            // Then we can add components created by this template to the bundle
            this.updateComponentCountInBundle(count, bundle, component);

            // Finally, we save the component in this templates bundles array so we can reference
            // it later if this templates rowCount changes and we need to remove or add components
            this.bundles[component.index] = component;
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

            } else {
                // Otherwise we add additional components to the bundle
                for (var index = orgLength; index < count; index++) {
                    var component = new uc.uvis.Component(this, index, parent);
                    bundle[index] = component;
                }
                // Notify child templates (subscribers) that we
                // have created new components that might need children.
                var newComponents = bundle.slice(orgLength);
                newComponents.forEach(this._components.onNext.bind(this));
            }
        }   

        dispose() {
            // TODO!!!

            //// End subscription to rows
            //if (this._rowsSub !== undefined) {
            //    this._rowsSub.dispose();
            //    this._rowsSub = undefined;
            //}

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
        }    
    }
}