/// <reference path="../../.typings/jasmine.d.ts" />

import dict = require('util/Dictionary');
import ct = require('uvis/Template');
import uc = require('uvis/Component');

export module uvis.spec {
    describe('Component:', () => {
        it('should set ctor arguments correctly', () => {
            var t = new ct.uvis.Template('ct', 'html');
            var c1 = new uc.uvis.Component(t, 0);
            var c2 = new uc.uvis.Component(t, 2, c1);

            expect(c1.template).toBe(t);
            expect(c1.parent).toBeUndefined();
            expect(c1.index).toBe(0);

            expect(c2.template).toBe(t);
            expect(c2.parent).toBe(c1);
            expect(c2.index).toBe(2);
        });
        
        describe('Children/bundles:', () => {
            var template = new ct.uvis.Template('ct','html');

            it('should add a child to the specified bundle', () => {
                var c1 = new uc.uvis.Component(template, 0);
                var c2 = new uc.uvis.Component(template, 0);
                var tid = 't1';
                c1.addChild(tid, c2);

                expect(c1.getBundle(tid)).toContain(c2);
            });

            it('should throw if index in bundle is in use when adding', () => {
                var c1 = new uc.uvis.Component(template, 0);
                var c2 = new uc.uvis.Component(template, 0);
                var c3 = new uc.uvis.Component(template, 0);
                var tid = 't1';
                c1.addChild(tid, c2);                
                expect(c1.addChild.bind(c1, tid, c3)).toThrow()
            });

            it('should throw if requested bundle does not exist', () => {
                var c1 = new uc.uvis.Component(template, 0);
                expect(c1.getBundle.bind(c1, 'does.not.exist')).toThrow();
            });
        });
    });
}