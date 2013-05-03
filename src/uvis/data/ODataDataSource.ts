/// <reference path="../../.typings/jquery.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');

export module uvis.data {
    import udds = uddsM.uvis.data;

    export class ODataDataSource implements udds.IDataSource {
        private _id: string;
        private _requestUrl: string;

        constructor(id: string, requestUrl: string) {
            this._id = id;
            this._requestUrl = requestUrl;
        }

        public get id() {
            return this._id;
        }

        public query(): Rx.Internals.AnonymousObservable {
            return Rx.Observable.createWithDisposable((observer: Rx.AnonymousObserver) => {
                $.getJSON(this._requestUrl, null).then(res => {
                    if (res.value !== undefined && Array.isArray(res.value)) {
                        res.value.forEach(observer.onNext, observer);
                    }
                    observer.onCompleted();
                }, err => {
                    var response = JSON.parse(err.responseText);
                    observer.onError(new Error("Error download data from OData server. Error message: " + response['odata.error']['message']['value']));
                });

                return Rx.Disposable.empty;
            });
        }

    }
}