define(["require", "exports", 'uvis/property'], function(require, exports, __propertyModule__) {
    /// <reference path="../.typings/jasmine.d.ts" />
    var propertyModule = __propertyModule__;

    var pm = propertyModule.uvis.property;
    (function (uvis) {
        (function (spec) {
            describe('Property should', function () {
                it('have the correct key after construction', function () {
                    var property = new pm.Property('key', 'value');
                    expect(property.key).toBe('key');
                });
            });
        })(uvis.spec || (uvis.spec = {}));
        var spec = uvis.spec;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=property.js.map
