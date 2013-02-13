//import dictModule = module('uvis/util/dictionary');
//import screenModule = module('uvis/screen');
//import propertyModule = module('uvis/property');
//import util = dictModule.uvis.util;
////import uvis = screenModule.uvis;
//export module uvis.app {
//    export class App {
//        private _id: string;
//        private _title: string;
//        private _dataSources: util.Dictionary;
//        private _screens: util.Dictionary;
//        constructor(id: string, title: string) {
//            this._id = id;
//            this._title = title;
//            this._screens = new util.Dictionary();
//            this._dataSources = new util.Dictionary();
//        }
//        get id() { return this._id; }
//        get title() { return this._title; }
//        get data() { return this._dataSources; }
//        get screens() { return this._screens; }
//        start() {
//            if (this.screens.contains(window.location.pathname)) {
//                var fragment = <DocumentFragment>this.screens[window.location.pathname].render();
//                document.body.appendChild(fragment);
//            }
//        }
//    }
//}
//@ sourceMappingURL=app.js.map
