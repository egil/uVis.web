import uupM = module('uvis/util/Promise');
export module uvis.data {
    export interface IData {
        getData(): uupM.uvis.util.IPromise;
    }
}