/// <reference path="../.typings/underscore-typed.d.ts" />
/// <reference path="../.typings/jasmine.d.ts" />
import promiseModule = module('uvis/util/promise');
import util = promiseModule.uvis.util;

export module uvis.spec {
    describe('Promise', () => {
        describe('Creating a new Promise', () => {
            it('should return a Promise object with state unfulfilled', () => {
                var p = new util.Promise();
                expect(p.state).toBe(util.PromiseState.UNFULFILLED);
            });
            it('should return a Promise object with state fulfilled if created with value', () => {
                var p = new util.Promise(1);
                expect(p.state).toBe(util.PromiseState.FULFILLED);
            });
        });

        describe('Subscribing to a Promise', () => {
            var p: util.Promise;
            var expected = 1;
            var actual;

            it('should return the promised value when state is fulfilled', () => {
                runs(() => {
                    p = new util.Promise();

                    p.done((v) => {
                        actual = v;
                    });

                    _.delay(() => {
                        p.fulfill(expected);
                    }, 20);
                });

                waitsFor(() => {
                    return p.state === util.PromiseState.FULFILLED;
                }, 'Promise should be fulfilled', 100);

                runs(() => {
                    expect(actual).toBe(expected);
                });
            });

            it('should return the promised value when if subscribed after state is fulfilled', () => {
                p = new util.Promise(expected);

                p.done((v) => {
                    actual = v;
                });

                expect(actual).toBe(expected);
            });

            it('should trigger the fail functions when a promise cannot be fulfilled', () => {
                runs(() => {
                    p = new util.Promise();
                    actual = null;

                    p.fail((v) => {
                        actual = v;
                    });

                    _.delay(() => {
                        p.signalFail('error-message');
                    }, 10);
                });

                waitsFor(() => {
                    return p.state === util.PromiseState.FAILED;
                }, 'Promise should have failed', 100);

                runs(() => {
                    expect(actual).toBe('error-message');
                });
            });

            it('should only be allowed to call "fulfill" once', () => {
                p = new util.Promise();
                actual = 0;
                
                p.fulfill(1);

                var shouldFail = () => {
                    p.fulfill(1);
                }

                expect(shouldFail).toThrow();
            });

            it('should only be allowed to "signalFail" once', () => {
                p = new util.Promise();

                p.signalFail('error');

                var shouldFail = () => {
                    p.signalFail('error');
                }

                expect(shouldFail).toThrow();
            });
        });
    });

}