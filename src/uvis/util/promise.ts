declare function nextTick(fn: Function): void;

export module uvis.util {
    export interface IPromise {
        then(onFulfilled: Function, onError?: Function): IPromise;
    }

    export var PromiseState = {
        FULFILLED: 'fulfilled',
        PENDING: 'pending',
        REJECTED: 'rejected'
    }

    /**
      * Promise A+ - an implementation of http://promises-aplus.github.com/promises-spec/
      */
    export class Promise implements IPromise {
        private _state = PromiseState.PENDING;
        private _funcs: Object[] = [];
        private _valueOrReason: any;

        get state() {
            return this._state;
        }

        static resolve(promiseOrValue: any) {
            var p;

            if (promiseOrValue instanceof Promise) {
                p = promiseOrValue;
            }
            else {
                p = new Promise();
                p.fulfill(promiseOrValue);
            }

            return p;
        }

        static when(promises: Promise[]): IPromise {
            var joinedPromises = new Promise();
            var promisedValues = [];
            var pending = promises.length;

            // if no promises was given as an argument, fulfill right away.
            if (pending === 0) {
                joinedPromises.fulfill(promisedValues);
            }

            // subscribe to the promises.
            // important: add the promised value to the same location
            // in results array as the original promise was positioned 
            // in the input promise array.
            promises.forEach((p, i) => {
                p.internalThen((v) => {
                    promisedValues[i] = v;
                    pending--;
                    if (pending === 0) {
                        joinedPromises.fulfill(promisedValues);
                    }
                }, (e) => {
                    joinedPromises.reject(e)
                });
            });

            return joinedPromises;
        }

        public fulfill(value?: any) {
            if (this.state !== PromiseState.PENDING) {
                throw new Error("Promise is not in an pending state.");
            }
            this._state = PromiseState.FULFILLED;
            this._valueOrReason = value;
            this.notify();
        }

        public reject(reason?: any) {
            if (this.state !== PromiseState.PENDING) {
                throw new Error("Promise is not in an pending state.");
            }
            this._state = PromiseState.REJECTED;
            this._valueOrReason = reason;
            this.notify();
        }

        /**
          * Get notified when this promise is fulfilled or if it is rejected.
          * @onFulfilled the function to execute if the promise is fulfulled
          * @onRejected the function to execute if the promise is rejected
          */
        public then(onFulfilled?: Function, onRejected?: Function): IPromise {
            return this.internalThen(onFulfilled, onRejected, new Promise());
        }

        private internalThen(onFulfilled: Function, onRejected: Function, promise2?: Promise): IPromise {
            this._funcs.push({ 'fulfilled': onFulfilled, 'rejected': onRejected, 'promise2': promise2 });

            // start async notification of the state is !== pending
            if (this.state !== PromiseState.PENDING) { this.notify(); }

            return promise2;
        }

        private notify() {
            // Executes the function one time, removing each function
            // as it is exected.
            var cb, state = this.state, funcs = this._funcs;
            while (cb = funcs.shift()) {
                // check if there is a callback for the state and if so, execute.
                if (cb[state] && cb[state] instanceof Function) {
                    nextTick(this.execute.bind(this, cb[state], cb.promise2));
                }
                else if (state === PromiseState.FULFILLED) {
                    cb.promise2.fulfill(this._valueOrReason);
                } else {
                    cb.promise2.reject(this._valueOrReason);
                }
            }

            // remove all elements from the array
            this._funcs.length = 0;
        }

        private execute(fn: (any) => any, promise2: Promise) {
            var promiseOrValue;

            if (promise2 !== undefined) {
                // catch errors, reject promise2
                try {
                    promiseOrValue = fn(this._valueOrReason);
                } catch (e) {
                    promise2.reject(e);
                    return;
                }

                // if no error was found, fulfill promise2
                if (promiseOrValue instanceof Promise) {
                    promiseOrValue.internalThen(promise2.fulfill.bind(promise2), promise2.reject.bind(promise2));
                }
                else {
                    promise2.fulfill(promiseOrValue);
                }
            } else {
                fn(this._valueOrReason);
            }
        }
    }
}