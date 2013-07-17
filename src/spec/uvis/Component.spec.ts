/// <reference path="../../.typings/jasmine.d.ts" />

import dict = require('util/Dictionary');
import ct = require('uvis/Template');
import uc = require('uvis/Component');

export module uvis.spec {
    describe('Component.', () => {
        it('should set ctor arguments correctly', () => {
            var t = new ct.uvis.Template('ct', 'html', undefined, Rx.Observable.empty());
            var c1 = new uc.uvis.Component(t, 0);
            var c2 = new uc.uvis.Component(t, 2, c1);

            expect(c1.template).toBe(t);
            expect(c1.parent).toBeUndefined();
            expect(c1.index).toBe(0);

            expect(c2.template).toBe(t);
            expect(c2.parent).toBe(c1);
            expect(c2.index).toBe(2);
        });
        
        describe('Bundles.', () => {
            it('should be able to create a bundle based on template', () => {
                var template = new ct.uvis.Template('ct', 'html', undefined, Rx.Observable.empty());
                var c1 = new uc.uvis.Component(template, 0);
                var arr = c1.createBundle(template);
                expect(Array.isArray(arr)).toBeTruthy();
                expect(c1.bundles.get(template.name).template).toBe(template);
                expect(c1.bundles.get(template.name).components).toBe(arr);
            });

            it('should be able to get a bundle based on template', () => {
                var template = new ct.uvis.Template('ct', 'html', undefined, Rx.Observable.empty());
                var c1 = new uc.uvis.Component(template, 0);
                c1.createBundle(template);
                var arr = c1.getBundle(template);
                expect(Array.isArray(arr)).toBeTruthy();
                expect(arr).toBe(c1.bundles.get(template.name).components);
            });

            it('should throw if creating bundle for template that already has a component assigned to it an index in its bundles array', () => {
                var template = new ct.uvis.Template('ct', 'html', undefined, Rx.Observable.empty());
                var c1 = new uc.uvis.Component(template, 0);
                var c2 = new uc.uvis.Component(template, 0); // same index, should not happen for the same template.
                c1.createBundle(template);
                expect(c2.createBundle.bind(c2, template)).toThrow();
            });

            it('should throw if creating bundle for template that already has a bundle', () => {
                var template = new ct.uvis.Template('ct', 'html', undefined, Rx.Observable.empty());
                var c1 = new uc.uvis.Component(template, 0);
                c1.createBundle(template);
                expect(c1.createBundle.bind(c1, template)).toThrow();
            });

            it('should throw if requested bundle does not exist', () => {
                var template = new ct.uvis.Template('ct', 'html', undefined, Rx.Observable.empty());
                var c1 = new uc.uvis.Component(template, 0);
                expect(c1.getBundle.bind(c1, template)).toThrow();
            });
        });

        describe('Dispose.', () => {
            
            it('should remove itself from templates who have bundles in it and dipose of children', () => {
                var pct = new ct.uvis.Template('pct', 'html', undefined, Rx.Observable.empty());
                var ct1 = new ct.uvis.Template('ct1', 'html', undefined, Rx.Observable.empty());
                var ct2 = new ct.uvis.Template('ct2', 'html', undefined, Rx.Observable.empty());

                var c1 = new uc.uvis.Component(pct, 0);
                var c2 = new uc.uvis.Component(pct, 1);
                c1.createBundle(ct1);
                c2.createBundle(ct1);

                c2.dispose();

                expect(ct1.bundles.length).toBe(1);
                expect(ct1.bundles[0]).toBe(c1);
                
                c1.dispose();

                expect(ct1.bundles.length).toBe(0);                
            });

            it('should throw if component is not the last in the a bundles array.', () => {
                var pct = new ct.uvis.Template('pct', 'html', undefined, Rx.Observable.empty());
                var ct1 = new ct.uvis.Template('ct1', 'html', undefined, Rx.Observable.empty());
                var ct2 = new ct.uvis.Template('ct2', 'html', undefined, Rx.Observable.empty());

                var c1 = new uc.uvis.Component(pct, 0);
                var c2 = new uc.uvis.Component(pct, 1);
                c1.createBundle(ct1);
                c2.createBundle(ct1);

                expect(c1.dispose.bind(c1)).toThrow();
            });
        });
    });
}