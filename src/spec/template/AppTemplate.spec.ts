/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/jasmine.d.ts" />

import utatM = module('uvis/template/AppTemplate');
import uupM = module('uvis/util/Promise');
import utccM = module('uvis/template/ComputeContext');
import uthtM = module('uvis/template/HTMLTemplate');
import uihtiM = module('uvis/instance/HTMLTemplateInstance');

export module uvis.spec {
    import utat = utatM.uvis.template;
    utatM.uvis.template.AppTemplate.debug = true;
    var dcc = utccM.uvis.template.DefaultComputeContext;
    var cc = utccM.uvis.template;

    describe('App Template:', () => {
        var actual, expected, fn, input, acc;
        var defaultPreample = '"use strict";var index=___c___.index;var data=___c___.data;var parent=___c___.parent;var map=___c___.map;var resolve=___c___.resolve;';

        beforeEach(function () {
            actual = undefined;
            input = undefined;
            expected = undefined;
            fn = undefined;
            acc = undefined;
        });

        afterEach(function () {
        });

        describe('createInstance():', () => {
            var appDef: utatM.uvis.template.AppDefinition = {
                name: 'My test application',
                description: 'Based on an app definition used for testing',
                propertySets: [{
                    name: 'disclaimer',
                    properties: [{
                        name: 'font-size',
                        default: '9px'
                    }, {
                        name: 'color',
                        default: '#ccc'
                    }]
                }],
                dataSources: [{
                    id: 'peopledb',
                    type: 'JSON',
                    data: {
                        People: [{
                            Name: 'Homer Simpson',
                            Role: 'Father'
                        }, {
                            Name: 'Marge Simpson',
                            Role: 'Mother'
                        }]
                    }
                }],
                screens: [{
                    id: 's1',
                    name: 'People screen',
                    url: '/',
                    forms: [{
                        id: 'f1',
                        visible: true,
                        children: [{
                            id: 'f11',
                            type: 'ul',
                            children: [{
                                id: 'peoplename',
                                type: 'li',
                                dataQuery: {
                                    expression: 'map.People'
                                },
                                properties: [{
                                    name: 'color',
                                    expression: 'index % 2 === 0 ? "red" : "green"'
                                }, {
                                    name: 'text',
                                    expression: 'data[index].Name + ": " + data[index].Role'
                                }]
                            }]
                        }]
                    }]
                }]
            };

            it('should return an app instance with templates created', () => {
                var at = new utatM.uvis.template.AppTemplate(JSON.stringify(appDef));
                var ai = at.createInstance();

                // verify basic app instance properties
                expect(ai.name).toBe(appDef.name);
                expect(ai.description).toBe(appDef.description);

                expect(ai.propertySets.contains(appDef.propertySets[0].name)).toBe(true);
                expect(ai.dataSources.contains(appDef.dataSources[0].id)).toBe(true);
                expect(ai.screens.contains(appDef.screens[0].url)).toBe(true);

                var s = ai.screens.get('/');                
                acc = cc.extend(dcc, { map: ai.dataSources.get('peopledb') });
                s.createInstance(acc).last((inst) => {
                    console.log(inst);
                });
            });
        });

        describe('when translating a uVis expression to JavaScript', () => {

            // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function
            // Functions created with the Function constructor do not create closures to their 
            // creation contexts; they always run in the window context(unless the function body 
            // starts with a "use strict"; expression, in which case the context is undefined).
            it('should have "use strict"; at the begning of the JavaScript code', () => {
                input = 'some random input ... does not matter';
                expected = defaultPreample;
                actual = utat.AppTemplate.translate(input);

                // test if actual starts with expected
                expect(actual.lastIndexOf(expected, 0)).toBe(0);
            });

            it('should wrap the result of running the JavaScript code into a Promise', () => {
                input = '42 + 42';
                expected = defaultPreample + 'return ___c___.resolve(42 + 42);'
                actual = utat.AppTemplate.translate(input);
                expect(actual).toBe(expected);
            });
        });

        describe('when compiling uVis statements into functions', () => {
            it('should create functions where the first argument is named "___c___"', () => {
                input = 'arguments[0] === ___c___';
                expected = true;

                runs(() => {
                    // first translate, then compile
                    var sourceCode = utat.AppTemplate.translate(input);
                    var fn = utat.AppTemplate.compile(sourceCode);

                    // fn is a function that returns a promise for a value
                    fn(dcc).last((res) => {
                        actual = res;
                    });
                });

                waitsFor(() => {
                    return actual;
                }, '', 20);

                runs(() => {
                    expect(actual).toBe(expected);
                });
            });

            describe('"Prefix" variables should be directly available', () => {
                it('should make "data" refer to ___c___.data', () => {
                    input = 'data === ___c___.data';
                    expected = true;

                    runs(() => {
                        // first translate, then compile
                        var sourceCode = utat.AppTemplate.translate(input);
                        var fn = utat.AppTemplate.compile(sourceCode);

                        acc = cc.extend(dcc, { data: 42 });

                        // fn is a function that returns a promise for a value
                        fn(acc).last((res) => {
                            actual = res;
                        });
                    });

                    waitsFor(() => {
                        return actual;
                    }, '', 20);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });
                });

                it('should make "parent" refer to ___c___.parent', () => {
                    input = 'parent === ___c___.parent';
                    expected = true;

                    runs(() => {
                        // first translate, then compile
                        var sourceCode = utat.AppTemplate.translate(input);
                        var fn = utat.AppTemplate.compile(sourceCode);

                        acc = cc.extend(dcc, { parent: new uihtiM.uvis.instance.HTMLTemplateInstance() });

                        // fn is a function that returns a promise for a value
                        fn(acc).last((res) => {
                            actual = res;
                        });
                    });

                    waitsFor(() => {
                        return actual;
                    }, '', 20);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });
                });

                it('should make "map" refer to ___c___.map', () => {
                    input = 'map === ___c___.map';
                    expected = true;

                    runs(() => {
                        // first translate, then compile
                        var sourceCode = utat.AppTemplate.translate(input);
                        var fn = utat.AppTemplate.compile(sourceCode);

                        acc = cc.extend(dcc, { map: 42 });

                        // fn is a function that returns a promise for a value
                        fn(acc).last((res) => {
                            actual = res;
                        });
                    });

                    waitsFor(() => {
                        return actual;
                    }, '', 20);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });
                });

