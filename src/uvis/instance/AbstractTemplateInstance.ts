import uudM = module('uvis/util/Dictionary');
import utatM = module('uvis/template/AbstractTemplate');
export module uvis.instance {
    export interface AbstractTemplateInstance {
        //id: string;
        //template: utatM.uvis.template.AbstractTemplate;
        parent: AbstractTemplateInstance;
        children: AbstractTemplateInstance[];
        properties: uudM.uvis.util.Dictionary;
    }
}