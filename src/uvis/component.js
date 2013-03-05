var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var dictModule = require("./uvis/util/dictionary")
var promiseModule = require("./uvis/util/promise")
(function (uvis) {
    var dict = dictModule.uvis.util;
    var util = promiseModule.uvis.util;
    var AbstractComponent = (function () {
        function AbstractComponent(id) {
            this._id = id;
            this._children = [];
            this._properties = new dict.Dictionary();
        }
        Object.defineProperty(AbstractComponent.prototype, "id", {
            get: function () {
                return this._id;
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
        AbstractComponent.prototype.createContent = function () {
            throw new Error('AbstractComponent.createContent() should never be called directly. Must be overridden. (Component id = ' + this.id + ')');
        };
        return AbstractComponent;
    })();
    uvis.AbstractComponent = AbstractComponent;    
    var HtmlComponent = (function (_super) {
        __extends(HtmlComponent, _super);
        function HtmlComponent(id) {
                _super.call(this, id);
        }
        HtmlComponent.prototype.createElement = function () {
            throw new Error('HtmlComponent.createElement() should never be called directly. Must be overridden. (Component id = ' + this.id + ')');
        };
        HtmlComponent.prototype.createContent = function () {
            var _this = this;
            var res = new util.Promise();
            var elm;
            var propPromise;
            var propPromises;
            var childrenPromise;
            var childrenPromises;
            // retrive all properties on this component first.
            // child components will likely use the same data
            // as the parent component, so triggering a data collection
            // now for this component may save some web services calls.
            propPromises = this.properties.map(function (key, prop) {
                return prop.calculate();
            });
            // create a promise that waits till all property promises have been fulfilled
            propPromise = util.Promise.when(propPromises);
            // retrive the content of all children, if any.
            propPromise.then(function (props) {
                // retrive content from each child
                childrenPromises = _this.children.map(function (child) {
                    return child.createContent();
                });
                // create a promise that waits till all child primses have been fulfilled
                childrenPromise = util.Promise.when(childrenPromises);
                // wait for content from all children
                childrenPromise.then(function (childrenContent) {
                    // get this components element
                    elm = _this.createElement();
                    // TODO assign properties to elm
                    // TODO assign content to elm
                    res.fulfill(elm);
                }, function (err) {
                    res.reject(err);
                });
            }, function (err) {
                res.reject(err);
            });
            // add children and properties to elm
            return res;
        };
        return HtmlComponent;
    })(AbstractComponent);
    uvis.HtmlComponent = HtmlComponent;    
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
    })(exports.uvis || (exports.uvis = {}));
var uvis = exports.uvis;
//@ sourceMappingURL=component.js.map
