import uupM = module('uvis/util/Promise');
import utatM = module('uvis/template/AbstractTemplate');
import uipiM = module('uvis/instance/PropertyInstance');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');

export module uvis.template {
    export interface ComputeContext {
        index: number;
        parent?: uiatiM.uvis.instance.AbstractTemplateInstance;
        data?;
        map?;
        screen?: utatM.uvis.template.AbstractTemplate;
        resolve: (promiseOrValue: any) => uupM.uvis.util.IPromise;
    }

    export var DefaultComputeContext: ComputeContext = {
        index: 1,
        resolve: uupM.uvis.util.Promise.resolve
    }

    export function extend(context: ComputeContext, extensions: {
                    index?: number;
                    parent?: uiatiM.uvis.instance.AbstractTemplateInstance;
                    data?;
                    map?;
                    screen?: utatM.uvis.template.AbstractTemplate; }): ComputeContext => {
        var cc = {
            index: extensions.index || context.index,
            parent: extensions.parent || context.parent,
            data: extensions.data || context.data,
            map: extensions.map || context.map,
            screen: extensions.screen || context.screen,
            resolve: uupM.uvis.util.Promise.resolve
        };
        return cc;
    }
}