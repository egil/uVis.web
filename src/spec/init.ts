//import propSpec = module('spec/property');
import upSpec = module('spec/util.promise');
import s1 = upSpec;

export module uvis.spec {
    export function init(jasmineEnv) {
        jasmineEnv.execute();
    }
}