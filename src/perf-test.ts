/// <reference path=".typings/rx.js.d.ts" />
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

require(['nextTick', 'shims', 'uvis/Template', 'uvis/TemplateProperty'], (nt, s, ut, up) => {
    var start = new Date();

    // Data source
    var count = 1000;
    var data = Rx.Observable.returnValue(count);

    // ICanvas
    var canvasSource = new Rx.Subject();
    var fragment = document.createDocumentFragment();
    var canvas = {
        addVisualComponent: (vc: HTMLElement) => {
            fragment.appendChild(vc);
        },

        removeVisualComponent: (vc: HTMLElement) => {
            fragment.removeChild(vc);
        }
    }

    var form = new ut.uvis.Template('form', 'html#div');
    form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', () => {
        return canvasSource;
    }, undefined, true));

    var span = new ut.uvis.Template('span', 'html#span', form, () => data);
    span.properties.add('class', new up.uvis.ComputedTemplateProperty('class', (c) => {
        return Rx.Observable.returnValue((c.index % 2 === 0 ? 'odd' : 'even'));
    }));
    span.properties.add('title', new up.uvis.ComputedTemplateProperty('title', (c) => {
        return Rx.Observable.returnValue(c.index);
    }));
    span.properties.add('text', new up.uvis.ComputedTemplateProperty('text', (c) => {
        return Rx.Observable.returnValue(c.index);
    }));

    span.properties.add('data-blah', new up.uvis.ComputedTemplateProperty('data-blah', (c) => {
        return Rx.Observable.returnValue(c.index * 42);
    }));

    span.properties.add('data-blah2', new up.uvis.ComputedTemplateProperty('data-blah2', (c) => {
        return Rx.Observable.returnValue(c.index * 42);
    }));

    span.properties.add('data-blah3', new up.uvis.ComputedTemplateProperty('data-blah3', (c) => {
        return Rx.Observable.returnValue(c.index * 42);
    }));

    span.properties.add('data-blah4', new up.uvis.ComputedTemplateProperty('data-blah4', (c) => {
        return Rx.Observable.returnValue(c.index * 42);
    }));

    span.properties.add('data-blah-shared', new up.uvis.SharedComputedTemplateProperty('data-blah-shared', (c) => {
        return Rx.Observable.returnValue('blaaaaah');
    }));

    form.initialize();
    span.initialize();

    canvasSource.onNext(canvas);

    document.body.appendChild(fragment);
    var end = new Date();

    console.log(end.getUTCMilliseconds() - start.getUTCMilliseconds());
    console.log(start);
    console.log(end);
});