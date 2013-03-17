import uupM = module('uvis/util/Promise');
import utatM = module('uvis/template/AbstractTemplate');
import uipiM = module('uvis/instance/PropertyInstance');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');

export module uvis.template {
    export interface ComputeContext {
        index: number;
        parent?: uiatiM.uvis.instance.AbstractTemplateInstance;
        data?: any;
    }

    export class PropertyTemplate {
        private _name;
        private _computeFunctionOrValue;
        private _defaultValue;
        
        constructor(name: string, computeFunctionOrValue?, defaultValue?: any) {
            this._name = name;
            this._computeFunctionOrValue = computeFunctionOrValue;
            this._defaultValue = defaultValue;
        }

        get name() {
            return this._name;
        }

        public computeValue(context: ComputeContext): uupM.uvis.util.IPromise {
            // a PropertyInstance
            var res = new uipiM.uvis.instance.PropertyInstance(this._name, this._defaultValue);

            if (this._computeFunctionOrValue instanceof Function) {
                return this._computeFunctionOrValue(context).then((value) => {
                    if (value !== undefined) {
                        res.value = value;
                    }
                    return res;
                });
            } else {
                if (this._computeFunctionOrValue !== undefined) {
                    res.value = this._computeFunctionOrValue;
                }
                return uupM.uvis.util.Promise.resolve(res);
            }            
        }
    }
}