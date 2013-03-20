import uudM = module('uvis/util/Dictionary');
import utatM = module('uvis/template/AbstractTemplate');
export module uvis.instance {
    export class AbstractTemplateInstance {
        private _children: AbstractTemplateInstance[];
        private _data: any;
        private _parent: AbstractTemplateInstance;
        private _properties: uudM.uvis.util.Dictionary;
        private _template: utatM.uvis.template.AbstractTemplate;

        get children() {
            return this._children;
        }
        set children(value) {
            this._children = value;
        }
        
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
        }

        get parent() {
            return this._parent;
        }
        set parent(value) {
            this._parent = value;
        }

        get properties() {
            return this._properties;
        }
        set properties(value) {
            this._properties = value;
        }

        get template() {
            return this._template;
        }

        set template(value) {
            this._template = value;
        }
        
    }
}