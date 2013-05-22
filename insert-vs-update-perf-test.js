var text1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis libero.';
var text2 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod.';
var attr1 = 'background: red;';
var attr2 = 'background: green;';

var testBody = document.createElement('div');
document.body.appendChild(testBody);

var createInitialElements = function (numOfElements) {
    var elm, i, fragment;

    // add the elements
    fragment = document.createDocumentFragment();
    for (i = 0; i < numOfElements; i += 1) {
        elm = document.createElement('p');
        elm.innerHTML = text1;
        elm.setAttribute('style', attr1);
        fragment.appendChild(elm);
    }
    testBody.appendChild(fragment);
};

var createInitialElementsInArray = function (numOfElements) {
    var elm, i, fragment, res = new Array(numOfElements);

    // add the elements
    fragment = document.createDocumentFragment();
    for (i = 0; i < numOfElements; i += 1) {
        elm = document.createElement('p');
        elm.innerHTML = text1;
        elm.setAttribute('style', attr1);
        fragment.appendChild(elm);
        res[i] = elm;
    }
    testBody.appendChild(fragment);

    return res;
};

var replaceEverything = function (changes, totalElms) {
    // create everything initially
    createInitialElements(totalElms);
    
    // then for each change, we must recreate everything again
    while (changes--) {
        // this is the correct
        while (testBody.firstChild) {
            testBody.removeChild(testBody.firstChild);
        }
        // recreate
        createInitialElements(totalElms);
    }
};

var updateChanged = function (changes, totalElms) {
    // create everything initially
    var elms = createInitialElementsInArray(totalElms);

    // then update a element x number of times
    while (changes--) {
        elms[changes].innerHTML = text2;
        elms[changes].setAttribute('style', attr2);
    }
};