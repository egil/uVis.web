import uudM = module('uvis/util/Dictionary');
import uccM = module('uvis/component/Context');
import ucctM = module('uvis/component/ComponentTemplate');
import ucciM = module('uvis/component/ComponentInstance');
import ucpM = module('uvis/component/Property');
import ucpsM = module('uvis/component/PropertySet');
import uceM = module('uvis/component/Event');
import udM = module('uvis/component/Definitions');
import udoddsM = module('uvis/data/ODataDataSource');
import uddvM = module('uvis/data/DataView');
import uddsM = module('uvis/data/DataSource');

export module uvis {
    import ucct = ucctM.uvis.component;
    import ucp = ucpM.uvis.component;
    import ucps = ucpsM.uvis.component;    
    import ucc = uccM.uvis.component;
    import ucci = ucciM.uvis.component;
    import uce = uceM.uvis.component;

    var debug = false;

    export function createAppInstance(appDefinition: udM.uvis.AppDefinition, debugEnabled = false) {
        var dataSources, propertySets, screens, app;

        debug = debugEnabled;

        // create data source instances
        dataSources = createDataSourceTemplates(appDefinition.dataSources);

        //// create property set bag and property set instances
        //if (Array.isArray(this._appdef.propertySets)) {
        //    var dict = new uudM.uvis.util.Dictionary();
        //    this.createPropertyTemplates(this._appdef.propertySets).forEach((prop) => {
        //        dict.add(prop.id, prop);
        //    });
        //    propertySets = dict;
        //}

        // create screens
        screens = createScreenTemplates(appDefinition.screens);

        // create app instance and return it once filled
        app = new App(appDefinition.name);
        app.description = appDefinition.description;
        app.dataSources = dataSources;
        //app.propertySets = propertySets;
        app.screens = screens;

        return app;
    }

    function createDataSourceTemplates(def: udM.uvis.DataSourceDefinition[]): uudM.uvis.util.Dictionary {
        var res = new uudM.uvis.util.Dictionary();

        def.forEach((dsdef) => {
            var ds = createDataSourceTemplate(dsdef);
            res.add(dsdef.id, ds);
        });
        return res;
    }

    function createDataSourceTemplate(def: udM.uvis.DataSourceDefinition): uddsM.uvis.data.IDataSource {
        var ds;
        var qfn;
        switch (def.type.toUpperCase()) {
            case 'ODATA':
                ds = new udoddsM.uvis.data.ODataDataSource(def.id, def.url);
                ucc.Context.dataSources.add(def.id, ds);
                break;
            case 'VIEW':
                qfn = compileQuery(translateQuery(def.query));
                ds = new uddvM.uvis.data.DataView(def.id, () => ucc.Context.dataSources.get(def.source), qfn);
                break;
            case 'SESSION':
                console.error('SESSION not implemented');
                break;
        }
        return ds;
    }

