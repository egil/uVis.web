///// <reference path="../.typings/jquery.d.ts" />
///// <reference path="../.typings/underscore-typed.d.ts" />
//import componentModule = module('uvis/component');
//import component = componentModule.uvis.component;
//export module uvis.screen {
//    /**
//      * Used to create a new component based on a type.
//      * @type a string name identifying the type of component to create.
//      * @id the identifier for the screen.
//     */
//    export function create(id: string, type: string): Screen {
//        var s: Screen;
//        switch (type) {
//            case 'canvas':
//                s = new CanvasScreen(id);
//                break;
//            default:
//                throw new Error('Unknown Screen type: ' + type);
//                break;
//        }
//        return s;
//    }
//    export class Screen extends component.AbstractComponent {
//        private _path: string;
//        constructor(id: string) {
//            super(id);
//        }
//        get path() {
//            return this._path;
//        }
//        set path(value: string) {
//            this._path = value;
//        }
//        render() : DocumentFragment {
//            var cast = <component.AbstractComponent>this;
//            var fragment = document.createDocumentFragment()
//            var scr = document.createElement('div');
//            scr.setAttribute('id', cast.id);
//            scr.setAttribute('style', 'position:relative;');
//            var style = document.createElement('style');
//            style.setAttribute('type', 'text/css');
//            style.innerText = '#' + cast.id + ' > div{position:relative;}';
//            fragment.appendChild(style);
//            _.each(cast.children, (comp: any, id?: string) => {
//                scr.appendChild(comp.render());
//            });
//            //_.each(scr.children, (elm:Element) => {
//            //    var style = elm.getAttribute('style');
//            //    style += 'position:relative;';
//            //    elm.setAttribute('style', style);
//            //});
//            fragment.appendChild(scr);
//            return fragment;
//        }
//    }
//    export class CanvasScreen extends Screen {
//        constructor(id) {
//            super(id);
//        }
//    }
//}
//@ sourceMappingURL=screen.js.map
