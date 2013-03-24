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

require(['nextTick', 'shims', 'uvis/template/AppTemplate'], (nt, s, utatM) => {
    $(document).ready(() => {
        console.log('test');
        $.getJSON('/apps/patient-demo/patient-definition.json', null, (definition) => {
            console.log('test');
            var appTemplate = new utatM.uvis.template.AppTemplate(definition);
            var instance = appTemplate.createInstance();
            instance.initialize();
        });
    });
});