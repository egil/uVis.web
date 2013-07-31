/// <reference path=".typings/rx.js.binding.d.ts" />
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
    $(() => {

        var start = new Date();

        // Data source
        //var count = 10000;
        var data = new Rx.Subject();

        // ICanvas
        var canvasSource = new Rx.Subject();
        var fragment = document.createDocumentFragment();
        var canvas = {
            addVisualComponent: (vc: HTMLElement) => { fragment.appendChild(vc); },
            removeVisualComponent: (vc: HTMLElement) => { fragment.removeChild(vc); }
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

        span.properties.add('data-title', new up.uvis.ComputedTemplateProperty('data-title', (c) => {
            return Rx.Observable.returnValue(c.index);

        }));
        span.properties.add('data-text', new up.uvis.ComputedTemplateProperty('data-text', (c) => {
            return Rx.Observable.returnValue(c.index);

        }));

        //span.properties.add('data-title2', new up.uvis.ComputedTemplateProperty('data-title2', (c) => {
        //    return Rx.Observable.returnValue(c.index);

        //}));
        //span.properties.add('data-text2', new up.uvis.ComputedTemplateProperty('data-text2', (c) => {
        //    return Rx.Observable.returnValue(c.index);

        //}));

        form.initialize();
        span.initialize();

        //console.log('creating 1000');
        //data.onNext(1000);
        //console.log('creating 2000');
        //data.onNext(2000);
        //console.log('creating 3000');
        //data.onNext(3000);
        //console.log('creating 4000');
        //data.onNext(4000);
        //console.log('creating 5000');
        //data.onNext(5000);
        //console.log('creating 6000');
        //data.onNext(6000);
        //console.log('creating 7000');
        //data.onNext(7000);
        //console.log('creating 8000');
        //data.onNext(8000);
        //console.log('creating 9000');
        //data.onNext(9000);
        //console.log('creating 000');
        data.onNext(1000);
        
        canvasSource.onNext(canvas);
        console.log('Number of child nodes: ' + fragment.childNodes.length);
        document.body.appendChild(fragment);
        var end = new Date();

        console.log(end.getTime() - start.getTime());
    });
});

    
