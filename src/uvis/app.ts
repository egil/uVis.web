import utilsModule = module('uvis/utils');
import screenModule = module('uvis/screen');
import propertyModule = module('uvis/property');
import utils = utilsModule.uvis.utils;

export module uvis.app {

    export class App {
        private _id: string;
        private _title: string;
        private _dataSources: utils.Dictionary;
        private _screens: utils.Dictionary;

        constructor(id: string, title: string) {
            this._id = id;
            this._title = title;
            this._screens = new utils.Dictionary();
            this._dataSources = new utils.Dictionary();
        }

        get id() { return this._id; }
        get title() { return this._title; }
        get data() { return this._dataSources; }
        get screens() { return this._screens; }

        start() {            
            if (this.screens.contains(window.location.pathname)) {
                var fragment = <DocumentFragment>this.screens[window.location.pathname].render();
                document.body.appendChild(fragment);
            }
        }
    }

}