                xit('should make "templates" refer to ___c___.templates', () => {
                    input = 'templates === ___c___.templates';
                    expected = true;

                    runs(() => {
                        // first translate, then compile
                        var sourceCode = utat.AppTemplate.translate(input);
                        var fn = utat.AppTemplate.compile(sourceCode);

                        acc = cc.extend(dcc, { templates: 42 });

                        // fn is a function that returns a promise for a value
                        fn(acc).last((res) => {
                            actual = res;
                        });
                    });

                    waitsFor(() => {
                        return actual;
                    }, '', 20);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });
                });

                xit('should make "screen" refer to ___c___.screen', () => {
                    input = 'screen === ___c___.screen';
                    expected = true;

                    runs(() => {
                        // first translate, then compile
                        var sourceCode = utat.AppTemplate.translate(input);
                        var fn = utat.AppTemplate.compile(sourceCode);

                        acc = cc.extend(dcc, { screen: new uthtM.uvis.template.HTMLTemplate('asdf','asdf') });

                        // fn is a function that returns a promise for a value
                        fn(acc).last((res) => {
                            actual = res;
                        });
                    });

                    waitsFor(() => {
                        return actual;
                    }, '', 20);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });
                });

                xit('should make "screens" refer to ___c___.screens', () => {
                    input = 'screens === ___c___.screens';
                    expected = true;

                    runs(() => {
                        // first translate, then compile
                        var sourceCode = utat.AppTemplate.translate(input);
                        var fn = utat.AppTemplate.compile(sourceCode);

                        acc = cc.extend(dcc, { screens: 42 });

                        // fn is a function that returns a promise for a value
                        fn(acc).last((res) => {
                            actual = res;
                        });
                    });

                    waitsFor(() => {
                        return actual;
                    }, '', 20);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });
                });

                it('should make "resovle" refer to ___c___.resolve', () => {
                    input = 'resolve === ___c___.resolve';
                    expected = true;

                    runs(() => {
                        // first translate, then compile
                        var sourceCode = utat.AppTemplate.translate(input);
                        var fn = utat.AppTemplate.compile(sourceCode);
                        
                        // fn is a function that returns a promise for a value
                        fn(dcc).last((res) => {
                            actual = res;
                        });
                    });

                    waitsFor(() => {
                        return actual;
                    }, '', 20);

                    runs(() => {
                        expect(actual).toBe(expected);
                    });
                });
            });
        });

    });

}