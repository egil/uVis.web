var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'uvis/util/promise'], function(require, exports, __utilModule__) {
    var utilModule = __utilModule__;

    var util = utilModule.uvis.util;
    (function (uvis) {
                uvis.PropertyState = {
            CURRENT: 'current',
            STALE: 'stale',
            STATIC: 'static',
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
                * PropertyState.STATIC   = the property is static and will always return the same result
                */
                function () {
                    return uvis.PropertyState.STATIC;
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
                // Following rule #67: Never call asynchronous callbacks synchronously
                this._subscribers.forEach(function (fn) {
                    nextTick(fn.bind(null, _this));
                });
            };
            return Property;
        })();
        uvis.Property = Property;        
        var CalculatedProperty = (function (_super) {
            __extends(CalculatedProperty, _super);
            function CalculatedProperty(key, calculatorFunc) {
                        _super.call(this, key);
                this._isStale = false;
                this._updating = false;
                this._calculatorFunc = calculatorFunc;
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
                // if already updating, subscrib to the current update
                if(this._updating && this._calculatedPromise !== undefined) {
                    return this._calculatedPromise;
                }
                // else create new promise and trigger calculation
                this._calculatedPromise = new util.Promise();
                this._updating = true;
                this._calculatorFunc().then(function (calculatedValue) {
                    // set updating and stale values
                    _this._updating = false;
                    _this._isStale = false;
                    // setting value triggers a notification of subscribers
                    _this.value = calculatedValue;
                    // fulfill the promise
                    _this._calculatedPromise.fulfill(_this);
                    // release this promise object so it can be collected
                    _this._calculatedPromise = undefined;
                }, function (errorMsg) {
                    _this._updating = false;
                    _this._calculatedPromise.reject(errorMsg);
                    _this._calculatedPromise = undefined;
                });
                return this._calculatedPromise;
            };
            CalculatedProperty.prototype.dependencyChanged = /** Function to be called when a dependency has changed
            * @source the dependency that changed
            */
            function (source) {
                this._isStale = true;
                // if there is already an update/recalculation
                // active, we do not react to the change in dependency
                // as the recalculation will pull the updated data
                // when it needs it.
                //
                // otherwise we trigger a recalculation if this property
                // has subscribers
                if(!this._updating && this.hasSubscribers) {
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
