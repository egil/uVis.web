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

    export interface DataQueryDefinition {
        expression: string;
        // Default value to use if expression does not result in anything
        default?: any;
    }

    export class AppTemplate {
        private _appdef: AppDefinition;

        /**
          * If set to true, the generated code will include
          * debug information.
          */
        public static debug = false;

        constructor(appDefinition: AppDefinition, debug = false) {
            this._appdef = appDefinition;

            uupM.uvis.util.Promise.debug = debug;
            AppTemplate.debug = debug;

            // validate app definition if in debug mode
            if (AppTemplate.debug) {
                AppDefinitionValidator.validate(this._appdef);
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
            if (this._appdef.propertySets) {
                propertySets = this.createPropertySetTemplates(this._appdef.propertySets);
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

        private createDataSourceTemplates(def: DataSourceDefinition[]): uudM.uvis.util.Dictionary {
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

        private createPropertySetTemplates(def: PropertySetDefinition[]): uudM.uvis.util.Dictionary {
            var propertySets = new uudM.uvis.util.Dictionary();

            // iterate through all property set definitions
            def.forEach((setDef) => {
                // create a new template for each
                var psd = new utpstM.uvis.template.PropertySetTemplate(setDef.name);

                // and add all properties to it
                setDef.properties.forEach((propDef) => {
                    // be sure to compile and translate the expressions before continuing.
                    var compiledExpression = propDef.expression !== undefined ? AppTemplate.compile(AppTemplate.translate(propDef.expression, 'property')) : undefined;
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
            var compiledExpression = def.expression !== undefined ? AppTemplate.compile(AppTemplate.translate(def.expression, 'property')) : undefined;
            var p = new utptM.uvis.template.PropertyTemplate(def.name, compiledExpression, def.default);
            return p;
        }

        private createDataQuery(def: DataQueryDefinition): uddqM.uvis.data.DataQuery {
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

    export class AppDefinitionValidator {
        private static prefixMsg = 'Invalid definition: ';
        private static invalidId = ' is not valid. It must start with a letter, and only contain numbers, letters, and underscores. Provided value was: ';
        private static idRegex = /^[\S][a-zA-Z]\w*$/;

        public static validate(def: AppDefinition) {
            if (def === undefined || def === null)
                throw new Error(prefixMsg + 'definition is null or undefined.');

            if (!def.name || !idRegex.test(def.name))
                throw new Error(prefixMsg + 'app.name' + invalidId);

            if (!Array.isArray(def.dataSources) || def.dataSources.length === 0)
                throw new Error(prefixMsg + 'app.dataSources is empty or not an array.');

            if (!Array.isArray(def.screens) || def.screens.length === 0)
                throw new Error(prefixMsg + 'app.screens is empty or not an array.');

            var unknownProperties = unknownProperties(def, ['name', 'description', 'dataSources', 'propertySets', 'screens']);
            if (unknownProperties.length > 0)
                throw new Error(prefixMsg + 'app contains unknown properties. Unknown properties are: ' + unknownProperties);

            validateDataSources(def.dataSources);
            validatePropertySets(def.propertySets);
            validateScreens(def.screens);
        }


        private static validateDataSources(dataSourcesDef: DataSourceDefinition[]) {
            var dataSourceTypes = ['JSON'];
            var allowedProperties = ['id', 'type', 'source', 'data'];

            dataSourcesDef.forEach((def) => {
                var unkProps = '';
                if (!def.id || !idRegex.test(def.id))
                    throw new Error(prefixMsg + 'dataSource.id' + invalidId);

                if (!def.type || dataSourceTypes.indexOf(def.type) !== -1)
                    throw new Error(prefixMsg + 'dataSource[' + def.id + '].type is not valid or undefined. Value is: ' + def.type);

                if (isUndefinedOrEmpty(def.source) && !def.data || def instanceof Object) {
                    throw new Error(prefixMsg + 'dataSource[' + def.id + '] both source and data is undefined or empty.');
                }

                unkProps = unknownProperties(def, allowedProperties);
                if (unkProps.length > 0)
                    throw new Error(prefixMsg + 'dataSource[' + def.id + '] contains unknown properties. Unknown properties are: ' + unkProps);
            });
        }

        private static validatePropertySets(propertySetsDef: PropertySetDefinition[]) {
            var allowedProperties = ['name', 'properties'];

            propertySetsDef.forEach((def) => {
                var unkProps = '';
                if (!def.name || !idRegex.test(def.name))
                    throw new Error(prefixMsg + 'propertySet.name' + invalidId);
                
                if (!Array.isArray(def.properties) || def.properties.length === 0)
                    throw new Error(prefixMsg + 'propertySet[' + def.name + '] both source and data is undefined or empty.');
                
                unkProps = unknownProperties(def, allowedProperties);
                if (unkProps.length > 0)
                    throw new Error(prefixMsg + 'propertySet[' + def.name + '] contains unknown properties. Unknown properties are: ' + unkProps);

                validateProperties(def.properties);
            });
        }

        private static validateScreens(validateScreensDef: ScreenDefinition[]) {
            //id: string; // (\D[a-zA-Z]\w*)
            //name: string;
            //url: string;
            //forms: FormTemplateDefinition[];
            var allowedProperties = ['id', 'name', 'url', 'forms'];

            validateScreensDef.forEach((def) => {
                var unkProps = '';
                if (!def.id || !idRegex.test(def.id))
                    throw new Error(prefixMsg + 'screen.id' + invalidId);

                if (isUndefinedOrEmpty(def.name))
                    throw new Error(prefixMsg + 'screen[' + def.id + '].name is undefined or empty.');
                
                if (isUndefinedOrEmpty(def.url))
                    throw new Error(prefixMsg + 'screen[' + def.id + '].url is undefined or empty.');

                if (!Array.isArray(def.forms) || def.forms.length === 0)
                    throw new Error(prefixMsg + 'screen[' + def.id + '].forms is undefined or empty.');                

                unkProps = unknownProperties(def, allowedProperties);
                if (unkProps.length > 0)
                    throw new Error(prefixMsg + 'propertySet[' + def.id + '] contains unknown properties. Unknown properties are: ' + unkProps);

                validateForms(def.forms);
            });
        }

        private static validateForms(def: FormTemplateDefinition[]) {
            // TODO
        }

        private static validateProperties(def: PropertyDefinition[]) {
            def.forEach(validateProperty);
        }

        private static validateProperty(def: PropertyDefinition) {
            var allowedProperties = ['name', 'properties', 'default'];
            var unkProps = '';

            if (!def.name || !idRegex.test(def.name))
                throw new Error(prefixMsg + 'property.name' + invalidId);

            if (isUndefinedOrEmpty(def.default) && isUndefinedOrEmpty(def.expression))
                throw new Error(prefixMsg + 'property[' + def.name + '] both default and expression is undefined or empty.');

            unkProps = unknownProperties(def, allowedProperties);
            if (unkProps.length > 0)
                throw new Error(prefixMsg + 'property[' + def.name + '] contains unknown properties. Unknown properties are: ' + unkProps);
        }

        private static isUndefinedOrEmpty(str: string) {
            return str === undefined || str.length === 0;
        }

        private static unknownProperties(obj: Object, expectedProperties: string[]): string {
            var keys = Object.keys(obj);
            var result: string = keys.reduce((previousValue, currentValue, index, arr) => {
                if (expectedProperties.indexOf(currentValue) === -1) {
                    // add a , if inbetween values, add a [ at the begining of the list
                    previousValue += previousValue.length > 0 ? ',' : '[';

                    // add current value
                    previousValue += ' ' + currentValue;

                    // add an ] to the end of the list
                    previousValue += arr.length - 1 === index ? ']' : '';
                }
                return previousValue;
            }, '');
            return result;
        }
    }

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
        expression?: string;
        // Default value to use if expression does not result in anything
        default?: string;
    }
}