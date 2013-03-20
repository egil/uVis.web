import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import utptM = module('uvis/template/PropertyTemplate');
import uipiM = module('uvis/instance/PropertyInstance');
import utccM = module('uvis/template/ComputeContext');

export module uvis.template {
    export class PropertySetTemplate extends utptM.uvis.template.PropertyTemplate {
        private _properties: uudM.uvis.util.Dictionary;

        constructor(name: string) {
            super(name, undefined, undefined);
            this._properties = new uudM.uvis.util.Dictionary;
        }

        get properties() {
            return this._properties;
        }

        public addProperty(property: utptM.uvis.template.PropertyTemplate) {
            this._properties.add(property.name, property);
        }

        public computeValue(context: utccM.uvis.template.ComputeContext): uupM.uvis.util.IPromise {
            // Schedule computation of individual properties
            return uupM.uvis.util.Promise.when(this.properties.map((name, prop: utptM.uvis.template.PropertyTemplate) => {
                return prop.computeValue(context);
            }))

            // then we move all calculated results into a dictionary for easier lookup later
            .then((properties: any[]) => {
                var d = new uudM.uvis.util.Dictionary();
                var res = new uipiM.uvis.instance.PropertyInstance(this.name, d);

                // copy the nested properties into the property instance
                properties.forEach((pair) => {
                    d.add(pair.name, pair);
                });


                return res;
            });
        }            
    }
}