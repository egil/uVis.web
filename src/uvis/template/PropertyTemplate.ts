import uupM = module('uvis/util/Promise');
import uipiM = module('uvis/instance/PropertyInstance');
import utccM = module('uvis/template/ComputeContext');

export module uvis.template {
    export class PropertyTemplate {
        private _id;
        private _computeFunctionOrValue;
        private _defaultValue;
        
        constructor(id: string, computeFunctionOrValue?, defaultValue?: any) {
            this._id = id;
            this._computeFunctionOrValue = computeFunctionOrValue;
            this._defaultValue = defaultValue;
        }

        get id() {
            return this._id;
        }

        public computeValue(context: utccM.uvis.template.ComputeContext): uupM.uvis.util.IPromise {
            // a PropertyInstance
            var res = new uipiM.uvis.instance.PropertyInstance(this._id, this._defaultValue);

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