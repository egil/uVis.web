/// <reference path=".typings/rx.js.d.ts" />
/// <reference path=".typings/jquery.d.ts" />

$(function () {
    var start = new Date();
    
    var count = 10000;
    var fragment = document.createDocumentFragment();    
    for (var i = 0; i < count; i++) {
        var is = '' + i;
        var elm = document.createElement('span');
        elm.setAttribute('class',
            (i % 2 === 0 ? 'odd' : 'even'));
        elm.setAttribute('title', is);
        elm.innerHTML = is;
        fragment.appendChild(elm);
    }
    document.querySelector('body > div > div')
        .appendChild(fragment);
    
    var end = new Date();

    console.log(end.getTime() - start.getTime());
});