/// <reference path="../../.typings/jasmine.d.ts" />

import dict = require('util/Dictionary');
import ut = require('uvis/Template');
import uc = require('uvis/Component');

export module uvis.spec {

    function sub(obs, actual, done) {
        obs.subscribe(res => { actual.push(res); },
            er => { console.error(er); },
            done);
    }

    function subD(obs, actual, done) {
        obs.subscribe(res => {
            actual.push(res);
            console.log(res);
        }, er => { console.error(er); }, done);
    }

    describe('Template.', () => {
                
        it('Should set ctor arguments correctly', () => {
            var rows = Rx.Observable.returnValue(42);
            var t1 = new ut.uvis.Template('t1', 'html');
            var t2 = new ut.uvis.Template('t2', 'html', t1);
            var t3 = new ut.uvis.Template('t3', 'html', t2, rows);

            expect(t1.id).toBe('t1');
            expect(t1.type).toBe('html');
            expect(t1.parent).toBeUndefined();
            expect(t1.rows).toBeUndefined();

            expect(t2.id).toBe('t2');
            expect(t2.type).toBe('html');
            expect(t2.parent).toBe(t1);
            expect(t2.rows).toBeUndefined();

            expect(t3.id).toBe('t3');
            expect(t3.type).toBe('html');
            expect(t3.parent).toBe(t2);
            expect(t3.rows).toBeDefined();
        });

        it('Should unsubscribe and dispose of dependencies.', () => {
            var done = false;
            var actual = [];
            var rows = new Rx.Subject<Object[]>();
            var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

            sub(t1.components, actual, () => { done = true; });

            // instantiate and create two components
            t1.instantiate();
            rows.onNext([{}, {}]);

            // disposing should result in done being set.
            t1.dispose();

            waitsFor(() => done, 'Did not complete.', 50);

            runs(() => {
                expect(actual.length).toBe(2);
            });
        });

        describe('Creating instance data tree.', () => {
            //#region With no parent

            describe('With no parent.', () => {
                it('Should return an empty array if rows returns 0 object', () => {
                    var done = false;
                    var actual = [];
                    var rows = Rx.Observable.empty();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.instantiate();

                    sub(t1.components, actual, () => { done = true; });

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(0);
                    });
                });

                it('Should return an empty array if rows returns array with 0 object', () => {
                    var done = false;
                    var actual = [];
                    var rows = Rx.Observable.returnValue([]);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.instantiate();

                    sub(t1.components, actual, () => { done = true; });

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(0);
                    });
                });

                it('Should return 1 component in array if rows returns an object', () => {
                    var done = false;
                    var actual = [];
                    var rows = Rx.Observable.returnValue({ single: 'object' });
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);
                    
                    // create the component instances
                    t1.instantiate();

                    sub(t1.components, actual, () => { done = true; });

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(1);
                    });
                });

                it('Should return N components in array if rows returns array with N objects', () => {
                    var done = false;
                    var actual = [];
                    var rows = Rx.Observable.returnValue([{ obj: 1 }, { obj: 2 }, { obj: 3 }]);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.instantiate();

                    sub(t1.components, actual, () => { done = true; });

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(3);
                    });
                });

                it('Should return N components in array if rows returns the number N', () => {
                    var done = false;
                    var actual = [];
                    var rows = Rx.Observable.returnValue(2);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.instantiate();

                    sub(t1.components, actual, () => { done = true; });

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(2);
                    });
                });

                it('Should delete N components if new array arrives has N less elements than the previous', () => {
                    var done = false;
                    var actual = [];
                    var rows = new Rx.Subject<Object[]>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.instantiate();

                    // creates 3 instances
                    rows.onNext([{}, {}, {}]);

                    // this should deletes one instance
                    rows.onNext([{}, {}]);

                    sub(t1.components, actual, () => { done = true; });

                    rows.onCompleted();

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(2);
                    });
                });

                it('Should create N components if new array arrives has N more elements than the previous', () => {
                    var done = false;
                    var actual = [];
                    var rows = new Rx.Subject<Object[]>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    runs(() => {
                        // create the component instances
                        t1.instantiate(); 

                        // creates 2 instances
                        rows.onNext([{}, {}]);

                        // this should add three instance, total 5
                        rows.onNext([{}, {}, {}, {}, {}]);

                        sub(t1.components, actual, () => { done = true; });

                        rows.onCompleted();
                    });                    

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(5);
                    });
                });
            });

            //#endregion

            //#region With parent

            describe('With parent.', () => {

                it('Should create zero components if parent creates zero components', () => {
                    var done = false;
                    var actual = [];

                    // parent
                    var parentRows = Rx.Observable.empty();
                    var parent = new ut.uvis.Template('parent', 'html', undefined, parentRows);

                    // template
                    var childRows = Rx.Observable.returnValue([{}, {}]);
                    var child = new ut.uvis.Template('child', 'html', parent, childRows);

                    // instantiating the child without instantiating the parent
                    // is not a problem. the parent will be instantiated if it
                    // isnt already
                    child.instantiate();

                    sub(child.components, actual, () => { done = true; });

                    waitsFor(() => done, 'Did not complete.', 50);

                    runs(() => {
                        expect(actual.length).toBe(0);
                    });
                });

            });

            //#endregion
        });
        
        xdescribe('Component referencing:', () => {
            // such that child component templates can subscribe to parent
            // component template and use these as bundles
            it('should return component instances (current and future) via an observable', () => {

            });
        });

        xdescribe('Property referencing:', () => {
            it('should return a property from component instance in bundle X on index Y as observable', () => {
            });
        });
    });
}