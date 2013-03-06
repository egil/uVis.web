(function (uvis) {
    (function (util) {
        var Dictionary = (function () {
            function Dictionary(initialElements) {
                this._hasSpecialProto = false;
                this._d = initialElements || {
                };
            }
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
                this.set(key, value);
            };
            Dictionary.prototype.get = function (key) {
                if(key === "__proto__") {
                    return this._specialProto;
                }
                return this.contains(key) ? this._d[key] : undefined;
            };
            Dictionary.prototype.set = /**
            * Sets a item to the dictionary.
            * @remark Overrides existing value if the specified key already exists.
            * @key The key of the element to add.
            * @value The value of the element to add.
            */
            function (key, value) {
                if(key === "__proto__") {
                    this._hasSpecialProto = true;
                    this._specialProto = value;
                } else {
                    this._d[key] = value;
                }
            };
            Dictionary.prototype.contains = function (key) {
                if(key === "__proto__") {
                    return this._hasSpecialProto;
                }
                return {
                }.hasOwnProperty.call(this._d, key);
            };
            Dictionary.prototype.remove = /**
            * Remove a item from the dictionary.
            * @key of item to remove
            */
            function (key) {
                var item;
                if(key === "__proto__") {
                    this._hasSpecialProto = false;
                    item = this._specialProto;
                    this._specialProto = undefined;
                } else {
                    item = this._d[key];
                    delete this._d[key];
                }
                return item;
            };
            Dictionary.prototype.forEach = function (func) {
                for(var prop in this._d) {
                    if(this.contains(prop)) {
                        func(prop, this._d[prop]);
                    }
                }
            };
            Dictionary.prototype.map = function (func) {
                var res = [];
                this.forEach(function (key, value) {
                    res.push(func(key, value));
                });
                return res;
            };
            return Dictionary;
        })();
        util.Dictionary = Dictionary;        
    })(uvis.util || (uvis.util = {}));
    var util = uvis.util;
})(exports.uvis || (exports.uvis = {}));
var uvis = exports.uvis;
//@ sourceMappingURL=dictionary.js.map
