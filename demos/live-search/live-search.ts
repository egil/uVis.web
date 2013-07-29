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

function searchWikipedia(term) {
    var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + term + '&callback=JSONPCallback';
    return Rx.Observable.getJSONPRequest(url);
}

require(['nextTick', 'shims', 'uvis/Template', 'uvis/TemplateProperty'], (nt, s, ut, up) => {
    $(() => {

        // Data source
        var search = Rx.Observable.fromEvent(document.getElementById('search'), "input")
            .select(event => event.target.value.trim()).throttle(100).distinctUntilChanged()
            .select(term => searchWikipedia(term))
            .switchLatest()
            .select(x => { return { term: x[0], results: x[1] }; })
        
        // ICanvas
        var canvasSource = new Rx.ReplaySubject(1);
        var resultsBox = document.getElementById('results');
        var canvas = {
            addVisualComponent: (vc: HTMLElement) => {
                resultsBox.appendChild(vc);
            },

            removeVisualComponent: (vc: HTMLElement) => {
                resultsBox.removeChild(vc);
            }
        }        
        canvasSource.onNext(canvas);

        var form = new ut.uvis.Template('form', 'html#div', undefined, () => search);
        form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', () => {
            return canvasSource;
        }, undefined, true));

        var searchTerm = new ut.uvis.Template('resultTerm', 'html#h4', form);
        searchTerm.properties.add('text', new up.uvis.ComputedTemplateProperty('text', (c) => {
            return c.property('row').select(x => 'Last search term: ' + x.term);
        }));
        
        var resultList = new ut.uvis.Template('resultList', 'html#ul', form);
        var resultItem = new ut.uvis.Template('resultItem', 'html#li', resultList, (t) => t.parent.rows.select(x=> x.results));
        resultItem.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return Rx.Observable.returnValue(c.parent);
        }));

        resultItem.properties.add('text', new up.uvis.ComputedTemplateProperty('text', (c) => {
            return c.property('row');
        }));

        searchTerm.initialize();
        resultItem.initialize();
    });
});