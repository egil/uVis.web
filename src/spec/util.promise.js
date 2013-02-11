define(["require", "exports", 'uvis/util/promise'], function(require, exports, __promiseModule__) {
    /// <reference path="../.typings/underscore-typed.d.ts" />
    /// <reference path="../.typings/jasmine.d.ts" />
    var promiseModule = __promiseModule__;

    var util = promiseModule.uvis.util;
    (function (uvis) {
        (function (spec) {
            describe('Promise', function () {
                describe('Creating a new Promise', function () {
                    it('should return a Promise object with state unfulfilled', function () {
                        var p = new util.Promise();
                        expect(p.state).toBe('unfulfilled');
                    });
                    it('should return a Promise object with state fulfilled if created with value', function () {
                        var p = new util.Promise(1);
                        expect(p.state).toBe('fulfilled');
                    });
                });
                describe('Subscribing to a Promise', function () {
                    var p;
                    var expected = 1;
                    var actual;
                    it('should return the promised value when state is fulfilled', function () {
                        runs(function () {
                            p = new util.Promise();
                            p.done(function (v) {
                                actual = v;
                            });
                            _.delay(function () {
                                p.fulfill(expected);
                            }, 20);
                        });
                        waitsFor(function () {
                            return p.state === 'fulfilled';
                        }, 'Promise should be fulfilled', 100);
                        runs(function () {
                            expect(actual).toBe(expected);
                        });
                    });
                    it('should return the promised value when if subscribed after state is fulfilled', function () {
                        p = new util.Promise(expected);
                        p.done(function (v) {
                            actual = v;
                        });
                        expect(actual).toBe(expected);
                    });
                });
            });
        })(uvis.spec || (uvis.spec = {}));
        var spec = uvis.spec;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=util.promise.js.map
