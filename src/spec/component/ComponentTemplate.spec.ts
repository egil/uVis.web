/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />

import ucctM = module('uvis/component/ComponentTemplate');
import ucciM = module('uvis/component/ComponentInstance');
import uddvM = module('uvis/data/DataView');
import ucpM = module('uvis/component/Property');
import uddsM = module('uvis/data/DataSource');
import udsdsM = module('uvis/data/SessionDataSource');
import uccM = module('uvis/component/Context');

export module uvis.spec {
    import utcc = ucctM.uvis.component;
    import uddv = uddvM.uvis.data;
    import ucp = ucpM.uvis.component;
    import ucci = ucciM.uvis.component;
    import udds = uddsM.uvis.data;
    import udsds = udsdsM.uvis.data;
    import ucc = uccM.uvis.component;
    
    describe('ComponentTemplate:', () => {
        describe('constructor + properties', () => {
            it('should set id property correctly in ctor', () => {
                var e = 'some id';
                var c = new utcc.ComponentTemplate(e);
                var a= c.id;
                expect(a).toBe(e);
            });

            it('should set parent property correctly in ctor', () => {                
                var pc = new utcc.ComponentTemplate('parent');
                var cc = new utcc.ComponentTemplate('child', pc);
                var a = cc.parent;
                expect(a).toBe(pc);
            });
        
            it('should set the data property correctly', () => {
                var c = new utcc.ComponentTemplate();
                var dv = new uddv.DataView(null, null, null);
                c.data = dv;
                expect(c.data).toBe(dv);
            });                
        });

        describe('children', () => {
            it('should ensure unique id of children', () => {
                var pc = new utcc.ComponentTemplate();
                var c1 = new utcc.ComponentTemplate('child');
                var c2 = new utcc.ComponentTemplate('child');
                expect(() => pc.addChildren([c1, c2])).toThrow('Children with duplicated id\'s detected. Id = child');
            });

            it('should allow multiple children to have undefined id', () => {
                var pc = new utcc.ComponentTemplate();
                var c1 = new utcc.ComponentTemplate();
                var c2 = new utcc.ComponentTemplate();
                pc.addChildren([c1, c2]);
            });

            it('should allow children to be added', () => {
                var pc = new utcc.ComponentTemplate();
                var c1 = new utcc.ComponentTemplate('child');
                var c2 = new utcc.ComponentTemplate('child2');
                var c3 = new utcc.ComponentTemplate();
                pc.addChildren([c1, c2]);
            });
        });

        describe('properties', () => {
            it('should throw exception if a property is inserted with a key of already added property', () => {
                var c = new utcc.ComponentTemplate();
                var p1 = new ucp.ReadOnlyProperty('id');
                var p2 = new ucp.ReadOnlyProperty('id');
                expect(() => {
                    c.addProperties([p1, p2]);
                }).toThrow('Property with duplicated id\'s detected. Id = id');
            });

            it('should allow inserting properties', () => {
                var c = new utcc.ComponentTemplate();
                var p1 = new ucp.ReadOnlyProperty('id');
                var p2 = new ucp.ReadOnlyProperty('width');
                c.addProperties([p1, p2]);
            });
        });

        describe('creating an instance tree', () => {
            it('should return in a Rx.Internals.AnonymouseObservable', () => {
                var c = new utcc.ComponentTemplate();
                var i = c.create();
                expect(i instanceof Rx.Internals.AnonymousObservable).toBeTruthy();
            });

            it('should update the provided context and set template = itself', () => {
                var ct = new utcc.HTMLComponentTemplate('div');
                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = ct.create().subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    ci = res.data[0];
                    expect(ci.context.template).toBe(ct);
                });
            });

            it('should insert instance properties on the instance template', () => {
                var ct = new utcc.HTMLComponentTemplate('div');
                ct.addProperty(new ucp.ReadOnlyProperty('title', 'test'));
                ct.addProperty(new ucp.ReadOnlyProperty('id', 'blah'));

                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = ct.create().subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    ci = res.data[0];
                    expect(ci.properties.contains('title')).toBeTruthy();
                    expect(ci.properties.get('title') instanceof Rx.Internals.AnonymousObservable).toBeTruthy();
                    expect(ci.properties.contains('id')).toBeTruthy();
                    expect(ci.properties.get('id') instanceof Rx.Internals.AnonymousObservable).toBeTruthy();
                });
            });

