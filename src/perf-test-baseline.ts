/// <reference path=".typings/rx.js.d.ts" />
/// <reference path=".typings/jquery.d.ts" />

$(function () {
    var start = new Date();
    var count = 2000;
    var data = Rx.Observable.range(0, count);
    var fragment = document.createDocumentFragment();
    data.subscribe(function (i) {
        var is = '' + i;
        var elm = document.createElement('span');
        elm.setAttribute('class', (i % 2 === 0 ? 'odd' : 'even'));
        elm.setAttribute('title', is);
        elm.innerHTML = is;
        fragment.appendChild(elm);
    }, null, function () {
        document.querySelector('body > div > div').appendChild(fragment);
    });
    var end = new Date();

    console.log(end.getTime() - start.getTime());
    console.log(start);
    console.log(end);
});