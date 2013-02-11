var propSpec = require("./spec/property")
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
//@ sourceMappingURL=init.js.map
