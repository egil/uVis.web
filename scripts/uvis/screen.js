var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../.typings/jquery.d.ts" />
/// <reference path="../.typings/underscore-typed.d.ts" />
var componentModule = require("./uvis/component")
var component = componentModule.uvis.component;
(function (uvis) {
    (function (screen) {
        /**
        * Used to create a new component based on a type.
        * @type a string name identifying the type of component to create.
        * @id the identifier for the screen.
        */
        function create(id, type) {
            var s;
            switch(type) {
                case 'canvas':
                    s = new CanvasScreen(id);
                    break;
                default:
                    throw new Error('Unknown Screen type: ' + type);
                    break;
            }
            return s;
        }
        screen.create = create;
        var Screen = (function (_super) {
            __extends(Screen, _super);
            function Screen(id) {
                        _super.call(this, id);
            }
            Object.defineProperty(Screen.prototype, "path", {
                get: function () {
                    return this._path;
                },
                set: function (value) {
                    this._path = value;
                },
                enumerable: true,
                configurable: true
            });
            Screen.prototype.render = function () {
                var cast = this;
                var fragment = document.createDocumentFragment();
                var scr = document.createElement('div');
                scr.setAttribute('id', cast.id);
                scr.setAttribute('style', 'position:relative;');
                var style = document.createElement('style');
                style.setAttribute('type', 'text/css');
                style.innerText = '#' + cast.id + ' > div{position:relative;}';
                fragment.appendChild(style);
                _.each(cast.children, function (comp, id) {
                    scr.appendChild(comp.render());
                });
                //_.each(scr.children, (elm:Element) => {
                //    var style = elm.getAttribute('style');
                //    style += 'position:relative;';
                //    elm.setAttribute('style', style);
                //});
                fragment.appendChild(scr);
                return fragment;
            };
            return Screen;
        })(component.AbstractComponent);
        screen.Screen = Screen;        
        var CanvasScreen = (function (_super) {
            __extends(CanvasScreen, _super);
            function CanvasScreen(id) {
                        _super.call(this, id);
            }
            return CanvasScreen;
        })(Screen);
        screen.CanvasScreen = CanvasScreen;        
    })(uvis.screen || (uvis.screen = {}));
    var screen = uvis.screen;
})(exports.uvis || (exports.uvis = {}));
var uvis = exports.uvis;
//@ sourceMappingURL=screen.js.map
