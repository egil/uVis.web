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
        },
        rx: {
            exports: 'rx'
        }
    }
});

require(['nextTick', 'shims',
         'spec/component/ComponentTemplate.spec',
         'spec/component/ComponentInstance.spec',
         'spec/component/Context.spec',
         'spec/component/Property.spec',
         'spec/data/DataSource.spec',
         'spec/data/DataView.spec',
         //'spec/util/Promise.spec',
         'spec/util/Dictionary.spec'
         //'spec/Property.spec',
         //'spec/data/JSONDataSource.spec',
         //'spec/template/AbstractTemplate.spec',
         //'spec/template/HTMLTemplate.spec',
         //'spec/template/AppTemplate.spec'
], () => {
    // execute jasmine
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.execute();
}, (err) => {
    console.error('Unable to load some or all of the requires specs. Error message = ' + err);
});