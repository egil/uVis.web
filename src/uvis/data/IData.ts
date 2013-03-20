import uupM = module('uvis/util/Promise');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');
export module uvis.data {
    export interface QueryContext {
        index: number;
        parent?: uiatiM.uvis.instance.AbstractTemplateInstance;
    }

    export interface IData {
        getData(context: QueryContext): uupM.uvis.util.IPromise;
    }
}