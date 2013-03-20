import uiaiM = module('uvis/instance/AppInstance');
import uupM = module('uvis/util/Promise');
import uudM = module('uvis/util/Dictionary');
import utatM = module('uvis/template/AbstractTemplate');
import uthtM = module('uvis/template/HTMLTemplate');
import utftM = module('uvis/template/FormTemplate');
import utpstM = module('uvis/template/PropertySetTemplate');
import utptM = module('uvis/template/PropertyTemplate');
import utstM = module('uvis/template/ScreenTemplate');
import udjdsM = module('uvis/data/JSONDataSource');
import uddqM = module('uvis/data/DataQuery');

export module uvis.template {
    import uup = uupM.uvis.util;

    export interface AppDefinition {
        name: string;
        description?: string;
        dataSources: DataSourceDefinition[];
        propertySets?: PropertySetDefinition[];
        screens: ScreenDefinition[];
    }

    export interface DataSourceDefinition {
        id: string; // (\D[a-zA-Z]\w*)
        type: string; // JSON, OData, etc.
        source?: string; // usually an url to the resource, e.g. OData endpoint or JSON file
        data?: any;
    }

    export interface PropertySetDefinition {
        name: string;
        properties: PropertyDefinition[];
    }

    export interface ScreenDefinition {
        id: string; // (\D[a-zA-Z]\w*)
        name: string;
        url: string;
        forms: FormTemplateDefinition[];
    }

    export interface FormTemplateDefinition {
        id: string; // (\D[a-zA-Z]\w*)
        name?: string;
        visible: bool; // indicates if a form is visible by default at startup
        properties?: PropertyDefinition[];
        dataQuery?: DataQueryDefinition;
        children: TemplateDefinition[];
    }

    export interface TemplateDefinition {
        id: string; // (\D[a-zA-Z]\w*)
        type: string; // a valid Component id
        properties?: PropertyDefinition[];
        dataQuery?: DataQueryDefinition;
        children?: TemplateDefinition[];
    }

    export interface PropertyDefinition {
        name: string;
        expression?: any;
        // Default value to use if expression does not result in anything
        default?: any;
    }

    export interface DataQueryDefinition {
        expression: string;
        // Default value to use if expression does not result in anything
        default?: any;
    }

    export class AppTemplate {
        private _appdef: AppDefinition;

        constructor(appDefinitionAsJson: string) {
            this._appdef = JSON.parse(appDefinitionAsJson);

            // register template types, default is HTMLTemplate
            utatM.uvis.template.AbstractTemplate.registerTemplateType('*',
                (id: string, templateTypeId?: string) => {
                return new uthtM.uvis.template.HTMLTemplate(id, templateTypeId);
            });
        }

        public createInstance(): uiaiM.uvis.instance.AppInstance {
            // create data source instances
            var dataSources = this.createDataSourceTemplates(this._appdef.dataSources);

            // create property set bag and property set instances
            var propertySets = this.createPropertySetTemplates(this._appdef.propertySets);

            // create screens
            var screens = this.createScreenTemplates(this._appdef.screens);

            // create app instance and return it once filled
            var appInstance = new uiaiM.uvis.instance.AppInstance();
            appInstance.name = this._appdef.name;
            appInstance.description = this._appdef.description;
            appInstance.dataSources = dataSources;
            appInstance.propertySets = propertySets;
            appInstance.screens = screens;

            return appInstance;
        }

        private createDataSourceTemplates(def: DataSourceDefinition[]): uudM.uvis.util.Dictionary {
            var res = new uudM.uvis.util.Dictionary();

            def.forEach((dsDef) => {
                var ds;
                if (dsDef.type === 'JSON') {
                    ds = new udjdsM.uvis.data.JSONDataSource(dsDef.id, dsDef.source, dsDef.data);
                    res.add(dsDef.id, ds);
                }
            });
            return res;
        }

