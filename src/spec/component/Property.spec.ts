/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />
import ucpM = module('uvis/component/Property');
import uccM = module('uvis/component/Context');

export module uvis.spec {
    import ucp = ucpM.uvis.component;
    import ucc = uccM.uvis.component;

    describe('Property:', () => {
        describe('ReadOnlyProperty:', () => {
            it('should set id and value in constructor correctly', () => {
                var p = new ucp.ReadOnlyProperty('title', 'some title');
                
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = p.getValue().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                });

                waitsFor(() => res.completed, '', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(p.id).toBe('title');
                    expect(res.data[0]).toBe('some title');
                });              
            });
        });

        describe('ReadWriteProperty:', () => {
            it('should push value changes to observers', () => {
                var p = new ucp.ReadWriteProperty('title', 'x');

                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = p.getValue().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                });

                waitsFor(() => res.data[0] === 'x', 'for x to be pushed', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.completed).toBeFalsy();
                    p.setValue('y');
                });

                waitsFor(() => res.data[1] === 'y', 'for y to be pushed', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.completed).toBeFalsy();
                    sub.dispose();
                });
            });

            it('should only publish distinct values', () => {
                var p = new ucp.ReadWriteProperty('title', 'x');

                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = p.getValue().subscribe((x) => {
                        res.data.push(x);
                    }, err => { res.err = err; }, () => { res.completed = true; });
                    p.setValue('z');
                    p.setValue('y');
                    p.setValue('y');
                    p.setValue('y');
                    p.setValue('end');
                });

                waitsFor(() => res.data[3] === 'end', 'for end to be pushed', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.completed).toBeFalsy();
                    expect(res.data.length).toBe(4);
                    expect(res.data[0]).toBe('x');
                    expect(res.data[1]).toBe('z');
                    expect(res.data[2]).toBe('y');
                    expect(res.data[3]).toBe('end');
                    sub.dispose();
                });
            });
        });

        describe('CalculatedProperty:', () => {
            it('should use the factory to create an observable', () => {
                var factory = (c?: ucc.Context) => c.index;
                var p = new ucp.CalculatedProperty('title', factory);
                var c = new ucc.Context({ index: 42 });

                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = p.getValue(c).subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                });

                waitsFor(() => res.completed, '', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(p.id).toBe('title');
                    expect(res.data[0]).toBe(42);
                    sub.dispose();
                });
            });

            it('should push changes if factory creates a dependent observable', () => {
                var sourceA = new Rx.BehaviorSubject('a');
                var sourceB = Rx.Observable.returnValue('b');
                var factory = (c?: ucc.Context) => c.combine(sourceA, sourceB, c.data, (a, b, d) => a + b + d + c.index);
                var p = new ucp.CalculatedProperty('title', factory);
                var c = new ucc.Context({ index: 42, data: Rx.Observable.returnValue('d') });

                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = p.getValue(c).subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                });

                waitsFor(() => res.data[0] === 'abd42', '', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.completed).toBeFalsy();
                    sourceA.onNext('aa');
                });

                waitsFor(() => res.data[1] === 'aabd42', '', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.completed).toBeFalsy();
                    sub.dispose();
                });
            });

            it('should return default value if stream completes', () => {
                var sourceA = new Rx.Subject();
                var factory = (c?: ucc.Context) => sourceA.asObservable();
                var p = new ucp.CalculatedProperty('title', factory, 'no title');

                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = p.getValue().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                    // complete without sending out values...
                    sourceA.onCompleted();
                });

                waitsFor(() => res.completed, 'stream to complete', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.completed).toBeTruthy();
                    expect(res.data[0]).toBe('no title');

                });
            });

            it('should allow multiple subscribers', () => {
                var sourceA = new Rx.ReplaySubject(1);
                var factory = (c?: ucc.Context) => sourceA.asObservable();
                var p = new ucp.CalculatedProperty('title', factory, 'no title');

                var res1 = { data: [], err: undefined, completed: false };
                var res2 = { data: [], err: undefined, completed: false };
                var sub1;
                var sub2;
                var observable = p.getValue();

                sourceA.onNext('z');

                runs(() => {
                    sub1 = observable.subscribe((x) => { res1.data.push(x); }, err => { res1.err = err; }, () => { res1.completed = true; });
                    sourceA.onNext('a');
                    sub2 = observable.subscribe((x) => { res2.data.push(x); }, err => { res2.err = err; }, () => { res2.completed = true; });
                });

                waitsFor(() => {
                    return res1.data[1] === 'a' && res2.data[0] === 'a';
                }, 'a on stream', 20);

                runs(() => {
                    expect(res1.err).toBeUndefined();
                    expect(res2.err).toBeUndefined();
                    expect(res1.completed).toBeFalsy();
                    expect(res2.completed).toBeFalsy();                    
                });

                runs(() => { sourceA.onNext('b'); });

                waitsFor(() => {
                    return res1.data[2] === 'b' && res2.data[1] === 'b';
                }, 'b on stream', 20);


                runs(() => {
                    expect(res1.err).toBeUndefined();
                    expect(res2.err).toBeUndefined();
                    expect(res1.completed).toBeFalsy();
                    expect(res2.completed).toBeFalsy();
                });
            });

            it('should only publish distinct values', () => {
                var sourceA = new Rx.ReplaySubject(1);
                var factory = (c?: ucc.Context) => sourceA.asObservable();
                var p = new ucp.CalculatedProperty('title', factory, 'no title');

                var res1 = { data: [], err: undefined, completed: false };
                var res2 = { data: [], err: undefined, completed: false };
                var sub1;
                var sub2;
                var observable = p.getValue();

                sourceA.onNext('z');

                runs(() => {
                    sub1 = observable.subscribe((x) => { res1.data.push(x); }, err => { res1.err = err; }, () => { res1.completed = true; });
                    sourceA.onNext('a');
                    sourceA.onNext('a');
                    sourceA.onNext('a');
                    sourceA.onCompleted();
                });

                waitsFor(() => {
                    return res1.completed;
                }, 'on stream to complete', 20);
                
                runs(() => {
                    expect(res1.err).toBeUndefined();
                    expect(res1.data.length).toBe(2);
                    expect(res1.data[0]).toBe('z');
                    expect(res1.data[1]).toBe('a');
                });
            });

            it('should throw meaningful error on cyclic dependencies', () => {
                var map = [];
                var factoryA = (ctx?: ucc.Context) => ctx.combine(map[1], map[2], (b, c) => b + c);
                var factoryB = (ctx?: ucc.Context) => ctx.combine(map[2], map[3], (c, a) => c + a);
                var factoryC = (ctx?: ucc.Context) => ctx.combine(map[0], map[1], (a, b) => a + b);

                var a = new ucp.CalculatedProperty('title', factoryA);
                var b = new ucp.CalculatedProperty('title', factoryB);
                var c = new ucp.CalculatedProperty('title', factoryC);

                var context = new ucc.Context();

                map.push(a.getValue(context));
                map.push(b.getValue(context));
                map.push(c.getValue(context));

                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = map[0].subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                });

                waitsFor(() => res.err !== undefined, 'error to arrive', 20);

                runs(() => {                   
                    expect(res.completed).toBeFalsy();
                    expect(res.err.message).toBe('Possible cyclic dependencies detected.');
                });
            });
        });
    });
}