    function translateQuery(expression: string) {
        var defaultPreample = "\"use strict\";\nvar ___res___;\nvar index=___c___.index;\nvar data=___c___.data;\nvar parent=___c___.parent;\nvar map=___c___.dataSources;\nvar forms=___c___.forms;\nvar combine=___c___.combine;\n";
        var code = defaultPreample;
        code += debug ? "console.debug(\"Executing query expression: " + expression.replace(/(")/g, "\\$1") + "\");\nconsole.debug(___c___);\n" : "";
        code += "___res___=" + expression + ";\n";
        code += "return ___res___;";
        return code;
    }

    function compileQuery(javaScriptCode: string): Function {
        return new Function('source', '___c___', javaScriptCode);
    }

    function createScreenTemplates(def: udM.uvis.ScreenDefinition[]): uudM.uvis.util.Dictionary {
        var res = new uudM.uvis.util.Dictionary();

        def.forEach((sdef) => {
            var s = new ucct.ScreenComponentTemplate(sdef.id, sdef.name, sdef.url);

            // foreach sDef.forms, create the form.
            sdef.forms.forEach((fdef: udM.uvis.FormTemplateDefinition) => {
                var f = new ucct.FormComponentTemplate(fdef.id, fdef.name, fdef.visible);

                // set parent
                f.parent = s;

                // create properties for form
                if (Array.isArray(fdef.properties)) {
                    f.addProperties(createPropertyTemplates(fdef.properties));
                }

                // create and set the data query, if any.
                if (fdef.data !== undefined) {
                    f.data = createDataSourceTemplate(fdef.data);
                }

                // create child templates
                fdef.children.forEach((tdef: udM.uvis.TemplateDefinition) => {
                    f.addChild(createTemplate(tdef, f));
                });

                // add to screen
                s.addChild(f);
            });

            // add to result
            res.add(s.url, s);
        });
        return res;
    }

    function createTemplate(def: udM.uvis.TemplateDefinition, parent: ucct.ComponentTemplate): ucct.ComponentTemplate {
        var c = new ucct.HTMLComponentTemplate(def.type, def.id, parent);
        
        // create properties for form
        if (Array.isArray(def.properties)) {
            c.addProperties(createPropertyTemplates(def.properties));
        }

        // create and set the data query, if any.
        if (def.data !== undefined) {
            c.data = createDataSourceTemplate(def.data);
        }

        // create child templates
        if (def.children !== undefined) {
            def.children.forEach((tdef: udM.uvis.TemplateDefinition) => {
                c.addChild(createTemplate(tdef, c));
            });
        }

        return c;
    }

    function createPropertyTemplates(def: udM.uvis.PropertyDefinition[]): ucp.IProperty[] {
        return def.map((pdef) => {
            return createPropertyTemplate(pdef);
        });
    }

    function createPropertyTemplate(def: udM.uvis.PropertyDefinition): ucp.IProperty {
        var compiledExpression;
        var result;

        // create a propertyset or a property?
        if (Array.isArray(def.properties)) {
            result = new ucps.StylePropertySet(def.id);
            result.addProperties(createPropertyTemplates(def.properties));
        } else {
            compiledExpression = def.expression !== undefined ? compileProperty(translateProperty(def.expression)) : undefined;

            result = compiledExpression !== undefined
                ? <ucp.IProperty>new ucp.CalculatedProperty(def.id, compiledExpression, def.default)
                : <ucp.IProperty>new ucp.ReadWriteProperty(def.id, def.default);
        }

        return result;
    }

    function translateProperty(expression: string): string {
        var defaultPreample = "\"use strict\";\nvar ___res___;\nvar index=___c___.index;\nvar data=___c___.data;\nvar parent=___c___.parent;\nvar map=___c___.dataSources;\nvar forms=___c___.forms;\nvar combine=___c___.combine;\n";
        var code = defaultPreample;
        code += debug ? "console.debug(\"Executing property expression: " + expression.replace(/(")/g, "\\$1") + "\");\nconsole.debug(___c___);\n" : "";
        code += "___res___=" + expression + ";\n";
        code += "return ___res___;";
        return code;
    }

    private compileProperty(javaScriptCode: string): Function {
        return new Function('___c___', javaScriptCode);
    }

    export class App {
        private _dataSources: uudM.uvis.util.Dictionary;
        private _screens: uudM.uvis.util.Dictionary;
        //private _propertySets: uudM.uvis.util.Dictionary;
        private _name: string;
        private _description: string;
        private _instances: uudM.uvis.util.Dictionary;

        constructor(name?: string) {
            this._name = name;
            //this._dataSources = new uudM.uvis.util.Dictionary();
            //this._screens = new uudM.uvis.util.Dictionary();
            this._instances = new uudM.uvis.util.Dictionary();

            //// testing
            //var screen = new ucct.ScreenComponentTemplate('s', 'screeeen', '/');
            //this.screens.add(screen.url, screen);

            //var form = new ucct.FormComponentTemplate('f', 'fooooorm', true);
            //screen.addChild(form);

            //var c1 = new ucct.HTMLComponentTemplate('h1');
            //form.addChild(c1);
            //var p1 = new ucp.ReadWriteProperty('text', 'HELLLLLO WORLD!');
            //c1.addProperty(p1);
            //var e = new uce.Event('click', () => { p1.setValue('!!!!'); });
            //c1.addEvent(e);
        }

        get dataSources() {
            return this._dataSources;
        }

        set dataSources(value) {
            this._dataSources = value;
        }

        get screens() {
            return this._screens;
        }

        set screens(value) {
            this._screens = value;
        }

        get instances() {
            return this._screens;
        }

        //get propertySets() {
        //    return this._propertySets;
        //}

        //set propertySets(value) {
        //    if (value instanceof uudM.uvis.util.Dictionary)
        //        this._propertySets = value;
        //    else
        //        throw new Error('Value must be an instance of uudM.uvis.util.Dictionary.');
        //}

        get name() {
            return this._name;
        }

        set name(value) {
            this._name = value;
        }

        get description() {
            return this._description;
        }

        set description(value) {
            this._description = value;
        }

        public initialize() {
            var screenTemplate: ucct.ScreenComponentTemplate = this.screens.get('/');

            // set the page title
            document.title = screenTemplate.name + ' | ' + this.name + ' | ' + document.title;

            //// add classes to the head
            //AppInstance.createCssClasses(this.propertySets, cc);

            // add visible forms
            if (screenTemplate) {                
                screenTemplate.create().subscribe((ci:ucci.HTMLComponentInstance) => {
                    ci.create().subscribe(x => {
                        document.body.appendChild(x);
                    });
                }, (err) => {
                    console.error(err);
                    alert("Error creating instances.\n" + err.message);
                });

                //, () => {
                //    // remove existing content from body
                //    // warning: possible memory leak here if events
                //    // are bound to the nodes being removed.
                //    while (document.body.firstChild) {
                //        document.body.removeChild(document.body.firstChild);
                //    }

                //    // update the id 
                //    document.body.setAttribute('id', screenTemplate.id);

                //    // insert all nodes at once
                //    var fragment = document.createDocumentFragment();
                //    children.forEach(fragment.appendChild, fragment);
                //    document.body.appendChild(fragment);
                //}

            } else {
                alert('No screen found matching the URL');
            }
        }
    }

}