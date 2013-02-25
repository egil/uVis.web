/// <reference path="../.typings/jasmine.d.ts" />

import propertyModule = module('uvis/property');
import utilModule = module('uvis/util/promise');
import um = propertyModule.uvis;
import util = utilModule.uvis.util;

export module uvis.spec {

    describe('Property', () => {
        var key = 'key';
        var staticValue = 'value';

        describe('A normal (none-calculated) Property', () => {
            it('should set its key and value if supplied during creation', () => {
                var p = new um.Property(key, staticValue);
                var actual;

                actual = p.value;

                expect(p.key).toBe(key);
                expect(actual).toBe(staticValue);
            });

            it('should not set its value if none is supplied during creation', () => {
                var p = new um.Property(key);
                var actual;

                actual = p.value;

                expect(p.key).toBe(key);
                expect(actual).toBeUndefined();
            });

            it('should always have a state of "static"', () => {
                var p = new um.Property(key);
                expect(p.state).toBe(um.PropertyState.STATIC);
            });
        });

        describe('Subscribing to a Property', () => {
            it('should notify subscribers about changes to its value', () => {
                var p = new um.Property(key);
                var notified = false;
                var actual;

                p.subscribe((prop: um.Property) => {
                    notified = true;
                    actual = prop.value;
                });
z
                // trigger onChange
                p.value = staticValue;

                expect(notified).toBeTruthy();
                expect(actual).toBe(staticValue);
            });
        });

        describe('Unsubscribing from a Property', () => {
            it('should not notify unsubscribed about changes to its value', () => {
                var p = new um.Property(key);
                var notified = false;
                var subFn = (prop: um.Property) => {
                    notified = true;
                };

                p.subscribe(subFn);
                p.unsubscribe(subFn);

                // trigger onChange
                p.value = staticValue;

                expect(notified).toBeFalsy();
            });
        });

        describe('Unsubscribing from a Property', () => {
            it('should only unsubscribe the targeted function', () => {
                var p = new um.Property(key);
                var subscribed = false;
                var subFn = () => { };

                p.subscribe(subFn);

                p.subscribe(() => {
                    subscribed = true;
                });

                p.unsubscribe(subFn);

                // trigger subscription functions
                p.value = staticValue;

                expect(subscribed).toBeTruthy();
            });
        });

        describe('Getting a calculated value', () => {
            it('should return as an Promise object which results in a Property object once fulfilled', () => {
                var p = new um.Property(key);
                var actual: um.Property;
                p.calculate().done((prop: um.Property) => {
                    actual = prop;
                });
                expect(actual.key).toBe(key);
            });
        });

        describe('A property with a calculated value', () => {
            it('should set its state to "stale" if one of its dependencies are updated', () => {
                var p1 = new um.Property('k1', 'v1');
                var p2 = new um.CalculatedProperty('k2', () => { });
                p1.subscribe(p2.dependencyChanged.bind(p2));
                p1.value = 'updated value';
                expect(p2.state).toBe(um.PropertyState.STALE);
            });

            it('should not auto recalculate its value if it has no subscribers', () => {
                var p1 = new um.Property('k1', 'v1');
                var p2 = new um.CalculatedProperty('k2', () => { });
                p1.subscribe(p2.dependencyChanged.bind(p2));
                p1.value = 'updated value';
                expect(p2.state).not.toBe(um.PropertyState.UPDATING);
            });

            it('should auto recalculate its value if it has subscribers', () => {                                
                var p1, p2 : um.CalculatedProperty;

                runs(() => {
                    // set up base property
                    p1 = new um.Property('p1', 'v1');

                    // set up a property that depends on p1
                    p2 = new um.CalculatedProperty('p2', () => {
                        var calcPromise = new util.Promise();
                        calcPromise.fulfill();
                        return calcPromise;
                    });
                    // set up dependency to p1 from p2
                    p1.subscribe(p2.dependencyChanged.bind(p2));

                    // set up an anonymous dependency to p2
                    p2.subscribe((dependency) => {
                        // dummy
                    });

                    // trigger a value change in p1
                    p1.value = "NEW VALUE";
                });

                waitsFor(() => {
                    return p2.state === um.PropertyState.CURRENT;
                }, 'Property should be current', 100);

                runs(() => {
                    expect(p2.state).toBe(um.PropertyState.CURRENT);
                });                
            });

            it('should set its state to "updating" when calculating its value', () => {
                var p1: um.CalculatedProperty,
                    cp: util.Promise;

                runs(() => {
                    // set up base property with a calculator that does not fulfill
                    // right away, thus making its "updating" stick around for testing
                    p1 = new um.CalculatedProperty('p1', () => {
                        cp = new util.Promise();                        
                        return cp;
                    });
                                        
                    // start calculation
                    p1.calculate();
                });

                waitsFor(() => {
                    return p1.state === um.PropertyState.UPDATING;
                }, 'Property should be updating', 10);

                runs(() => {
                    expect(p1.state).toBe(um.PropertyState.UPDATING);

                    // once we see that the state is updating, we fulfill and continue
                    cp.fulfill();
                });
            });
        });
    });
}