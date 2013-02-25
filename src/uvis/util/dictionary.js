(function (uvis) {
    (function (util) {
        var Dictionary = (function () {
            function Dictionary() {
                this._d = {
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
                this._d[key] = value;
            };
            Dictionary.prototype.getItem = function (key) {
                return this._d[key];
            };
            Dictionary.prototype.contains = function (key) {
                return this._d.hasOwnProperty(key);
            };
            Dictionary.prototype.remove = /**
            * Remove a item from the dictionary.
            * @key of item to remove
            */
            function (key) {
                var item;
                if(this.contains(key)) {
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
            return Dictionary;
        })();
        util.Dictionary = Dictionary;        
    })(uvis.util || (uvis.util = {}));
    var util = uvis.util;
})(exports.uvis || (exports.uvis = {}));
var uvis = exports.uvis;
//@ sourceMappingURL=dictionary.js.map
