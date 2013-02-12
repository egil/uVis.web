define(["require", "exports", 'uvis/initializer'], function(require, exports, __initializerModule__) {
    
    var initializerModule = __initializerModule__;

    var initializer = initializerModule.uvis.initializer;
    (function (uvis) {
        function run(appDefUri) {
            var appInstance;
            // get app-definition file
            $.getJSON(appDefUri).then(// initialize the app
            function (appDef) {
                appInstance = initializer.init(appDef);
            }).then(// start the app
            function () {
                appInstance.start();
            });
            // parse app, return app-instance
            // initialize app-instance
            return appInstance;
        }
        uvis.run = run;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=uvis.js.map
