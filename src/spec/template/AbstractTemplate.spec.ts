/// <reference path="../../.typings/jasmine.d.ts" />
import utptM = module('uvis/template/PropertyTemplate');
import utatM= module('uvis/template/AbstractTemplate');
import uupM= module('uvis/util/Promise');
import uup = uupM.uvis.util;
import utat = utatM.uvis.template;
import utpt = utptM.uvis.template;
export module uvis.spec {
    describe('Abstract Template:', () => {
        var c, actual, expected, fn;

        uupM.uvis.util.Promise.debug = true;

        beforeEach(function () {
            c = undefined;
            actual = undefined;
            expected = undefined;
            fn = undefined;
        });

        afterEach(function () {
        });
        
        describe('constructor()', () => {            
            it('should return a new template with its id set to constructor supplied value', () => {
                expected = 'component id';
                c = new utat.AbstractTemplate(expected);
                expect(c.id).toBe(expected);
            });

            it('should throw an error if a valid id is not supplied (null, undefined, or empty string)', () => {
                fn = () => { new utat.AbstractTemplate(null); }
                expect(fn).toThrow();
                fn = () => { new utat.AbstractTemplate(undefined); }
                expect(fn).toThrow();
                fn = () => { new utat.AbstractTemplate(''); }
                expect(fn).toThrow();
            });
        });

        describe('creatingContent()', () => {

            it('should throw error if component is a AbstractComponent', () => {
                c = new utat.AbstractTemplate('c1');
                fn = () => { c.createContent(); }
                expect(fn).toThrow();
            });
        });

        describe('adding properties to a template', () => {
            it('should return them correctly', () => {
                c = new utat.AbstractTemplate('div');
                c.properties.add('class', new utpt.PropertyTemplate('class', () => {
                    uup.Promise.resolve('should-be-here');
                }));
                expect(c.properties.get('class').name).toBe('class');
            });
        });
    });

}