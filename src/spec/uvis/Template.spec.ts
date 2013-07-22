/// <reference path="../../.typings/rx.js.uvis.d.ts" />
/// <reference path="../../.typings/rx.js.aggregates.d.ts" />
/// <reference path="../../.typings/jasmine.d.ts" />

import ud = require('util/Dictionary');
import ut = require('uvis/Template');
import uc = require('uvis/Component');
import pt = require('uvis/PropertyTemplate');

export module uvis.spec {

    function sub(obs, actual, done?) {
        return obs.subscribe(res => { actual.push(res); },
            err => {
                console.error(err);
            },
            done);
    }

    function sube(obs, errHandler) {
        return obs.subscribe(x => {}, errHandler);
    }

    function subD(obs, actual, done?) {
        return obs.subscribe(res => {
            actual.push(res);
            console.log(res);
        }, er => {
                console.error(er);
            }, done);
    }

    describe('Template.', () => {
        
        it('Should set ctor arguments correctly', () => {
            var rows = Rx.Observable.returnValue(42);
            var t1 = new ut.uvis.Template('t1', 'html#p', undefined, rows);
            var t2 = new ut.uvis.Template('t2', 'html#div', t1);

            expect(t1.name).toBe('t1');
            expect(t1.type).toBe('html');
            expect(t1.subtype).toBe('p');
            expect(t1.parent).toBeUndefined();
            expect(t1.rows).toBeDefined();
            expect(t1.children.contains(t2.name)).toBeTruthy();

            expect(t2.name).toBe('t2');
            expect(t2.type).toBe('html');
            expect(t2.subtype).toBe('div');
            expect(t2.parent).toBe(t1);
            expect(t2.rows).toBe(t1.rows);
        });

        it('should create a single component if ctor is missing parent and rows', () => {
            var t1 = new ut.uvis.Template('t1', 'html');
            
            runs(() => { t1.initialize(); });

            waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'T1 did not complete.', 20);
            
            runs(() => { expect(t1.existingComponents.length).toBe(1); });
        });

        it('Should unsubscribe and dispose of dependencies.', () => {
            var isDisposed = false;
            var rows = Rx.Observable.createWithDisposable(obs => {
                observer = obs;
                return Rx.Disposable.create((x) => {
                    isDisposed = true;
                });
            });
            var parent = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.returnValue(2));
            var child = new ut.uvis.Template('child', 'html', parent, rows);
            child.initialize();
            child.dispose();
            expect(isDisposed).toBeTruthy();
        });

