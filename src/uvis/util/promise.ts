declare function nextTick(fn: Function): void;

export module uvis.util {
    export interface IPromise {
        then(onFulfilled?: Function, onRejected?: Function): IPromise;
        last(onFulfilled?: Function, onRejected?: Function): void;
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
          * @param onFulfilled The function to execute if the promise is fulfulled
          * @param onRejected The function to execute if the promise is rejected
          * @return A new IPromise object
          */
        public then(onFulfilled?: Function, onRejected?: Function): IPromise {
            return this.addHandlers(onFulfilled, onRejected, new Promise());
        }

        /**
          * Get notified when this promise is fulfilled or if it is rejected.
          * @param onFulfilled The function to execute if the promise is fulfulled
          * @param onRejected The function to execute if the promise is rejected
          */
        public last(onFulfilled?: Function, onRejected?: Function): void {
            this.addHandlers(onFulfilled, onRejected);
        }

        private addHandlers(onFulfilled?: Function, onRejected?: Function, promise2?: IPromise): IPromise {
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
                else if (cb.promise2 !== undefined) {
                    // else check if a promise2 exists, and fulfill or reject it as needed
                    if (state === PromiseState.FULFILLED) {
                        cb.promise2.fulfill(this._valueOrReason);
                    } else {
                        cb.promise2.reject(this._valueOrReason);
                    }
                }
            }
        }

        private execute(callback: (any) => any, promise2: Promise) {
            var promiseOrValue;

            // if promise2 is defined, we need to pass it 
            // the result of the onFulfilled/onRejected function
            if (promise2 !== undefined) {
                // catch errors, reject promise2
                try {
                    promiseOrValue = callback(this._valueOrReason);
                } catch (e) {
                    promise2.reject(e);
                    if (Promise.debug) {
                        var stack = e.stack === undefined ? [] :
                            e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                                   .replace(/^\s+at\s+/gm, '')
                                   .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                                   .split('\n');
                        console.error(e.message || e);
                        stack.forEach((line) => {
                            console.error('\t' + line);
                        });                       
                    }
                    return;
                }

                // if no error was found, fulfill promise2
                if (promiseOrValue instanceof Promise) {
                    promiseOrValue.last(promise2.fulfill.bind(promise2), promise2.reject.bind(promise2));
                }
                else {
                    promise2.fulfill(promiseOrValue);
                }
            } else {
                callback(this._valueOrReason);
            }
        }

        static resolve(promiseOrValue: any): IPromise {
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

        static fail(reason: any): IPromise {
            var p = new Promise();
            p.reject(reason);
            return p;
        }

        static join(...promises: IPromise[]): IPromise {
            return Promise.when(promises);
        }

        static when(promises: IPromise[]): IPromise {
            var joinedPromises = new Promise();
            var promisedValues = [];
            var pending = Array.isArray(promises) ? promises.length : 0;

            // if no promises was given as an argument, fulfill right away.
            if (pending === 0) {
                joinedPromises.fulfill(promisedValues);
            }
            else {
                // subscribe to the promises.
                // important: add the promised value to the same location
                // in results array as the original promise was positioned 
                // in the input promise array.
                promises.forEach((p, i) => {
                    p.last((v) => {
                        promisedValues[i] = v;
                        pending--;
                        if (pending === 0) {
                            joinedPromises.fulfill(promisedValues);                            
                        }
                    }, (e) => {
                        joinedPromises.reject(e)
                    });
                });
            }

            return joinedPromises;
        }

        static debug = false;
    }
}