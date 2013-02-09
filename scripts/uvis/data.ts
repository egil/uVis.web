/// <reference path="../.typings/require.d.ts" />
import utilsModule = module('uvis/utils');
//import odataModule = module('uvis/data/odata');
import utils = utilsModule.uvis.utils;

export module uvis.data {
    
    export function create(def) : DataSource {
        var ds: DataSource,
            type: string;

        type = def.type;

        switch (type) {
            case 'odata':
                //require(['uvis/data/odata'], (odataModule) => {
                    ds = new OData(def.id, def.uri);
                //});
                //ds = new OData(def.id, def.uri);
                //ds = new DataSource(def.id);
                break;
            default:
                throw new Error('Unknown DataSource type: ' + type);
                break;
        }
        return ds;
    }

    export class DataSource {
        private _properties: utils.Dictionary;

        constructor(id: string) {
            this._properties = new utils.Dictionary();            
            this._properties.add('id', id);
        }

        get id(): string {
            return this.properties['id'];
        }

        get properties() {
            return this._properties;
        }
    }

    export class OData extends DataSource {
        private _uri: string;

        constructor(id: string, uri: string) {
            super(id);
            this._uri = uri;
        }

        get uri(): string {
            return this._uri;
        }
    }

}