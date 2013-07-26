/// <reference path=".typings/require.d.ts" />
/// <reference path=".typings/jasmine.d.ts" />

require.config({
    baseUrl: 'src',
    paths: {
        'nextTick': 'libs/nextTick',
        'shims': 'libs/shims'
    },

    shim: {
        nextTick: {
            exports: 'nextTick'
        },
        rx: {
            exports: 'rx'
        }
    }
});

//require(['nextTick', 'shims', 'spec/util/Dictionary.spec',
//    'spec/uvis/App.spec', 'spec/uvis/Template.spec', 'spec/uvis/Component.spec', 'spec/uvis/TemplateProperty.spec'], () => {
require(['nextTick', 'shims', 'spec/util/Dictionary.spec', 'spec/uvis/Template.spec'], () => {
    // execute jasmine
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.execute();
}, (err) => {
    console.error('Unable to load some or all of the requires specs. Error message = ' + err);
});