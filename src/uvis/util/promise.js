define(["require", "exports"], function(require, exports) {
        (function (uvis) {
        (function (util) {
            // Inspiration - http://api.jquery.com/category/deferred-object/
            // https://github.com/unscriptable/promises/blob/master/src/Async.js
            var Promise = (function () {
                function Promise(promisedValue) {
                    //private _state = PromiseState.UNFULFILLED;
                    this._isUnfulfilled = true;
                    this._funcs = [];
                    if(promisedValue !== undefined) {
                        this.fulfill(promisedValue);
                    }
                }
                Promise.when = function when(promises) {
                    var joinedPromises = new Promise();
                    var promisedValues = [];
                    var pending = promises.length;
                    // if no promises was given as an argument, fulfill right away.
                    if(pending === 0) {
                        joinedPromises.fulfill(promisedValues);
                    }
                    // subscribe to the promises.
                    // important: add the promised value to the same location
                    // in results array as the original promise was positioned
                    // in the input promise array.
                    promises.forEach(function (p, i) {
                        p.then(function (v) {
                            promisedValues[i] = v;
                            pending--;
                            if(pending === 0) {
                                joinedPromises.fulfill(promisedValues);
                            }
                        }, function (e) {
                            joinedPromises.reject(e);
                        });
                    });
                    return joinedPromises;
                };
                Promise.prototype.fulfill = //get state(): string {
                //    return this._state;
                //}
                function (value) {
                    if(!this._isUnfulfilled) {
                        throw new Error("Promise is not in an unfulfilled state.");
                    }
                    this._value = value;
                    this._isUnfulfilled = false;
                    this.notify('fulfilled');
                };
                Promise.prototype.reject = function (error) {
                    if(!this._isUnfulfilled) {
                        throw new Error("Promise is not in an unfulfilled state.");
                    }
                    this._value = error;
                    this._isUnfulfilled = false;
                    this.notify('failed');
                };
                Promise.prototype.then = /**
                * Get notified when this promise is fulfilled or if it is rejected.
                * @onFulfilled the function to execute if the promise is fulfulled
                * @onError the function to execute if the promise is rejected
                */
                function (onFulfilled, onError) {
                    this._funcs.push({
                        'fulfilled': onFulfilled,
                        'failed': onError
                    });
                    // if the promise has already been fulfilled or rejected, notify right away.
                    if(!this._isUnfulfilled) {
                        this.notify('fulfilled');
                    }
                    return this;
                };
                Promise.prototype.fail = function (onError) {
                    return this.then(undefined, onError);
                };
                Promise.prototype.notify = function (state) {
                    // Executes the function one time, removing each function
                    // as it is exected.
                                        var i = 0, cb;
                    while(cb = this._funcs[i++]) {
                        // check if there is a callback for the state and if so, execute.
                        if(cb[state]) {
                            nextTick(cb[state].bind(null, this._value));
                        }
                    }
                    // remove all elements from the array
                    this._funcs.length = 0;
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
