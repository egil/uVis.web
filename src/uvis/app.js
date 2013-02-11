define(["require", "exports", 'uvis/util/dictionary'], function(require, exports, __dictModule__) {
    var dictModule = __dictModule__;

    
    
    var util = dictModule.uvis.util;
    (function (uvis) {
        //import uvis = screenModule.uvis;
        (function (app) {
            var App = (function () {
                function App(id, title) {
                    this._id = id;
                    this._title = title;
                    this._screens = new util.Dictionary();
                    this._dataSources = new util.Dictionary();
                }
                Object.defineProperty(App.prototype, "id", {
                    get: function () {
                        return this._id;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(App.prototype, "title", {
                    get: function () {
                        return this._title;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(App.prototype, "data", {
                    get: function () {
                        return this._dataSources;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(App.prototype, "screens", {
                    get: function () {
                        return this._screens;
                    },
                    enumerable: true,
                    configurable: true
                });
                App.prototype.start = function () {
                    if(this.screens.contains(window.location.pathname)) {
                        var fragment = this.screens[window.location.pathname].render();
                        document.body.appendChild(fragment);
                    }
                };
                return App;
            })();
            app.App = App;            
        })(uvis.app || (uvis.app = {}));
        var app = uvis.app;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=app.js.map
