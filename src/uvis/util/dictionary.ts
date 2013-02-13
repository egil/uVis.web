export module uvis.util {
    export class Dictionary {
        private _d = {};

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
            this._d[key] = value;
        }

        getItem(key): any {
            return this._d[key];
        }
        contains(key): bool {
            return this._d.hasOwnProperty(key);
        }
        /**
          * Remove a item from the dictionary.
          * @key of item to remove
          */
        remove(key: string): any {
            var item;
            if (this.contains(key)) {
                item = this._d[key];
                delete this._d[key];
            }
            return item;
        }

        forEach(func: (key: string, value: any) => void ) {
            for (var prop in this._d) {
                if (this.contains(prop)) {
                    func(prop, this._d[prop]);
                }
            }
        }
    }
}