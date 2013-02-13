export module uvis.util {
    export var PromiseState = {
        FAILED: 'failed',
        FULFILLED: 'fulfilled',
        UNFULFILLED: 'unfulfilled'
    }

    export interface IPromise {
        state: string;
        done(...funcs: Function[]): IPromise;
        fail(...funcs: Function[]): IPromise;
    }

    // Inspiration - http://api.jquery.com/category/deferred-object/
    export class Promise implements IPromise {
        private _isFulfilled = false;
        private _isFailed = false;
        private _failError: string;
        private _doneFunctions: Function[] = [];
        private _failFunctions: Function[] = [];
        private _promisedValue: any;

        constructor(promisedValue?: any) {
            if (promisedValue !== undefined) {
                this.fulfill(promisedValue);
            }
        }

        get state(): string {
            return this._isFailed ? PromiseState.FAILED :
                   this._isFulfilled ? PromiseState.FULFILLED :
                    PromiseState.UNFULFILLED;
        }

        public fulfill(promisedValue?: any) {
            if (this._isFulfilled) throw new Error("Promise already fulfilled.");
            if (this._isFailed) throw new Error("Promise already failed.");
            this._promisedValue = promisedValue;
            this._isFulfilled = true;
            this.notify(this._doneFunctions, this._promisedValue);

            // remove all fail functions from array, as they should
            // not be called anyway now. This should make it possible
            // for the garbage collector can collect them.
            this._failFunctions.length = 0;
        }

        public signalFail(error: string) {
            if (this._isFulfilled) throw new Error("Promise already fulfilled.");
            if (this._isFailed) throw new Error("Promise already failed.");
            this._failError = error;
            this._isFailed = true;
            this.notify(this._failFunctions, this._failError);

            // remove all fail functions from array, as they should
            // not be called anyway now. This should make it possible
            // for the garbage collector can collect them.
            this._doneFunctions.length = 0;
        }

        /**
          * Get notified when this promise is fulfilled.
          */
        public done(...functions: Function[]): IPromise {
            // If the promise have been fulfilled, 
            // execute the functions passed to done,
            // otherwise add them to the local array
            // for later notificaiton.
            if (this._isFulfilled) {
                this.notify(functions, this._promisedValue);
            } else {
                // create the doneFunctions array
                if (this._doneFunctions === undefined) {
                    this._doneFunctions = [];
                }
                // push done functions onto the done array
                functions.forEach((fn) => (this._doneFunctions.push(fn)));
            }
            return this;
        }

        public fail(...functions: Function[]): IPromise {
            // If the promise have already failed, 
            // execute the functions passed to fail,
            // otherwise add them to the local array
            // for later notificaiton.
            if (this._isFailed) {
                this.notify(functions, this._failError);
            } else {
                // create the _failFunctions array
                if (this._failFunctions === undefined) {
                    this._failFunctions = [];
                }
                // push done functions onto the done array
                functions.forEach((fn) => (this._failFunctions.push(fn)));
            }
            return this;
        }

        private notify(functions: Function[], fnInput) {
            // Executes the function one time, removing each function
            // as it is exected.
            if (functions) {
                while (functions.length > 0) {
                    functions.shift()(fnInput);
                }
            }
        }
    }
}