            it('should add children to the instance template with context.parent pointing to the parent', () => {
                var ct = new utcc.HTMLComponentTemplate('div');
                ct.addChild(new utcc.HTMLComponentTemplate('p'));
                ct.addChild(new utcc.HTMLComponentTemplate('span'));

                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = ct.create().subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    ci = res.data[0];
                    expect(ci.children[0].context.parent).toBe(ci);
                    expect(ci.children[1].context.parent).toBe(ci);
                });
            });

            it('should create a single observer if context.data and this.data is undefined, with context.index = 0', () => {
                var ct = new utcc.HTMLComponentTemplate('div');
                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = ct.create().subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    ci = res.data[0];
                    expect(res.data.length).toBe(1);
                });
            });

            it('should return a single instance if either context.data or this.data produces one object and sets context.data to data object and should use this.data over context.data if both are defined', () => {
                // data source
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart Simpson' }];
                var ds = new udsds.SessionDataSource('ds', comparer, initValues);

                // secondary data source
                var sds = Rx.Observable.returnValue({ id: 2, name: 'Marge Simpson' })

                var ct = new utcc.HTMLComponentTemplate('div');
                ct.data = ds;

                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    // pass in secondary data source via context. It should not be used
                    sub = ct.create(new ucc.Context({ data: sds })).subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    ci = res.data[0];
                    expect(res.data.length).toBe(1);

                    // get the data object
                    ci.context.data.single().subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'data to be retrieved.', 20);

                runs(() => {
                    expect(res.data[1].id).toBe(initValues[0].id);
                    expect(res.data[1].name).toBe(initValues[0].name);
                });

            });          

            it('should return N instances if either context.data or this.data produces N objects with context.index = N', () => {                
                // secondary data source of length 4
                var sds = Rx.Observable.fromArray([{ id: 1, name: 'Bart Simpson' }, { id: 2, name: 'Marge Simpson' }, { id: 3, name: 'Patty Bouvier' }, { id: 4, name: ' Selma Bouvier' }]);

                var ct = new utcc.HTMLComponentTemplate('div');

                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    // pass in secondary data source via context. It should not be used
                    sub = ct.create(new ucc.Context({ data: sds })).subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();                    
                    expect(res.data.length).toBe(4);
                    res.data.forEach((x, i) => {
                        expect(x.context.index).toBe(i);
                    });
                });
            });

            it('should return 0 instances if neither context.data or this.data produces anything', () => {
                // secondary data source of length 0
                var sds = Rx.Observable.empty();

                var ct = new utcc.HTMLComponentTemplate('div');

                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    // pass in secondary data source via context. It should not be used
                    sub = ct.create(new ucc.Context({ data: sds })).subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.data.length).toBe(0);
                });
            });

            it('should return N instances if either context.data or this.data produces a single number N', () => {
                // secondary data source of length 0
                var sds = Rx.Observable.returnValue(10);

                var ct = new utcc.HTMLComponentTemplate('div');

                var ci: ucci.IComponentInstance;
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    // pass in secondary data source via context. It should not be used
                    sub = ct.create(new ucc.Context({ data: sds })).subscribe((x) => { res.data.push(x); }, err => {
                        console.error(err);
                        res.err = err;
                    }, () => {
                        res.completed = true;
                    });
                });

                waitsFor(() => res.completed, 'instance(s) to be created.', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.data.length).toBe(10);
                });
            });

            describe('changes to data stream:', () => {
                it('should add instances if new objects is pushed on data stream', () => {
                    var missing;
                    expect(missing).toBeDefined();
                });
                it('should push updated data to instances if updates is pushed on data stream', () => {
                    var missing;
                    expect(missing).toBeDefined();
                });
                it('should dispose instances if delete-notifications are pushed on the data stream', () => {
                    var missing;
                    expect(missing).toBeDefined();
                });
            });
        });
    });
}