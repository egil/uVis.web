define(["require", "exports", 'uvis/property', 'uvis/util/promise'], function(require, exports, __propertyModule__, __utilModule__) {
    /// <reference path="../.typings/jasmine.d.ts" />
    var propertyModule = __propertyModule__;

    var utilModule = __utilModule__;

    var um = propertyModule.uvis;
    var util = utilModule.uvis.util;
    (function (uvis) {
        (function (spec) {
            describe('Property:', function () {
                var key = 'key';
                var staticValue = 'value';
                describe('A normal (none-calculated) Property', function () {
                    it('should set its key and value if supplied during creation', function () {
                        var p = new um.Property(key, staticValue);
                        var actual;
                        actual = p.value;
                        expect(p.key).toBe(key);
                        expect(actual).toBe(staticValue);
                    });
                    it('should not set its value if none is supplied during creation', function () {
                        var p = new um.Property(key);
                        var actual;
                        actual = p.value;
                        expect(p.key).toBe(key);
                        expect(actual).toBeUndefined();
                    });
                    it('should always have a state of "static"', function () {
                        var p = new um.Property(key);
                        expect(p.state).toBe(um.PropertyState.STATIC);
                    });
                });
                describe('Subscribing to a Property', function () {
                    it('should notify subscribers about changes to its value', function () {
                        var p = new um.Property(key);
                        var notified = false;
                        var actual;
                        runs(function () {
                            p.subscribe(function (prop) {
                                notified = true;
                                actual = prop.value;
                            });
                            // trigger onChange
                            p.value = staticValue;
                        });
                        waitsFor(function () {
                            return notified;
                        }, 'Should have been notified by now', 100);
                        runs(function () {
                            expect(actual).toBe(staticValue);
                        });
                    });
                });
                describe('Unsubscribing from a Property', function () {
                    it('should only unsubscribe the targeted function', function () {
                        var p = new um.Property(key);
                        var subscribed = false;
                        var subFn = function () {
                        };
                        runs(function () {
                            p.subscribe(subFn);
                            p.subscribe(function () {
                                subscribed = true;
                            });
                            p.unsubscribe(subFn);
                            // trigger subscription functions
                            p.value = staticValue;
                        });
                        waitsFor(function () {
                            return subscribed;
                        }, 'Should have been notified by now', 10);
                        runs(function () {
                            expect(subscribed).toBeTruthy();
                        });
                    });
                });
                describe('Getting a calculated value', function () {
                    it('should return as an Promise object which results in a Property object once fulfilled', function () {
                        var p = new um.Property(key);
                        var actual;
                        runs(function () {
                            p.calculate().then(function (prop) {
                                actual = prop;
                            });
                        });
                        waitsFor(function () {
                            return actual !== undefined;
                        }, 'Should have been notified by now', 10);
                        runs(function () {
                            expect(actual.key).toBe(key);
                        });
                    });
                });
                describe('A property with a calculated value', function () {
                    it('should set its state to "stale" if one of its dependencies are updated', function () {
                        var p1 = new um.Property('k1', 'v1');
                        var p2 = new um.CalculatedProperty('k2', function () {
                        });
                        runs(function () {
                            p1.subscribe(p2.dependencyChanged.bind(p2));
                            p1.value = 'updated value';
                        });
                        waitsFor(function () {
                            return p2.state === um.PropertyState.STALE;
                        }, 'Should have been notified by now', 10);
                        runs(function () {
                            expect(p2.state).toBe(um.PropertyState.STALE);
                        });
                    });
                    it('should not auto recalculate its value if it has no subscribers', function () {
                        var p1 = new um.Property('k1', 'v1');
                        var p2 = new um.CalculatedProperty('k2', function () {
                        });
                        p1.subscribe(p2.dependencyChanged.bind(p2));
                        p1.value = 'updated value';
                        expect(p2.state).not.toBe(um.PropertyState.UPDATING);
                    });
                    it('should auto recalculate its value if it has subscribers', function () {
                        var p1, p2;
                        runs(function () {
                            // set up base property
                            p1 = new um.Property('p1', 'v1');
                            // set up a property that depends on p1
                            p2 = new um.CalculatedProperty('p2', function () {
                                var calcPromise = new util.Promise();
                                calcPromise.fulfill();
                                return calcPromise;
                            });
                            // set up dependency to p1 from p2
                            p1.subscribe(p2.dependencyChanged.bind(p2));
                            // set up an anonymous dependency to p2
                            p2.subscribe(function (dependency) {
                                // dummy
                                                            });
                            // trigger a value change in p1
                            p1.value = "NEW VALUE";
                        });
                        waitsFor(function () {
                            return p2.state === um.PropertyState.CURRENT;
                        }, 'Property should be current', 100);
                        runs(function () {
                            expect(p2.state).toBe(um.PropertyState.CURRENT);
                        });
                    });
                    it('should set its state to "updating" when calculating its value', function () {
                        var p1, cp;
                        runs(function () {
                            // set up base property with a calculator that does not fulfill
                            // right away, thus making its "updating" stick around for testing
                            p1 = new um.CalculatedProperty('p1', function () {
                                cp = new util.Promise();
                                return cp;
                            });
                            // start calculation
                            p1.calculate();
                        });
                        waitsFor(function () {
                            return p1.state === um.PropertyState.UPDATING;
                        }, 'Property should be updating', 10);
                        runs(function () {
                            expect(p1.state).toBe(um.PropertyState.UPDATING);
                            // once we see that the state is updating, we fulfill and continue
                            cp.fulfill();
                        });
                    });
                });
            });
        })(uvis.spec || (uvis.spec = {}));
        var spec = uvis.spec;
    })(exports.uvis || (exports.uvis = {}));
    var uvis = exports.uvis;
})
//@ sourceMappingURL=property.spec.js.map
