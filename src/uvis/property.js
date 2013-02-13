var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'uvis/util/promise'], function(require, exports, __utilModule__) {
    /// <reference path="../.typings/underscore-typed.d.ts" />
    var utilModule = __utilModule__;

    var util = utilModule.uvis.util;
    (function (uvis) {
        uvis.PropertyState = {
            CURRENT: 'current',
            STALE: 'stale',
            UPDATING: 'updating'
        };
        var Property = (function () {
            /**
            * Creates a new instance of a property.
            * @param key a string with representing the key of the property.
            * @param value an value of the property
            */
            function Property(key, value) {
                this._key = key;
                this._value = value;
                this._subscribers = [];
            }
            Object.defineProperty(Property.prototype, "key", {
                get: /** Gets this property's key */
                function () {
                    return this._key;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Property.prototype, "value", {
                get: /** Gets this property's value */
                function () {
                    return this._value;
                },
                set: /** Sets this propertys' value */
                function (newValue) {
                    // only set if value is different
                    if(this.value !== newValue) {
                        this._value = newValue;
                        this.notify();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Property.prototype.calculate = /** Triggers a re-calculation of the property's value */
            function () {
                return new util.Promise(this);
            };
            Object.defineProperty(Property.prototype, "state", {
                get: /** Gets this property's state.
                * PropertyState.CURRENT  = the property is up to date
                * PropertyState.UPDATING = the property is currently being calculated
                * PropertyState.STALE    = the property is needs updating
                */
                function () {
                    return uvis.PropertyState.CURRENT;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Property.prototype, "hasSubscribers", {
                get: function () {
                    return this._subscribers.length > 0;
                },
                enumerable: true,
                configurable: true
            });
            Property.prototype.subscribe = function (func) {
                // varify that func is not already subscribed
                if(this._subscribers.indexOf(func) !== -1) {
                    throw new Error('Already subscribed');
                }
                this._subscribers.push(func);
                return this;
            };
            Property.prototype.unsubscribe = function (func) {
                var index = this._subscribers.indexOf(func);
                if(index !== -1) {
                    this._subscribers.splice(index, 1);
                }
                return this;
            };
            Property.prototype.notify = function () {
                var _this = this;
                this._subscribers.forEach(function (fn) {
                    return fn(_this);
                });
            };
            return Property;
        })();
        uvis.Property = Property;        
        var CalculatedProperty = (function (_super) {
            __extends(CalculatedProperty, _super);
            function CalculatedProperty(key, func) {
                        _super.call(this, key);
                this._isStale = false;
                this._updating = false;
                this._calculatorFunc = func;
            }
            Object.defineProperty(CalculatedProperty.prototype, "state", {
                get: function () {
                    return this._updating ? uvis.PropertyState.UPDATING : this._isStale ? uvis.PropertyState.STALE : uvis.PropertyState.CURRENT;
                },
                enumerable: true,
                configurable: true
            });
            CalculatedProperty.prototype.calculate = function () {
                var _this = this;
                // if another callee have requested recalculation,
                // we reuse the same Promise object from that.
                if(this._calculatedPromise === undefined || this._calculatedPromise.state !== util.PromiseState.UNFULFILLED) {
                    this._calculatedPromise = new util.Promise();
                }
                this._updating = true;
                this._calculatorFunc().done(function (calculatedValue) {
                    // set updating and stale values
                    _this._updating = false;
                    _this._isStale = false;
                    // setting value triggers a notification of subscribers
                    _this.value = calculatedValue;
                    // fulfill the promise
                    _this._calculatedPromise.fulfill(_this);
                    // release this promise object so it can be collected
                    _this._calculatedPromise = undefined;
                }).fail(function (errorMsg) {
                    _this._updating = false;
                    _this._calculatedPromise.signalFail(errorMsg);
                    _this._calculatedPromise = undefined;
                });
                return this._calculatedPromise;
            };
            CalculatedProperty.prototype.dependencyChanged = /** Function to be called when a dependency has changed
            * @source the dependency that changed
            */
            function (source) {
                // if we are already updating, there is likely an
                // cyclic dependency and we should abort.
                if(this._updating && this._calculatedPromise) {
                    this._calculatedPromise.signalFail('Dependency has been changed while updating,' + 'possible cyclic dependency.Property: ' + this.key + '.Dependent: ' + source.key);
                }
                this._isStale = true;
                // only update if there are any subscribers,
                // otherwise we wait for somebody to request a recalculation
                // to save on resources.
                if(this.hasSubscribers) {
                    this.calculate();
                }
            };
            return CalculatedProperty;
        })(Property);
        uvis.CalculatedProperty = CalculatedProperty;        
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=property.js.map
