/// <reference path="../../.typings/jasmine.d.ts" />

import uthtM = module('uvis/template/HtmlTemplate');
import uupM = module('uvis/util/Promise');
import utptM = module('uvis/template/PropertyTemplate');
import uihti = module('uvis/instance/HTMLTemplateInstance');
import uddM = module('uvis/data/IData');
import uup = uupM.uvis.util;
import htht = uthtM.uvis.template;
import utpt = utptM.uvis.template;

export module uvis.spec {
    

    class MockData implements uddM.uvis.data.IData {        
        constructor(public data) { }
        getData(): uupM.uvis.util.IPromise {
            return uup.Promise.resolve(this.data);
        }
    }

    describe('HtmlTemplate:', () => {
        var t1: htht.HtmlTemplate,
            t2: htht.HtmlTemplate,
            a1,
            a2,
            a3,
            e1,
            e2,
            e3,
            fn1: Function,
            fn2: Function,
            p1: utpt.PropertyTemplate,
            p2: utpt.PropertyTemplate,
            p3: utpt.PropertyTemplate,
            completed,
            failed;

        // set promises to debug mode
        uup.Promise.debug = true;

        beforeEach(function () {
            t1 = undefined;
            t2 = undefined;
            a1 = undefined;
            a2 = undefined;
            a3 = undefined;
            e1 = undefined;
            e2 = undefined;
            e3 = undefined;
            fn1 = undefined;
            fn2 = undefined;
            p1 = undefined;
            p2 = undefined;
            p3 = undefined;
            completed = undefined;
            failed = undefined;
        });

        describe('constructor()', () => {
            it('should return a new template with its tag set to constructor supplied value', () => {
                e1 = 'div';
                t1 = new htht.HtmlTemplate('id', e1);
                expect(t1.tag).toBe(e1);
            });

            it('should throw an error if a valid tag is not supplied (null, undefined, or empty string)', () => {
                fn1 = () => { new htht.HtmlTemplate('id', null); }
                expect(fn1).toThrow();
                fn1 = () => { new htht.HtmlTemplate('id', undefined); }
                expect(fn1).toThrow();
                fn1 = () => { new htht.HtmlTemplate('id', ''); }
                expect(fn1).toThrow();
            });
        });

        describe('createInstance()', () => {
            it('should return an element with an unique id based on the templates id', () => {
                e1 = 'an-id';
                t1 = new htht.HtmlTemplate(e1, 'div');
                completed = 0;

                runs(() => {
                    t1.createInstance().last((instance) => {
                        a1 = instance.element;
                        completed++;
                    });
                    t1.createInstance().last((instance) => {
                        a2 = instance.element;
                        completed++;
                    });
                });

                waitsFor(() => {
                    return completed === 2;
                }, "", 100);

                runs(function () {
                    expect(a1.getAttribute('id').lastIndexOf(e1, 0)).toBe(0);
                    expect(a2.getAttribute('id').lastIndexOf(e1, 0)).toBe(0);
                    expect(a1.getAttribute('id')).toNotEqual(a2.getAttribute('id'));
                });
            });

            it('should return an element with the supplied properties set on it', () => {
                e1 = 'some title';
                e2 = 'true';
                e3 = 'rtl';
                t1 = new htht.HtmlTemplate('id', 'div');
                p1 = new utpt.PropertyTemplate('title', 'some title');
                p2 = new utpt.PropertyTemplate('contenteditable', true);
                p3 = new utpt.PropertyTemplate('dir', 'rtl');
                t1.addProperty(p1);
                t1.addProperty(p2);
                t1.addProperty(p3);

                runs(() => {
                    t1.createInstance().last((instance) => {
                        a1 = instance.element;
                        completed = true;
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 10);

                runs(function () {
                    expect(a1.getAttribute('title')).toBe(e1);
                    expect(a1.getAttribute('contenteditable')).toBe(e2);
                    expect(a1.getAttribute('dir')).toBe(e3);
                });
            });

            it('should not set properties whoes value is null or undefined', () => {
                e1 = 'some title';
                e2 = 'true';
                e3 = 'rtl';
                t1 = new htht.HtmlTemplate('id', 'div');
                p1 = new utpt.PropertyTemplate('title', undefined);
                p2 = new utpt.PropertyTemplate('contenteditable', null);
                t1.addProperty(p1);
                t1.addProperty(p2);

                runs(() => {
                    t1.createInstance().last((instance) => {
                        a1 = instance.element;
                        completed = true;
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 10);

                runs(function () {
                    expect(a1.getAttribute('title')).toBeNull();
                    expect(a1.getAttribute('contenteditable')).toBeNull();
                });
            });

            it('should return an element with specified text set inside it (innerHTML)', () => {
                runs(() => {
                    e1 = 'some data that goes inside the div';
                    t1 = new htht.HtmlTemplate('asdf', 'div');
                    t1.addProperty(new utpt.PropertyTemplate('text', e1));
                    t1.createInstance().last((instance) => {
                        a1 = instance.element.innerHTML;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1).toBe(e1);
                });
            });

            it('should calculate any properties that requires it before setting them on the element', () => {
                e1 = 'some value 1';
                e2 = 'en';

                t1 = new htht.HtmlTemplate('id', 'div');

                // properties
                p1 = new utpt.PropertyTemplate('title', 'some title');
                p2 = new utpt.PropertyTemplate('dir', () => {
                    return uup.Promise.resolve(e1 + e1);
                });
                p3 = new utpt.PropertyTemplate('lang', () => {
                    return uup.Promise.resolve(e2 + e2);
                });

                t1.addProperty(p1);
                t1.addProperty(p2);
                t1.addProperty(p3);

                runs(() => {
                    t1.createInstance().last((instance) => {
                        a1 = instance.element;
                        completed = true;
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 50);

                runs(function () {
                    expect(a1.getAttribute('title')).toBe('some title');
                    expect(a1.getAttribute('dir')).toBe(e1 + e1);
                    expect(a1.getAttribute('lang')).toBe(e2 + e2);
                });
            });
            
            it('should make template runtime variables available (index, data, parent) to the compute function', () => {
                t1 = new htht.HtmlTemplate('id', 'div');
                t1.dataSource = new MockData('42');

                p1 = new utpt.PropertyTemplate('data-has-data', (context) => {
                    return uup.Promise.resolve(context.data !== undefined && context.data === '42');
                });

                p2 = new utpt.PropertyTemplate('data-has-index', (context) => {
                    return uup.Promise.resolve(context.index !== undefined && typeof context.index === 'number');
                });

                p3 = new utpt.PropertyTemplate('data-has-parent', (context) => {
                    return uup.Promise.resolve(context.parent !== undefined && context.parent instanceof uthtM.uvis.template.HtmlTemplate);
                });

                t1.addProperty(p1);
                t1.addProperty(p2);
                t1.addProperty(p3);

                runs(() => {
                    t1.createInstance().last((instance) => {
                        a1 = instance.element;
                        completed = true;
                    });
                });

                waitsFor(() => {
                    return completed;
                }, "", 50);

                runs(function () {
                    expect(a1.getAttribute('data-has-data')).toBe('true');
                    expect(a1.getAttribute('data-has-index')).toBe('true');
                    expect(a1.getAttribute('data-has-parent')).toBe('true');
                });
            });

            describe('depending on the content of dataSource', () => {
                it('should create a single control instance if the dataSource is an object', () => {
                    e1 = new MockData({ 'Name': 'Homer' });
                    t1 = new htht.HtmlTemplate('data-test', 'div');
                    t1.dataSource = e1;

                    runs(() => {
                        t1.createInstance().last((i) => {
                            a1 = i;
                        });
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(a1 instanceof uihti.uvis.instance.HTMLTemplateInstance).toBeTruthy();
                    });
                });

                it('should create a single control instance if the dataSource is an undefined', () => {
                    t1 = new htht.HtmlTemplate('data-test', 'div');
                    
                    // t1.dataSource is undefined

                    runs(() => {
                        t1.createInstance().last((i) => {
                            a1 = i;
                        });
                    });

                    waitsFor(() => {
                        return a1;
                    }, '', 20);

                    runs(() => {
                        expect(a1 instanceof uihti.uvis.instance.HTMLTemplateInstance).toBeTruthy();
                    });
                });

                it('should create zero control instance dataSource if it is an empty array', () => {
                    completed = false;
                    e1 = new MockData([]);
                    t1 = new htht.HtmlTemplate('data-test', 'div');
                    t1.dataSource = e1;
                    
                    runs(() => {
                        t1.createInstance().last((i) => {
                            a1 = i;
                            completed = true;
                        });
                    });

                    waitsFor(() => {
                        return completed;
                    }, '', 20);

                    runs(() => {
                        expect(a1).toBeUndefined();
                    });
                });

                it('should create a control instance foreach object in dataSource if it is an array', () => {
                    e1 = new MockData([{ 'Name': 'Homer' }, { 'Name': 'Marge' }, { 'Name': 'Bart' }, { 'Name': 'Lisa' }]);
                    t1 = new htht.HtmlTemplate('data-test', 'div');
                    t1.dataSource = e1;

                    runs(() => {
                        t1.createInstance().last((i) => {
                            a1 = i;
                            completed = true;
                        });
                    });

                    waitsFor(() => {
                        return completed;
                    }, '', 20);

                    runs(() => {
                        expect(Array.isArray(a1)).toBeTruthy();
                        expect(a1.length).toBe(4);
                    });
                });

                it('should create N control instances if dataSource is number N', () => {
                    e1 = new MockData(4);
                    t1 = new htht.HtmlTemplate('data-test', 'div');
                    t1.dataSource = e1;

                    runs(() => {
                        t1.createInstance().last((i) => {
                            a1 = i;
                            completed = true;
                        });
                    });

                    waitsFor(() => {
                        return completed;
                    }, '', 20);

                    runs(() => {
                        expect(Array.isArray(a1)).toBeTruthy();
                        expect(a1.length).toBe(4);
                    });
                });
            });            
        });
    });

}