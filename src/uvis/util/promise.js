define(["require", "exports"], function(require, exports) {
    (function (uvis) {
        (function (util) {
            util.PromiseState = {
                FAILED: 'failed',
                FULFILLED: 'fulfilled',
                UNFULFILLED: 'unfulfilled'
            };
            // Inspiration - http://api.jquery.com/category/deferred-object/
            var Promise = (function () {
                function Promise(promisedValue) {
                    this._isFulfilled = false;
                    this._isFailed = false;
                    this._doneFunctions = [];
                    this._failFunctions = [];
                    if(promisedValue !== undefined) {
                        this.fulfill(promisedValue);
                    }
                }
                Object.defineProperty(Promise.prototype, "state", {
                    get: function () {
                        return this._isFailed ? util.PromiseState.FAILED : this._isFulfilled ? util.PromiseState.FULFILLED : util.PromiseState.UNFULFILLED;
                    },
                    enumerable: true,
                    configurable: true
                });
                Promise.prototype.fulfill = function (promisedValue) {
                    if(this._isFulfilled) {
                        throw new Error("Promise already fulfilled.");
                    }
                    if(this._isFailed) {
                        throw new Error("Promise already failed.");
                    }
                    this._promisedValue = promisedValue;
                    this._isFulfilled = true;
                    this.notify(this._doneFunctions, this._promisedValue);
                    // remove all fail functions from array, as they should
                    // not be called anyway now. This should make it possible
                    // for the garbage collector can collect them.
                    this._failFunctions.length = 0;
                };
                Promise.prototype.signalFail = function (error) {
                    if(this._isFulfilled) {
                        throw new Error("Promise already fulfilled.");
                    }
                    if(this._isFailed) {
                        throw new Error("Promise already failed.");
                    }
                    this._failError = error;
                    this._isFailed = true;
                    this.notify(this._failFunctions, this._failError);
                    // remove all fail functions from array, as they should
                    // not be called anyway now. This should make it possible
                    // for the garbage collector can collect them.
                    this._doneFunctions.length = 0;
                };
                Promise.prototype.done = /**
                * Get notified when this promise is fulfilled.
                */
                function () {
                    var _this = this;
                    var functions = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        functions[_i] = arguments[_i + 0];
                    }
                    // If the promise have been fulfilled,
                    // execute the functions passed to done,
                    // otherwise add them to the local array
                    // for later notificaiton.
                    if(this._isFulfilled) {
                        this.notify(functions, this._promisedValue);
                    } else {
                        // create the doneFunctions array
                        if(this._doneFunctions === undefined) {
                            this._doneFunctions = [];
                        }
                        // push done functions onto the done array
                        functions.forEach(function (fn) {
                            return (_this._doneFunctions.push(fn));
                        });
                    }
                    return this;
                };
                Promise.prototype.fail = function () {
                    var _this = this;
                    var functions = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        functions[_i] = arguments[_i + 0];
                    }
                    // If the promise have already failed,
                    // execute the functions passed to fail,
                    // otherwise add them to the local array
                    // for later notificaiton.
                    if(this._isFailed) {
                        this.notify(functions, this._failError);
                    } else {
                        // create the _failFunctions array
                        if(this._failFunctions === undefined) {
                            this._failFunctions = [];
                        }
                        // push done functions onto the done array
                        functions.forEach(function (fn) {
                            return (_this._failFunctions.push(fn));
                        });
                    }
                    return this;
                };
                Promise.prototype.notify = function (functions, fnInput) {
                    // Executes the function one time, removing each function
                    // as it is exected.
                    if(functions) {
                        while(functions.length > 0) {
                            functions.shift()(fnInput);
                        }
                    }
                };
                return Promise;
            })();
            util.Promise = Promise;            
        })(uvis.util || (uvis.util = {}));
        var util = uvis.util;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=promise.js.map
