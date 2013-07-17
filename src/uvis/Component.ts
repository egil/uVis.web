/// <reference path="../.typings/rx.js.d.ts" />
import ud = require('util/Dictionary');
import ut = require('uvis/Template');
import pt = require('uvis/PropertyTemplate');

export module uvis {

    export interface Bundle {
        template: ut.uvis.Template;
        components: Component[];
    }

    export interface ComponentProperty<T, O extends Rx.IObservable<T>> {
        property?: O;
        subscription?: Rx._IDisposable;
        creating: bool;
    }

    export class Component {
        private _template: ut.uvis.Template;
        private _index: number;
        private _parent: Component;
        private _bundles: ud.Dictionary<Bundle>;
        private _properties: ud.Dictionary<ComponentProperty<any, Rx.IObservable<any>>> = new ud.Dictionary<ComponentProperty>();

        constructor(template: ut.uvis.Template, index: number, parent?: Component) {
            this._template = template;
            this._index = index;
            this._parent = parent;
        }

        get index() {
            return this._index;
        }

        get parent() {
            return this._parent;
        }

        get template() {
            return this._template;
        }

        get bundles(): ud.Dictionary<Bundle> {
            if (this._bundles === undefined) {
                this._bundles = new ud.Dictionary<Bundle>();
            }
            return this._bundles;
        }

        getProperty<T>(name: string): Rx.IObservable<T> {
            var cp = this._properties.get(name);

            // If the property already exists, return it.
            if (cp !== undefined && cp.property !== undefined) {
                return cp.property;
            }
            // If we are already creating this property, return an error message
            if (cp !== undefined && cp.creating) {
                return Rx.Observable.throwException('Cyclic dependency detected for property "' + name + '" from template "' + this.template.name);
            }
            
            // Else we try to create the property
            var propTpl = this.template.properties.get(name);                                                                   

            if (propTpl !== undefined) {

                // Create ComponentProperty object, mark it as being created
                cp = { creating: true };

                // Add it to dictionary for reuse later
                this._properties.add(propTpl.name, cp);                                            

                // Create property
                cp.property = propTpl.create(this);
                    
                // If it is a ComputedObservable, we must 
                // connect it to its underlying sequence.
                if (propTpl instanceof pt.uvis.ComputedPropertyTemplate) {
                    cp.subscription = (<Rx.ConnectableObservable>cp.property).connect();
                }

                // If this is a PropertyTemplate, we know that we are handed
                // an subject, so we store a reference to its dispose method 
                // for later use when cleaning up.
                if (propTpl instanceof pt.uvis.PropertyTemplate) {
                    cp.subscription = { dispose: (<Rx.ISubject>cp.property).dispose };
                }

                return cp.property;
            } else {
                return Rx.Observable.throwException('Component property "' + name + '" was not found.');
            }
        }

        createBundle(template: ut.uvis.Template): Component[] {
            if(this.bundles.contains(template.name)) {
                throw new Error('A bundle already exists for this template.');
                console.error(template);
                console.error(this);
            }
            if (template.bundles[this.index] !== undefined) {
                throw new Error('Another component has already added itself to the template\'s bundle array.');
                console.error(template);
                console.error(this);
            }

            // We need to store a reference to the template
            // we created a bundle for, so we can remove it again
            // if we are disposed.
            var bundle: Bundle = {
                components: new Array<Component>(),
                template: template
            };

            // Add this bundle to the local dictionary
            this.bundles.add(template.name, bundle);

            // Add this component to the template
            template.bundles[this.index] = this;
            
            return bundle.components;
        }

        getBundle(template: ut.uvis.Template): Component[] {
            var bundle = this.bundles.get(template.name);
            if (bundle === undefined) {
                throw new Error('No bundle found for template.');
                console.error(template);
                console.error(this);
            }
            return bundle.components;
        }

        dispose() {
            // Unsubscribe from properties
            this._properties.forEach((name, cp) => {
                if (cp.subscription !== undefined) {
                    cp.subscription.dispose();
                }                
            });
            // Make sure there are no references left
            this._properties.removeAll();

            // Dispose of my children, clean up their
            // template's bundle cache.
            this.bundles.forEach((name, bundle) => {
                // Check if this component is the last component in the
                // templates bundles array
                if (bundle.template.bundles.length - 1 === this.index) {
                    // Use pop to remove component
                    bundle.template.bundles.pop();

                    // Dispose of each child, starting with the last
                    var child;
                    while (child = bundle.components.pop()) {
                        child.dispose();
                    }
                } else {
                    throw new Error('Cannot remove myself from template bundles array, I am not the last one.')
                    console.error(bundle.template);
                    console.error(this);
                }
            });

            // Make sure there are no references left
            this.bundles.removeAll();

            // Unreference template, parent, etc.
            this.template = null;
            this.parent = null;
        }
    }
}