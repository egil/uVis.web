/// <reference path=".typings/jquery.d.ts" />
/// <reference path=".typings/rx.d.ts" />

$(function () {
    var count = 20000;
    var data = Rx.Observable.range(0, count);
    var fragment = document.createDocumentFragment();
    data.subscribe(function (i) {
        var elm = document.createElement('span');
        elm.setAttribute('class', (i % 2 === 0 ? 'odd' : 'even'));
        elm.setAttribute('title', i);
        elm.innerHTML = i;
        fragment.appendChild(elm);
    }, null, function () {
        document.querySelector('body > div > div').appendChild(fragment);
    });
});