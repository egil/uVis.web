import ut = require('uvis/Template');
import uc = require('uvis/Component');

export module uvis {
    export class Bundle {
        private _components = new Array<uc.uvis.Component>();
        private _subject = new Rx.Subject<uc.uvis.Component>();
        private _template: ut.uvis.Template;
        private _parent: uc.uvis.Component;

        constructor(template: ut.uvis.Template, parent?: uc.uvis.Component) {
            this._template = template;
            this._parent = parent;
        }

        get existing(): uc.uvis.Component[] {
            return this._components;
        }

        /**
         * Return an observable that will produce components
         * that is added to it.
         */
        get components(): Rx.IObservable<uc.uvis.Component> {
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
        get parent(): uc.uvis.Component {
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
        add(component: uc.uvis.Component) {
            // Add new component to the proper position
            if (this._components[component.index] !== undefined) {
                throw new Error('Unable to add component to bundle. Another bundle is already added to that index.');
            }
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

        /**
         * Marks the bundle as complete. No more components will
         * be added to it or removed from it from this point.
         */
        markCompleted() {
            this._subject.onCompleted();
        }

        dispose() {
            // Dispose of all components in bundle
            var c;
            while (c = this._components.pop()) c.dispose(false);

            // Signal to subscribers that no more components are coming
            this._subject.onCompleted();

            // Dispose of subject, frees all resources
            this._subject.dispose();

            // Release all variables
            this._components = null;
            this._subject = null;
            this._template = null;
        }

        visited = false;
        updated = false;
    }
}