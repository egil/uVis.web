/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />
import uccM = module('uvis/component/Context');
import ucciM = module('uvis/component/ComponentInstance');
import uddvM = module('uvis/data/DataView');
import ucpM = module('uvis/component/Property');
import ucpsM = module('uvis/component/PropertySet');
import uudM = module('uvis/util/Dictionary');

export module uvis.spec {
    //import utcc = ucctM.uvis.component;
    import uddv = uddvM.uvis.data;
    import ucp = ucpM.uvis.component;
    import ucci = ucciM.uvis.component;
    import ucc = uccM.uvis.component;
    import ucps = ucpsM.uvis.component;

    describe('ComponentInstance', () => {

        describe('AbstractComponentInstance (tested through HTMLComponentInstance):', () => {
            it('should init properties and children array on ctor', () => {
                var ci = new ucci.HTMLComponentInstance('div');
                expect(Array.isArray(ci.children)).toBeTruthy();
                expect(ci.properties instanceof uudM.uvis.util.Dictionary).toBeTruthy();
            });
            it('should add child correctly', () => {
                var c1 = new ucci.HTMLComponentInstance('div');
                var c2 = new ucci.HTMLComponentInstance('div');
                c1.addChild(c2);
                expect(c1.children).toContain(c2);
            });

            it('should remove child correctly', () => {
                var c1 = new ucci.HTMLComponentInstance('div');
                var c2 = new ucci.HTMLComponentInstance('div');
                c1.addChild(c2);
                c1.removeChild(c2);
                expect(c1.children).toNotContain(c2);

            });
        });

        describe('HTMLComponentInstance', () => {
            it('should set "tag" during constructor, convert it to upper case', () => {
                var i = new ucci.HTMLComponentInstance('DIV');
                var i2 = new ucci.HTMLComponentInstance('div');
                expect(i.tag).toBe('DIV')
                expect(i2.tag).toBe('DIV')
            });

            it('should dispose of any resources when dispose() is called', () => {
                var elm = document.createElement('DIV');
                var parent = new ucci.HTMLComponentInstance('DIV');
                var child1 = new ucci.HTMLComponentInstance('P');
                var child2 = new ucci.HTMLComponentInstance('TABLE');
                parent.addChild(child1);
                parent.addChild(child2);

                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = parent.create().subscribe((x) => { elm.appendChild(x); }, err => { res.err = err; }, () => { res.completed = true; });
                });

                waitsFor(() => res.completed, '', 20);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    parent.dispose();
                    expect(elm.childElementCount).toBe(0);

                    parent.children.forEach(child => {
                        expect((<ucci.HTMLComponentInstance>child).element).toBeUndefined();
                    });
                });
            });

            describe('create() returns a observable sequence:', () => {
                it('should produce a single HTML element', () => {
                    var i = new ucci.HTMLComponentInstance('DIV');
                    var res = { data: [], err: undefined, completed: false };
                    var sub;

                    runs(() => {
                        sub = i.create().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, '', 20);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(res.data.length).toBe(1);
                        expect(res.data[0] instanceof HTMLElement).toBeTruthy();
                        expect(res.data[0].nodeName).toBe('DIV');
                    });
                });

                it('should produce a single HTML element with children attached, in the order they are added to the parent', () => {
                    var parent = new ucci.HTMLComponentInstance('DIV');
                    var child1 = new ucci.HTMLComponentInstance('P');
                    var child2 = new ucci.HTMLComponentInstance('TABLE');

                    parent.addChild(child1);
                    parent.addChild(child2);

                    var res = { data: [], err: undefined, completed: false };
                    var sub;

                    runs(() => {
                        sub = parent.create().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, '', 20);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(res.data.length).toBe(1);
                        expect(res.data[0] instanceof HTMLElement).toBeTruthy();
                        var elm = <HTMLElement>res.data[0];
                        expect(elm.childElementCount).toBe(2);
                        expect(elm.firstChild.nodeName).toBe('P');
                        expect(elm.lastChild.nodeName).toBe('TABLE');
                    });
                });