        it('Should create the special row property template.', () => {
            var t1 = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.returnValue(2));
            expect(t1.properties.contains('row')).toBeTruthy();
        });

        xit('should allow re-initialization of template, recreating all components (refreshAll/requeryAll)', () => {
            //expect(undefined).toBeDefined();
        });

        describe('State changes.', () => {
            it('Should be marked as ACTIVE once initialized but rowsCount is not completed.', () => {
                var t1 = new ut.uvis.Template('t1', 'html', undefined, new Rx.Subject());
                t1.initialize();
                expect(t1.state).toBe(ut.uvis.TemplateState.ACTIVE);
            });

            it('Should be marked as ACTIVE once initialized but parent is not completed.', () => {
                var p = new ut.uvis.Template('parent', 'html', undefined, new Rx.Subject());
                var c = new ut.uvis.Template('child', 'html', p, Rx.Observable.empty());
                c.initialize();
                expect(c.state).toBe(ut.uvis.TemplateState.ACTIVE);
            });

            it('Should be marked as DISPOSED once disposed.', () => {
                var t1 = new ut.uvis.Template('t1', 'html', undefined, new Rx.Subject());
                t1.initialize();
                t1.dispose();
                expect(t1.state).toBe(ut.uvis.TemplateState.DISPOSED);
            });

            it('Should be marked as completed once all templates above it in the template data tree is completed.', () => {
                var r1 = new Rx.Subject();
                var r2 = new Rx.Subject();
                var r3 = new Rx.Subject();
                var r4 = new Rx.Subject();
                var t1 = new ut.uvis.Template('t1', 'html', undefined, r1);
                var t2 = new ut.uvis.Template('t2', 'html', t1, r2);
                var t3 = new ut.uvis.Template('t3', 'html', t2, r3);
                var t4 = new ut.uvis.Template('t4', 'html', t3, r4);

                t1.initialize();
                t2.initialize();
                t3.initialize();
                t4.initialize();

                runs(() => {
                    expect(t1.state).toBe(ut.uvis.TemplateState.ACTIVE);
                    expect(t2.state).toBe(ut.uvis.TemplateState.ACTIVE);
                    expect(t3.state).toBe(ut.uvis.TemplateState.ACTIVE);
                    expect(t4.state).toBe(ut.uvis.TemplateState.ACTIVE);

                    r2.onNext(2);
                    r1.onNext(2);
                    r3.onNext(2);
                    r4.onNext(2);
                    r1.onCompleted();
                    r4.onCompleted();
                    r3.onCompleted();
                    r2.onCompleted();
                });

                waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'T1 did not complete', 20);
                waitsFor(() => t2.state === ut.uvis.TemplateState.COMPLETED, 'T2 did not complete', 20);
                waitsFor(() => t3.state === ut.uvis.TemplateState.COMPLETED, 'T3 did not complete', 20);
                waitsFor(() => t4.state === ut.uvis.TemplateState.COMPLETED, 'T4 did not complete', 20);
            });

            it('Should NOT be marked as completed if any templates above it in the template data tree is NOT completed.', () => {
                var r1 = new Rx.Subject();
                var r2 = new Rx.Subject();
                var r3 = new Rx.Subject();
                var r4 = new Rx.Subject();
                var t1 = new ut.uvis.Template('t1', 'html', undefined, r1);
                var t2 = new ut.uvis.Template('t2', 'html', t1, r2);
                var t3 = new ut.uvis.Template('t3', 'html', t2, r3);
                var t4 = new ut.uvis.Template('t4', 'html', t3, r4);

                t1.initialize();
                t2.initialize();
                t3.initialize();
                t4.initialize();

                runs(() => {
                    expect(t1.state).toBe(ut.uvis.TemplateState.ACTIVE);
                    expect(t2.state).toBe(ut.uvis.TemplateState.ACTIVE);
                    expect(t3.state).toBe(ut.uvis.TemplateState.ACTIVE);
                    expect(t4.state).toBe(ut.uvis.TemplateState.ACTIVE);

                    r2.onNext(2);
                    r1.onNext(2);
                    r3.onNext(2);
                    r4.onNext(2);
                    r1.onCompleted();
                    r4.onCompleted();
                    //r3.onCompleted();
                    r2.onCompleted();
                });

                waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'T1 did not complete', 20);
                waitsFor(() => t2.state === ut.uvis.TemplateState.COMPLETED, 'T2 did not complete', 20);

                runs(() => {
                    expect(t3.state).toBe(ut.uvis.TemplateState.ACTIVE);
                    expect(t4.state).toBe(ut.uvis.TemplateState.ACTIVE);
                });
            });

        });

        describe('Creating instance data tree.', () => {
            //#region With no parent

            describe('With no parent.', () => {
                it('Should create no components if rows returns 0 object', () => {
                    var rows = Rx.Observable.empty();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.existingComponents.length).toBe(0);
                    });
                });

                it('Should create no components if rows returns array with 0 object', () => {
                    var rows = Rx.Observable.returnValue([]);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.existingComponents.length).toBe(0);
                    });
                });

                it('Should create 1 component if rows returns an object', () => {
                    var rows = Rx.Observable.returnValue({ single: 'object' });
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.existingComponents.length).toBe(1);
                    });
                });

                it('Should create N components if rows returns array with N objects', () => {
                    var rows = Rx.Observable.returnValue([{ obj: 1 }, { obj: 2 }, { obj: 3 }]);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.existingComponents.length).toBe(3);
                    });
                });

                it('Should create N components in array if rows returns the number N', () => {
                    var rows = Rx.Observable.returnValue(2);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.existingComponents.length).toBe(2);
                    });
                });

                it('Should delete N components if new array arrives has N less elements than the previous', () => {
                    var rows = new Rx.Subject<Object[]>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    runs(() => {
                        // create the component instances
                        t1.initialize();

                        // creates 3 instances
                        rows.onNext([{}, {}, {}]);

                    });
                    
                    waitsFor(() => t1.existingComponents.length === 3, 'T1 did not create 3 components', 20);

                    runs(() => {
                        // this should deletes one instance
                        rows.onNext([{}, {}]);
                    });

                    waitsFor(() => t1.existingComponents.length === 2, 'T1 did not delete 1 components', 20);
                });

                it('Should create N components if new array arrives has N more elements than the previous', () => {
                    var rows = new Rx.Subject<Object[]>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    runs(() => {
                        // create the component instances
                        t1.initialize();

                        // creates 2 instances
                        rows.onNext([{}, {}]);
                    });

                    waitsFor(() => t1.existingComponents.length === 2, 'T1 did not create 2 components', 20);

                    runs(() => {
                        // this should add three instance, total 5
                        rows.onNext([{}, {}, {}, {}, {}]);
                    });

                    waitsFor(() => t1.existingComponents.length === 5, 'T1 did not create 2 addition components', 20);
                });
            });

            //#endregion

            //#region With parent

            describe('With parent.', () => {

                it('Should initialize parent if child is initialized', () => {
                    var rows = new Rx.Subject<Object[]>();
                    var parent = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.never());
                    var child = new ut.uvis.Template('child', 'html', parent, Rx.Observable.returnValue(42));

                    expect(parent.state).toBe(ut.uvis.TemplateState.INACTIVE);

                    child.initialize();

                    expect(parent.state).toBe(ut.uvis.TemplateState.ACTIVE);
                });

                it('Child should inherit parents data source if it does not have one', () => {
                    var rows = Rx.Observable.returnValue({ parent: 'data-source' });
                    var parent = new ut.uvis.Template('parent', 'html', undefined, rows);
                    var child = new ut.uvis.Template('child', 'html', parent);
                    expect(child.rows).toBe(parent.rows);
                });

                it('Should create zero components if parent creates zero components', () => {
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, Rx.Observable.empty());
                    var t2 = new ut.uvis.Template('t2', 'html', t1, Rx.Observable.returnValue(42));
                    var t3 = new ut.uvis.Template('t3', 'html', t2, Rx.Observable.returnValue(42));


                    t3.initialize();

                    expect(t3.existingComponents.length).toBe(0);
                });

                it('Should create N components based on row count for each parent component', () => {
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, Rx.Observable.returnValue(10));
                    var t2 = new ut.uvis.Template('t2', 'html', t1, Rx.Observable.returnValue(2));
                    var t3 = new ut.uvis.Template('t3', 'html', t2, Rx.Observable.returnValue(4));

                    runs(() => {
                        t1.initialize();
                        t2.initialize();
                        t3.initialize();
                    });

                    //waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'T1 did not complete', 50);
                    //waitsFor(() => t2.state === ut.uvis.TemplateState.COMPLETED, 'T2 did not complete', 50);
                    //waitsFor(() => t3.state === ut.uvis.TemplateState.COMPLETED, 'T3 did not complete', 50);

                    waitsFor(() => t1.existingComponents.length === 10, 'T1 did not create 10 components', 20);
                    waitsFor(() => t2.existingComponents.length === 20, 'T2 did not create 20 components', 20);
                    waitsFor(() => t3.existingComponents.length === 80, 'T3 did not create 80 components', 20);

                    //runs(() => {
                    //    expect(t1.existingComponents.length).toBe(10);
                    //    expect(t2.existingComponents.length).toBe(20);
                    //    expect(t3.existingComponents.length).toBe(80);
                    //});
                });

                it('Should remove N components based on changed row count for each parent component', () => {
                    var r2 = new Rx.Subject<number>();
                    var r3 = new Rx.Subject<number>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, Rx.Observable.returnValue(2));
                    var t2 = new ut.uvis.Template('t2', 'html', t1, r2);
                    var t3 = new ut.uvis.Template('t3', 'html', t2, r3);

                    runs(() => {
                        t3.initialize();

                        r2.onNext(3);
                        r3.onNext(6);
                    });

                    waitsFor(() => t2.existingComponents.length === 6, 'T2 did not produce right amount of components', 50);
                    waitsFor(() => t3.existingComponents.length === 36, 'T3 did not produce right amount of components', 50);

                    runs(() => {
                        r2.onNext(2);
                        r3.onNext(3);
                        r2.onCompleted();
                        r3.onCompleted();
                    });

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'T1 did not complete', 50);
                    waitsFor(() => t2.state === ut.uvis.TemplateState.COMPLETED, 'T2 did not complete', 50);
                    waitsFor(() => t3.state === ut.uvis.TemplateState.COMPLETED, 'T3 did not complete', 50);

                    runs(() => {
                        expect(t1.existingComponents.length).toBe(2);
                        expect(t2.existingComponents.length).toBe(4);
                        expect(t3.existingComponents.length).toBe(12);
                    });
                });

                it('should add N components based on changed row count for each parent component', () => {
                    var r2 = new Rx.Subject<number>();
                    var r3 = new Rx.Subject<number>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, Rx.Observable.returnValue(2));
                    var t2 = new ut.uvis.Template('t2', 'html', t1, r2);
                    var t3 = new ut.uvis.Template('t3', 'html', t2, r3);

                    runs(() => {
                        t3.initialize();

                        r2.onNext(3);
                        r3.onNext(6);
                    });

                    waitsFor(() => t2.existingComponents.length === 6, 'T2 did not produce right amount of components', 50);
                    waitsFor(() => t3.existingComponents.length === 36, 'T3 did not produce right amount of components', 50);

                    runs(() => {
                        r2.onNext(5);
                        r3.onNext(7);
                        r2.onCompleted();
                        r3.onCompleted();
                    });

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'T1 did not complete', 50);
                    waitsFor(() => t2.state === ut.uvis.TemplateState.COMPLETED, 'T2 did not complete', 50);
                    waitsFor(() => t3.state === ut.uvis.TemplateState.COMPLETED, 'T3 did not complete', 50);

                    runs(() => {
                        expect(t1.existingComponents.length).toBe(2);
                        expect(t2.existingComponents.length).toBe(10);
                        expect(t3.existingComponents.length).toBe(70);
                    });
                });
            });

            //#endregion

            describe('Out of order initialization.', () => {
                it('Should be able to on other component to initialize.', () => {
                    // Form - root of tree
                    var form = new ut.uvis.Template('form', 'html');

                    // Initialize form 
                    form.initialize();

                    // T11 row that depends on t12!text
                    // Then we select the first component (index = 0) from the bundle
                    // Then we use the form component to find its t12 child with index = 2 and its text property.
                    //var t11row = form.getForm().select(c => <Rx.IObservable<number>>c.get('t12', 2, 'text')).switchLatest();
                    var t11row = form.getForm().get('t12', 2, 'text');

                    // Two child templates to form, both one level down in the tree
                    var t11 = new ut.uvis.Template('t11', 'html', form, t11row);

                    var t12 = new ut.uvis.Template('t12', 'html', form, Rx.Observable.returnValue(4));

                    // Property on t12 that t11 row can depend on
                    t12.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                        return Rx.Observable.returnValue(5 * c.index);
                    }));

                    runs(() => {
                        sub(t11.components, []);
                    });

                    waitsFor(() => t11.state === ut.uvis.TemplateState.COMPLETED, 'T11 did not complete', 50);
                    waitsFor(() => t12.state === ut.uvis.TemplateState.COMPLETED, 'T12 did not complete', 50);

                    runs(() => {
                        expect(form.existingComponents.length).toBe(1);
                        expect(t11.existingComponents.length).toBe(10);
                        expect(t12.existingComponents.length).toBe(4);
                    });
                });

                it('Should be able to detect cyclic dependencies between templates.', () => {
                    var errorMessage;
                    // Form - root of tree
                    var form = new ut.uvis.Template('form', 'html');

                    // Initialize form 
                    form.initialize();

                    // T11 row that depends on t12!text
                    // We use the form component to find its t12 child with index = 2 and its text property.
                    //var t11row = form.getForm().select(c => <Rx.IObservable<number>>c.get('t12', 0, 'text')).switchLatest();
                    var t11row = form.getForm().get('t12', 0, 'text');

                    // Two child templates to form, both one level down in the tree
                    var t11 = new ut.uvis.Template('t11', 'html', form, t11row);

                    // Property on t12 that t11 row can depend on
                    t11.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                        return Rx.Observable.returnValue(5 * c.index);
                    }));

                    // T12 row that depends on t11!text
                    // var t12row = form.getForm().select(c => <Rx.IObservable<number>>c.get('t11', 0, 'text')).switchLatest();
                    var t12row = form.getForm().get('t11', 0, 'text');

                    var t12 = new ut.uvis.Template('t12', 'html', form, t12row);

                    // Property on t12 that t11 row can depend on
                    t12.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                        return Rx.Observable.returnValue(5 * c.index);
                    }));

                    runs(() => {
                        sube(t11.components, (err) => {
                            errorMessage = err;
                        });

                        sube(t12.components, (err) => {
                            errorMessage = err;
                        });
                    });

                    waitsFor(() => errorMessage !== undefined, 'No error message arrived', 100);
                });
            });
        });   

        describe('Property referencing:', () => {
            it('should return a property from component in bundle X on index Y as observable (active, no parent)', () => {
                var obs;
                var actual = [];
                var rows = Rx.Observable.returnValue(30);
                var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                // create a text property and add it to the properties dictionary
                t1.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    return Rx.Observable.returnValue('My index is ' + c.index);
                }));

                // init template, create components
                runs(() => {
                    t1.initialize();
                });

                waitsFor(() => t1.existingComponents.length === 30, 'Did not create components', 100);

                runs(() => {
                    // get the text property from component 2 in bundle 1 (zero indexed).
                    obs = t1.getForm(1).property('text');
                    // subscribe to it to get the property value
                    sub(obs, actual);
                });

                waitsFor(() => actual.length === 1, 'Did not return property', 20);

                runs(() => {
                    expect(actual[0]).toBe('My index is 1');
                });

            });

            it('should return a property from component in bundle X on index Y as observable (inactive, no parent)', () => {
                var obs;
                var actual = [];
                var rows = Rx.Observable.returnValue(4);
                var t1 = new ut.uvis.Template('parent', 'html', undefined, rows);

                // create a text property and add it to the properties dictionary
                t1.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    //return Rx.Observable.returnValue('My index is ' + c.index);
                    return c.property('row').select(n => 'Data is ' + n);
                }));
                
                runs(() => {
                    // get the text property from component 2 in bundle 1 (zero indexed).
                    obs = t1.getForm(2).property('text');
                    // subscribe to it to get the property value
                    sub(obs, actual);
                });

                waitsFor(() => actual.length === 1, 'Did not return property', 20);

                runs(() => {
                    expect(actual[0]).toBe('Data is 4');
                })
            });
        });

    });
}