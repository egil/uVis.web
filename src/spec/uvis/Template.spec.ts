/// <reference path="../../.typings/jasmine.d.ts" />

import dict = require('util/Dictionary');
import ut = require('uvis/Template');
import uc = require('uvis/Component');
import pt = require('uvis/PropertyTemplate');

export module uvis.spec {

    function sub(obs, actual, done?) {
        return obs.subscribe(res => { actual.push(res); },
            err => { console.log(err); },
            done);
    }

    function subD(obs, actual, done?) {
        return obs.subscribe(res => {
            actual.push(res);
            console.log(res);
        }, er => { console.log(er); }, done);
    }

    describe('Template.', () => {
                
        it('Should set ctor arguments correctly', () => {
            var rows = Rx.Observable.returnValue(42);
            var t3 = new ut.uvis.Template('t3', 'html', undefined, rows);
            var t2 = new ut.uvis.Template('t2', 'html', t3);
            
            expect(t2.name).toBe('t2');
            expect(t2.type).toBe('html');
            expect(t2.parent).toBe(t3);
            expect(t2.rows).toBe(t3.rows);

            expect(t3.name).toBe('t3');
            expect(t3.type).toBe('html');
            expect(t3.parent).toBeUndefined();
            expect(t3.rows).toBeDefined();
        });

        it('should throw if ctor is missing parent and rows', () => {
            expect(() => { new ut.uvis.Template('t1', 'html'); }).toThrow();
        });

        it('Should unsubscribe and dispose of dependencies.', () => {
            var rows = new Rx.Subject<number>();
            var parent = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.returnValue(2));
            var child = new ut.uvis.Template('child', 'html', parent, rows);
            child.initialize();
            child.dispose();
        });

        it('Should create the special row property template.', () => {
            var t1 = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.returnValue(2));
            expect(t1.properties.contains('row')).toBeTruthy();
        });

