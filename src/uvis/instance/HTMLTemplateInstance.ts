import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uudM = module('uvis/util/Dictionary');

export module uvis.instance {
    export class HTMLTemplateInstance implements uiatiM.uvis.instance.AbstractTemplateInstance {
        private _element: HTMLElement;
        private _properties: uudM.uvis.util.Dictionary;
        
        constructor(element: HTMLElement, properties: uudM.uvis.util.Dictionary) {
            this._element = element;
            this._properties = properties;
        }

        get element() {
            return this._element;
        }

        get properties() {
            return this._properties;
        }
    }
}