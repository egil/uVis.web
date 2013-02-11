/// <reference path="../.typings/underscore-typed.d.ts" />
export module uvis.property {
    /**
      * Create a new property.
      * The combination of owners id and property's id must be unique.
      * @ownerId is the id of the owner the property
      * @propDef is the JSON definition of the property
      */
    export function create(key: string, value: any): Property {
        var prop: Property;

        // determine if the property is calculated.
        prop = isCalculated(value) ? new CalculatedProperty(key, value) : new Property(key, value);

        return prop;
    }

    function isCalculated(value): bool {
        return false;
    }

    export interface ISubscriber {
        onChange(target: IPublisher): void;
    }

    export interface IPublisher {
        attach(source: ISubscriber): void;
        detach(source: ISubscriber): void;
        notify(): void;
    }

    export class Property implements IPublisher {
        private _key: string;
        private _value: any;
        private _subscribers: ISubscriber[];

        /** 
          * Creates a new instance of a property.
          * @param key a string with representing the key of the property.
          * @param value an value of the property
          */
        constructor(key: string, value?: any) {
            this._key = key;
            this._value = value;
        }

        /** Gets this propertys' key */
        get key() {
            return this._key;
        }

        /** Gets this propertys' value */
        get value() {
            return this._value;
        }

        /** Sets this propertys' value */
        set value(value: any) {
            // only set if value is different
            if (this.value !== value) {
                this._value = value;
                this.notify();
            }
        }

        attach(source: ISubscriber): void {
            if (this._subscribers.indexOf(source) !== -1) return;
            this._subscribers.push(source);
        }

        detach(source: ISubscriber): void {
            if (this._subscribers.indexOf(source) !== -1) return;
            this._subscribers = _.without(this._subscribers, source);
        }

        notify(): void {
            _.each(this._subscribers, (s: ISubscriber) => s.onChange(this));
        }
    }

    export class CalculatedProperty extends Property implements ISubscriber {
        private _updating: bool;
        private _isStale: bool;
        private _calculatorValue: (...args: any[]) => any;

        constructor(key: string, func: (...args: any[]) => any) {
            super(key);
            this._isStale = true;
            this._calculatorValue = func;
        }

        get value() {
            if (this._isStale) {
                this.calculateValue();
            }
            return super.value;
        }

        calculateValue(): any {
            // test if this value is being updated already,
            // indicates a cyclic dependency
            if (this._updating) {
                throw new Error("Property is updating, possible cyclic dependency. Property: " + this.key);
            }
            this._updating = true;
            this.value = this._calculatorValue();
            this._updating = false;
        }

        onChange(target: IPublisher): void {
            this._isStale = true;
        }
    }
}