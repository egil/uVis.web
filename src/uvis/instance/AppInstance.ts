import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uistiM = module('uvis/instance/ScreenTemplateInstance');
import uihtiM = module('uvis/instance/HTMLTemplateInstance');
import utccM = module('uvis/template/ComputeContext');

export module uvis.instance {
    import utcc = utccM.uvis.template;

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
            var screenTemplate = this.screens.get('/');
            var cc = utcc.extend(utcc.DefaultComputeContext, { map: this.dataSources });
            if (screenTemplate) {
                screenTemplate.createInstance(cc).last((screenInstance: uistiM.uvis.instance.ScreenTemplateInstance) => {

                    // remove existing content from body
                    // warning: possible memory leak here if events
                    // are bound to the nodes being removed.
                    while (document.body.firstChild) {
                        document.body.removeChild(document.body.firstChild);
                    }

                    // update the id 
                    document.body.setAttribute('id', screenTemplate.id);

                    // insert all nodes at once
                    var docFragment = screenInstance.getContent();
                    console.log(docFragment);
                    document.body.appendChild(docFragment);

                });                
            } else {
                alert('No screen found matching the URL');
            }
        }
    }
}