/// <reference path="../../.typings/jasmine.d.ts" />

import uthtM = module('uvis/template/HtmlTemplate');
import uupM = module('uvis/util/Promise');
import utptM = module('uvis/template/PropertyTemplate');
import uihti = module('uvis/instance/HTMLTemplateInstance');
import uddM = module('uvis/data/IData');
import uup = uupM.uvis.util;
import utht = uthtM.uvis.template;
import utpt = utptM.uvis.template;

export module uvis.spec {
    
    class MockData implements uddM.uvis.data.IData {        
        constructor(public data) { }
        getData(): uupM.uvis.util.IPromise {
            return uup.Promise.resolve(this.data);
        }
    }

    describe('HtmlTemplate:', () => {
        var t1: utht.HtmlTemplate,
            t2: utht.HtmlTemplate,
            t3: utht.HtmlTemplate,
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
            t3 = undefined;
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
                t1 = new utht.HtmlTemplate('id', e1);
                expect(t1.tag).toBe(e1);
            });

            it('should throw an error if a valid tag is not supplied (null, undefined, or empty string)', () => {
                fn1 = () => { new utht.HtmlTemplate('id', null); }
                expect(fn1).toThrow();
                fn1 = () => { new utht.HtmlTemplate('id', undefined); }
                expect(fn1).toThrow();
                fn1 = () => { new utht.HtmlTemplate('id', ''); }
                expect(fn1).toThrow();
            });
        });

        describe('createInstance()', () => {
            xit('should return an instances with an unique id based on the templates id', () => {
                e1 = new MockData(2);
                t1 = new utht.HtmlTemplate('data-test', 'div');
                // data source is 2 === creates two instances
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
                    expect(a1[0]).toNotBe(a1[1]);
                    expect(a1[0].element.id).toNotBe(a1[1].element.id);
                });
            });

            it('should return an element with the supplied properties set on it', () => {
                e1 = 'some title';
                e2 = 'true';
                e3 = 'rtl';
                t1 = new utht.HtmlTemplate('id', 'div');
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
                t1 = new utht.HtmlTemplate('id', 'div');
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
                    t1 = new utht.HtmlTemplate('asdf', 'div');
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

                t1 = new utht.HtmlTemplate('id', 'div');

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
                t1 = new utht.HtmlTemplate('id', 'div');
                t1.dataSource = new MockData('42');
                e1 = new uihti.uvis.instance.HTMLTemplateInstance();

                p1 = new utpt.PropertyTemplate('data-has-data', (context) => {
                    return uup.Promise.resolve(context.data !== undefined && context.data === '42');
                });

                p2 = new utpt.PropertyTemplate('data-has-index', (context) => {
                    return uup.Promise.resolve(context.index !== undefined && typeof context.index === 'number');
                });

                p3 = new utpt.PropertyTemplate('data-has-parent', (context) => {
                    return uup.Promise.resolve(context.parent !== undefined && context.parent instanceof uihti.uvis.instance.HTMLTemplateInstance);
                });

                t1.addProperty(p1);
                t1.addProperty(p2);
                t1.addProperty(p3);

                runs(() => {
                    t1.createInstance({ parent: e1, index: 1 }).last((instance) => {
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

            it('should return the same instance(s) if called twice', () => {
                e1 = 'an-id';
                t1 = new utht.HtmlTemplate(e1, 'div');
                completed = 0;

                runs(() => {
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                        completed++;
                    });
                    t1.createInstance().last((instance) => {
                        a2 = instance;
                        completed++;
                    });
                });

                waitsFor(() => {
                    return completed === 2;
                }, "", 100);

                runs(function () {
                    expect(a1.element.id).toBe(a2.element.id);
                });
            });

            describe('depending on the content of dataSource', () => {
                it('should create a single control instance if the dataSource is an object', () => {
                    e1 = new MockData({ 'Name': 'Homer' });
                    t1 = new utht.HtmlTemplate('data-test', 'div');
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
                    t1 = new utht.HtmlTemplate('data-test', 'div');
                    
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
                    t1 = new utht.HtmlTemplate('data-test', 'div');
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
                    t1 = new utht.HtmlTemplate('data-test', 'div');
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
                        expect(a1.children.length).toBe(4);
                    });
                });

                it('should create N control instances if dataSource is number N', () => {
                    e1 = new MockData(4);
                    t1 = new utht.HtmlTemplate('data-test', 'div');
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
                        expect(a1.children.length).toBe(4);
                    });
                });
            });

            describe('if context.data is undefined', () => {
                it('should use child.data when creating instances', () => {
                    t1 = new utht.HtmlTemplate('data-test', 'div');
                    t2 = new utht.HtmlTemplate('child-data-test', 'div');
                    
                    // add a child to t1
                    t1.children.push(t2);

                    // set data for child t2
                    e1 = new MockData('child-data');
                    t2.dataSource = e1;
                    
                    // create a property so we can detect data usage 
                    p1 = new utpt.PropertyTemplate('data-child', (context) => {
                        return uup.Promise.resolve(context.data !== undefined && context.data === 'child-data');
                    });

                    t2.addProperty(p1);

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
                        expect(a1.children[0].element.getAttribute('data-child')).toBe('true');
                    });
                });
            });

            describe('if context.data is an not undefined', () => {
                it('should use child.data when creating instances if child.data is not undefined', () => {
                    t1 = new utht.HtmlTemplate('data-test', 'div');

                    // add data to parent
                    e1 = new MockData('parent-data');
                    t1.dataSource = e1;

                    // create child
                    t2 = new utht.HtmlTemplate('child-data-test', 'div');

                    // add a child to t1
                    t1.children.push(t2);

                    // set data for child t2
                    e2 = new MockData('child-data');
                    t2.dataSource = e2;

                    // create a property so we can detect data usage 
                    p1 = new utpt.PropertyTemplate('data-child', (context) => {
                        return uup.Promise.resolve(context.data !== undefined && context.data === 'child-data');
                    });

                    t2.addProperty(p1);

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
                        expect(a1.children[0].element.getAttribute('data-child')).toBe('true');
                    });
                });

                it('should use context.data when creating instances if child.data is undefined', () => {
                    t1 = new utht.HtmlTemplate('data-test', 'div');

                    // add data to parent
                    e1 = new MockData('parent-data');
                    t1.dataSource = e1;

                    // create child
                    t2 = new utht.HtmlTemplate('child-data-test', 'div');

                    // add a child to t1
                    t1.children.push(t2);

                    // create a property so we can detect data usage 
                    p1 = new utpt.PropertyTemplate('data-child', (context) => {
                        return uup.Promise.resolve(context.data !== undefined && context.data === 'parent-data');
                    });

                    t2.addProperty(p1);

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
                        expect(a1.children[0].element.getAttribute('data-child')).toBe('true');
                    });
                });

                it('should use context.data if child.data is a number', () => {
                    t1 = new utht.HtmlTemplate('parent', 'div');

                    // add data to parent
                    e1 = new MockData('parent-data');
                    t1.dataSource = e1;

                    // create child
                    t2 = new utht.HtmlTemplate('child', 'div');

                    // add a child to t1
                    t1.children.push(t2);

                    // set data for child t2
                    e2 = new MockData(2);
                    t2.dataSource = e2;

                    // create a property so we can detect data usage 
                    p1 = new utpt.PropertyTemplate('data-child', (context) => {
                        return uup.Promise.resolve(context.data !== undefined && context.data === 'parent-data');
                    });

                    t2.addProperty(p1);

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
                        console.log(a1);
                        console.log(a1.element);
                        expect(a1.children[0].children[0].element.getAttribute('data-child')).toBe('true');
                        expect(a1.children[0].children[1].element.getAttribute('data-child')).toBe('true');
                    });
                });
            });
        });

        describe('creating instances with one level of children', () => {
            // no data on parent, no data on child
            // parent.children[0].child
            it('should create 1 parent and 1 child if no data on parent and no data on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });

            // no data on parent, single on child
            // parent.children[0].child
            it('should create 1 parent and 1 child if no data on parent and single object on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t2.dataSource = new MockData('mock');

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });

            // no data on parent, array of N on child
            // parent.children[N].child
            it('should create 1 parent and N children if no data on parent and array of N on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t2.dataSource = new MockData(['mock', 'one', 'more']);

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0].children.length).toBe(3);
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });

            // no data on parent, array of 0 on child
            // parent.children = undefined
            it('should create 1 parent and 0 children if no data on parent and empty array on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t2.dataSource = new MockData([]);

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0]).toBeUndefined();
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });

            // single on parent, no data on child
            // parent.children[0].child
            it('should create 1 parent and 1 child if single object on parent and no data on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData('mock');

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });


            // single on parent, single on child
            // parent.children[0].child
            it('should create 1 parent and 1 child if single object on parent and single object on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData('mock-parent');
                    t2.dataSource = new MockData('mock-child');

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });


            // single on parent, array of N on child
            // parent.children[N].child
            it('should create 1 parent and N child if single object on parent and array of N on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData('mock-parent');
                    t2.dataSource = new MockData(['mock', 'one', 'more']); 

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0].children.length).toBe(3);
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });

            // single on parent, array of 0 on child
            // parent.children = undefined
            it('should create 1 parent and 0 children if single object on parent and empty array on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData('mock-parent');
                    t2.dataSource = new MockData([]);
                    
                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.element.tagName).toBe('TR');
                    expect(a1.children.length).toBe(2);
                    expect(a1.children[0]).toBeUndefined();
                    expect(a1.children[1].element.tagName).toBe('TH');
                });
            });


            // array of Y on parent, no data on child
            // Y.parent.children[0].child
            it('should create N parent and 1 child if array of N on parent and no data on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData(['mock', 'one', 'two']);

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.children.length).toBe(3);
                    expect(a1.element.nodeName).toBe("#document-fragment");

                    expect(a1.children[0].element.tagName).toBe('TR');
                    expect(a1.children[0].children.length).toBe(2);
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[0].children[1].element.tagName).toBe('TH');

                    expect(a1.children[1].element.tagName).toBe('TR');
                    expect(a1.children[1].children.length).toBe(2);
                    expect(a1.children[1].children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].children[1].element.tagName).toBe('TH');

                    expect(a1.children[2].element.tagName).toBe('TR');
                    expect(a1.children[2].children.length).toBe(2);
                    expect(a1.children[2].children[0].element.tagName).toBe('TD');
                    expect(a1.children[2].children[1].element.tagName).toBe('TH');

                });
            });

            // array of Y on parent, single on child
            // Y.parent.children[0].child
            it('should create N parent and 1 child if array of N on parent and single object on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData(['mock', 'one', 'two']);
                    t2.dataSource = new MockData('child-mock');


                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.children.length).toBe(3);
                    expect(a1.element.nodeName).toBe("#document-fragment");

                    expect(a1.children[0].element.tagName).toBe('TR');
                    expect(a1.children[0].children.length).toBe(2);
                    expect(a1.children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[0].children[1].element.tagName).toBe('TH');

                    expect(a1.children[1].element.tagName).toBe('TR');
                    expect(a1.children[1].children.length).toBe(2);
                    expect(a1.children[1].children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].children[1].element.tagName).toBe('TH');

                    expect(a1.children[2].element.tagName).toBe('TR');
                    expect(a1.children[2].children.length).toBe(2);
                    expect(a1.children[2].children[0].element.tagName).toBe('TD');
                    expect(a1.children[2].children[1].element.tagName).toBe('TH');

                });
            });

            // array of Y on parent, array of N on child
            // Y.parent.children[N].child
            it('should create N parent and Y child if array of N on parent and array of Y on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData(['mock', 'one', 'two']);
                    t2.dataSource = new MockData(['mock', 'four']);


                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.children.length).toBe(3);
                    expect(a1.element.nodeName).toBe("#document-fragment");

                    expect(a1.children[0].element.tagName).toBe('TR');
                    expect(a1.children[0].children.length).toBe(2);
                    expect(a1.children[0].children[0].children.length).toBe(2);
                    expect(a1.children[0].children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[0].children[0].children[1].element.tagName).toBe('TD');
                    expect(a1.children[0].children[1].element.tagName).toBe('TH');

                    expect(a1.children[1].element.tagName).toBe('TR');
                    expect(a1.children[1].children.length).toBe(2);
                    expect(a1.children[1].children[0].children.length).toBe(2);
                    expect(a1.children[1].children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[1].children[0].children[1].element.tagName).toBe('TD');
                    expect(a1.children[1].children[1].element.tagName).toBe('TH');

                    expect(a1.children[2].element.tagName).toBe('TR');
                    expect(a1.children[2].children.length).toBe(2);
                    expect(a1.children[2].children[0].children.length).toBe(2);
                    expect(a1.children[2].children[0].children[0].element.tagName).toBe('TD');
                    expect(a1.children[2].children[0].children[1].element.tagName).toBe('TD');
                    expect(a1.children[2].children[1].element.tagName).toBe('TH');

                });
            });

            // array of Y parent, array of 0 on child
            // Y.parent.children = undefined
            it('should create N parent and 0 child if array of N on parent and empty array on child', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData(['mock', 'one', 'two']);
                    t2.dataSource = new MockData([]);


                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
                    });
                });

                waitsFor(() => {
                    return a1;
                }, '', 20);

                runs(() => {
                    expect(a1.children.length).toBe(3);
                    expect(a1.element.nodeName).toBe("#document-fragment");

                    expect(a1.children[0].element.tagName).toBe('TR');
                    expect(a1.children[0].children.length).toBe(2);
                    expect(a1.children[0].children[0]).toBeUndefined();
                    expect(a1.children[0].children[1].element.tagName).toBe('TH');

                    expect(a1.children[1].element.tagName).toBe('TR');
                    expect(a1.children[1].children.length).toBe(2);
                    expect(a1.children[1].children[0]).toBeUndefined();
                    expect(a1.children[1].children[1].element.tagName).toBe('TH');

                    expect(a1.children[2].element.tagName).toBe('TR');
                    expect(a1.children[2].children.length).toBe(2);
                    expect(a1.children[2].children[0]).toBeUndefined();
                    expect(a1.children[2].children[1].element.tagName).toBe('TH');

                });
            });

            // array of 0 parent, array of 0 on child
            // Y.parent.children = undefined
            it('should create 0 parent if data on parent is an empty array', () => {
                runs(() => {
                    t1 = new utht.HtmlTemplate('parent', 'tr');
                    t2 = new utht.HtmlTemplate('child', 'td');
                    t3 = new utht.HtmlTemplate('secondchild', 'th');
                    t1.addChildren(t2, t3);

                    // add data
                    t1.dataSource = new MockData([]);

                    // create tree
                    t1.createInstance().last((instance) => {
                        a1 = instance;
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
        });

        xdescribe('complex table created', () => {
            it('should create the right hiearki', () => {
                var tableinstance;
                var data = {
                    id: 1,
                    name: 'Peter F. Hamilton',
                    books: [
                        { title: 'Pandoras Star', rating: 5 },
                        { title: 'The Great North Road', rating: 4 },
                    ]
                }

                runs(() => {
                    // <table title="This is a fantastic table!">
                    var table = new utht.HtmlTemplate('table1', 'table');
                    table.dataSource = new MockData({ caption: 'This is a fantastic table!' });
                    table.addProperty(new utpt.PropertyTemplate('title', (context) => {
                        return uup.Promise.resolve(context.data.caption);
                    }));

                        // <thead>
                        var thead = new utht.HtmlTemplate('thead1', 'thead');
                        table.children.push(thead);

                            // <tr>
                            var theadRow = new utht.HtmlTemplate('theadtr', 'tr');
                            thead.children.push(theadRow);

                                // <th>Title</th><th>Rating</th>
                                var th = new utht.HtmlTemplate('th', 'th');
                                th.dataSource = new MockData(['Title', 'Rating']);
                                th.addProperty(new utpt.PropertyTemplate('text', (context) => {
                                    return uup.Promise.resolve(context.data);
                                }));
                                theadRow.children.push(th);

                            // </tr>
                        // </thead>

                        // <tbody>
                        var tbody = new utht.HtmlTemplate('tbody', 'tbody');
                        table.children.push(tbody);
                            
                            // <tr>
                            var tbodyRow = new utht.HtmlTemplate('row', 'tr');
                            tbodyRow.dataSource = new MockData([{ Title: 'Pandoras Star', Rating: 10 }, { Title: 'Judas Unchained', Rating: 9 }]);
                            tbody.children.push(tbodyRow);

                                // <td>Pandoras Star</td><td>10</td>
                                var tdTitle = new utht.HtmlTemplate('titleCol', 'td');
                                tdTitle.addProperty(new utpt.PropertyTemplate('text', (context) => {
                                    return uup.Promise.resolve(context.data.Title);
                                }));
                                tbodyRow.children.push(tdTitle);

                                var tdRating = new utht.HtmlTemplate('ratingCol', 'td');
                                tdRating.addProperty(new utpt.PropertyTemplate('text', (context) => {
                                    return uup.Promise.resolve(context.data.Rating);
                                }));
                                tbodyRow.children.push(tdRating);
                            // </tr>
                            // <tr><td>Judas Unchianed</td><td>9</td>
                        // </tbody>
                    // </table>

                    table.createInstance().last((instance) => {
                        tableinstance = instance;
                    });
                });

                waitsFor(() => {
                    return tableinstance;
                }, '', 100);

                runs(() => {
                    console.log(tableinstance.element);
                });
            });
        });
    });
}