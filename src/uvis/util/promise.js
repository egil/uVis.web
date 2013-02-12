define(["require", "exports"], function(require, exports) {
    (function (uvis) {
        (function (util) {
            // Inspiration - http://api.jquery.com/category/deferred-object/
            var Promise = (function () {
                function Promise(promisedValue) {
                    this._isFulfilled = false;
                    this._isFailed = false;
                    if(promisedValue !== undefined) {
                        this.fulfill(promisedValue);
                    }
                }
                Object.defineProperty(Promise.prototype, "state", {
                    get: function () {
                        return this._isFailed ? 'failed' : this._isFulfilled ? 'fulfilled' : 'unfulfilled';
                    },
                    enumerable: true,
                    configurable: true
                });
                Promise.prototype.fulfill = function (promisedValue) {
                    if(this._isFulfilled) {
                        throw new Error("Promise already fulfilled.");
                    }
                    this._promisedValue = promisedValue;
                    this._isFulfilled = true;
                    this.notifyDone();
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
                        this.notifyDone(functions);
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
                Promise.prototype.notifyDone = function (functions) {
                    functions = functions === undefined ? this._doneFunctions : functions;
                    // Executes the function one time, removing each function
                    // as it is exected.
                    if(functions) {
                        while(functions.length > 0) {
                            functions.shift()(this._promisedValue);
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
