/// <reference path="../.typings/underscore-typed.d.ts" />
/// <reference path="../.typings/jasmine.d.ts" />
var dictionaryModule = require("./uvis/util/dictionary")
var util = dictionaryModule.uvis.util;
(function (uvis) {
    (function (spec) {
        describe('Dictionary', function () {
            it('should return a value added to it', function () {
                var d = new util.Dictionary();
                var actual;
                var key = 'k1';
                var expected = 'v1';
                d.add(key, expected);
                actual = d.getItem(key);
                expect(actual).toBe(expected);
            });
            it('should only return key-value pairs added to it', function () {
                var d = new util.Dictionary();
                var c = 0;
                d.add('k1', 'v1');
                d.add('k2', 'v2');
                d.add('k3', 'v3');
                d.forEach(function (k, v) {
                    c++;
                });
                expect(c).toBe(3);
                expect(d.contains('k1')).toBeTruthy();
                expect(d.contains('k2')).toBeTruthy();
                expect(d.contains('k3')).toBeTruthy();
            });
            it('should not be possible to replace built in functions', function () {
                var d = new util.Dictionary();
                var orgAdd = d.add;
                var actual;
                var key = 'add';
                var expected = 'v1';
                d.add(key, expected);
                actual = d.getItem(key);
                expect(actual).toBe(expected);
                expect(d.add).toBe(orgAdd);
            });
        });
    })(uvis.spec || (uvis.spec = {}));
    var spec = uvis.spec;
})(exports.uvis || (exports.uvis = {}));
var uvis = exports.uvis;
//@ sourceMappingURL=util.dictionary.spec.js.map
