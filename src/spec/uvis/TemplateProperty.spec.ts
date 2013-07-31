/// <reference path="../../.typings/rx.js.binding.d.ts" />
/// <reference path="../../.typings/jasmine.d.ts" />

import dict = require('util/Dictionary');
import ut = require('uvis/Template');
import uc = require('uvis/Component');
import pt = require('uvis/TemplateProperty');
import ub = require('uvis/Bundle');

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

    describe('TemplateProperty.', () => {

        //#region TemplateProperty class

        describe('TemplateProperty class.', () => {
            it('Should set ctor arguments correctly.', () => {
                var p1 = new pt.uvis.TemplateProperty<number>('top', 42);
                var p2 = new pt.uvis.TemplateProperty<number>('bottom');
                var p3 = new pt.uvis.TemplateProperty<number>('bottom', 42, true);
                expect(p1.name).toBe('top');
                expect(p1.initialValue).toBe(42);
                expect(p1.internal).toBeFalsy();
                expect(p2.name).toBe('bottom');
                expect(p2.initialValue).toBeUndefined();
                expect(p2.internal).toBeFalsy();
                expect(p3.name).toBe('bottom');
                expect(p3.initialValue).toBe(42);
                expect(p3.internal).toBeTruthy();
            });

            it('Should return an ISubject', () => {
                var p1 = new pt.uvis.TemplateProperty<number>('top', 42);
                var p2 = new pt.uvis.TemplateProperty<number>('bottom');

                expect(p1.create() instanceof Rx.BehaviorSubject).toBeTruthy();
                expect(p2.create() instanceof Rx.ReplaySubject).toBeTruthy();
            });

            it('Should allow multiple observers per observable', () => {
                var actual1 = [];
                var actual2 = [];
                var p2 = new pt.uvis.TemplateProperty<number>('bottom');
                var obs = p2.create();

                runs(() => {
                    sub(obs, actual1); // observer 1

                    obs.onNext(1);

                    sub(obs, actual2); // observer 2

                    obs.onNext(42);
                });

                waitsFor(() => actual1.length === 2 && actual2.length === 2, 'Did not push all numbers', 20);

                runs(() => {
                    expect(actual1[0]).toBe(1);
                    expect(actual1[1]).toBe(42);
                    expect(actual2[0]).toBe(1);
                    expect(actual2[1]).toBe(42);
                });         
            });

            it('Should allow multiple observers per observable (initialValue)', () => {
                var actual1 = [];
                var actual2 = [];
                var p1 = new pt.uvis.TemplateProperty<number>('top', 42);
                var obs = p1.create();

                runs(() => {
                    sub(obs, actual1); // observer 1
                    sub(obs, actual2); // observer 2
                    obs.onNext(500);
                });

                waitsFor(() => actual1.length === 2 && actual2.length === 2, 'Did not push all numbers', 20);

                runs(() => {
                    expect(actual1[0]).toBe(42);
                    expect(actual1[1]).toBe(500);
                    expect(actual2[0]).toBe(42);
                    expect(actual2[1]).toBe(500);
                });
            });
        });

        //#endregion
        
        //#region ComputedTemplateProperty

        describe('ComputedTemplateProperty.', () => {
            var template = new ut.uvis.Template('t', 'html', undefined, () => Rx.Observable.empty());
            var bundle = new ub.uvis.Bundle(template);

            it('Should set ctor arguments correctly.', () => {
                var actual = [];
                var done = false;
                var component = new uc.uvis.Component(template, bundle, 42);
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => Rx.Observable.returnValue(c.index));
                var obs = p1.create(component);

                runs(() => {
                    obs.connect();
                    sub(obs, actual, () => { done = true });                    
                });
                
                waitsFor(() => done, 'Did not complete', 20);

                runs(() => {
                    expect(actual[0]).toBe(42);
                    expect(p1.name).toBe('align');
                    expect(p1.internal).toBeFalsy();
                });
            });

            it('Should set ctor arguments correctly (with initialValue).', () => {
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => Rx.Observable.empty(), 1);

                runs(() => {
                    expect(p1.initialValue).toBe(1);
                    expect(p1.name).toBe('align');
                    expect(p1.internal).toBeFalsy();
                });
            });

            it('Should set ctor arguments correctly (with initialValue, internal).', () => {
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => Rx.Observable.empty(), 1, true);

                runs(() => {
                    expect(p1.initialValue).toBe(1);
                    expect(p1.name).toBe('align');
                    expect(p1.internal).toBeTruthy();
                });
            });

            it('Should create an unique observable based on component.', () => {
                var actual1 = [];
                var actual2 = [];
                var done1 = false;
                var done2 = false;
                var c1 = new uc.uvis.Component(template, bundle, 1);
                var c2 = new uc.uvis.Component(template, bundle, 2);
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => Rx.Observable.returnValue(c.index));
                var obs = p1.create(c1);
                obs.connect();

                runs(() => {
                    sub(obs, actual1, () => { done1 = true });
                });

                waitsFor(() => done1, 'Did not complete', 20);

                runs(() => {
                    sub(p1.create(c2).refCount(), actual2, () => { done2 = true });
                });

                waitsFor(() => done2, 'Did not complete', 20);

                runs(() => {
                    expect(actual1[0]).toBe(1);
                    expect(actual2[0]).toBe(2);
                });
            }); 

            it('Should create observable uses default value if source does not produce a value.', () => {
                var actual = [];
                var component = new uc.uvis.Component(template, bundle, 1);
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => Rx.Observable.never(), 42);
                var obs = p1.create(component);
                obs.connect();

                runs(() => {
                    sub(obs, actual);
                });

                waitsFor(() => actual.length === 1, 'Did not complete', 20);

                runs(() => {
                    expect(actual[0]).toBe(42);
                });
            });

            it('Should create observable that multiple observers can share (cold).', () => {
                var actual1 = [];
                var actual2 = [];
                var prodCount = 0;
                var done1 = false;
                var done2 = false;
                var component = new uc.uvis.Component(template, bundle, 1);
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => Rx.Observable.returnValue(c.index).doAction(() => { prodCount++; }));
                var obs = p1.create(component);
                obs.connect();

                runs(() => {
                    sub(obs, actual1, () => { done1 = true; });
                });

                waitsFor(() => done1, 'Did not complete', 20);

                runs(() => {
                    sub(obs, actual2, () => { done2 = true; });
                });

                waitsFor(() => done2, 'Did not complete', 20);

                runs(() => {
                    expect(prodCount).toBe(1);
                    expect(actual1[0]).toBe(1);
                    expect(actual2[0]).toBe(1);
                });
            });

            it('Should create observable that multiple observers can share (hot).', () => {
                var actual1 = [];
                var actual2 = [];
                var prodCount = 0;
                var done1 = false;
                var done2 = false;
                var component = new uc.uvis.Component(template, bundle, 1);
                var source = new Rx.Subject<number>();
                var produceTracker = source.doAction(() => { prodCount++; });
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => produceTracker);

                var obs = p1.create(component);
                obs.connect();

                runs(() => {
                    sub(obs, actual1);

                    // push value to observers
                    source.onNext(42); 
                });

                waitsFor(() => actual1.length === 1, 'Did not complete', 20);

                runs(() => {
                    sub(obs, actual2);
                });

                waitsFor(() => actual2.length === 1, 'Did not complete', 20);

                runs(() => {
                    expect(prodCount).toBe(1);
                    expect(actual1[0]).toBe(42);
                    expect(actual2[0]).toBe(42);
                });
            });

            it('Should create observable that multiple observers can share (cold+initialValue).', () => {
                var actual1 = [];
                var actual2 = [];
                var prodCount = 0;
                var done1 = false;
                var done2 = false;
                var component = new uc.uvis.Component(template, bundle, 42);
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => Rx.Observable.returnValue(c.index).doAction(() => { prodCount++; }), 1);

                var obs = p1.create(component);
                obs.connect();

                runs(() => {
                    sub(obs, actual1, () => { done1 = true; });
                });

                waitsFor(() => done1, 'Did not complete', 20);

                runs(() => {
                    sub(obs, actual2, () => { done2 = true; });
                });

                waitsFor(() => done2, 'Did not complete', 20);

                runs(() => {
                    expect(prodCount).toBe(1);
                    expect(actual1[0]).toBe(42);
                    expect(actual2[0]).toBe(42);
                });
            });

            it('Should create observable that multiple observers can share (hot+initialValue).', () => {
                var actual1 = [];
                var actual2 = [];
                var done1 = false;
                var done2 = false;
                var prodCount = 0;
                var component = new uc.uvis.Component(template, bundle, 1);
                var source = new Rx.Subject<number>();
                var produceTracker = source.doAction(() => { prodCount++; });
                var p1 = new pt.uvis.ComputedTemplateProperty<number>('align', (c) => produceTracker, 1);

                var obs = p1.create(component);
                obs.connect();

                runs(() => {
                    sub(obs, actual1);

                    // push value to observers
                    source.onNext(42);
                });

                waitsFor(() => actual1.length === 2, 'Did not complete', 20);

                runs(() => {
                    sub(obs, actual2);
                });

                waitsFor(() => actual2.length === 1, 'Did not complete', 20);

                runs(() => {
                    expect(prodCount).toBe(1);
                    expect(actual1[0]).toBe(1);
                    expect(actual1[1]).toBe(42);
                    expect(actual2[0]).toBe(42);
                });
            });
        });

        //#endregion

        //#region SharedComputedTemplateProperty

        describe('SharedComputedTemplateProperty.', () => {
            it('Should set ctor arguments correctly.', () => {
                var actual = [];
                var done = false;
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('text', () => Rx.Observable.returnValue<number>(42));
                
                sub(p1.create(), actual, () => { done = true; });
                
                waitsFor(() => {
                    return done;
                }, 'Did not complete', 20);

                runs(() => {
                    expect(p1.name).toBe('text');
                    expect(actual[0]).toBe(42);
                    expect(p1.internal).toBeFalsy();
                });
            });

            it('Should set ctor arguments correctly (with initialValue).', () => {
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('texty', () => Rx.Observable.empty(), 1);

                runs(() => {
                    expect(p1.name).toBe('texty');
                    expect(p1.initialValue).toBe(1);
                    expect(p1.internal).toBeFalsy();
                });
            });

            it('Should set ctor arguments correctly (with initialValue).', () => {
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('texty', () => Rx.Observable.empty(), 1, true);

                runs(() => {
                    expect(p1.name).toBe('texty');
                    expect(p1.initialValue).toBe(1);
                    expect(p1.internal).toBeTruthy();
                });
            });


            it('Should return default value if observable never produces a value or completes.', () => {
                var source = new Rx.Subject<number>();
                var actual = [];
                var done = false;
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('text', () => source, 1);

                runs(() => {
                    sub(p1.create(), actual, () => { done = true; });
                });

                waitsFor(() => {
                    return actual[0] !== undefined;
                }, 'Did not complete', 20);

                runs(() => {
                    expect(actual[0]).toBe(1);
                });
            });

            it('Should return default value first, if one is supplied (cold source)', () => {
                var source = Rx.Observable.empty();
                var actual = [];
                var done = false;
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('text', () => source, 1);

                runs(() => {
                    sub(p1.create(), actual, () => { done = true; });
                });

                waitsFor(() => {
                    return done;
                }, 'Did not complete', 20);

                runs(() => {
                    expect(actual[0]).toBe(1);
                });
            });

            it('Should return a shared observable that allows for late subscribers (hot observable).', () => {
                var actual1 = [];
                var actual2 = [];
                var prodCount = 0;
                var source = new Rx.Subject<number>();
                var done1 = false;
                var done2 = false;

                var produceTracker = source.doAction(() => { prodCount++; });
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('text', () => produceTracker);
                
                runs(() => {
                    var sub1 = sub(p1.create(), actual1);
                    
                    source.onNext(42);                                
                });

                waitsFor(() => {
                    return actual1.length === 1;
                }, 'Did not complete', 20);

                // a second, late subscriber
                runs(() => {
                    var sub2 = sub(p1.create(), actual2);
                });

                waitsFor(() => {
                    return actual2.length === 1;
                }, 'Did not complete', 20);

                
                runs(() => {
                    expect(prodCount).toBe(1);
                    expect(actual1[0]).toBe(42);
                    expect(actual2[0]).toBe(42);
                });            
            });

            it('Should return a shared observable that allows for late subscribers (cold observable).', () => {
                var actual1 = [];
                var actual2 = [];
                var prodCount = 0;
                var source = Rx.Observable.returnValue(42);
                var done1 = false;
                var done2 = false;

                var produceTracker = source.doAction(() => { prodCount++; });
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('text', () => produceTracker);

                runs(() => {
                    var sub1 = sub(p1.create(), actual1, () => { done1 = true; });
                });

                waitsFor(() => {
                    return done1;
                }, 'Did not complete', 20);
                
                runs(() => {
                    var sub2 = sub(p1.create(), actual2, () => { done2 = true; });
                });

                waitsFor(() => {
                    return done2;
                }, 'Did not complete', 20);

                runs(() => {
                    expect(prodCount).toBe(2);
                    expect(actual1[0]).toBe(42);
                    expect(actual2[0]).toBe(42);
                });
            });

            it('Should return a shared observable that allows for late subscribers (hot observable + initialValue).', () => {
                var actual1 = [];
                var actual2 = [];
                var prodCount = 0;
                var source = new Rx.Subject<number>();

                var produceTracker = source.doAction(() => { prodCount++; });
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('text', () => produceTracker, 1);
                
                runs(() => {
                    var sub1 = sub(p1.create(), actual1);
                    source.onNext(42);
                });

                waitsFor(() => {
                    return actual1.length === 2;
                }, 'Did not complete', 20);

                runs(() => {
                    var sub2 = sub(p1.create(), actual2);
                });
                
                waitsFor(() => {
                    return actual2.length === 1;
                }, 'Did not complete', 20);

                runs(() => {
                    expect(prodCount).toBe(1);
                    expect(actual1[0]).toBe(1);
                    expect(actual1[1]).toBe(42);
                    expect(actual2[0]).toBe(42);
                });
            });

            it('Should return a shared observable that allows for late subscribers (cold observable + initialValue).', () => {
                var actual1 = [];
                var actual2 = [];
                var prodCount = 0;
                var source = Rx.Observable.returnValue(42);
                var done1 = false;
                var done2 = false;

                var produceTracker = source.doAction(() => { prodCount++; });
                var p1 = new pt.uvis.SharedComputedTemplateProperty<number>('text', () => produceTracker, 1);

                runs(() => {
                    var sub1 = sub(p1.create(), actual1, () => { done1 = true; });
                });

                waitsFor(() => {
                    return done1;
                }, 'Did not complete', 20);

                runs(() => {
                    var sub2 = sub(p1.create(), actual2, () => { done2 = true; });
                });

                waitsFor(() => {
                    return done2;
                }, 'Did not complete', 20);

                runs(() => {
                    expect(prodCount).toBe(2);
                    expect(actual1[0]).toBe(1);
                    expect(actual1[1]).toBe(42);
                    expect(actual2[0]).toBe(42);
                });
            });
        });

        //#endregion 

        //#region TemplatePropertySet



        //#endregion TemplatePropertySet

    });

}
