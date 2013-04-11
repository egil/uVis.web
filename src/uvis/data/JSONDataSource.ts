/// <reference path="../../.typings/jquery.d.ts" />
import uupM = module('uvis/util/Promise');

export module uvis.data {
    
    export class JSONDataSource {
        private _id: string;
        private _source: string;
        private _data;

        constructor(id: string, source?: string, data?: any) {            
            this._id = id;
            this._source = source;
            this._data = data;
        }

        get id() {
            return this._id;
        }

        get data(): uupM.uvis.util.IPromise {
            var promise = new uupM.uvis.util.Promise();
            if (this._data === undefined) {
                $.getJSON(this._source, undefined, (result) => {
                    this._data = result;
                    promise.fulfill(this._data);
                });
            } else {
                promise.fulfill(this._data);
            }
            return promise;
        }
    }
}