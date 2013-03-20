import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uudM = module('uvis/util/Dictionary');

export module uvis.instance {
    export class HTMLTemplateInstance extends uiatiM.uvis.instance.AbstractTemplateInstance {
        private _element: Node;
        
        get element() {
            return this._element;
        }

        set element(element) {
            this._element = element;
        }
    }
}