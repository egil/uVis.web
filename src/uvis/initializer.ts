/// <reference path="../.typings/underscore-typed.d.ts" />
import componentModule = module('uvis/component');
import screenModule = module('uvis/screen');
import appModule = module('uvis/app');
import propertyModule = module('uvis/property');
import dataModule = module('uvis/data');
import component = componentModule.uvis.component;
import screen = screenModule.uvis.screen;
import property = propertyModule.uvis.property;

export module uvis.initializer {

    export function init(appDef): appModule.uvis.app.App {
        var app = new appModule.uvis.app.App(appDef.id, appDef.title);

        // add data sources
        _.each(appDef.dataSources, (def) => {
            var ds = dataModule.uvis.data.create(def);
            app.data.add(ds.id, ds);
        });
        
        // add screens            
        _.each(appDef.screens, (def) => {
            var screen = createScreen(def);
            app.screens.add(screen.path, screen);
        });

        return app;
    }

    function createScreen(screenDef: any): screen.Screen {
        var scr = screen.create(screenDef.id, screenDef.type);
        scr.path = screenDef.path;

        // components
        _.each(screenDef.components, (comDef) => {
            var co = createComponent(scr, comDef);

            // TODO: why is this cast needed, bug in TypeScript?
            //       complains that "children" is not a property of Screen.
            (<component.AbstractComponent>scr).children.add(co.id, co);
        });
        return scr;
    }

    function createComponent(parent: component.AbstractComponent, comDef: any): componentModule.uvis.component.AbstractComponent {
        var co = component.create(comDef.id, comDef.type);
        var props = _.omit(comDef, 'id');

        // get properties        
        _.each(props, (value: any, key?: string) => {
            co.properties.add(key, property.create(key, value));
        });

        return co;
    }
}