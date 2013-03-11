import utilModule = module('uvis/util/Promise');
import util = utilModule.uvis.util; 

export module uvis {
    declare function nextTick(fn: Function): void;

    export var PropertyState = {
        CURRENT: 'current',
        STALE: 'stale',
        STATIC: 'static',
        UPDATING: 'updating'
    }

    export class Property {
        private _key: string;
        private _value: any;
        private _subscribers: any[];

        /** 
          * Creates a new instance of a property.
          * @param key a string with representing the key of the property.
          * @param value an value of the property
          */
        constructor(key: string, value?: any) {
            this._key = key;
            this._value = value;
            this._subscribers = [];
        }

        /** Gets this property's key */
        get key() {
            return this._key;
        }

        /** Gets this property's value */
        get value() {
            return this._value;
        }

        /** Triggers a re-calculation of the property's value */
        calculate(): util.IPromise {
            return new util.Promise(this);
        }

        /** Gets this property's state.
          * PropertyState.CURRENT  = the property is up to date
          * PropertyState.UPDATING = the property is currently being calculated
          * PropertyState.STALE    = the property is needs updating
          * PropertyState.STATIC   = the property is static and will always return the same result
          */
        get state(): string {
            return PropertyState.STATIC;
        }

        /** Sets this propertys' value */
        set value(newValue: any) {
            // only set if value is different
            if (this.value !== newValue) {
                this._value = newValue;
                this.notify();
            }
        }

        get hasSubscribers(): bool {
            return this._subscribers.length > 0;
        }

        public subscribe(func: (property: Property) => void ): Property {
            // varify that func is not already subscribed
            if (this._subscribers.indexOf(func) !== -1) {
                throw new Error('Already subscribed');
            }
            this._subscribers.push(func);
            return this;
        }

        public unsubscribe(func: (property: Property) => void ): Property {
            var index = this._subscribers.indexOf(func);
            if (index !== -1) {
                this._subscribers.splice(index, 1);
            }
            return this;
        }

        private notify(): void {
            // Following rule #67: Never call asynchronous callbacks synchronously
            this._subscribers.forEach((fn) => {
                nextTick(fn.bind(null, this));
            });
        }
    }

    export class CalculatedProperty extends Property {
        private _isStale = false;
        private _updating = false;
        private _calculatedPromise: util.Promise;
        private _calculatorFunc: () => util.IPromise;

        constructor(key: string, calculatorFunc: () => util.IPromise) {
            super(key);
            this._calculatorFunc = calculatorFunc;
        }

        get state(): string {
            return this._updating ? PropertyState.UPDATING :
                   this._isStale ? PropertyState.STALE : PropertyState.CURRENT;
        }

        calculate(): util.IPromise {
            // if already updating, subscrib to the current update
            if (this._updating && this._calculatedPromise !== undefined) {
                return this._calculatedPromise;
            }
            // else create new promise and trigger calculation
            this._calculatedPromise = new util.Promise();
            this._updating = true;
            this._calculatorFunc().then((calculatedValue) => {
                // set updating and stale values
                this._updating = false;
                this._isStale = false;

                // setting value triggers a notification of subscribers
                this.value = calculatedValue;

                // fulfill the promise
                this._calculatedPromise.fulfill(this);

                // release this promise object so it can be collected
                this._calculatedPromise = undefined;
            }, (errorMsg) => {
                this._updating = false;
                this._calculatedPromise.reject(errorMsg);
                this._calculatedPromise = undefined;
            });

            return this._calculatedPromise;
        }

        /** Function to be called when a dependency has changed
          * @source the dependency that changed
          */
        public dependencyChanged(source: Property) {
            this._isStale = true;

            // if there is already an update/recalculation
            // active, we do not react to the change in dependency
            // as the recalculation will pull the updated data
            // when it needs it.
            //
            // otherwise we trigger a recalculation if this property
            // has subscribers
            if (!this._updating && this.hasSubscribers) {
                this.calculate();
            }
        }
    }
}