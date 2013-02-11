var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'uvis/util/dictionary'], function(require, exports, __dictModule__) {
    /// <reference path="../.typings/require.d.ts" />
    var dictModule = __dictModule__;

    //import odataModule = module('uvis/data/odata');
    var util = dictModule.uvis.util;
    (function (uvis) {
        (function (data) {
            function create(def) {
                var ds, type;
                type = def.type;
                switch(type) {
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
            data.create = create;
            var DataSource = (function () {
                function DataSource(id) {
                    this._properties = new util.Dictionary();
                    this._properties.add('id', id);
                }
                Object.defineProperty(DataSource.prototype, "id", {
                    get: function () {
                        return this.properties['id'];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DataSource.prototype, "properties", {
                    get: function () {
                        return this._properties;
                    },
                    enumerable: true,
                    configurable: true
                });
                return DataSource;
            })();
            data.DataSource = DataSource;            
            var OData = (function (_super) {
                __extends(OData, _super);
                function OData(id, uri) {
                                _super.call(this, id);
                    this._uri = uri;
                }
                Object.defineProperty(OData.prototype, "uri", {
                    get: function () {
                        return this._uri;
                    },
                    enumerable: true,
                    configurable: true
                });
                return OData;
            })(DataSource);
            data.OData = OData;            
        })(uvis.data || (uvis.data = {}));
        var data = uvis.data;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=data.js.map
