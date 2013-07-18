/// <reference path="../.typings/rx.js.d.ts" />
import ud = require('util/Dictionary');
import ut = require('uvis/Template');
import pt = require('uvis/PropertyTemplate');

export module uvis {

    export class Bundle {
        private _components = new Array<Component>();
        private _subject = new Rx.Subject<Component>();
        private _template: ut.uvis.Template;
        private _parent: Component;

        constructor(template: ut.uvis.Template, parent?: Component) {
            this._template = template;
            this._parent = parent;
        }

        get existing(): Component[] {
            return this._components;
        }

        /**
         * Return an observable that will produce components
         * that is added to it.
         */
        get components(): Rx.IObservable<Component> {
            return this._subject.startWith.apply(this._subject, this.existing);
        }

        /**
         * Get the template that produced components in this bundle.
         */
        get template(): ut.uvis.Template {
            return this._template;
        }

        /**
         * Get the parent component for this bundle.
         */
        get parent(): Component {
            return this._parent;
        }

        /**
         * Get the name of the bundle.
         */
        get name(): string {
            return this._template.name;
        }

        /**
         * Get the number of components in the bundle.
         */
        get count(): number {
            return this._components.length;
        }

        /**
         * Add a component to the bundle.
         */
        add(component: Component) {
            // Add new component to the proper position
            this._components[component.index] = component;
            // Push it to subscribers
            this._subject.onNext(component);
        }

        /**
         * Removes a component at a specific index, or
         * from the end of the components collection.
         * When removed, the component is also disposed.
         */
        remove(index?: number) {
            if (index === undefined) {
                var c = this._components.pop();
                c.dispose(false);
            } else {
                this._components.splice(index, 1)[0].dispose(false);
            }
        }

        dispose() {
            // Dispose of all components in bundle
            var c;
            while (c = this._components.pop()) c.dispose();

            // Signal to subscribers that no more components are coming
            this._subject.onCompleted();

            // Dispose of subject, frees all resources
            this._subject.dispose();

            // Release all variables
            this._components = null;
            this._subject = null;
            this._template = null;
        }
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
        private _bundle: Bundle;
        private _bundles: ud.Dictionary<Bundle>;
        private _properties: ud.Dictionary<ComponentProperty<any, Rx.IObservable<any>>> = new ud.Dictionary<ComponentProperty>();

        constructor(template: ut.uvis.Template, bundle: Bundle, index: number, parent?: Component) {
            this._template = template;
            this._bundle = bundle;
            this._index = index;
            this._parent = parent;
        }

        /**
         * Get the template that created the component.
         */
        get template() {
            return this._template;
        }

        /**
         * Get the bundle that the component belongs to.
         */
        get bundle(): Bundle {
            return this._bundle;
        }

        /**
         * Get the components index in the bundle it belongs to.
         */
        get index() {
            return this._index;
        }

        /**
         * Get the components parent in the instance data tree.
         */
        get parent() {
            return this._parent;
        }

        /**
         * Get the bundles the component is the parent of.
         */
        get bundles(): ud.Dictionary<Bundle> {
            if (this._bundles === undefined) {
                this._bundles = new ud.Dictionary<Bundle>();
            }
            return this._bundles;
        }

        /**
         * Multi purpose function that will retrive either:
         * 
         *  - Bundle: get(bundleName: string) 
         *  - Component in a specific bundle: get(bundleName: string, index: number)
         *  - Property on a component in a specific bundle: get(bundleName: string, index: number, propertyName: string)
         *
         * It will create bundles and components first if they do not exist.
         */
        get<T>(bundleName: string, index?: number, propertyName?: string): Rx.IObservable<T> {
            var bundle = this.bundles.get(bundleName);
            var res: Rx.IObservable<T>;

            // Try to create bundle if it does not exist
            if (bundle === undefined) {
                var template = this.template.children.get(bundleName);

                // If there is no template by the requested name,
                // we return an error message
                if (template === undefined) {
                    return Rx.Observable.throwException('There is no such template that can create the requested bundle. Bundle name = ' + bundleName);
                }

                // Create the bundle and initialize template to get the bundle filled with components.
                // Assert that template is not initialize, otherwise the bundle should exist already.
                bundle = this.createBundle(template);
                template.initialize();

                res = bundle.components;
            }

            // If the property name is specifed, but index is omitted,
            // we set index to its default value of 0.
            if (index === undefined && propertyName !== undefined) {
                index = 0;
            }

            if (index !== undefined) {
                // Select the component from the bundle that matches
                // the index. If a component at 'index' is replaced later,
                // the replaced component will be pushed to subscribers.
                res = bundle.components.where(c=> c.index === index);
            }

            // If the user requested a property, we modify the observable result
            // to produce that instead.
            if (propertyName !== undefined) {
                res = (<Rx.IObservable<Component>>res).select(c => c.property(propertyName)).switchLatest();
            }

            return res;
        }

        property<T>(name: string): Rx.IObservable<T> {
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

                cp.creating = false;

                return cp.property;
            } else {
                return Rx.Observable.throwException('Component property "' + name + '" was not found.');
            }
        }

        createBundle(template: ut.uvis.Template): Bundle {
            if (this.bundles.contains(template.name)) {
                throw new Error('A bundle already exists for this template.');
                console.error(template);
                console.error(this);
            }

            // Create the bundle, add it to the local
            // bundles collection and to the templates
            // bundles collection.
            var bundle = new Bundle(template, this);
            this.bundles.add(template.name, bundle);
            template.bundles.push(bundle);

            return bundle;
        }

        /**
         * Dispose of this component.
         */
        dispose(removeFromBundle: boolean = true) {
            // Unsubscribe from properties
            this._properties.forEach((name, cp) => {
                if (cp.subscription !== undefined) {
                    cp.subscription.dispose();
                }
            });

            // Make sure there are no references left
            this._properties.removeAll();

            // Dispose of my child components
            this.bundles.forEach((name, bundle) => {
                // First remove the bundle from the template, so it 
                // knows not to produce more components for the bundle.
                var bindex = bundle.template.bundles.indexOf(bundle);
                bundle.template.bundles.splice(bindex, 1);
                // Then dispose of the bundle, disposing of all 
                // child components in the bundle.
                bundle.dispose();
            });

            // Make sure there are no references left
            this.bundles.removeAll();

            // Remove this component from its bundle
            if (removeFromBundle) this.bundle.remove(this.index);

            // Unreference template, parent, etc.
            this._template = null;
            this._parent = null;
            this._bundle = null;
            this._bundles = null;
            this._properties = null;
        }
    }
}