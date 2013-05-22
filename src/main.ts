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
    //var app = new ucaM.uvis.App('Test App');
    //app.initialize();
    $(document).ready(() => {
        $.getJSON('/apps/lifeline-demo/lifeline-definition.json', null, (definition) => {
            var app = ucaM.uvis.createAppInstance(definition, true);
            app.initialize();
        });
    });
});








// function(p) { return Rx.Observable.fromArray(p.PtNote); }
p => Rx.Observable.fromArray(p.PtNote);
