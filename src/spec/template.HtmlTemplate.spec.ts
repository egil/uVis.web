/// <reference path="../.typings/jasmine.d.ts" />
import templateModule = module('uvis/template/HtmlTemplate');
import propertyModule = module('uvis/Property');
import ut = templateModule.uvis.template;
import up = propertyModule.uvis;

export module uvis.spec {
    describe('HtmlTemplate:', () => {
        var t1: ut.HtmlTemplate,
            t2: ut.HtmlTemplate,
            a1,
            a2,
            e1,
            e2,
            fn1: Function,
            fn2: Function,
            p1: up.Property,
            p2: up.Property,
            p3: up.Property,
            pc1: up.CalculatedProperty,
            pc2: up.CalculatedProperty,
            pc3: up.CalculatedProperty,
            completed,
            failed;

        beforeEach(function () {
            t1 = undefined;
            t2 = undefined;
            a1 = undefined;
            a2 = undefined;
            e1 = undefined;
            e2 = undefined;
            fn1 = undefined;
            fn2 = undefined;
            p1 = undefined;
            p2 = undefined;
            p3 = undefined;
            pc1 = undefined;
            pc2 = undefined;
            pc3 = undefined;
            completed = undefined;
            failed = undefined;
        });

        describe('constructor()', () => {
            it('should return a new template with its tag set to constructor supplied value', () => {
                e1 = 'div';
                t1 = new ut.HtmlTemplate('id', e1);
                expect(t1.tag).toBe(e1);
            });

            it('should throw an error if a valid tag is not supplied (null, undefined, or empty string)', () => {
                fn1 = () => { new ut.HtmlTemplate('id', null); }
                expect(fn1).toThrow();
                fn1 = () => { new ut.HtmlTemplate('id', undefined); }
                expect(fn1).toThrow();
                fn1 = () => { new ut.HtmlTemplate('id', ''); }
                expect(fn1).toThrow();
            });
        });

        describe('creatingContent()', () => {
            it('should return an element with an unique id based on the templates id', () => {
                e1 = 'an-id';
                t1 = new ut.HtmlTemplate(e1, 'div');

                runs(() => {
                    t1.createContent().then((elm) => {
                        a1 = elm;
                        completed = true;
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 10);

                runs(function () {
                    expect(a1.getAttribute('id')).toBe(e1);
                });
            });

            xit('should return an element with the supplied properties set on it', () => {
                t1 = new ut.HtmlTemplate('id', 'div');
                pc1 = new up.CalculatedProperty('title', () => {

                });
                p2 = new up.Property('contenteditable', true);
                p3 = new up.Property('dir', 'rtl');
                t1.properties.add(p1.key, p1);
                t1.properties.add(p2.key, p2);
                t1.properties.add(p3.key, p3);

                runs(() => {
                    t1.createContent().then((elm) => {
                        a1= elm;
                        completed = true;
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 10);

                runs(function () {
                    expect(a1.getAttribute('title')).toBe('some title');
                    expect(a1.getAttribute('contenteditable')).toBe(true);
                    expect(a1.getAttribute('dir')).toBe('rtl');
                });

            });
        });
    });

}