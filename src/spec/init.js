define(["require", "exports", 'spec/property'], function(require, exports, __propSpec__) {
    var propSpec = __propSpec__;

    (function (uvis) {
        (function (spec) {
            var ps = propSpec;
            function init(jasmineEnv) {
                jasmineEnv.execute();
            }
            spec.init = init;
        })(uvis.spec || (uvis.spec = {}));
        var spec = uvis.spec;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=init.js.map
