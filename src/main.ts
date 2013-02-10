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

require(['jquery','underscore','uvis/uvis'], ($, _, runtime) => {
    runtime.uvis.run('/app-definitions/demo1.json');
});