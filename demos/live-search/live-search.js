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

require(['nextTick', 'shims', 'uvis/Template', 'uvis/TemplateProperty', 'uvis/TemplateEvent'], function (nt, s, ut, up, ue) {
    $(function () {
        // Data source
        var search = Rx.Observable.fromEvent(document.getElementById('search'), 'input').select(function (event) {
            return event.target.value.trim();
        }).throttle(250).distinctUntilChanged().select(function (term) {
            return searchWikipedia(term);
        }).switchLatest().select(function (x) {
            return { term: x[0], results: x[1] };
        });

        // ICanvas
        var canvasSource = new Rx.Subject();
        var canvas = {
            addVisualComponent: function (vc) {
                document.body.appendChild(vc);
            },
            removeVisualComponent: function (vc) {
                document.body.removeChild(vc);
            }
        };

        // Top of template tree - form
        var form = new ut.uvis.Template('form', 'html#div');
        form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', function () {
            return canvasSource;
        }, undefined, true));

        // Level 1 of template tree - container for controls
        var fieldset = new ut.uvis.Template('fieldset', 'html#fieldset', form);
        fieldset.properties.add('class', new up.uvis.TemplateProperty('class', 'form-inline'));

        // Level 2 of template tree - controls
        var h1 = new ut.uvis.Template('h1', 'html#h1', fieldset);
        h1.properties.add('text', new up.uvis.TemplateProperty('text', 'Live Search Demo'));
        h1.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', function (c) {
            return c.parent.canvas;
        }, undefined, true));

        // Level 2 of template tree - inputCount
        var txtSearch = new ut.uvis.Template('txtSearch', 'html#input', fieldset);
        txtSearch.properties.add('type', new up.uvis.TemplateProperty('type', 'text'));
        txtSearch.properties.add('placeholder', new up.uvis.TemplateProperty('placeholder', 'Enter search term here . . .'));
        txtSearch.properties.add('class', new up.uvis.TemplateProperty('class', 'input-xxlarge'));
        txtSearch.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', function (c) {
            return c.parent.canvas;
        }, undefined, true));

        txtSearch.events.add('input', new ue.uvis.TemplateObservableEvent('input', function (o) {
            return o.throttle(250).distinctUntilChanged();
        }, ''));

        var searchTerm = new ut.uvis.Template('resultTerm', 'html#h4', fieldset);
        searchTerm.properties.add('text', new up.uvis.ComputedTemplateProperty('text', function (c) {
            return c.template.walk().get('resultList').property('row').select(function (x) {
                return x.term;
            }).select(function (x) {
                return 'Last search term: ' + x;
            });
        }));
        searchTerm.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', function (c) {
            return c.parent.canvas;
        }, undefined, true));

        var resultList = new ut.uvis.Template('resultList', 'html#ul', form, function (t) {
            return t.walk().get('fieldset').get('txtSearch').event('input').select(searchWikipedia).switchLatest().select(function (x) {
                return { term: x[0], results: x[1] };
            });
        });
        var resultItem = new ut.uvis.Template('resultItem', 'html#li', resultList, function (t) {
            return t.parent.rows.select(function (x) {
                return x.results;
            });
        });
        resultItem.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', function (c) {
            return c.parent.canvas;
        }));
        resultItem.properties.add('text', new up.uvis.ComputedTemplateProperty('text', function (c) {
            return c.property('row');
        }));

        form.initialize();
        fieldset.initialize();
        h1.initialize();
        txtSearch.initialize();
        searchTerm.initialize();
        resultList.initialize();
        resultItem.initialize();

        canvasSource.onNext(canvas);
    });
});
