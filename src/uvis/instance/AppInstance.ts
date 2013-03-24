import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uihtiM = module('uvis/instance/HTMLTemplateInstance');

export module uvis.instance {
    export class AppInstance {
        private _dataSources = new uudM.uvis.util.Dictionary();
        private _screens = new uudM.uvis.util.Dictionary();
        private _propertySets = new uudM.uvis.util.Dictionary();
        private _name: string;
        private _description: string;

        constructor(name?: string) {
            this._name = name;
        }
        
        get dataSources() {
            return this._dataSources;
        }

        set dataSources(value) {
            this._dataSources = value;
        }

        get screens() {
            return this._screens;
        }

        set screens(value) {
            this._screens = value;
        }

        get propertySets() {
            return this._propertySets;
        }

        set propertySets(value) {
            this._propertySets = value;
        }

        get name() {
            return this._name;
        }

        set name(value) {
            this._name = value;
        }

        get description() {
            return this._description;
        }

        set description(value) {
            this._description = value;
        }

        public initialize() {
            var s = this.screens.get('/');
            if (s) {
                var body = document.body;

                // remove existing content from body
                // warning: possible memory leak here if events
                // are bound to the nodes being removed.
                while (body.firstChild) {
                    body.removeChild(body.firstChild);
                }

                // update the id 
                body.setAttribute('id', s.template.id);

                // insert all nodes at once
                body.appendChild(s.getContent());
            } else {
                alert('No screen found matching the URL');
            }
        }
    }
}