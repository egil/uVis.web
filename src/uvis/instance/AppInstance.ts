import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import utstM = module('uvis/template/ScreenTemplate');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uistiM = module('uvis/instance/ScreenTemplateInstance');
import uihtiM = module('uvis/instance/HTMLTemplateInstance');
import uipiM = module('uvis/instance/PropertyInstance');
import utccM = module('uvis/template/ComputeContext');
import utpstM = module('uvis/template/PropertySetTemplate');

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
            if (value instanceof uudM.uvis.util.Dictionary)
                this._propertySets = value;
            else
                throw new Error('Value must be an instance of uudM.uvis.util.Dictionary.');
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
            var screenTemplate: utstM.uvis.template.ScreenTemplate = this.screens.get('/');
            var cc = utcc.extend(utcc.DefaultComputeContext, { map: this.dataSources });
            
            // set the page title
            document.title = screenTemplate.name + ' | ' + this.name + ' | ' + document.title;

            // add classes to the head
            AppInstance.createCssClasses(this.propertySets, cc);

            // add visible forms
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
                    document.body.appendChild(docFragment);
                });
            } else {
                alert('No screen found matching the URL');
            }
        }

        private static createCssClasses(propertySets: uudM.uvis.util.Dictionary, computeContext: utcc.ComputeContext) {
            uupM.uvis.util.Promise.when(propertySets.map((id: string, ps: utpstM.uvis.template.PropertySetTemplate) => {
                return ps.computeValue(computeContext);

            })).last((sets: uipiM.uvis.instance.PropertyInstance[]) => {
                // simple guide for inserting styles: https://developer.mozilla.org/en-US/docs/DOM/CSSStyleSheet/insertRule
                var style = document.createElement('style');
                document.getElementsByTagName('head')[0].appendChild(style);
                var s = <CSSStyleSheet>document.styleSheets[document.styleSheets.length - 1];

                sets.forEach((pi, index) => {
                    // build a style attribute according to specifications
                    // @see http://www.w3.org/TR/css-style-attr/
                    var value = '';
                    pi.value.forEach((name: string, propertyInstance: any) => {
                        value += name + ':' + propertyInstance.value + ';';
                    });
                    s.insertRule('.' + pi.name + '{' + value + '}', index);
                });
            });
        }
    }
}