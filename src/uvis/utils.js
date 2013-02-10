define(["require", "exports"], function(require, exports) {
    (function (uvis) {
        /// <reference path="../.typings/underscore-typed.d.ts" />
        (function (utils) {
            var Dictionary = (function () {
                function Dictionary() { }
                Dictionary.prototype.get = function (key) {
                    return this[key];
                };
                Dictionary.prototype.set = /**
                * Set the value for a specific key.
                */
                function (key, value) {
                    this[key] = value;
                };
                Dictionary.prototype.contains = function (key) {
                    return this[key] !== undefined;
                };
                Dictionary.prototype.add = /**
                * Add a item to the dictionary.
                * @remark method throws an exception if a value with the specified key already exists.
                * @key The key of the element to add.
                * @value The value of the element to add.
                */
                function (key, value) {
                    if(this.contains(key)) {
                        throw new Error('Item with the key = "' + key + '" already exists in the dictionary.');
                    }
                    this[key] = value;
                };
                return Dictionary;
            })();
            utils.Dictionary = Dictionary;            
        })(uvis.utils || (uvis.utils = {}));
        var utils = uvis.utils;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=utils.js.map
