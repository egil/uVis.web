/// <reference path="../.typings/underscore-typed.d.ts" />
/// <reference path="../.typings/jasmine.d.ts" />
import promiseModule = module('uvis/util/promise');
import util = promiseModule.uvis.util;
declare function nextTick(fn: Function): void;
declare function setZeroTimeout(fn: Function): void;

export module uvis.spec {
    describe('nextTick', () => {
        it('should trigger a function on next tick', () => {
            var changed = false, fn;

            fn = () => {
                changed = true;
            };

            runs(() => {
                nextTick(fn);
            });

            waitsFor(() => {
                return changed === true;
            }, 'nextTick did not work', 20);

            runs(() => {
                expect(changed).toBeTruthy();
            });
        });

        it('should trigger a function on next tick with supplied arguments', () => {
            var changed = false,
                fn,
                expected = 'expected',
                actual;

            fn = (x) => {
                changed = true;
                actual= x;
            };

            runs(() => {
                nextTick(fn.bind(null, expected));
            });

            waitsFor(() => {
                return changed === true;
            }, 'nextTick did not work', 20);

            runs(() => {
                expect(changed).toBeTruthy();
                expect(expected).toBe(actual);
            });
        });
    });

    describe('Promise:', () => {

        describe('Subscribing to a Promise', () => {
            var p: util.Promise;
            var expected = 1;            

            it('should return the promised value when state is fulfilled', () => {
                var actual;
                runs(() => {
                    p = new util.Promise(); 

                    p.then((v) => {
                        actual = v;
                    });

                    p.fulfill(expected);
                });

                waitsFor(() => {
                    return actual !== undefined;
                }, 'Promise should be fulfilled', 20);

                runs(() => {
                    expect(actual).toBe(expected);
                });
            });

            it('should return the promised value when if subscribed after state is fulfilled', () => {
                var actual;
                p = new util.Promise(expected);

                runs(() => {
                    p.then((v) => {
                        actual = v;
                    });
                });

                waitsFor(() => {
                    return actual !== undefined;
                }, 'Promise should be fulfilled', 20);

                runs(() => {
                    expect(actual).toBe(expected);
                });
            });

            it('should trigger the fail functions when a promise cannot be fulfilled', () => {
                var actual;
                runs(() => {
                    p = new util.Promise();

                    p.fail((v) => {
                        actual = v;
                    });

                    p.reject('error-message');                    
                });

                waitsFor(() => {
                    return actual !== undefined;
                }, 'Promise should have failed', 20);

                runs(() => {
                    expect(actual).toBe('error-message');
                });
            });

            it('should only be allowed to call "fulfill" once', () => {
                p = new util.Promise();

                p.fulfill(1);

                var shouldFail = () => {
                    p.fulfill(1);
                }

                expect(shouldFail).toThrow();
            });

            it('should only be allowed to "reject" once', () => {
                p = new util.Promise();

                p.reject('error');

                var shouldFail = () => {
                    p.reject('error');
                }

                expect(shouldFail).toThrow();
            });

            describe('when', () => {
                it('should only fulfill when all promises passed to it have been fulfilled', () => {
                    var p1 = new util.Promise();
                    var p2 = new util.Promise();
                    var p3 = new util.Promise();
                    var expected = 3;
                    var actual;
                    var pwhen = util.Promise.when([p1, p2, p3]).then((parr) => { actual = parr.length; });

                    runs(() => {
                        p1.fulfill();
                        p2.fulfill();                        
                        p3.fulfill();
                    });

                    waitsFor(() => {
                        return actual !== undefined;
                    }, 'Should have been notified by now', 10);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });

                });

                it('should return result from promises in the same order the promises was passed to it', () => {
                    var p0 = new util.Promise();
                    var p1 = new util.Promise();
                    var p2 = new util.Promise();
                    var expected = ['v1', 'v2', 'v3'];
                    var actual;
                    var pwhen = util.Promise.when([p0, p1, p2]).then((parr) => { actual = parr; });

                    runs(() => {
                        p1.fulfill(expected[1]);
                        p0.fulfill(expected[0]);
                        p2.fulfill(expected[2]);
                    });

                    waitsFor(() => {
                        return actual !== undefined;
                    }, 'Should have been notified by now', 10);

                    runs(() => {
                        expect(actual[0]).toBe(expected[0]);
                        expect(actual[1]).toBe(expected[1]);
                        expect(actual[2]).toBe(expected[2]);
                    });

                });
            });
        });
    });

}