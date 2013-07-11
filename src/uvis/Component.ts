/// <reference path="../.typings/rx.js.d.ts" />
import ud = require('util/Dictionary');
import ut = require('uvis/Template');
//import up = require('uvis/Property');

export module uvis {

    interface Bundle {
        template: ut.uvis.Template;
        components: Component[];
    }

    export class Component {
        private _template: ut.uvis.Template;
        private _index: number;
        private _parent: Component;
        private _bundles: ud.Dictionary<Bundle>;

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

        private get bundles(): ud.Dictionary<Bundle> {
            if (this._bundles === undefined) {
                this._bundles = new ud.Dictionary<Bundle>();
            }
            return this._bundles;
        }

        createBundle(template: ut.uvis.Template): Component[] {
            // We also need to store a reference to the template
            // we created a bundle for, so we can remove it again
            // if we are disposed.
            var bundle: Bundle = {
                components: new Array<Component>(),
                template: template
            };

            this.bundles.add(template.name, bundle);

            return bundle.components;
        }

        getBundle(template: ut.uvis.Template): Component[] {
            var bundle = this.bundles.get(template.name);
            return bundle.components;
        }

        dispose() {                                   
            // TODO: Unsubscribe from properties

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
                    console.error(bundle.template);
                    console.error(this);
                    throw new Error('Cannot remove myself from template bundles array, I am not the last one.')
                }
            });

            // Make sure there are no references left
            this.bundles.removeAll();
        }
    }
}