/// <reference path="../.typings/underscore-typed.d.ts" />
/// <reference path="../.typings/jquery.d.ts" />

import appModule = module('uvis/app');
import initializerModule = module('uvis/initializer');
import initializer = initializerModule.uvis.initializer;

export module uvis {

    export function run(appDefUri: string) {
        var appInstance: appModule.uvis.app.App;

        // get app-definition file
        $.getJSON(appDefUri)

        // initialize the app
        .then((appDef) => {
            appInstance = initializer.init(appDef);
        })

        // start the app
        .then(() => {            
            appInstance.start();
        });

        // parse app, return app-instance        
        // initialize app-instance
        return appInstance;
    }
}