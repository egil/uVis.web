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

require(['nextTick', 'shims', 'uvis/Template', 'uvis/TemplateProperty'], function (nt, s, ut, up) {
    $(function () {
        // Data source
        var search = Rx.Observable.fromEvent(document.getElementById('search'), "input").select(function (event) {
            return event.target.value.trim();
        }).throttle(250).distinctUntilChanged().select(function (term) {
            return searchWikipedia(term);
        }).switchLatest().select(function (x) {
            return { term: x[0], results: x[1] };
        });

        // ICanvas
        var canvasSource = new Rx.ReplaySubject(1);
        var resultsBox = document.getElementById('results');
        var canvas = {
            addVisualComponent: function (vc) {
                resultsBox.appendChild(vc);
            },
            removeVisualComponent: function (vc) {
                resultsBox.removeChild(vc);
            }
        };
        canvasSource.onNext(canvas);

        var form = new ut.uvis.Template('form', 'html#div', undefined, function () {
            return search;
        });
        form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', function () {
            return canvasSource;
        }, undefined, true));

        var searchTerm = new ut.uvis.Template('resultTerm', 'html#h4', form);
        searchTerm.properties.add('text', new up.uvis.ComputedTemplateProperty('text', function (c) {
            return c.property('row').select(function (x) {
                return 'Last search term: ' + x.term;
            });
        }));

        var resultList = new ut.uvis.Template('resultList', 'html#ul', form);
        var resultItem = new ut.uvis.Template('resultItem', 'html#li', resultList, function (t) {
            return t.parent.rows.select(function (x) {
                return x.results;
            });
        });
        resultItem.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', function (c) {
            return Rx.Observable.returnValue(c.parent);
        }));

        resultItem.properties.add('text', new up.uvis.ComputedTemplateProperty('text', function (c) {
            return c.property('row');
        }));

        searchTerm.initialize();
        resultItem.initialize();
    });
});
