import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uudM = module('uvis/util/Dictionary');

export module uvis.instance {
    export class HTMLTemplateInstance implements uiatiM.uvis.instance.AbstractTemplateInstance {
        private _parent: uiatiM.uvis.instance.AbstractTemplateInstance;
        private _children: uiatiM.uvis.instance.AbstractTemplateInstance[];
        private _element: Node;
        private _properties: uudM.uvis.util.Dictionary;
        
        get element() {
            return this._element;
        }

        set element(element) {
            this._element = element;
        }

        get properties() {
            return this._properties;
        }

        set properties(properties) {
            this._properties = properties;
        }

        get parent() {
            return this._parent;
        }

        set parent(parent) {
            this._parent = parent;
        }

        get children() {
            return this._children;
        }

        set children(children) {
            this._children = children;
        }
    }
}