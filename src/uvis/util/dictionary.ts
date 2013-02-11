export module uvis.util {
    export class Dictionary {
        get (key: string): any {
            return this[key];
        }

        /**
          * Set the value for a specific key.
          */
        set (key: string, value: any) {
            this[key] = value;
        }

        contains(key): bool {
            return this[key] !== undefined;
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
            this[key] = value;
        }
    }
}