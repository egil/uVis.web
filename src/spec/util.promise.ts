/// <reference path="../.typings/underscore-typed.d.ts" />
/// <reference path="../.typings/jasmine.d.ts" />
import promiseModule = module('uvis/util/promise');
import util = promiseModule.uvis.util;

export module uvis.spec {
    describe('Promise', () => {
        describe('Creating a new Promise', () => {
            it('should return a Promise object with state unfulfilled', () => {
                var p = new util.Promise();
                expect(p.state).toBe('unfulfilled');
            });
            it('should return a Promise object with state fulfilled if created with value', () => {
                var p = new util.Promise(1);
                expect(p.state).toBe('fulfilled');
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
                    return p.state === 'fulfilled';
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
        });
    });

}