import uupM = module('uvis/util/Promise');
import utatM = module('uvis/template/AbstractTemplate');
import utftM = module('uvis/template/FormTemplate');
import uistiM = module('uvis/instance/ScreenTemplateInstance');
import utccM = module('uvis/template/ComputeContext');

export module uvis.template {
    import cc = utccM.uvis.template;

    export class ScreenTemplate extends utatM.uvis.template.AbstractTemplate {
        private _id: string;
        private _name: string;
        private _url: string;

        constructor(id: string, name: string, url: string) {
            super(id);
            this._name = name;
            this._url = url;
        }

        get url() {
            return this._url;
        }

        get name() {
            return this._name;
        }

        public createInstance(context: utccM.uvis.template.ComputeContext): uupM.uvis.util.IPromise {
            context = cc.extend(context, { screen: this });

            return uupM.uvis.util.Promise.when(
                // First filter away any forms that are not visible by default
                this.children.filter((t: utftM.uvis.template.FormTemplate) => {
                return t.visible;
            }).map((t) => {
                return t.createInstance(context)
            })).then((instances) => {
                var sti = new uistiM.uvis.instance.ScreenTemplateInstance();
                sti.template = this;
                sti.children = instances;
                return sti;
            });
        }
    }
}