define(["require", "exports", 'uvis/utils'], function(require, exports, __utilsModule__) {
    var utilsModule = __utilsModule__;

    
    
    var utils = utilsModule.uvis.utils;
    (function (uvis) {
        (function (app) {
            var App = (function () {
                function App(id, title) {
                    this._id = id;
                    this._title = title;
                    this._screens = new utils.Dictionary();
                    this._dataSources = new utils.Dictionary();
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
