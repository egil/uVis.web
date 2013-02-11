define(["require", "exports", 'spec/util.promise'], function(require, exports, __upSpec__) {
    //import propSpec = module('spec/property');
    var upSpec = __upSpec__;

    var s1 = upSpec;
    (function (uvis) {
        (function (spec) {
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
