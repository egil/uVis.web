/// <reference path="../.typings/jasmine.d.ts" />

import propertyModule = module('uvis/Property');
import templateModule = module('uvis/template/AbstractTemplate');
import up = propertyModule.uvis;
import ut = templateModule.uvis.template;

export module uvis.spec {
    describe('Abstract Template:', () => {
        var c, actual, expected, fn;

        beforeEach(function () {
            c = actual = expected = fn = undefined;
        });

        afterEach(function () {
        });
        
        describe('constructor()', () => {            
            it('should return a new template with its id set to constructor supplied value', () => {
                expected = 'component id';
                c = new ut.AbstractTemplate(expected);
                expect(c.id).toBe(expected);
            });

            it('should throw an error if a valid id is not supplied (null, undefined, or empty string)', () => {
                fn = () => { new ut.AbstractTemplate(null); }
                expect(fn).toThrow();
                fn = () => { new ut.AbstractTemplate(undefined); }
                expect(fn).toThrow();
                fn = () => { new ut.AbstractTemplate(''); }
                expect(fn).toThrow();
            });
        });

        describe('creatingContent()', () => {

            it('should throw error if component is a AbstractComponent', () => {
                c = new ut.AbstractTemplate('c1');
                fn = () => { c.createContent(); }
                expect(fn).toThrow();
            });
        });
    });

}