/// <reference path=".typings/require.d.ts" />
require.config({
    baseUrl: 'scripts',
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
    'uvis/uvis'
], function ($, _, runtime) {
    runtime.uvis.run('/app-definitions/demo1.json');
});
//@ sourceMappingURL=tests.js.map
