/// <reference path="../.typings/underscore-typed.d.ts" />
var componentModule = require("./uvis/component")
var screenModule = require("./uvis/screen")
var appModule = require("./uvis/app")
var propertyModule = require("./uvis/property")
var dataModule = require("./uvis/data")
var component = componentModule.uvis.component;
var screen = screenModule.uvis.screen;
var property = propertyModule.uvis.property;
(function (uvis) {
    (function (initializer) {
        function init(appDef) {
            var app = new appModule.uvis.app.App(appDef.id, appDef.title);
            // add data sources
            _.each(appDef.dataSources, function (def) {
                var ds = dataModule.uvis.data.create(def);
                app.data.add(ds.id, ds);
            });
            // add screens
            _.each(appDef.screens, function (def) {
                var screen = createScreen(def);
                app.screens.add(screen.path, screen);
            });
            return app;
        }
        initializer.init = init;
        function createScreen(screenDef) {
            var scr = screen.create(screenDef.id, screenDef.type);
            scr.path = screenDef.path;
            // components
            _.each(screenDef.components, function (comDef) {
                var co = createComponent(scr, comDef);
                // TODO: why is this cast needed, bug in TypeScript?
                //       complains that "children" is not a property of Screen.
                (scr).children.add(co.id, co);
            });
            return scr;
        }
        function createComponent(parent, comDef) {
            var co = component.create(comDef.id, comDef.type);
            var props = _.omit(comDef, 'id');
            // get properties
            _.each(props, function (value, key) {
                co.properties.add(key, property.create(key, value));
            });
            return co;
        }
    })(uvis.initializer || (uvis.initializer = {}));
    var initializer = uvis.initializer;
})(exports.uvis || (exports.uvis = {}));
var uvis = exports.uvis;
//@ sourceMappingURL=initializer.js.map
