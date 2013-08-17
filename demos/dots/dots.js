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

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(rgb) {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

function min3(a, b, c) {
    return (a < b) ? ((a < c) ? a : c) : ((b < c) ? b : c);
}
function max3(a, b, c) {
    return (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);
}
function HueShift(h, s) {
    h += s;
    while (h >= 360.0)
        h -= 360.0;
    while (h < 0.0)
        h += 360.0;
    return h;
}
function RGB2HSV(rgb) {
    var hsv = { saturation: undefined, hue: undefined, value: undefined };
    var max = max3(rgb.r, rgb.g, rgb.b);
    var dif = max - min3(rgb.r, rgb.g, rgb.b);
    hsv.saturation = (max == 0.0) ? 0 : (100 * dif / max);
    if (hsv.saturation == 0)
        hsv.hue = 0;
else if (rgb.r == max)
        hsv.hue = 60.0 * (rgb.g - rgb.b) / dif;
else if (rgb.g == max)
        hsv.hue = 120.0 + 60.0 * (rgb.b - rgb.r) / dif;
else if (rgb.b == max)
        hsv.hue = 240.0 + 60.0 * (rgb.r - rgb.g) / dif;
    if (hsv.hue < 0.0)
        hsv.hue += 360.0;
    hsv.value = Math.round(max * 100 / 255);
    hsv.hue = Math.round(hsv.hue);
    hsv.saturation = Math.round(hsv.saturation);
    return hsv;
}

// RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
// which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
function HSV2RGB(hsv) {
    var rgb = { r: 0, g: 0, b: 0 };
    if (hsv.saturation == 0) {
        rgb.r = rgb.g = rgb.b = Math.round(hsv.value * 2.55);
    } else {
        hsv.hue /= 60;
        hsv.saturation /= 100;
        hsv.value /= 100;
        var i = Math.floor(hsv.hue);
        var f = hsv.hue - i;
        var p = hsv.value * (1 - hsv.saturation);
        var q = hsv.value * (1 - hsv.saturation * f);
        var t = hsv.value * (1 - hsv.saturation * (1 - f));
        switch (i) {
            case 0:
                rgb.r = hsv.value;
                rgb.g = t;
                rgb.b = p;
                break;
            case 1:
                rgb.r = q;
                rgb.g = hsv.value;
                rgb.b = p;
                break;
            case 2:
                rgb.r = p;
                rgb.g = hsv.value;
                rgb.b = t;
                break;
            case 3:
                rgb.r = p;
                rgb.g = q;
                rgb.b = hsv.value;
                break;
            case 4:
                rgb.r = t;
                rgb.g = p;
                rgb.b = hsv.value;
                break;
            default:
                rgb.r = hsv.value;
                rgb.g = p;
                rgb.b = q;
        }
        rgb.r = Math.round(rgb.r * 255);
        rgb.g = Math.round(rgb.g * 255);
        rgb.b = Math.round(rgb.b * 255);
    }
    return rgb;
}

require(['nextTick', 'shims', 'uvis/Template', 'uvis/TemplateProperty'], function (nt, s, ut, up) {
    $(function () {
        // Data source
        var count = Rx.Observable.fromEvent(document.getElementById('count'), 'change').select(function (e) {
            return parseInt(e.target.value, 10);
        }).startWith(parseInt((document.getElementById('count')).value, 10));
        var size = Rx.Observable.fromEvent(document.getElementById('size'), 'change').select(function (e) {
            return parseInt(e.target.value, 10);
        }).startWith(parseInt((document.getElementById('size')).value, 10)).replay(null, 1).refCount();
        var color1 = Rx.Observable.fromEvent(document.getElementById('color1'), 'change').select(function (e) {
            return e.target.value;
        }).startWith((document.getElementById('color1')).value).replay(null, 1).refCount();
        var color2 = Rx.Observable.fromEvent(document.getElementById('color2'), 'change').select(function (e) {
            return e.target.value;
        }).startWith((document.getElementById('color2')).value).replay(null, 1).refCount();
        var color3 = Rx.Observable.fromEvent(document.getElementById('color3'), 'change').select(function (e) {
            return e.target.value;
        }).startWith((document.getElementById('color3')).value).replay(null, 1).refCount();
        var color4 = Rx.Observable.fromEvent(document.getElementById('color4'), 'change').select(function (e) {
            return e.target.value;
        }).startWith((document.getElementById('color4')).value).replay(null, 1).refCount();

        // ICanvas
        var canvasSource = new Rx.Subject();
        var fragment = document.createDocumentFragment();
        var canvas = {
            addVisualComponent: function (vc) {
                fragment.appendChild(vc);
            },
            removeVisualComponent: function (vc) {
                fragment.removeChild(vc);
            }
        };

        var form = new ut.uvis.Template('form', 'html#div');
        form.properties.add('canvas', new up.uvis.SharedComputedTemplateProperty('canvas', function () {
            return canvasSource;
        }, undefined, true));

        var span = new ut.uvis.Template('span', 'html#span', form, function () {
            return count;
        });
        span.properties.add('class', new up.uvis.ComputedTemplateProperty('class', function (c) {
            return Rx.Observable.returnValue((c.index % 2 === 0 ? 'odd' : 'even'));
        }));
        span.properties.add('title', new up.uvis.ComputedTemplateProperty('title', function (c) {
            return Rx.Observable.returnValue(c.index);
        }));
        span.properties.add('text', new up.uvis.ComputedTemplateProperty('text', function (c) {
            return Rx.Observable.returnValue(c.index);
        }));
        span.properties.add('style', new up.uvis.ComputedTemplateProperty('style', function (c) {
            return Rx.Observable.returnValue(c.index).select(function (i) {
                if (i % 4 === 0)
                    return color4;
                if (i % 3 === 0)
                    return color3;
                if (i % 2 === 0)
                    return color2;
                return color1;
            }).switchLatest().combineLatest(size, function (color, size) {
                var x = size + c.index;

                // Calculate font color
                var temprgb = hexToRgb(color);
                var temphsv = RGB2HSV(temprgb);
                temphsv.hue = HueShift(temphsv.hue, 180.0);
                temprgb = HSV2RGB(temphsv);
                var fontColor = rgbToHex(temprgb);

                return 'height:' + x + 'px;width:' + x + 'px;border-radius:' + x + 'px;' + 'background-color:' + color + ';line-height:' + x + 'px;' + 'font-size:' + x / 2 + 'px;' + 'color:' + fontColor + ';';
            });
        }));

        form.initialize();
        span.initialize();

        canvasSource.onNext(canvas);
        document.body.appendChild(fragment);
    });
});
//# sourceMappingURL=dots.js.map
