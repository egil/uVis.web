import dictModule = module('uvis/util/Dictionary');
import promiseModule = module('uvis/util/Promise');
import helpersModule = module('uvis/util/Extensions');
import propertyModule = module('uvis/Property');

export module uvis.template {
    import dict = dictModule.uvis.util;
    import util = promiseModule.uvis.util;
    import prop = propertyModule.uvis;
    import helpers = helpersModule.uvis.util;

    export class AbstractTemplate {
        private _children: AbstractTemplate[] = [];
        private _properties =  new dict.Dictionary();
        private _id: string;
        private _data: prop.Property;

        constructor(id: string) {
            if (typeof (id) !== 'string' || id.length === 0) {
                throw new Error('Supplied id is not a string or an empty string.');
            }
            this._id = id;
        }

        get id(): string {
            return this._id;
        }

        get children(): AbstractTemplate[] {
            return this._children;
        }

        get properties(): dict.Dictionary {
            return this._properties;
        }

        get data(): prop.Property {
            return this._data;
        }

        set data(value) {
            this._data = value;
        }

        createContent(): util.IPromise {
            throw new Error('AbstractComponent.createContent() should never be called directly. Must be overridden. (Component id = ' + this.id + ')');
        }
    }
}