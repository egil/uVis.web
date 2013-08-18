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

require(['nextTick', 'shims', 'uvis/Template', 'uvis/TemplateProperty', 'uvis/TemplateEvent'], (nt, s, ut, up, ue) => {
    $(() => {        
        // Root canvas -- the document body
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
        form.properties.add('style', new up.uvis.TemplateProperty('style', 'padding-top: 105px;'));
        form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', () => {
            return canvasSource;
        }, undefined, true));

        // Level 1 of template tree - container for controls
        var fieldset = new ut.uvis.Template('fieldset', 'html#fieldset', form);
        fieldset.properties.add('style', new up.uvis.TemplateProperty('style',
            'position: fixed; background: #fff; top: 0; left: 0; right: 0;' +
            'padding: 0 20px; height: 105px; border-bottom: solid #ccc 1px;' +
            'box-shadow: 0px 5px 10px rgba(50, 50, 50, 0.75);'));
        fieldset.properties.add('class', new up.uvis.TemplateProperty('class', 'form-inline'));

        // Level 1 of template tree - h1
        var h1 = new ut.uvis.Template('h1', 'html#h1', form);
        h1.properties.add('text', new up.uvis.TemplateProperty('text', 'Dots Demo'));
        h1.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return c.template.walk().get('fieldset').canvas();
        }, undefined, true));
        
        // Level 1 of template tree - labelCount
        var labelCount = new ut.uvis.Template('labelCount', 'html#label', form);
        labelCount.properties.add('style', new up.uvis.TemplateProperty('style', 'padding-right: 10px;'));
        labelCount.properties.add('text', new up.uvis.TemplateProperty('text', 'Point count:'));
        labelCount.properties.add('for', new up.uvis.ComputedTemplateProperty('for', (c) => {
            return c.template.walk().get('inputCount').property('id');
        }));
        labelCount.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return c.template.walk().get('fieldset').canvas();
        }, undefined, true));

        // Level 1 of template tree - inputCount
        var inputCount = new ut.uvis.Template('inputCount', 'html#input', form);
        inputCount.properties.add('type', new up.uvis.TemplateProperty('type', 'number'));
        inputCount.properties.add('style', new up.uvis.TemplateProperty('style', 'margin-right: 20px;'));
        inputCount.properties.add('value', new up.uvis.TemplateProperty('value', '200'));
        inputCount.properties.add('min', new up.uvis.TemplateProperty('min', '0'));
        inputCount.properties.add('max', new up.uvis.TemplateProperty('max', '100000'));
        inputCount.properties.add('step', new up.uvis.TemplateProperty('step', '1'));
        inputCount.properties.add('class', new up.uvis.TemplateProperty('class', 'input-mini'));
        inputCount.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return c.template.walk().get('fieldset').canvas();
        }, undefined, true));

        inputCount.events.add('change', new ue.uvis.TemplateObservableEvent('change', undefined, 200));

        // Level 1 of template tree - labelSize
        var labelSize = new ut.uvis.Template('labelSize', 'html#label', form);
        labelSize.properties.add('style', new up.uvis.TemplateProperty('style', 'padding-right: 10px;'));
        labelSize.properties.add('text', new up.uvis.TemplateProperty('text', 'Point size:'));
        labelSize.properties.add('for', new up.uvis.ComputedTemplateProperty('for', (c) => {
            return c.template.walk().get('inputSize').property('id');
        }));
        labelSize.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return c.template.walk().get('fieldset').canvas();
        }, undefined, true));

        // Level 1 of template tree - inputSize
        var inputSize = new ut.uvis.Template('inputSize', 'html#input', form);
        inputSize.properties.add('type', new up.uvis.TemplateProperty('type', 'number'));
        inputSize.properties.add('style', new up.uvis.TemplateProperty('style', 'margin-right: 20px;'));
        inputSize.properties.add('value', new up.uvis.TemplateProperty('value', '50'));
        inputSize.properties.add('min', new up.uvis.TemplateProperty('min', '0'));
        inputSize.properties.add('max', new up.uvis.TemplateProperty('max', '100'));
        inputSize.properties.add('step', new up.uvis.TemplateProperty('step', '1'));
        inputSize.properties.add('class', new up.uvis.TemplateProperty('class', 'input-mini'));
        inputSize.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return c.template.walk().get('fieldset').canvas();
        }, undefined, true));

        inputSize.events.add('change', new ue.uvis.TemplateObservableEvent('change', undefined, 50));

        // Level 1 of template tree - inputColor
        var inputColor = new ut.uvis.Template('inputColor', 'html#input', form, () => Rx.Observable.returnValue(4));
        inputColor.properties.add('type', new up.uvis.TemplateProperty('type', 'color'));
        inputColor.properties.add('value', new up.uvis.TemplateProperty('value', '#000000'));
        inputColor.properties.add('style', new up.uvis.TemplateProperty('style', 'margin-right: 20px;'));
        inputColor.properties.add('class', new up.uvis.TemplateProperty('class', 'input-mini'));
        inputColor.properties.add('canvas', new up.uvis.ComputedTemplateProperty('canvas', (c) => {
            return c.template.walk().get('fieldset').canvas();
        }, undefined, true));

        inputColor.events.add('input', new ue.uvis.TemplateObservableEvent('input', undefined, '#000000'));
                
        // Level 1 of template tree - result circles
        var dot = new ut.uvis.Template('dot', 'html#span', form, (t) => {
            return t.walk().get('inputCount').event('change');
        });

        dot.properties.add('title', new up.uvis.ComputedTemplateProperty('title', (c) => {
            return Rx.Observable.returnValue(c.index);
        }));

        dot.properties.add('text', new up.uvis.ComputedTemplateProperty('text', (c) => {
            return Rx.Observable.returnValue(c.index);
        }));

        dot.properties.add('style', new up.uvis.ComputedTemplateProperty('style', (c) => {
            var sizeObs = c.template.walk().get('inputSize').event('change');

            return Rx.Observable.returnValue(c.index)
                .select(i => c.template.walk().get('inputColor', i % 4).event('input'))
                .switchLatest()
                .combineLatest(sizeObs, (color, size) => {
                    return 'height:' + size + 'px;' +
                        'width:' + size + 'px;' +
                        'border-radius:' + size + 'px;' +
                        'background-color:' + color + ';' +
                        'line-height:' + size + 'px;' +
                        'font-size:' + size / 3 + 'px;' +
                        'color:white;' + 'text-shadow: black 0px 0px 2px;' +
                        'display: inline-block; margin: ' + size / 8 + 'px; text-align: center;';
                });
        }));

        // Initialize each template
        form.initialize();
        fieldset.initialize();
        h1.initialize();
        labelCount.initialize();
        inputCount.initialize();
        labelSize.initialize();
        inputSize.initialize();
        inputColor.initialize();
        dot.initialize();

        // Provide the canvas to root of the tree
        canvasSource.onNext(canvas);
    });
});