        private createPropertySetTemplates(def: PropertySetDefinition[]): uudM.uvis.util.Dictionary {
            var propertySets = new uudM.uvis.util.Dictionary();

            // iterate through all property set definitions
            def.forEach((setDef) => {
                // create a new template for each
                var psd = new utpstM.uvis.template.PropertySetTemplate(setDef.name);

                // and add all properties to it
                setDef.properties.forEach((propDef) => {
                    // be sure to compile and translate the expressions before continuing.
                    var compiledExpression = propDef.expression !== undefined ? AppTemplate.compile(AppTemplate.translate(propDef.expression)) : undefined;
                    psd.addProperty(new utptM.uvis.template.PropertyTemplate(propDef.name, compiledExpression, propDef.default));
                });

                propertySets.add(psd.name, psd);
            });

            return propertySets;
        }

        private createScreenTemplates(def: ScreenDefinition[]): uudM.uvis.util.Dictionary {
            var res = new uudM.uvis.util.Dictionary();

            def.forEach((sdef) => {
                var s = new utstM.uvis.template.ScreenTemplate(sdef.id, sdef.name, sdef.url);

                // foreach sDef.forms, create the form.
                sdef.forms.forEach((fdef: FormTemplateDefinition) => {
                    var f = new utftM.uvis.template.FormTemplate(fdef.id, fdef.name, fdef.visible);

                    // set parent
                    f.parent = s;

                    // create properties for form
                    if (fdef.properties !== undefined) {
                        fdef.properties.forEach((pdef) => {
                            f.addProperty(this.createPropertyTemplate(pdef));
                        });
                    }

                    // create and set the data query, if any.
                    if (fdef.dataQuery !== undefined) {
                        f.dataSource = this.createDataQuery(fdef.dataQuery);
                    }

                    // create child templates
                    fdef.children.forEach((tdef: TemplateDefinition) => {
                        f.addChild(this.createTemplate(tdef, f));
                    });

                    // add to screen
                    s.addChild(f);
                });

                // add to result
                res.add(s.url, s);
            });
            return res;
        }

        private createTemplate(def: TemplateDefinition, parent: utatM.uvis.template.AbstractTemplate): utatM.uvis.template.AbstractTemplate {
            var c = utatM.uvis.template.AbstractTemplate.create(def.id, def.type);
         
            // set parent
            c.parent = parent;

            // create properties for form
            if (def.properties !== undefined) {
                def.properties.forEach((pdef) => {
                    c.addProperty(this.createPropertyTemplate(pdef));
                });
            }

            // create and set the data query, if any.
            if (def.dataQuery !== undefined) {
                c.dataSource = this.createDataQuery(def.dataQuery);
            }

            // create child templates
            if (def.children !== undefined) {
                def.children.forEach((tdef: TemplateDefinition) => {
                    c.addChild(this.createTemplate(tdef, c));
                });
            }

            return c;
        }

        private createPropertyTemplate(def: PropertyDefinition): utptM.uvis.template.PropertyTemplate {
            var compiledExpression = def.expression !== undefined ? AppTemplate.compile(AppTemplate.translate(def.expression)) : undefined;
            var p = new utptM.uvis.template.PropertyTemplate(def.name, compiledExpression, def.default);
            return p;
        }

        private createDataQuery(def: DataQueryDefinition): uddqM.uvis.data.DataQuery {
            var compiledExpression = AppTemplate.compile(AppTemplate.translate(def.expression));
            var dq = new uddqM.uvis.data.DataQuery(compiledExpression, def.default);
            return dq;
        }

        /**
          * Takes a uVis statement/code and returns
          * valid JavaScript code that can be executed
          */
        static translate(expression: string): string {
            var defaultPreample = '"use strict";var index=___c___.index;var data=___c___.data;var parent=___c___.parent;var map=___c___.map;var resolve=___c___.resolve;';
            var code = defaultPreample;
            code += AppTemplate.debug ? 'console.log("executing: ' + expression + '"); console.log(___c___);' : '';
            code += 'return ___c___.resolve(' + expression + ');';

            return code;
        }

        static compile(javaScriptCode: string): Function {
            return new Function('___c___', javaScriptCode);
        }

        static debug = false;
    }
}