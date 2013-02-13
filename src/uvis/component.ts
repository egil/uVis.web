///// <reference path="../.typings/jquery.d.ts" />
///// <reference path="../.typings/underscore-typed.d.ts" />

//import propertyModule = module('uvis/property');
//import dictModule = module('uvis/util/dictionary');
//import util = dictModule.uvis.util;

//export module uvis.component {

//    /**
//      * Used to create a new component based on a type.
//      * @type a string name identifying the type of component to create.
//     */
//    export function create(id: string, type: string): AbstractComponent {
//        var c: AbstractComponent;
//        switch (type) {
//            case 'text':
//                c = new HtmlComponent(id);
//                break;
//            default:
//                throw new Error('Unknown Component type: ' + type);
//                break;
//        }
//        return c;
//    }

//    export class AbstractComponent {
//        private _parent: AbstractComponent;
//        private _children: util.Dictionary;
//        private _properties: util.Dictionary;

//        constructor(id: string) {
//            this._properties = new util.Dictionary();
//            this._children = new util.Dictionary();
//            this._properties.add('id', id);
//        }

//        get id(): string {
//            return this.properties['id'];
//        }

//        get parent() {
//            return this._parent;
//        }

//        set parent(value: AbstractComponent) {
//            this._parent = value;
//        }

//        get children() {
//            return this._children;
//        }

//        get properties() {
//            return this._properties;
//        }

//        render(): DocumentFragment {
//            throw new Error("NOT IMPLEMENTED");
//        }
//    }

//    export class HtmlComponent extends AbstractComponent {
//        constructor(id) {
//            super(id);
//        }

//        render(): DocumentFragment {
//            var fragment = document.createDocumentFragment();
//            var elm = document.createElement('div');            
//            elm.setAttribute('id', this.id);
//            elm.innerText = this.properties['text'].value;
            
//            var styles = '';
//            _.each(_.omit(this.properties, 'id', 'text', 'type'),
//                (obj: any, key?: string) => {
//                    if (obj instanceof propertyModule.uvis.property.Property) {
//                        styles += obj.key + ':' + obj.value + ';';
//                    }
//                });
//            elm.setAttribute('style', styles);
            
//            _.each(this.children, (comp: any, id?: string) => {                
//                elm.appendChild(comp.render());
//            });

//            fragment.appendChild(elm);
//            return fragment;
//        }
//    }
//}
