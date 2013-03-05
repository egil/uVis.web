define(["require", "exports", 'spec/util.promise.spec', 'spec/property.spec', 'spec/util.dictionary.spec'], function(require, exports, __ups__, __ps__, __uds__) {
    var ups = __ups__;

    var ps = __ps__;

    var uds = __uds__;

    // actually load the specs
    var s1 = ups;
    var s2 = ps;
    var s3 = uds;
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
