define(["require", "exports"], function(require, exports) {
    (function (uvis) {
        /// <reference path="../.typings/require.d.ts" />
        (function (spec) {
            function init(jasmineEnv) {
                require([
                    'spec/util.promise.spec', 
                    'spec/util.dictionary.spec', 
                    'spec/property.spec', 
                    'spec/component.spec'
                ], function () {
                    jasmineEnv.execute();
                }, function (err) {
                    console.error('Unable to load some or all of the requires specs. Error message = ' + err);
                });
            }
            spec.init = init;
        })(uvis.spec || (uvis.spec = {}));
        var spec = uvis.spec;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=init.js.map
