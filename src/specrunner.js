/// <reference path=".typings/jasmine.d.ts" />
/// <reference path=".typings/require.d.ts" />
require.config({
    baseUrl: 'src',
    paths: {
        'nextTick': 'libs/nextTick'
    },
    shim: {
        nextTick: {
            exports: 'nextTick'
        }
    }
});
require([
    'spec/init', 
    'nextTick'
], function (specs, when) {
    var jasmineEnv = jasmine.getEnv();
    specs.uvis.spec.init(jasmineEnv);
});
//@ sourceMappingURL=specrunner.js.map
