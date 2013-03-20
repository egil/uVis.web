export module uvis.util {
    export class Dictionary {
        private _d;
        private _hasSpecialProto = false;
        private _specialProto: any;

        constructor(initialElements?: Object) {
            this._d = initialElements || {};
        }

        /**
          * Add a item to the dictionary.
          * @remark method throws an exception if a value with the specified key already exists.
          * @key The key of the element to add.
          * @value The value of the element to add. 
          */
        add(key: string, value: any) {
            if (this.contains(key)) {
                throw new Error('Item with the key = "' + key + '" already exists in the dictionary.');
            }
            this.set(key, value);
        }
        
        get(key: string): any {
            if (key === "__proto__") {
                return this._specialProto;
            }
            return this.contains(key) ? this._d[key] : undefined;
        }

        /**
          * Sets a item to the dictionary.
          * @remark Overrides existing value if the specified key already exists.
          * @key The key of the element to add.
          * @value The value of the element to add. 
          */
        set(key:string, value: any) {
            if (key === "__proto__") {
                this._hasSpecialProto = true;
                this._specialProto = value;
            } else {
                this._d[key] = value;
            }
        }
        
        contains(key): bool {
            if (key === "__proto__") {
                return this._hasSpecialProto;
            }
            return {}.hasOwnProperty.call(this._d, key);
        }
        /**
          * Remove a item from the dictionary.
          * @key of item to remove
          */
        remove(key: string): any {
            var item;
            if (key === "__proto__") {
                this._hasSpecialProto = false;
                item = this._specialProto;
                this._specialProto = undefined;
            } else {
                item = this._d[key];
                delete this._d[key];
            }
            return item;
        }
        
        forEach(func: (key: string, value: any) => void) {
            for (var prop in this._d) {
                if (this.contains(prop)) {
                    func(prop, this._d[prop]);
                }
            }
        }

        map(func: (key: string, value: any) => any ) : any[] {
            var res = [];
            this.forEach((key, value) => {
                res.push(func(key, value));
            });
            return res;
        }
    }
}