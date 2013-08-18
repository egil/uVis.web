/// <reference path="../../src/.typings/rx.js.aggregates.d.ts" />
/// <reference path="../../src/.typings/rx.js.coincidence.d.ts" />
/// <reference path="../../src/.typings/rx.js.time.d.ts" />
/// <reference path="../../src/.typings/rx.js.binding.d.ts" />
/// <reference path="../../src/.typings/rx.js.d.ts" />
/// <reference path="../../src/.typings/jquery.d.ts" />
/// <reference path="../../src/.typings/require.d.ts" />


require.config({
    baseUrl: '/src',
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

function searchWikipedia(term): Rx.IObservable<Array<any>> {
    var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + term + '&callback=JSONPCallback';
    return Rx.Observable.getJSONPRequest(url);
}

require(['nextTick', 'shims', 'uvis/Template', 'uvis/TemplateProperty', 'uvis/TemplateEvent'], (nt, s, ut, up, ue) => {
    $(() => {

        // ICanvas
        var canvasSource = new Rx.Subject();
        var canvas = {
            addVisualComponent: (vc: HTMLElement) => {
                document.body.appendChild(vc);
            },
            removeVisualComponent: (vc: HTMLElement) => {
                document.body.removeChild(vc);
            }
        }

        // Top of template tree - form
        var form = new ut.uvis.Template('form', 'html#div');
        form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', () => {
            return canvasSource;
        }, undefined, true));

        var h1 = new ut.uvis.Template('h1', 'html#h1', form);
        h1.properties.add('text', new up.uvis.TemplateProperty('text', 'Live Search Demo'));

        var txtSearch = new ut.uvis.Template('txtSearch', 'html#input', form);
        txtSearch.properties.add('type', new up.uvis.TemplateProperty('type', 'text'));
        txtSearch.properties.add('placeholder', new up.uvis.TemplateProperty('placeholder', 'Enter search term here . . .'));
        txtSearch.properties.add('class', new up.uvis.TemplateProperty('class', 'input-xxlarge'));

        txtSearch.events.add('input', new ue.uvis.TemplateObservableEvent('input', (o) => o.throttle(250).distinctUntilChanged(), ''));

        var searchTerm = new ut.uvis.Template('resultTerm', 'html#h4', form);
        searchTerm.properties.add('text', new up.uvis.ComputedTemplateProperty('text', (c) => {
            return c.template.walk().get('resultList').property('row').select(x => x.term).select(x => 'Last search term: ' + x);
        }));

        var resultList = new ut.uvis.Template('resultList', 'html#ul', form, (t) => {
            return t.walk().get('txtSearch').event('input')                 // gets search term
                .select(searchWikipedia).switchLatest()                     // gets latests search result
                .select(x => { return { term: x[0], results: x[1] }; });    // extracts search result
        });

        var resultItem = new ut.uvis.Template('resultItem', 'html#li', resultList, (t) => t.parent.rows.select(x=> x.results));
        resultItem.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return c.parent.canvas
        }));
        resultItem.properties.add('text', new up.uvis.ComputedTemplateProperty('text', (c) => {
            return c.property('row');
        }));

        form.initialize();
        h1.initialize();
        txtSearch.initialize();
        searchTerm.initialize();
        resultList.initialize();
        resultItem.initialize();

        canvasSource.onNext(canvas);
    });
});