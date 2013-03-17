export module uvis.instance {
    export class PropertyInstance {
        private _name: string;
        private _value: any;

        constructor(name: string, value: any) {
            this._name = name;
            this._value = value;
        }
        get name() {
            return this._name;
        }

        get value() {
            return this._value;
        }

        set value(value) {
            this._value = value;
        }
    }
}