        it('should allow re-initialization of template, recreating all components (refreshAll/requeryAll)', () => {
            expect(undefined).toBeDefined();
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
                        expect(t1.bundles.length).toBe(0);
                    });
                });

                it('Should create no components if rows returns array with 0 object', () => {
                    var rows = Rx.Observable.returnValue([]);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.bundles.length).toBe(0);
                    });
                });

                it('Should create 1 component if rows returns an object', () => {
                    var rows = Rx.Observable.returnValue({ single: 'object' });
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);
                    
                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.bundles.length).toBe(1);
                    });
                });

                it('Should create N components if rows returns array with N objects', () => {
                    var rows = Rx.Observable.returnValue([{ obj: 1 }, { obj: 2 }, { obj: 3 }]);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);
                    
                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.bundles.length).toBe(3);
                    });
                });

                it('Should create N components in array if rows returns the number N', () => {
                    var rows = Rx.Observable.returnValue(2);
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    waitsFor(() => t1.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete.', 20);

                    runs(() => {
                        expect(t1.bundles.length).toBe(2);
                    });
                });

                it('Should delete N components if new array arrives has N less elements than the previous', () => {
                    var rows = new Rx.Subject<Object[]>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    // creates 3 instances
                    rows.onNext([{}, {}, {}]);

                    expect(t1.bundles.length).toBe(3);

                    // this should deletes one instance
                    rows.onNext([{}, {}]);

                    expect(t1.bundles.length).toBe(2);
                });

                it('Should create N components if new array arrives has N more elements than the previous', () => {
                    var rows = new Rx.Subject<Object[]>();
                    var t1 = new ut.uvis.Template('t1', 'html', undefined, rows);

                    // create the component instances
                    t1.initialize();

                    // creates 2 instances
                    rows.onNext([{}, {}]);

                    expect(t1.bundles.length).toBe(2);

                    // this should add three instance, total 5
                    rows.onNext([{}, {}, {}, {}, {}]);

                    expect(t1.bundles.length).toBe(5);
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

                it('Should create zero components if parent creates zero components', () => {
                    var parent = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.empty());
                    var child = new ut.uvis.Template('child', 'html', parent, Rx.Observable.returnValue(42));

                    child.initialize();

                    expect(child.existingComponents.length).toBe(0);
                });

                it('should create N components based on row count for each parent component', () => {
                    var parent = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.returnValue(10));
                    var child = new ut.uvis.Template('child', 'html', parent, Rx.Observable.returnValue(2));

                    child.initialize();

                    waitsFor(() => child.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete', 50);

                    runs(() => {
                        expect(parent.existingComponents.length).toBe(10);
                        expect(child.existingComponents.length).toBe(20);
                    });
                });

                it('should remove N components based on changed row count for each parent component', () => {
                    var rows = new Rx.Subject<number>();                    
                    var parent = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.returnValue(2));
                    var child = new ut.uvis.Template('child', 'html', parent, rows);

                    child.initialize();

                    rows.onNext(3);

                    rows.onNext(2);

                    rows.onCompleted();

                    waitsFor(() => child.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete', 50);

                    runs(() => {
                        expect(parent.existingComponents.length).toBe(2);
                        expect(child.existingComponents.length).toBe(4);
                    });
                });

                it('should add N components based on changed row count for each parent component', () => {
                    var rows = new Rx.Subject<number>();
                    var parent = new ut.uvis.Template('parent', 'html', undefined, Rx.Observable.returnValue(2));
                    var child = new ut.uvis.Template('child', 'html', parent, rows);

                    child.initialize();

                    rows.onNext(2);

                    rows.onNext(10);

                    rows.onCompleted();

                    waitsFor(() => child.state === ut.uvis.TemplateState.COMPLETED, 'Did not complete', 50);

                    runs(() => {
                        expect(parent.existingComponents.length).toBe(2);
                        expect(child.existingComponents.length).toBe(20);
                    });
                });
            });

            //#endregion
        });
        
        describe('Component referencing:', () => {
            // such that child component templates can subscribe to parent
            // component template and use these as bundles
            it('should return component instances (current and future) via an observable', () => {
                var actual = [];
                var done = false;
                var rows = new Rx.Subject<number>();
                var parent = new ut.uvis.Template('parent', 'html', undefined, rows);
                parent.initialize();

                rows.onNext(2);

                sub(parent.components, actual, () => { done = true; });

                expect(actual.length).toBe(2);

                rows.onNext(10);

                expect(actual.length).toBe(10);

                parent.dispose();
            });
        });

        describe('Property referencing:', () => {
            it('should return a property from component in bundle X on index Y as observable (active, no parent)', () => {
                var obs;
                var actual = [];
                var rows = Rx.Observable.returnValue(30);
                var t1 = new ut.uvis.Template('parent', 'html', undefined, rows);

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
                    obs = t1.get(0, 1, 'text');
                    // subscribe to it to get the property value
                    sub(obs, actual);
                });

                waitsFor(() => actual.length === 1, 'Did not return property', 20);

                runs(() => {
                    expect(actual[0]).toBe('My index is 1');
                })

            });

            it('should return a property from component in bundle X on index Y as observable (inactive, no parent)', () => {
                var obs;
                var actual = [];
                var rows = Rx.Observable.returnValue(4);
                var t1 = new ut.uvis.Template('parent', 'html', undefined, rows);

                // create a text property and add it to the properties dictionary
                t1.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    //return Rx.Observable.returnValue('My index is ' + c.index);
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));
                
                runs(() => {
                    // get the text property from component 2 in bundle 1 (zero indexed).
                    obs = t1.get(0, 1, 'text');
                    // subscribe to it to get the property value
                    sub(obs, actual);
                });

                waitsFor(() => actual.length === 1, 'Did not return property', 20);

                runs(() => {
                    expect(actual[0]).toBe('Data is 4');
                })
            });

            it('should enable reconnecting to same property on new component (active, no parent)', () => {
                var obs;
                var actual = [];
                var rows = new Rx.Subject<number>();
                var t1 = new ut.uvis.Template('parent', 'html', undefined, rows);

                // create a text property and add it to the properties dictionary
                t1.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));

                runs(() => {
                    t1.initialize();
                    
                    // create two components
                    rows.onNext(2);
                });

                waitsFor(() => t1.existingComponents.length === 2, 'Did not create components', 100);

                runs(() => {
                    // get the text property from component 2 in bundle 1 (zero indexed).
                    obs = t1.get(0, 1, 'text');
                    
                    // subscribe to it to get the property value
                    sub(obs, actual);
                });

                waitsFor(() => actual.length === 1, 'Did not return property data', 20);

                runs(() => {
                    // remove one component, i.e. delete the one we are depending on
                    rows.onNext(1);

                    // create four more component (over 2 again)
                    rows.onNext(5);
                });

                waitsFor(() => actual.length === 2, 'Did not return property data after reconnectinng to new component', 20);

                runs(() => {
                    expect(actual[0]).toBe('Data is 2');
                    expect(actual[1]).toBe('Data is 5');
                })
            });

            it('should enable reconnecting to same property on new component (inactive, no parent)', () => {
                var obs;
                var actual = [];
                var rows = new Rx.Subject<number>();
                var t1 = new ut.uvis.Template('parent', 'html', undefined, rows);

                // create a text property and add it to the properties dictionary
                t1.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));

                // get the text property from component 2 in bundle 1 (zero indexed).
                obs = t1.get(0, 1, 'text');
                
                // subscribe to it to get the property value
                sub(obs, actual);

                runs(() => {
                    // create two components
                    rows.onNext(2);
                });

                waitsFor(() => actual.length === 1, 'Did not return property data', 20);

                runs(() => {
                    // remove one component, i.e. delete the one we are depending on
                    rows.onNext(1);

                    // create four more component (over 2 again)
                    rows.onNext(5);
                });

                waitsFor(() => actual.length === 2, 'Did not return property data after reconnectinng to new component', 20);

                runs(() => {
                    expect(actual[0]).toBe('Data is 2');
                    expect(actual[1]).toBe('Data is 5');
                })
            });

            it('should return a property from component in bundle X on index Y as observable (active, parent)', () => {
                var actual1 = [];
                var actual2 = [];
                var prows = Rx.Observable.returnValue(20);
                var crows = Rx.Observable.returnValue(10);
                var parent = new ut.uvis.Template('parent', 'html', undefined, prows);
                var child = new ut.uvis.Template('child', 'html', undefined, crows);

                // create a text property and add it to the properties dictionary
                parent.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));

                // create a text property and add it to the properties dictionary
                child.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));

                runs(() => {
                    child.initialize();
                });

                waitsFor(() => child.existingComponents.length === 200, 'Did not create components', 100);

                runs(() => {
                    // get the text property from component 4 in bundle 1 (zero indexed).
                    // subscribe to it to get the property value
                    sub(parent.get(0, 16, 'text'), actual1);

                    // get the text property from component 2 in bundle 2 (zero indexed).
                    // subscribe to it to get the property value
                    sub(child.get(13, 9, 'text'), actual2);
                });

                waitsFor(() => actual1.length === 1, 'Did not return property 1', 100);
                waitsFor(() => actual2.length === 1, 'Did not return property 2', 100);

                runs(() => {
                    expect(actual1[0]).toBe('Data is 20');
                    expect(actual2[0]).toBe('Data is 10');
                });
            });

            it('should return a property from component in bundle X on index Y as observable (inactive, parent)', () => {
                var actual1 = [];
                var actual2 = [];
                var prows = Rx.Observable.returnValue(4);
                var crows = Rx.Observable.returnValue(2);
                var parent = new ut.uvis.Template('parent', 'html', undefined, prows);
                var child = new ut.uvis.Template('child', 'html', parent, crows);

                // create a text property and add it to the properties dictionary
                parent.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    //return Rx.Observable.returnValue('My index is ' + c.index);
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));

                // create a text property and add it to the properties dictionary
                child.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    //return Rx.Observable.returnValue('My index is ' + c.index);
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));

                runs(() => {
                    // get the text property from component 4 in bundle 1 (zero indexed).
                    // subscribe to it to get the property value
                    sub(parent.get(0, 3, 'text'), actual1);

                    // get the text property from component 2 in bundle 2 (zero indexed).
                    // subscribe to it to get the property value
                    sub(child.get(3, 1, 'text'), actual2);
                });

                waitsFor(() => actual1.length === 1, 'Did not return property 1', 20);
                waitsFor(() => actual2.length === 1, 'Did not return property 2', 20);

                runs(() => {
                    expect(actual1[0]).toBe('Data is 4');
                    expect(actual2[0]).toBe('Data is 2');
                });
            });

            it('should enable reconnecting to same property on new component (active, parent)', () => {
                var obs;
                var actual = [];
                var prows = new Rx.Subject<number>();
                var crows = new Rx.Subject<number>();
                var parent = new ut.uvis.Template('parent', 'html', undefined, prows);
                var child = new ut.uvis.Template('child', 'html', parent, crows);

                // create a text property and add it to the properties dictionary
                child.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    return c.parent.getProperty('row').select(n => 'Data is ' + n);
                }));
                
                runs(() => {
                    child.initialize();
                    // create two components
                    prows.onNext(2);
                    crows.onNext(2);
                });

                waitsFor(() => child.existingComponents.length === 4, 'Did not create components', 100);

                runs(() => {
                    // get the text property from component 2 in bundle 1 (zero indexed).
                    obs = child.get(1, 0, 'text');

                    // subscribe to it to get the property value
                    sub(obs, actual);
                });

                waitsFor(() => actual.length === 1, 'Did not return property data', 20);

                runs(() => {
                    // remove one component, i.e. delete the one we are depending on
                    prows.onNext(1);

                    // create four more component (over 2 again)
                    prows.onNext(5);
                });

                waitsFor(() => actual.length === 2, 'Did not return property data after reconnectinng to new component', 20);

                runs(() => {
                    expect(actual[0]).toBe('Data is 2');
                    expect(actual[1]).toBe('Data is 5');
                })
            });

            it('should enable reconnecting to same property on new component (inactive, parent)', () => {
                var obs;
                var actual = [];
                var prows = new Rx.Subject<number>();
                var crows = new Rx.Subject<number>();
                var parent = new ut.uvis.Template('parent', 'html', undefined, prows);
                var child = new ut.uvis.Template('child', 'html', parent, crows);

                // create a text property and add it to the properties dictionary
                child.properties.add('text', new pt.uvis.ComputedPropertyTemplate('text', (c) => {
                    return c.getProperty('row').select(n => 'Data is ' + n);
                }));

                // get the text property from component 2 in bundle 1 (zero indexed).
                obs = child.get(2, 2, 'text');

                // subscribe to it to get the property value
                sub(obs, actual);

                runs(() => {
                    // create two components
                    prows.onNext(3);
                    crows.onNext(3);
                });

                waitsFor(() => actual.length === 1, 'Did not return property data', 20);

                runs(() => {
                    // remove one component, i.e. delete the one we are depending on
                    crows.onNext(1);

                    // create four more component (over 2 again)
                    crows.onNext(5);
                });

                waitsFor(() => actual.length === 2, 'Did not return property data after reconnectinng to new component', 20);

                runs(() => {
                    expect(actual[0]).toBe('Data is 3');
                    expect(actual[1]).toBe('Data is 5');
                })
            });
        });
    });
}