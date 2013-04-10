/// <reference path="../../.typings/jasmine.d.ts" />

import uupM = module('uvis/util/Promise');
import p = uupM.uvis.util;
declare function nextTick(fn: Function): void;

export module uvis.spec {
    p.Promise.debug = true;
    describe('Promise:', () => {
        var p1, p2, p3: p.Promise;
        var e1, e2, e3: any;
        var a1, a2, a3: any;
        var fn1, fn2, fn3: Function;

        beforeEach(() => {
            p1 = undefined;
            p2 = undefined;
            p3 = undefined;
            e1 = undefined;
            e2 = undefined;
            e3 = undefined;
            a1 = undefined;
            a2 = undefined;
            a3 = undefined;
            fn1 = undefined;
            fn2 = undefined;
            fn3 = undefined;
        });

        describe('when a promise is created without any arguments', () => {
            it('should be in a state of "pending"', () => {
                p1 = new p.Promise();
                expect(p1.state).toBe(p.PromiseState.PENDING);
            });
        });

        describe('Promise.resolve:', () => {
            it('should return the input promise', () => {
                // create p1 and set its state to fulfil                
                runs(() => {
                    p1 = new p.Promise();
                    p1.fulfill();
                    p2 = p.Promise.resolve(p1);
                });

                waitsFor(() => {
                    return p2.state === p.PromiseState.FULFILLED;
                }, '', 20);

                runs(() => {
                    expect(p2.state).toBe(p.PromiseState.FULFILLED);
                    expect(p2).toBe(p1);
                });
            });

            it('should be fulfilled with the input value', () => {
                runs(() => {
                    e1 = 'value 1';
                    p1 = p.Promise.resolve(e1);
                    p1.then((res) => {
                        a1 = res;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1).toBe(e1);
                });
            });
        });

        describe('Promise.when', () => {
            it('should only fulfill when all promises passed to it have been fulfilled', () => {
                var p1 = new p.Promise();
                var p2 = new p.Promise();
                var p3 = new p.Promise();
                var expected = 3;
                var actual;
                var pwhen = p.Promise.when([p1, p2, p3]).then((parr) => { actual = parr.length; });

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
                var p0 = new p.Promise();
                var p1 = new p.Promise();
                var p2 = new p.Promise();
                var expected = ['v1', 'v2', 'v3'];
                var actual;
                var pwhen = p.Promise.when([p0, p1, p2]).then((parr) => { actual = parr; });

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


        describe('if the "then" is passed an onFulfilled or onRejected argument that is not a function', () => {
            it('should ignore the arguments', () => {
                p1 = new p.Promise();
                p1.then('not a function', {});
            });
        });

        describe('if "then" is called multiple times on the same promise', () => {
            it('should execute onFulfilled in the same order of their originating calls to "then"', () => {
                var c = 0;

                runs(() => {
                    p1 = new p.Promise();
                    p1.then(() => {
                        c++;
                        a1 = c;
                    });
                    p1.then(() => {
                        c++;
                        a2 = c;
                    });
                    p1.then(() => {
                        c++;
                        a3 = c;
                    });
                    p1.fulfill();
                });

                waitsFor(() => {
                    return c === 3;
                }, '', 40);

                runs(() => {
                    expect(a1).toBe(1);
                    expect(a2).toBe(2);
                    expect(a3).toBe(3);
                });
            });

            it('should execute onRejected in the same order of their originating calls to "then"', () => {
                var c = 0;

                runs(() => {
                    p1 = new p.Promise();
                    p1.then(undefined, () => {
                        c++;
                        a1 = c;
                    });
                    p1.then(undefined, () => {
                        c++;
                        a2 = c;
                    });
                    p1.then(undefined, () => {
                        c++;
                        a3 = c;
                    });
                    p1.reject();
                });

                waitsFor(() => {
                    return c === 3;
                }, '', 40);

                runs(() => {
                    expect(a1).toBe(1);
                    expect(a2).toBe(2);
                    expect(a3).toBe(3);
                });
            });
        });

        describe('A call to promise1.then must return a new promise2:', () => {
            it('should not be equal', () => {
                p1 = new p.Promise();
                p2 = p1.then();
                expect(p2).toNotEqual(p1);
            });

            describe('If onFulfilled or onRejected returns a none Promise value:', () => {
                it('should fulfil promise2 with the value from onFulfilled', () => {
                    runs(() => {
                        e1 = 'value 2';
                        p1 = new p.Promise();
                        p2 = p1.then(() => {
                            return e1;
                        });
                        p1.fulfill();
                        p2.then((res) => {
                            a1 = res;
                        });
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(a1).toBe(e1);
                    });
                });

                it('should fulfil promise2 with the value from onRejected', () => {
                    runs(() => {
                        e1 = 'reason 1';
                        p1 = new p.Promise();
                        p2 = p1.then(undefined, () => {
                            return e1;
                        });
                        p1.reject();
                        p2.then((res) => {
                            a1 = res;
                        });
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(a1).toBe(e1);
                    });
                });

                it('should reject promise2 if onFulfilled throws an exception', () => {
                    runs(() => {
                        e1 = 'exception/fulfil';
                        p1 = new p.Promise();
                        p2 = p1.then(() => {
                            throw e1;
                        });
                        p1.fulfill();
                        p2.then(undefined, (res) => {
                            a1 = res;
                        });
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(a1).toBe(e1);
                    });
                });

                it('should reject promise2 if onRejected throws an exception', () => {
                    runs(() => {
                        e1 = 'exception/reject';
                        p1 = new p.Promise();
                        p2 = p1.then(undefined, () => {
                            throw e1;
                        });
                        p1.reject();
                        p2.then(undefined, (res) => {
                            a1 = res;
                        });
                    });

                    waitsFor(() => {
                        return a1;
                    }, 'no exception/reject found', 20);

                    runs(() => {
                        expect(a1).toBe(e1);
                    });
                });
            });

            describe('if onFulfilled or onRejected returns a Promise (returnedPromise)', () => {
                it('p2 should assume the state of returendPromise (fulfilled)', () => {
                    runs(() => {
                        p1 = new p.Promise();
                        p2 = p1.then(() => {
                            // return pending promise
                            p3 = new p.Promise();
                            return p3;
                        });
                        p1.fulfill();
                        p2.then((res) => {
                            a1 = res;
                        });
                    });

                    waitsFor(() => {
                        return p3;
                    }, '', 20);

                    runs(() => {
                        e1 = 'value 3';
                        expect(p2.state).toBe(p.PromiseState.PENDING);
                        p3.fulfill(e1);
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(p2.state).toBe(p.PromiseState.FULFILLED);
                        expect(a1).toBe(e1);
                    });
                });
            });

            it('p2 should assume the state of returendPromise (rejected)', () => {
                runs(() => {
                    p1 = new p.Promise();
                    p2 = p1.then(undefined, () => {
                        // return pending promise
                        p3 = new p.Promise();
                        return p3;
                    });
                    p1.reject();

                    p2.then(undefined, (res) => {
                        a1 = res;
                    });
                });

                waitsFor(() => {
                    return p3;
                }, '', 20);

                runs(() => {
                    e1 = 'reason 4';
                    expect(p2.state).toBe(p.PromiseState.PENDING);
                    p3.reject(e1);
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(p2.state).toBe(p.PromiseState.REJECTED);
                    expect(a1).toBe(e1);
                });
            });

            describe('if onFulfilled is not a function and promise1 is fulfilled', () => {
                it('promise2 must be fulfilled with the same value', () => {
                    runs(() => {
                        e1 = 'value 5';
                        p1 = new p.Promise();
                        p2 = p1.then('not a function');
                        p2.then((res) => {
                            a1 = res;
                        });
                        p1.fulfill(e1);
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(p2.state).toBe(p.PromiseState.FULFILLED);
                        expect(a1).toBe(e1);
                    });
                });
            });

            describe('if onRejected is not a function and promise1 is rejected', () => {
                it('promise2 must be rejected with the same value', () => {
                    runs(() => {
                        e1 = 'reason 6';
                        p1 = new p.Promise();
                        p2 = p1.then(undefined, 'not a function');
                        p2.then(undefined, (reason) => {
                            a1 = reason;
                        });
                        p1.reject(e1);
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(p2.state).toBe(p.PromiseState.REJECTED);
                        expect(a1).toBe(e1);
                    });
                });
            });
        });

        describe('When a promise is fulfilled', () => {
            it('should transition to a fulfilled state and return the promised value', () => {
                runs(() => {
                    e1 = 'value 7';
                    p1 = new p.Promise();
                    p1.fulfill(e1);
                    p1.then((res) => {
                        a1 = res;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(p1.state).toBe(p.PromiseState.FULFILLED);
                    expect(a1).toBe(e1);
                });
            });

            it('should not transition to a rejected or pending state', () => {
                runs(() => {
                    e1 = 'value 8';
                    p1 = new p.Promise();
                    p1.then((res) => {
                        a1 = res;
                    });
                    p1.fulfill(e1);
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                fn1 = () => {
                    p1.reject();
                };

                runs(() => {
                    expect(fn1).toThrow();
                });
            });

            it('should only call any onFulfilled functions attached to it with the promised value as the first argument', () => {
                runs(() => {
                    e1 = 'value 9';
                    p1 = new p.Promise();
                    p1.then(() => {
                        a1 = arguments[0];
                    });
                    p1.fulfill(e1);
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1).toBe(e1);
                });
            });

            it('should only call any onFulfilled functions once', () => {
                a1 = 0;
                runs(() => {
                    e1 = 'value 10';
                    p1 = new p.Promise();
                    p1.fulfill(e1);
                    p1.then(() => {
                        a1++;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1).toBe(1);
                });
            });
        });

        describe('When a promise is rejected', () => {
            it('should transition to a rejected state and return the an reason for the rejection', () => {
                runs(() => {
                    e1 = 'reason 11';
                    p1 = new p.Promise();
                    p1.reject(e1);
                    p1.then(undefined, (res) => {
                        a1 = res;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(p1.state).toBe(p.PromiseState.REJECTED);
                    expect(a1).toBe(e1);
                });
            });

            it('should not transition to a fulfilled or pending state', () => {
                runs(() => {
                    e1 = 'reason 12';
                    p1 = new p.Promise();
                    p1.then(undefined, (res) => {
                        a1 = res;
                    });
                    p1.reject(e1);
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                fn1 = () => {
                    p1.fulfill();
                };

                runs(() => {
                    expect(fn1).toThrow();
                });
            });

            it('should only call any onRejected functions attached to it with the reason as the first argument', () => {
                runs(() => {
                    e1 = 'reason 13';
                    p1 = new p.Promise();
                    p1.then(undefined, () => {
                        a1 = arguments[0];
                    });
                    p1.reject(e1);
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1).toBe(e1);
                });
            });

            it('should only call any onRejected functions once', () => {
                a1 = 0;
                runs(() => {
                    e1 = 'reason 14';
                    p1 = new p.Promise();
                    p1.then(undefined, () => {
                        a1++;
                    });
                    p1.reject(e1);
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1).toBe(1);
                });
            });
        });

    });
}