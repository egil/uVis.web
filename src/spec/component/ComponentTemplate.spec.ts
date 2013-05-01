/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />

import ucctM = module('uvis/component/ComponentTemplate');
import uddvM = module('uvis/data/DataView');
import ucpM = module('uvis/component/Property');

export module uvis.spec {
    import utcc = ucctM.uvis.component;
    import uddv = uddvM.uvis.data;
    import ucp = ucpM.uvis.component;
    
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

            it('should create a single observer if context.data and this.data is undefined', () => {
            });

            it('should assign instance properties to each instance template created', () => {
            });

            it('should return a single instance if either context.data or this.data produces one object', () => {
            });

            it('should return N instances if either context.data or this.data produces N objects', () => {
            });

            it('should return 0 instances if neither context.data or this.data produces anything', () => {
            });

            it('should return N instances if either context.data or this.data produces a single number N', () => {
            });

            describe('changes to data stream:', () => {
                it('should add instances if new objects is pushed on data stream', () => {
                });
                it('should push updated data to instances if updates is pushed on data stream', () => {
                });
                it('should dispose instances if delete-notifications are pushed on the data stream', () => {
                });
            });
        });
    });
}