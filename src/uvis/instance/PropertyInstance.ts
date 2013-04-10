export module uvis.instance {
    export class PropertyInstance {
        private _id: string;
        private _value: any;

        constructor(id: string, value: any) {
            this._id = id;
            this._value = value;
        }
        get id() {
            return this._id;
        }

        get value() {
            return this._value;
        }

        set value(value) {
            this._value = value;
        }
    }
}