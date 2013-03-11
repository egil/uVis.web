/// <reference path="../.typings/jasmine.d.ts" />
import templateModule = module('uvis/template/HtmlTemplate');
import propertyModule = module('uvis/Property');
import ut = templateModule.uvis.template;
import up = propertyModule.uvis;

export module uvis.spec {
    describe('HtmlTemplate:', () => {
        var c: ut.HtmlTemplate,
            p1: up.Property,
            p2: up.Property,
            p3: up.Property,
            pc1: up.CalculatedProperty,
            pc2: up.CalculatedProperty,
            actual,
            expected,
            fn,
            completed,
            failed;

        beforeEach(function () {
            c = actual = expected = fn = undefined;
            p1 = p2 = p3 = undefined;
            pc1 = pc2 = undefined;
            completed = failed = false;
        });

        afterEach(function () {
            //runs(() => {
            
            //});

            //waitsFor(() => {
            //}, "", 10);

            //runs(function () {
                
            //});
        });

        describe('instantiating a new template', () => {
            it('should return a new template with its tag set to constructor supplied value', () => {
                expected = 'div';
                c = new ut.HtmlTemplate('id', expected);
                expect(c.tag).toBe(expected);
            });

            it('should throw an error if a valid tag is not supplied (null, undefined, or empty string)', () => {
                fn = () => { new ut.HtmlTemplate('id', null); }
                expect(fn).toThrow();
                fn = () => { new ut.HtmlTemplate('id', undefined); }
                expect(fn).toThrow();
                fn = () => { new ut.HtmlTemplate('id', ''); }
                expect(fn).toThrow();
            });
        });

        describe('creating content', () => {
            it('should return an element with an unique id based on the templates id', () => {
                expected = 'an-id';
                c = new ut.HtmlTemplate(expected, 'div');

                runs(() => {
                    c.createContent().then((elm) => {
                        actual = elm;
                        completed = true;                        
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 10);

                runs(function () {
                    expect(actual.getAttribute('id')).toBe(expected);
                });                               
            });

            xit('should return an element with the supplied properties set on it', () => {
                c = new ut.HtmlTemplate('id', 'div');
                pc1 = new up.CalculatedProperty('title', () => {

                });
                p2 = new up.Property('contenteditable', true);
                p3 = new up.Property('dir', 'rtl');
                c.properties.add(p1.key, p1);
                c.properties.add(p2.key, p2);
                c.properties.add(p3.key, p3);

                runs(() => {
                    c.createContent().then((elm) => {
                        actual = elm;
                        completed = true;
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 10);

                runs(function () {
                    expect(actual.getAttribute('title')).toBe('some title');
                    expect(actual.getAttribute('contenteditable')).toBe(true);
                    expect(actual.getAttribute('dir')).toBe('rtl');
                });

            });
        });
    });

}