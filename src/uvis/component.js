var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'uvis/property', 'uvis/utils'], function(require, exports, __propertyModule__, __utilsModule__) {
    /// <reference path="../.typings/jquery.d.ts" />
    /// <reference path="../.typings/underscore-typed.d.ts" />
    var propertyModule = __propertyModule__;

    var utilsModule = __utilsModule__;

    var utils = utilsModule.uvis.utils;
    (function (uvis) {
        (function (component) {
            /**
            * Used to create a new component based on a type.
            * @type a string name identifying the type of component to create.
            */
            function create(id, type) {
                var c;
                switch(type) {
                    case 'text':
                        c = new HtmlComponent(id);
                        break;
                    default:
                        throw new Error('Unknown Component type: ' + type);
                        break;
                }
                return c;
            }
            component.create = create;
            var AbstractComponent = (function () {
                function AbstractComponent(id) {
                    this._properties = new utils.Dictionary();
                    this._children = new utils.Dictionary();
                    this._properties.add('id', id);
                }
                Object.defineProperty(AbstractComponent.prototype, "id", {
                    get: function () {
                        return this.properties['id'];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(AbstractComponent.prototype, "parent", {
                    get: function () {
                        return this._parent;
                    },
                    set: function (value) {
                        this._parent = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(AbstractComponent.prototype, "children", {
                    get: function () {
                        return this._children;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(AbstractComponent.prototype, "properties", {
                    get: function () {
                        return this._properties;
                    },
                    enumerable: true,
                    configurable: true
                });
                AbstractComponent.prototype.render = function () {
                    throw new Error("NOT IMPLEMENTED");
                };
                return AbstractComponent;
            })();
            component.AbstractComponent = AbstractComponent;            
            var HtmlComponent = (function (_super) {
                __extends(HtmlComponent, _super);
                function HtmlComponent(id) {
                                _super.call(this, id);
                }
                HtmlComponent.prototype.render = function () {
                    var fragment = document.createDocumentFragment();
                    var elm = document.createElement('div');
                    elm.setAttribute('id', this.id);
                    elm.innerText = this.properties['text'].value;
                    var styles = '';
                    _.each(_.omit(this.properties, 'id', 'text', 'type'), function (obj, key) {
                        if(obj instanceof propertyModule.uvis.property.Property) {
                            styles += obj.key + ':' + obj.value + ';';
                        }
                    });
                    elm.setAttribute('style', styles);
                    _.each(this.children, function (comp, id) {
                        elm.appendChild(comp.render());
                    });
                    fragment.appendChild(elm);
                    return fragment;
                };
                return HtmlComponent;
            })(AbstractComponent);
            component.HtmlComponent = HtmlComponent;            
        })(uvis.component || (uvis.component = {}));
        var component = uvis.component;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=component.js.map
