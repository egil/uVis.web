/// <reference path=".typings/jasmine.d.ts" />
/// <reference path=".typings/require.d.ts" />
require.config({
    baseUrl: 'src',
    paths: {
        'nextTick': 'libs/nextTick',
        'shims': 'libs/shims'
    },

    shim: {
        nextTick: {
            exports: 'nextTick'
        }
    }
});

require(['nextTick','shims',
         'spec/util/Promise.spec',
         'spec/util/Dictionary.spec',
         //'spec/Property.spec',
         'spec/data/JSONDataSource.spec',
         'spec/template/AbstractTemplate.spec',
         'spec/template/HTMLTemplate.spec',
         'spec/template/AppTemplate.spec'], () => {
    // execute jasmine
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.execute();
}, (err) => {
    console.error('Unable to load some or all of the requires specs. Error message = ' + err);
});