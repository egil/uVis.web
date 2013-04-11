import utptM = module('uvis/template/PropertyTemplate');
import uthtM = module('uvis/template/HTMLTemplate');

export module uvis.template {

    export class FormTemplate extends uthtM.uvis.template.HTMLTemplate {
        private _visible: bool;
        private _name: string;

        constructor(id: string, name?: string, visible: bool = false) {
            super(id, 'div');            
            this._visible = visible;
            // add the name as the 'title' attribute to the div element
            if (name) {
                this.addProperty(new utptM.uvis.template.PropertyTemplate('title', name));
                this._name = name;
            }                        
        }

        get name() {
            return this._name;
        }

        get visible() {
            return this._visible;
        }

        set visible(visible) {
            // todo dispose of/hide children
            this._visible = visible;
        }
    }
}