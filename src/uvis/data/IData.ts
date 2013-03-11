import promiseModule = module('uvis/util/Promise');
export module uvis.data {
    export interface IData {
        getData(): promiseModule.uvis.util.IPromise;
    }
}