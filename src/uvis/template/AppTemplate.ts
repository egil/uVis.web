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
import utdM = module('uvis/template/Definitions');
import utadvM = module('uvis/template/AppDefinitionValidator');

export module uvis.template {
    import uup = uupM.uvis.util;

    export class AppTemplate {
        private _appdef: utdM.uvis.template.AppDefinition;

        /**
          * If set to true, the generated code will include
          * debug information.
          */
        public static debug = false;

        constructor(appDefinition: utdM.uvis.template.AppDefinition, debug = false) {
            this._appdef = appDefinition;

            uupM.uvis.util.Promise.debug = debug;
            AppTemplate.debug = debug;

            // validate app definition if in debug mode
            if (AppTemplate.debug) {
                utadvM.uvis.template.AppDefinitionValidator.validate(this._appdef);
            }

            // register template types, default is HTMLTemplate
            utatM.uvis.template.AbstractTemplate.registerTemplateType('*',
                (id: string, templateTypeId?: string) => {
                    return new uthtM.uvis.template.HTMLTemplate(id, templateTypeId);
                });
        }

        public createInstance(): uiaiM.uvis.instance.AppInstance {
            var dataSources, propertySets, screens, appInstance;

            // create data source instances
            dataSources = this.createDataSourceTemplates(this._appdef.dataSources);

            // create property set bag and property set instances
            if (Array.isArray(this._appdef.propertySets)) {
                var dict = new uudM.uvis.util.Dictionary();
                this.createPropertyTemplates(this._appdef.propertySets).forEach((prop) => {
                    dict.add(prop.name, prop);
                });
                propertySets = dict;
            }

            // create screens
            screens = this.createScreenTemplates(this._appdef.screens);

            // create app instance and return it once filled
            appInstance = new uiaiM.uvis.instance.AppInstance();
            appInstance.name = this._appdef.name;
            appInstance.description = this._appdef.description;
            appInstance.dataSources = dataSources;
            appInstance.propertySets = propertySets;
            appInstance.screens = screens;

            return appInstance;
        }

        private createDataSourceTemplates(def: utdM.uvis.template.DataSourceDefinition[]): uudM.uvis.util.Dictionary {
            var res = new uudM.uvis.util.Dictionary();

            def.forEach((dsdef) => {
                var ds;
                if (dsdef.type === 'JSON') {
                    ds = new udjdsM.uvis.data.JSONDataSource(dsdef.id, dsdef.source, dsdef.data);
                    res.add(dsdef.id, ds);
                }
            });
            return res;
        }

        private createScreenTemplates(def: utdM.uvis.template.ScreenDefinition[]): uudM.uvis.util.Dictionary {
            var res = new uudM.uvis.util.Dictionary();

            def.forEach((sdef) => {
                var s = new utstM.uvis.template.ScreenTemplate(sdef.id, sdef.name, sdef.url);

                // foreach sDef.forms, create the form.
                sdef.forms.forEach((fdef: utdM.uvis.template.FormTemplateDefinition) => {
                    var f = new utftM.uvis.template.FormTemplate(fdef.id, fdef.name, fdef.visible);

                    // set parent
                    f.parent = s;

                    // create properties for form
                    if (Array.isArray(fdef.properties)) {
                        f.addProperties(this.createPropertyTemplates(fdef.properties));                        
                    }

                    // create and set the data query, if any.
                    if (fdef.dataQuery !== undefined) {
                        f.dataSource = this.createDataQuery(fdef.dataQuery);
                    }

                    // create child templates
                    fdef.children.forEach((tdef: utdM.uvis.template.TemplateDefinition) => {
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

        private createTemplate(def: utdM.uvis.template.TemplateDefinition, parent: utatM.uvis.template.AbstractTemplate): utatM.uvis.template.AbstractTemplate {
            var c = utatM.uvis.template.AbstractTemplate.create(def.id, def.type);

            // set parent
            c.parent = parent;

            // create properties for form
            if (Array.isArray(def.properties)) {
                c.addProperties(this.createPropertyTemplates(def.properties));
            }

            // create and set the data query, if any.
            if (def.dataQuery !== undefined) {
                c.dataSource = this.createDataQuery(def.dataQuery);
            }

            // create child templates
            if (def.children !== undefined) {
                def.children.forEach((tdef: utdM.uvis.template.TemplateDefinition) => {
                    c.addChild(this.createTemplate(tdef, c));
                });
            }

            return c;
        }

        private createPropertyTemplates(def: utdM.uvis.template.PropertyDefinition[]): utptM.uvis.template.PropertyTemplate[] {
            return def.map((pdef) => {
                return this.createPropertyTemplate(pdef);
            });
        }

        private createPropertyTemplate(def: utdM.uvis.template.PropertyDefinition): utptM.uvis.template.PropertyTemplate {
            var compiledExpression;
            var result;
            
            // create a propertyset or a property?
            if (Array.isArray(def.properties)) {
                result = new utpstM.uvis.template.PropertySetTemplate(def.id, def.default);
                result.addProperties(this.createPropertyTemplates(def.properties));
            } else {
                compiledExpression = def.expression !== undefined ? AppTemplate.compile(AppTemplate.translate(def.expression, 'property')) : undefined;
                result = new utptM.uvis.template.PropertyTemplate(def.id, compiledExpression, def.default);
            }

            return result;
        }

        private createDataQuery(def: utdM.uvis.template.DataQueryDefinition): uddqM.uvis.data.DataQuery {
            var compiledExpression = AppTemplate.compile(AppTemplate.translate(def.expression, 'data query'));
            var dq = new uddqM.uvis.data.DataQuery(compiledExpression, def.default);
            return dq;
        }

        /**
          * Takes a uVis statement/code and returns
          * valid JavaScript code that can be executed
          */
        private static translate(expression: string, type: string): string {
            var defaultPreample = "\"use strict\";\nvar ___res___;\nvar index=___c___.index;\nvar data=___c___.data;\nvar parent=___c___.parent;\nvar map=___c___.map;\nvar resolve=___c___.resolve;\n";
            var code = defaultPreample;
            code += AppTemplate.debug ? "console.debug(\"Executing " + type + " expression: " + expression.replace(/(")/g, "\\$1") + "\");\nconsole.debug(___c___);\n" : "";
            code += "___res___=" + expression + ";\n";
            code += "return ___c___.resolve(___res___);";
            return code;
        }

        private static compile(javaScriptCode: string): Function {
            return new Function('___c___', javaScriptCode);
        }
    }    
}