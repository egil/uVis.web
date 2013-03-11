import dictModule = module('uvis/util/Dictionary');
import promiseModule = module('uvis/util/Promise');
import helpersModule = module('uvis/util/Extensions');
import dataModule = module('uvis/data/IData');
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
        private _data: dataModule.uvis.data.IData;

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

        get data(): dataModule.uvis.data.IData {
            return this._data;
        }

        set data(value: dataModule.uvis.data.IData) {
            this._data = value;
        }

        addProperty(property: prop.Property) {
            this.properties.add(property.key, property);
        }

        createContent(): util.IPromise {
            throw new Error('AbstractComponent.createContent() should never be called directly. Must be overridden. (Component id = ' + this.id + ')');
        }
    }
}