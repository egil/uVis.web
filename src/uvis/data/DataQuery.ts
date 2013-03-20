import udidM = module('uvis/data/IData');
import uupM = module('uvis/util/Promise');

export module uvis.data {

    export class DataQuery implements udidM.uvis.data.IData {
        private _queryFunctionOrValue;
        private _defaultValue;
        constructor(queryFunctionOrValue, defaultValue?: any) {
            this._queryFunctionOrValue = queryFunctionOrValue;
            this._defaultValue = defaultValue;
        }
        public getData(context: udidM.uvis.data.QueryContext): uupM.uvis.util.IPromise {
            var res = this._defaultValue;

            if (this._queryFunctionOrValue instanceof Function) {
                return this._queryFunctionOrValue(context).then((data) => {
                    if (data !== undefined) {
                        res = data;
                    }
                    return res;
                });
            } else {
                if (this._queryFunctionOrValue !== undefined) {
                    res = this._queryFunctionOrValue;
                }
                return uupM.uvis.util.Promise.resolve(res);
            }
        }
    }
}