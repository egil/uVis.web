declare function nextTick(fn: Function): void;
export module uvis.util {
    //export var PromiseState = {
    //    FAILED: 'failed',
    //    FULFILLED: 'fulfilled',
    //    UNFULFILLED: 'unfulfilled'
    //}

    export interface IPromise {
        //state: string;
        then(onFulfilled: Function, onError?: Function): IPromise;
        fail(onError: Function): IPromise;
    }

    // Inspiration - http://api.jquery.com/category/deferred-object/
    // https://github.com/unscriptable/promises/blob/master/src/Async.js
    export class Promise implements IPromise {
        //private _state = PromiseState.UNFULFILLED;
        private _isUnfulfilled: bool = true;
        private _funcs: Object[] = [];
        private _value: any;

        constructor(promisedValue?: any) {
            if (promisedValue !== undefined) {
                this.fulfill(promisedValue);
            }
        }

        static when(promises: IPromise[]): IPromise {
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
                p.then((v) => {                    
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

        //get state(): string {
        //    return this._state;
        //}

        public fulfill(value?: any) {
            if (!this._isUnfulfilled) {
                throw new Error("Promise is not in an unfulfilled state.");
            }
            this._value = value;
            this._isUnfulfilled = false;
            this.notify('fulfilled');
        }

        public reject(error?: any) {
            if (!this._isUnfulfilled) {
                throw new Error("Promise is not in an unfulfilled state.");
            }
            this._value = error;
            this._isUnfulfilled = false;
            this.notify('failed');
        }

        /**
          * Get notified when this promise is fulfilled or if it is rejected.
          * @onFulfilled the function to execute if the promise is fulfulled
          * @onError the function to execute if the promise is rejected
          */
        public then(onFulfilled: Function, onError?: Function): IPromise {
            this._funcs.push({ 'fulfilled': onFulfilled, 'failed': onError });
            // if the promise has already been fulfilled or rejected, notify right away.
            if (!this._isUnfulfilled) {
                this.notify('fulfilled');
            }
            return this;
        }

        public fail(onError: Function): IPromise {
            return this.then(undefined, onError);
        }

        private notify(state) {
            // Executes the function one time, removing each function
            // as it is exected.
            var i = 0, cb;
            while (cb = this._funcs[i++]) {
                // check if there is a callback for the state and if so, execute.
                if (cb[state]) {
                    nextTick(cb[state].bind(null, this._value));
                }
            }

            // remove all elements from the array
            this._funcs.length = 0;
        }
    }
}