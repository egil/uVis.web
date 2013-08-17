export class Dictionary<T> {
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
    add(key: string, value: T) {
        if (this.contains(key)) {
            throw new Error('Item with the key = "' + key + '" already exists in the dictionary.');
        }
        this.set(key, value);
    }
    
    get(key: string): T {
        if (key === "__proto__") {
            return this._specialProto;
        }
        return this._d[key];
    }

    /**
      * Sets a item to the dictionary.
      * @remark Overrides existing value if the specified key already exists.
      * @key The key of the element to add.
      * @value The value of the element to add. 
      */
    set(key: string, value: T) {
        if (key === "__proto__") {
            this._hasSpecialProto = true;
            this._specialProto = value;
        } else {
            this._d[key] = value;
        }
    }
    
    contains(key): boolean {
        if (key === "__proto__") {
            return this._hasSpecialProto;
        }
        return {}.hasOwnProperty.call(this._d, key);
    }
    /**
      * Remove a item from the dictionary.
      * @key of item to remove
      */
    remove(key: string): T {
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

    removeAll() {
        this._hasSpecialProto = false;
        this._specialProto = undefined;
        this._d = {};
    }
    
    forEach<T>(func: (key: string, value: T, count: number) => void) {
        var count = 0;
        for (var prop in this._d) {
            if (this.contains(prop)) {
                func(prop, this._d[prop], count++);
            }
        }
        if (this._hasSpecialProto) {
            func('__proto__', this._specialProto, count++);
        }
    }

    map<T>(func: (key: string, value: T, count: number) => any): any[] {
        var count = 0;
        var res = [];
        this.forEach((key, value) => {
            res.push(func(key, value, count++));
        });

        if (this._hasSpecialProto) {
            res.push(func('__proto__', this._specialProto, count++));
        }
        return res;
    }

    count(): number {
        var count = 0;
        this.forEach(_ => { count++; });
        return count;
    }
}