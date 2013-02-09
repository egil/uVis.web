
var initializerModule = require("./uvis/initializer")
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
//@ sourceMappingURL=uvis.js.map
