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

        get data(): uupM.uvis.util.IPromise {
            var promise = new uupM.uvis.util.Promise();
            if (this._data === undefined) {
                // todo download the data
                var httpRequest;
                if (XMLHttpRequest) { // Mozilla, Safari, ...
                    httpRequest = new XMLHttpRequest();
                } else if (ActiveXObject) { // IE 8 and older
                    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                }
                httpRequest.onreadystatechange = () => {
                    if (httpRequest.status === 200) {
                        this._data = JSON.parse(httpRequest.responceText);
                        promise.fulfill(this._data);
                    } else {
                        promise.reject(httpRequest.responseText);
                    }
                };
                httpRequest.open('GET', this._source);
                httpRequest.send();
            } else {
                promise.fulfill(this._data);
            }
            return promise;
        }
    }
}