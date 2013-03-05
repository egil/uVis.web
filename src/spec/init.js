var ups = require("./spec/util.promise.spec")
var ps = require("./spec/property.spec")
var uds = require("./spec/util.dictionary.spec")
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
//@ sourceMappingURL=init.js.map
