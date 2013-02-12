export module uvis.util {
    export interface IPromise {
        state: string;
        done(...functions: Function[]): IPromise;
    }

    // Inspiration - http://api.jquery.com/category/deferred-object/
    export class Promise implements IPromise {
        private _isFulfilled = false;
        private _isFailed = false;
        private _doneFunctions: Function[];
        private _promisedValue: any;

        constructor(promisedValue?: any) {
            if (promisedValue !== undefined) {
                this.fulfill(promisedValue);
            }
        }

        get state(): string {
            return this._isFailed ? 'failed' :
                   this._isFulfilled ? 'fulfilled' :
                   'unfulfilled';
        }

        fulfill(promisedValue: any) {
            if (this._isFulfilled) throw new Error("Promise already fulfilled.");
            this._promisedValue = promisedValue;
            this._isFulfilled = true;
            this.notifyDone();
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
                this.notifyDone(functions);
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

        private notifyDone(functions?: Function[]) {
            functions = functions === undefined ? this._doneFunctions : functions;
            // Executes the function one time, removing each function
            // as it is exected.
            if (functions) {
                while (functions.length > 0) {
                    functions.shift()(this._promisedValue);
                }
            }
        }
    }
}