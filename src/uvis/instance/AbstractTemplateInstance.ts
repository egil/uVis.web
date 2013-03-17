import uudM = module('uvis/util/Dictionary');
export module uvis.instance {
    export interface AbstractTemplateInstance {
        element: HTMLElement;
        properties: uudM.uvis.util.Dictionary;
    }
}