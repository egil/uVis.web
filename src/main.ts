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
        $.getJSON('/apps/patient-demo/patient-definition.json', null, (definition) => {            
            var appTemplate = new utatM.uvis.template.AppTemplate(definition, true);
            var appInstance = appTemplate.createInstance();
            appInstance.initialize();
        });
    });
});