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
        var count = Rx.Observable.fromEvent(document.getElementById('count'), 'change')
            .select(e => parseInt(e.target.value, 10)).startWith(parseInt((<HTMLInputElement>document.getElementById('count')).value, 10))
        var size = Rx.Observable.fromEvent(document.getElementById('size'), 'change')
            .select(e => parseInt(e.target.value, 10))
            .startWith(parseInt((<HTMLInputElement>document.getElementById('size')).value, 10))
            .replay(null, 1).refCount();
        var color1 = Rx.Observable.fromEvent(document.getElementById('color1'), 'change')
            .select(e => e.target.value)
            .startWith((<HTMLInputElement>document.getElementById('color1')).value)
            .replay(null, 1).refCount();
        var color2 = Rx.Observable.fromEvent(document.getElementById('color2'), 'change')
            .select(e => e.target.value)
            .startWith((<HTMLInputElement>document.getElementById('color2')).value)
            .replay(null, 1).refCount();
        var color3 = Rx.Observable.fromEvent(document.getElementById('color3'), 'change')
            .select(e => e.target.value)
            .startWith((<HTMLInputElement>document.getElementById('color3')).value)
            .replay(null, 1).refCount();
        var color4 = Rx.Observable.fromEvent(document.getElementById('color4'), 'change')
            .select(e => e.target.value)
            .startWith((<HTMLInputElement>document.getElementById('color4')).value)
            .replay(null, 1).refCount();

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

        var span = new ut.uvis.Template('span', 'html#span', form, () => count);
        span.properties.add('title', new up.uvis.ComputedTemplateProperty('title', (c) => {
            return Rx.Observable.returnValue(c.index);
        }));
        span.properties.add('text', new up.uvis.ComputedTemplateProperty('text', (c) => {
            return Rx.Observable.returnValue(c.index);
        }));
        span.properties.add('style', new up.uvis.ComputedTemplateProperty('style', (c) => {
            return Rx.Observable.returnValue(c.index).select(i => {           
                if (i % 4 === 0) return color4;
                if (i % 3 === 0) return color3;
                if (i % 2 === 0) return color2;
                return color1;    
            }).switchLatest().combineLatest(size, (color, size) => {
                var x= size + c.index;
                return 'height:' + x + 'px;width:' + x + 'px;border-radius:' + x +
                    'px;background-color:' + color + ';line-height:' + x + 'px;' +
                    'px;font-size:' + x / 2 + 'px;';
            });
        }));

        form.initialize();
        span.initialize();

        canvasSource.onNext(canvas);

        document.body.appendChild(fragment);
        var end = new Date();

        console.log(end.getTime() - start.getTime());
        console.log(start);
        console.log(end);

    });
});