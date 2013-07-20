/// <reference path="../../.typings/jasmine.d.ts" />

import dict = require('util/Dictionary');
import ct = require('uvis/Template');
import uc = require('uvis/Component');
import ub = require('uvis/Bundle');

export module uvis.spec {
    describe('Component.', () => {
        it('should set ctor arguments correctly', () => {
            var t = new ct.uvis.Template('ct', 'html', undefined, Rx.Observable.empty());
            var b = new ub.uvis.Bundle(t);
            var c1 = new uc.uvis.Component(t, b, 0);
            var c2 = new uc.uvis.Component(t, b, 2, c1);

            expect(c1.template).toBe(t);
            expect(c1.parent).toBeUndefined();
            expect(c1.index).toBe(0);
            expect(c1.bundle).toBe(b);

            expect(c2.template).toBe(t);
            expect(c2.parent).toBe(c1);
            expect(c2.index).toBe(2);
            expect(c2.bundle).toBe(b);
        });
        
        describe('Bundles.', () => {

            it('should be able to get a bundle based on template', () => {
                var t1 = new ct.uvis.Template('t1', 'html', undefined, Rx.Observable.empty());
                var t2 = new ct.uvis.Template('t2', 'html', undefined, Rx.Observable.empty());
                var b = new ub.uvis.Bundle(t1);
                var c1 = new uc.uvis.Component(t1, b, 0);
                
                var expected = c1.createBundle(t2);
                var actual = c1.bundles.get(t2.name);

                expect(actual).toBe(expected);
            });            

            it('should throw if creating bundle for template that already has a bundle', () => {
                var t1 = new ct.uvis.Template('t1', 'html', undefined, Rx.Observable.empty());
                var t2 = new ct.uvis.Template('t2', 'html', undefined, Rx.Observable.empty());
                var b = new ub.uvis.Bundle(t1);
                var c1 = new uc.uvis.Component(t1, b, 0);
                c1.createBundle(t2);
                expect(c1.createBundle.bind(c1, t2)).toThrow();
            });
        });

        xdescribe('Dispose.', () => {
            
            //it('should remove itself from templates who have bundles in it and dipose of children', () => {
            //    var pct = new ct.uvis.Template('pct', 'html', undefined, Rx.Observable.empty());
            //    var ct1 = new ct.uvis.Template('ct1', 'html', pct, Rx.Observable.empty());
            //    var ct2 = new ct.uvis.Template('ct2', 'html', pct, Rx.Observable.empty());

            //    var b = new ub.uvis.Bundle(pct);
            //    var c1 = new uc.uvis.Component(pct, b, 0);
            //    var c2 = new uc.uvis.Component(pct, b, 1);

            //    c1.createBundle(ct1);
            //    c2.createBundle(ct1);

            //    c2.dispose();

            //    expect(ct1.bundles.length).toBe(1);
            //    expect(ct1.bundles[0]).toBe(c1);
                
            //    c1.dispose();

            //    expect(ct1.bundles.length).toBe(0);                
            //});

            //it('should throw if component is not the last in the a bundles array.', () => {
            //    var pct = new ct.uvis.Template('pct', 'html', undefined, Rx.Observable.empty());
            //    var ct1 = new ct.uvis.Template('ct1', 'html', undefined, Rx.Observable.empty());
            //    var ct2 = new ct.uvis.Template('ct2', 'html', undefined, Rx.Observable.empty());

            //    var c1 = new uc.uvis.Component(pct, 0);
            //    var c2 = new uc.uvis.Component(pct, 1);
            //    c1.createBundle(ct1);
            //    c2.createBundle(ct1);

            //    expect(c1.dispose.bind(c1)).toThrow();
            //});
        });
    });
}