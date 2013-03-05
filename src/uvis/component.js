var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'uvis/util/dictionary', 'uvis/util/promise'], function(require, exports, __dictModule__, __promiseModule__) {
    var dictModule = __dictModule__;

    var promiseModule = __promiseModule__;

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
            function HtmlComponent(id, tag) {
                        _super.call(this, id);
                this._tag = tag;
            }
            HtmlComponent.LIST_OF_ATTRIBUTES = [
                'abbr', 
                'accept', 
                'accept-charset', 
                'accesskey', 
                'action', 
                'allowfullscreen', 
                'alt', 
                'async', 
                'autocomplete', 
                'autofocus', 
                'autoplay', 
                'border', 
                'challenge', 
                'charset', 
                'checked', 
                'cite', 
                'class', 
                'cols', 
                'colspan', 
                'command', 
                'content', 
                'contenteditable', 
                'contextmenu', 
                'controls', 
                'coords', 
                'crossorigin', 
                'data', 
                'datetime', 
                'default', 
                'defer', 
                'dir', 
                'dirname', 
                'disabled', 
                'draggable', 
                'dropzone', 
                'enctype', 
                'for', 
                'form', 
                'formaction', 
                'formenctype', 
                'formmethod', 
                'formnovalidate', 
                'formtarget', 
                'headers', 
                'height', 
                'hidden', 
                'high', 
                'href', 
                'hreflang', 
                'http-equiv', 
                'icon', 
                'id', 
                'inert', 
                'inputmode', 
                'ismap', 
                'keytype', 
                'kind', 
                'label', 
                'lang', 
                'list', 
                'loop', 
                'low', 
                'manifest', 
                'max', 
                'maxlength', 
                'media', 
                'mediagroup', 
                'method', 
                'min', 
                'multiple', 
                'muted', 
                'name', 
                'novalidate', 
                'open', 
                'optimum', 
                'pattern', 
                'placeholder', 
                'poster', 
                'preload', 
                'radiogroup', 
                'readonly', 
                'rel', 
                'required', 
                'reversed', 
                'rows', 
                'rowspan', 
                'sandbox', 
                'spellcheck', 
                'scope', 
                'scoped', 
                'seamless', 
                'selected', 
                'shape', 
                'size', 
                'sizes', 
                'span', 
                'src', 
                'srcdoc', 
                'srclang', 
                'start', 
                'step', 
                'style', 
                'tabindex', 
                'target', 
                'title', 
                'translate', 
                'type', 
                'typemustmatch', 
                'usemap', 
                'value', 
                'width', 
                'wrap'
            ];
            HtmlComponent.LIST_OF_CSS_PROPERTIES = [
                '@keframes', 
                'animation', 
                'animation-delay', 
                'animation-direction', 
                'animation-duration', 
                'animation-fill-mode', 
                'animation-iteration-count', 
                'animation-name', 
                'animation-play-state', 
                'animation-timing-function', 
                'azimuth', 
                'backface-visibility', 
                'background', 
                'background-attachment', 
                'background-clip', 
                'background-color', 
                'background-image', 
                'background-origin', 
                'background-position', 
                'background-repeat', 
                'background-size', 
                'border', 
                'border-bottom', 
                'border-bottom-color', 
                'border-bottom-left-radius', 
                'border-bottom-right-radius', 
                'border-bottom-style', 
                'border-bottom-width', 
                'border-collapse', 
                'border-color', 
                'border-image', 
                'border-image-outset', 
                'border-image-repeat', 
                'border-image-slice', 
                'border-image-source', 
                'border-image-width', 
                'border-left', 
                'border-left-color', 
                'border-left-style', 
                'border-left-width', 
                'border-radius', 
                'border-right', 
                'border-right-color', 
                'border-right-style', 
                'border-right-width', 
                'border-spacing', 
                'border-style', 
                'border-top', 
                'border-top-color', 
                'border-top-left-radius', 
                'border-top-right-radius', 
                'border-top-style', 
                'border-top-width', 
                'border-width', 
                'bottom', 
                'box-decoration-break', 
                'box-shadow', 
                'break-after', 
                'break-before', 
                'break-inside', 
                'caption-side', 
                'clear', 
                'clip', 
                'color', 
                'column-count', 
                'column-fill', 
                'column-gap', 
                'column-rule', 
                'column-rule-color', 
                'column-rule-style', 
                'column-rule-width', 
                'column-span', 
                'column-width', 
                'content', 
                'counter-increment', 
                'counter-reset', 
                'cue', 
                'cue-after', 
                'cue-before', 
                'cursor', 
                'direction', 
                'display', 
                'elevation', 
                'empty-cells', 
                'float', 
                'font', 
                'font-family', 
                'font-size', 
                'font-size-adjust', 
                'font-stretch', 
                'font-style', 
                'font-variant', 
                'font-weight', 
                'height', 
                'left', 
                'letter-spacing', 
                'line-height', 
                'list-style', 
                'list-style-image', 
                'list-style-position', 
                'list-style-type', 
                'margin', 
                'margin-bottom', 
                'margin-left', 
                'margin-right', 
                'margin-top', 
                'marker-offset', 
                'marks', 
                'marquee-direction', 
                'marquee-play-count', 
                'marquee-speed', 
                'marquee-style', 
                'max-height', 
                'max-width', 
                'min-height', 
                'min-width', 
                'opacity', 
                'orphans', 
                'outline', 
                'outline-color', 
                'outline-style', 
                'outline-width', 
                'overflow', 
                'overflow-style', 
                'overflow-x', 
                'overflow-y', 
                'padding', 
                'padding-bottom', 
                'padding-left', 
                'padding-right', 
                'padding-top', 
                'page', 
                'page-break-after', 
                'page-break-before', 
                'page-break-inside', 
                'pause', 
                'pause-after', 
                'pause-before', 
                'perspective', 
                'perspective-origin', 
                'pitch', 
                'pitch-range', 
                'play-during', 
                'position', 
                'quotes', 
                'richness', 
                'right', 
                'size', 
                'speak', 
                'speak-header', 
                'speak-numeral', 
                'speak-punctuation', 
                'speech-rate', 
                'stress', 
                'table-layout', 
                'text-align', 
                'text-decoration', 
                'text-indent', 
                'text-shadow', 
                'text-transform', 
                'top', 
                'transform', 
                'transform-origin', 
                'transform-style', 
                'transition', 
                'transition-delay', 
                'transition-duration', 
                'transition-property', 
                'transition-timing-function', 
                'unicode-bidi', 
                'vertical-align', 
                'visibility', 
                'voice-family', 
                'volume', 
                'white-space', 
                'widows', 
                'width', 
                'word-spacing', 
                'z-index'
            ];
            HtmlComponent.prototype.createElement = function () {
                return document.createElement(this._tag);
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
                        // assign properties to elm
                        _this.setProperties(elm);
                        // add content
                        _this.appendContent(elm);
                        // add children to elm
                        childrenContent.forEach(function (child) {
                            elm.appendChild(child);
                        });
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
            HtmlComponent.prototype.setProperties = function (element) {
                // set style properties
                            };
            HtmlComponent.prototype.appendContent = function (element) {
            };
            return HtmlComponent;
        })(AbstractComponent);
        uvis.HtmlComponent = HtmlComponent;        
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=component.js.map
