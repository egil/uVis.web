/// <reference path=".typings/jasmine.d.ts" />
/// <reference path=".typings/require.d.ts" />
require.config({
    baseUrl: 'src',
    paths: {
        'jquery': 'libs/jquery-1.9.0',
        'underscore': 'libs/underscore-min'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        underscore: {
            exports: '_'
        }
    }
});
require([
    'jquery', 
    'underscore', 
    'spec/init'
], function ($, _, specs) {
    var jasmineEnv = jasmine.getEnv();
    specs.uvis.spec.init(jasmineEnv);
});
//@ sourceMappingURL=specrunner.js.map
