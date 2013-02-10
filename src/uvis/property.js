var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    /// <reference path="../.typings/underscore-typed.d.ts" />
    (function (uvis) {
        (function (property) {
            /**
            * Create a new property.
            * The combination of owners id and property's id must be unique.
            * @ownerId is the id of the owner the property
            * @propDef is the JSON definition of the property
            */
            function create(key, value) {
                var prop;
                // determine if the property is calculated.
                prop = isCalculated(value) ? new CalculatedProperty(key, value) : new Property(key, value);
                return prop;
            }
            property.create = create;
            function isCalculated(value) {
                return false;
            }
            var Property = (function () {
                /**
                * Creates a new instance of a property.
                * @param key a string with representing the key of the property.
                * @param value an value of the property
                */
                function Property(key, value) {
                    this._key = key;
                    this._value = value;
                }
                Object.defineProperty(Property.prototype, "key", {
                    get: /** Gets this propertys' key */
                    function () {
                        return this._key;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Property.prototype, "value", {
                    get: /** Gets this propertys' value */
                    function () {
                        return this._value;
                    },
                    set: /** Sets this propertys' value */
                    function (value) {
                        // only set if value is different
                        if(this.value !== this.value) {
                            this._value = this.value;
                            this.notify();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Property.prototype.attach = function (source) {
                    if(this._subscribers.indexOf(source) !== -1) {
                        return;
                    }
                    this._subscribers.push(source);
                };
                Property.prototype.detach = function (source) {
                    if(this._subscribers.indexOf(source) !== -1) {
                        return;
                    }
                    this._subscribers = _.without(this._subscribers, source);
                };
                Property.prototype.notify = function () {
                    var _this = this;
                    _.each(this._subscribers, function (s) {
                        return s.onChange(_this);
                    });
                };
                return Property;
            })();
            property.Property = Property;            
            var CalculatedProperty = (function (_super) {
                __extends(CalculatedProperty, _super);
                function CalculatedProperty(key, func) {
                                _super.call(this, key);
                    this._isStale = true;
                    this._calculatorValue = func;
                }
                Object.defineProperty(CalculatedProperty.prototype, "value", {
                    get: function () {
                        if(this._isStale) {
                            this.calculateValue();
                        }
                        return _super.prototype.value;
                    },
                    enumerable: true,
                    configurable: true
                });
                CalculatedProperty.prototype.calculateValue = function () {
                    // test if this value is being updated already,
                    // indicates a cyclic dependency
                    if(this._updating) {
                        throw new Error("Property is updating, possible cyclic dependency. Property: " + this.key);
                    }
                    this._updating = true;
                    this.value = this._calculatorValue();
                    this._updating = false;
                };
                CalculatedProperty.prototype.onChange = function (target) {
                    this._isStale = true;
                };
                return CalculatedProperty;
            })(Property);
            property.CalculatedProperty = CalculatedProperty;            
        })(uvis.property || (uvis.property = {}));
        var property = uvis.property;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=property.js.map
