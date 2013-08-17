/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/rx.js.uvis.d.ts" />

import ut = require('uvis/Template');
import uc = require('uvis/Component');
import ub = require('uvis/Bundle');
import up = require('uvis/TemplateProperty');

export module uvis.spec {
    describe('Component.', () => {
        it('should set ctor arguments correctly', () => {
            var t = new ut.uvis.Template('ut', 'html', undefined, (t?) => Rx.Observable.empty());
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

        it('Should find the form component in the instance data tree on ctor', () => {
            var t = new ut.uvis.Template('ut', 'html', undefined, (t?) => Rx.Observable.empty());
            var b = new ub.uvis.Bundle(t);

            var form = new uc.uvis.Component(t, b, 0);
            var c2 = new uc.uvis.Component(t, b, 1, form);
            var c3 = new uc.uvis.Component(t, b, 2, c2);
            var c4 = new uc.uvis.Component(t, b, 3, c3);

            expect(form.form).toBe(form);
            expect(c2.form).toBe(form);
            expect(c3.form).toBe(form);
            expect(c4.form).toBe(form);
        });

        describe('Bundles.', () => {

            it('should be able to get a bundle based on template', () => {
                var t1 = new ut.uvis.Template('t1', 'html', undefined, (t?) => Rx.Observable.empty());
                var t2 = new ut.uvis.Template('t2', 'html', undefined, (t?) => Rx.Observable.empty());
                var b = new ub.uvis.Bundle(t1);
                var c1 = new uc.uvis.Component(t1, b, 0);

                var expected = c1.createBundle(t2);
                var actual = c1.bundles.get(t2.name);

                expect(actual).toBe(expected);
            });

            it('should throw if creating bundle for template that already has a bundle', () => {
                var t1 = new ut.uvis.Template('t1', 'html', undefined, (t?) => Rx.Observable.empty());
                var t2 = new ut.uvis.Template('t2', 'html', undefined, (t?) => Rx.Observable.empty());
                var b = new ub.uvis.Bundle(t1);
                var c1 = new uc.uvis.Component(t1, b, 0);
                c1.createBundle(t2);
                expect(c1.createBundle.bind(c1, t2)).toThrow();
            });
        });

        describe('Visual tree.', () => {

            it('Should use the form as canvas if canvas is not specified.', () => {
                var elm = document.createDocumentFragment();
                var canvasSource = new Rx.Subject();
                var canvas: uc.uvis.ICanvas = {
                    addVisualComponent: (vc) => {
                        elm.appendChild(vc);
                    },
                    removeVisualComponent: (vc) => {
                        elm.removeChild(vc);
                    }
                };
                var form = new ut.uvis.Template('form', 'html#div');
                var t1 = new ut.uvis.Template('t1', 'html#p', form, (t?) => Rx.Observable.returnValue(4));

                // Add the outer canvas to the form.
                form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', () => {
                    return canvasSource;
                }, undefined, true));

                t1.initialize();

                runs(() => {
                    
                    canvasSource.onNext(canvas);
                });

                waitsFor(() => elm.childNodes.length === 1, 'Did not add form to document fragment.', 20);
                waitsFor(() => elm.firstChild.childNodes.length === 4, 'Did not add p to div.', 20);
            });

            it('Should use specified canvas', () => {
                var elm = document.createDocumentFragment();
                var canvasSource = new Rx.Subject();
                var canvas: uc.uvis.ICanvas = {
                    addVisualComponent: (vc) => {
                        elm.appendChild(vc);
                    },
                    removeVisualComponent: (vc) => {
                        elm.removeChild(vc);
                    }
                };
                var form = new ut.uvis.Template('form', 'html#div');
                var t1 = new ut.uvis.Template('t1', 'html#p', form, (t?) => Rx.Observable.returnValue(4));
                var t2 = new ut.uvis.Template('t2', 'html#div', form);

                // Add the outer canvas to the form.
                form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', () => {
                    return canvasSource;
                }, undefined, true));

                // Add the canvas to the t1, make it use t2 as canvas.
                t1.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
                    return c.form.get('t2', 0).select(c => c.canvas).switchLatest();
                }, undefined, true));

                runs(() => {
                    form.initialize();
                    t1.initialize();
                    //t2.initialize();

                    canvasSource.onNext(canvas);
                });

                waitsFor(() => elm.childNodes.length === 1, 'Did not add form to document fragment.', 20);
                waitsFor(() => elm.firstChild.childNodes.length === 1, 'Did not add t2 to form.', 20);
                waitsFor(() => elm.firstChild.firstChild.childNodes.length === 4, 'Did not add t1 to t2.', 20);
            });

            it('Should allow the canvas to be changed', () => {
                var elm = document.createDocumentFragment();
                var canvasSource = new Rx.Subject();
                var switcher = new Rx.Subject();
                var canvas: uc.uvis.ICanvas = {
                    addVisualComponent: (vc) => {
                        elm.appendChild(vc);
                    },
                    removeVisualComponent: (vc) => {
                        elm.removeChild(vc);
                    }
                };
                var form = new ut.uvis.Template('form', 'html#div');
                var t1 = new ut.uvis.Template('t1', 'html#p', form, Rx.Observable.returnValue(4));
                var t2 = new ut.uvis.Template('t2', 'html#div', form);
                var t3 = new ut.uvis.Template('t3', 'html#header', form);

                // Add the outer canvas to the form.
                form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', () => {
                    return canvasSource;
                }, undefined, true));

                // Add the canvas to the t1, make it dependent on 'switcher'.
                t1.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
                    return switcher.switchLatest();
                }, undefined, true));

                runs(() => {
                    form.initialize();
                    t1.initialize();
                    t2.initialize();
                    t3.initialize();
                    canvasSource.onNext(canvas);

                });

                waitsFor(() => elm.childNodes.length === 1, 'Did not add form to document fragment.', 20);
                waitsFor(() => elm.firstChild.childNodes.length === 2, 'Did not add t2 to form.', 20);

                runs(() => {
                    expect(t2.existingComponents[0].visualComponent.childNodes.length).toBe(0);
                    expect(t3.existingComponents[0].visualComponent.childNodes.length).toBe(0);            
                    switcher.onNext(t3.existingComponents[0].canvas);
                });

                waitsFor(() => t3.existingComponents[0].visualComponent.childNodes.length === 4, 'Did not add t1 to t3', 20);
                
                runs(() => {
                    expect(t2.existingComponents[0].visualComponent.childNodes.length).toBe(0);
                    switcher.onNext(t2.existingComponents[0].canvas);
                });

                waitsFor(() => t2.existingComponents[0].visualComponent.childNodes.length === 4, 'Did not add t1 to t2', 20);

                runs(() => {
                    expect(t3.existingComponents[0].visualComponent.childNodes.length).toBe(0);
                });
            });
        });

    });
}