/// <reference path="../.typings/require.d.ts" />
export module uvis.spec {
    export function init(jasmineEnv) {        
        require(['spec/util.promise.spec',
                 'spec/util.dictionary.spec',
                 'spec/property.spec',
                 'spec/component.spec'], () => {
            jasmineEnv.execute();
        }, (err) => {
            console.error('Unable to load some or all of the requires specs. Error message = ' + err);
        });
    }
}