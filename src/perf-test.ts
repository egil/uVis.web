/// <reference path=".typings/jquery.d.ts" />
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

require(['nextTick', 'shims', 'uvis/component/App'], (nt, s, ucaM) => {
    $(() => {
        $.getJSON('/apps/perf-test/perf-test.json', null, (definition) => {
            var app = ucaM.uvis.createAppInstance(definition);
            app.initialize();
        });
    });
});