                it('should produce a single HTML element with properties attached', () => {
                    var context = new ucc.Context();
                    var titleProp = Rx.Observable.returnValue('test-title');
                    var langProp = Rx.Observable.returnValue('da');
                    var i = new ucci.HTMLComponentInstance('DIV');

                    i.context = context;
                    i.properties.add('title', titleProp);
                    i.properties.add('lang', langProp);
                    
                    var res = { data: [], err: undefined, completed: false };
                    var sub;

                    runs(() => {
                        sub = i.create().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, '', 20);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(res.data.length).toBe(1);
                        var elm = <HTMLElement>res.data[0];
                        expect(elm instanceof HTMLElement).toBeTruthy();
                        expect(elm.getAttribute('title')).toBe('test-title');
                        expect(elm.getAttribute('lang')).toBe('da');
                    });
                });

                it('should produce a single HTML style attribute ', () => {
                    var context = new ucc.Context();

                    var styleProp = new ucps.StylePropertySet('style');
                    var widthProp = new ucp.ReadWriteProperty('width', '100px');
                    var heightProp = new ucp.ReadWriteProperty('height', '10px');
                    styleProp.properties.add('width', widthProp.create());
                    styleProp.properties.add('height', heightProp.create());

                    var i = new ucci.HTMLComponentInstance('DIV');

                    i.context = context;
                    i.properties.add('style', styleProp.create(context));

                    var res = { data: [], err: undefined, completed: false };
                    var sub;

                    runs(() => {
                        sub = i.create().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, '', 20);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(res.data.length).toBe(1);
                        var elm = <HTMLElement>res.data[0];
                        expect(elm instanceof HTMLElement).toBeTruthy();
                        expect(elm.getAttribute('style')).toBe('width:100px;height:10px;');
                    });
                });

                it('should set "text" property as text content on the HTML element', () => {
                    var context = new ucc.Context();
                    var titleProp = Rx.Observable.returnValue('test-text');
                    var i = new ucci.HTMLComponentInstance('DIV');

                    i.context = context;
                    i.properties.add('text', titleProp);

                    var res = { data: [], err: undefined, completed: false };
                    var sub;

                    runs(() => {
                        sub = i.create().subscribe((x) => { res.data.push(x); }, err => {
                            console.error(err);
                            res.err = err;
                        }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, '', 20);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(res.data.length).toBe(1);
                        var elm = <HTMLElement>res.data[0];
                        expect(elm instanceof HTMLElement).toBeTruthy();
                        expect(elm.firstChild.nodeType).toBe(3);
                        expect(elm.firstChild.nodeValue).toBe('test-text');
                    });
                });

                it('should update "text" property as text content on the HTML element when the observable updates', () => {
                    var context = new ucc.Context();
                    var text = 'test-text';
                    var textProp = new Rx.BehaviorSubject(text);
                    var i = new ucci.HTMLComponentInstance('DIV');
                    var elm: HTMLElement;

                    i.context = context;
                    i.properties.add('text', textProp);

                    var res = { data: [], err: undefined, completed: false };
                    var sub;

                    runs(() => {
                        sub = i.create().subscribe((x) => { res.data.push(x); }, err => {
                            console.error(err);
                            res.err = err;
                        }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, '', 20);

                    runs(() => {
                        elm = <HTMLElement>res.data[0];
                        textProp.onNext('new-text');
                    });

                    waitsFor(() => elm.firstChild.nodeValue !== 'test-text', 'title to change', 20);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(elm.firstChild.nodeValue).toBe('new-text');
                    });
                });


                it('should change properties on element when their observable updates', () => {
                    var context = new ucc.Context();
                    var title = 'test-title';
                    var titleProp = new Rx.BehaviorSubject(title);
                    var langProp = Rx.Observable.returnValue('da');
                    var i = new ucci.HTMLComponentInstance('DIV');
                    var elm: HTMLElement;

                    i.context = context;
                    i.properties.add('title', titleProp);
                    i.properties.add('lang', langProp);

                    var res = { data: [], err: undefined, completed: false };
                    var sub;

                    runs(() => {
                        sub = i.create().subscribe((x) => { res.data.push(x); }, err => { res.err = err; }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, '', 20);

                    runs(() => {
                        elm = <HTMLElement>res.data[0];
                        titleProp.onNext('new-title');
                    });

                    waitsFor(() => elm.getAttribute('title') !== 'test-title', 'title to change', 20);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(elm.getAttribute('title')).toBe('new-title');
                    });
                });                
            });
        });
    });
}

