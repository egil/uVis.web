/// <reference path="../.typings/require.d.ts" />
/// <reference path="../.typings/jquery.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('util/Dictionary');
import ct = require('uvis/Template');
import ids = require('uvis/data/IDataSource');

//import uci = require('uvis/ComponentInstance');
//import up = require('uvis/Property');

export module uvis {

    export interface FormDefinition {
        name: string;
        visible: boolean;
        content?: string;
        downloaded?: boolean;
    }

    export class App {
        private _baseUrl: string;
        private _forms = new ud.Dictionary<ct.uvis.Template>();
        private _formDefs = new ud.Dictionary<FormDefinition>();
        private _dataSources = new ud.Dictionary<ids.uvis.data.IDataSource>();

        constructor(baseUrl: string = '') {
            this._baseUrl = baseUrl;
        }

        get baseUrl() {
            return this._baseUrl;
        }

        get forms(): ud.Dictionary<utc.uvis.Template> {
            return this._forms;
        }

        get formDefs(): ud.Dictionary<FormDefinition> {
            return this._formDefs;
        }

        get dataSources(): ud.Dictionary<ids.uvis.data.IDataSource> {
            return this._dataSources;
        }

        addForm(form: ct.uvis.Template) {
            if (this.forms.contains(form.name)) {
                throw new Error('Form  with same name has already been added to application. { name: ' + form.name + ' }');
            }
            this.forms.add(form.name, form);
        }

        addFormDef(def: FormDefinition) {
            if (this.formDefs.contains(def.name)) {
                throw new Error('Form definition with same name has already been added to application. { name: ' + def.name + ' }');
            }
            this.formDefs.add(def.name, def);
        }

        addDataSource(def: ids.uvis.data.DataSourceDefinition) {
            require(['/src/uvis/data/' + def.name], (ds) => {
                // init data source, add to dict
            });
        }

        initialize() {
            this.formDefs.forEach((_, def) => {
                if (def.visible && !def.downloaded) {
                    this.downloadForm(def);
                }
            });
        }

        private downloadForm(def: FormDefinition) {            
            $.getJSON(this._baseUrl + def.name + '.json', null).then(content => {
                def.content = content;
                def.downloaded = true;
            }, err => {
                console.log(err);
            });
        }
    }
}