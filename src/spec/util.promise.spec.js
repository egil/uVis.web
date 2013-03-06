/// <reference path="../.typings/underscore-typed.d.ts" />
/// <reference path="../.typings/jasmine.d.ts" />
var promiseModule = require("./uvis/util/promise")
var util = promiseModule.uvis.util;
(function (uvis) {
    (function (spec) {
        describe('nextTick', function () {
            it('should trigger a function on next tick', function () {
                var changed = false, fn;
                fn = function () {
                    changed = true;
                };
                runs(function () {
                    nextTick(fn);
                });
                waitsFor(function () {
                    return changed === true;
                }, 'nextTick did not work', 20);
                runs(function () {
                    expect(changed).toBeTruthy();
                });
            });
            it('should trigger a function on next tick with supplied arguments', function () {
                var changed = false, fn, expected = 'expected', actual;
                fn = function (x) {
                    changed = true;
                    actual = x;
                };
                runs(function () {
                    nextTick(fn.bind(null, expected));
                });
                waitsFor(function () {
                    return changed === true;
                }, 'nextTick did not work', 20);
                runs(function () {
                    expect(changed).toBeTruthy();
                    expect(expected).toBe(actual);
                });
            });
        });
        describe('Promise:', function () {
            describe('Subscribing to a Promise', function () {
                var p;
                var expected = 1;
                it('should return the promised value when state is fulfilled', function () {
                    var actual;
                    runs(function () {
                        p = new util.Promise();
                        p.then(function (v) {
                            actual = v;
                        });
                        p.fulfill(expected);
                    });
                    waitsFor(function () {
                        return actual !== undefined;
                    }, 'Promise should be fulfilled', 20);
                    runs(function () {
                        expect(actual).toBe(expected);
                    });
                });
                it('should return the promised value when if subscribed after state is fulfilled', function () {
                    var actual;
                    p = new util.Promise(expected);
                    runs(function () {
                        p.then(function (v) {
                            actual = v;
                        });
                    });
                    waitsFor(function () {
                        return actual !== undefined;
                    }, 'Promise should be fulfilled', 20);
                    runs(function () {
                        expect(actual).toBe(expected);
                    });
                });
                it('should trigger the fail functions when a promise cannot be fulfilled', function () {
                    var actual;
                    runs(function () {
                        p = new util.Promise();
                        p.fail(function (v) {
                            actual = v;
                        });
                        p.reject('error-message');
                    });
                    waitsFor(function () {
                        return actual !== undefined;
                    }, 'Promise should have failed', 20);
                    runs(function () {
                        expect(actual).toBe('error-message');
                    });
                });
                it('should only be allowed to call "fulfill" once', function () {
                    p = new util.Promise();
                    p.fulfill(1);
                    var shouldFail = function () {
                        p.fulfill(1);
                    };
                    expect(shouldFail).toThrow();
                });
                it('should only be allowed to "reject" once', function () {
                    p = new util.Promise();
                    p.reject('error');
                    var shouldFail = function () {
                        p.reject('error');
                    };
                    expect(shouldFail).toThrow();
                });
                describe('when', function () {
                    it('should only fulfill when all promises passed to it have been fulfilled', function () {
                        var p1 = new util.Promise();
                        var p2 = new util.Promise();
                        var p3 = new util.Promise();
                        var expected = 3;
                        var actual;
                        var pwhen = util.Promise.when([
                            p1, 
                            p2, 
                            p3
                        ]).then(function (parr) {
                            actual = parr.length;
                        });
                        runs(function () {
                            p1.fulfill();
                            p2.fulfill();
                            p3.fulfill();
                        });
                        waitsFor(function () {
                            return actual !== undefined;
                        }, 'Should have been notified by now', 10);
                        runs(function () {
                            expect(actual).toBe(expected);
                        });
                    });
                    it('should return result from promises in the same order the promises was passed to it', function () {
                        var p0 = new util.Promise();
                        var p1 = new util.Promise();
                        var p2 = new util.Promise();
                        var expected = [
                            'v1', 
                            'v2', 
                            'v3'
                        ];
                        var actual;
                        var pwhen = util.Promise.when([
                            p0, 
                            p1, 
                            p2
                        ]).then(function (parr) {
                            actual = parr;
                        });
                        runs(function () {
                            p1.fulfill(expected[1]);
                            p0.fulfill(expected[0]);
                            p2.fulfill(expected[2]);
                        });
                        waitsFor(function () {
                            return actual !== undefined;
                        }, 'Should have been notified by now', 10);
                        runs(function () {
                            expect(actual[0]).toBe(expected[0]);
                            expect(actual[1]).toBe(expected[1]);
                            expect(actual[2]).toBe(expected[2]);
                        });
                    });
                });
            });
        });
    })(uvis.spec || (uvis.spec = {}));
    var spec = uvis.spec;
})(exports.uvis || (exports.uvis = {}));
var uvis = exports.uvis;
//@ sourceMappingURL=util.promise.spec.js.map
