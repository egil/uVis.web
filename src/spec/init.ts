import ups = module('spec/util.promise.spec');
import ps = module('spec/property.spec');
import uds = module('spec/util.dictionary.spec');

// actually load the specs
import s1 = ups;
import s2 = ps;
import s3 = uds;

export module uvis.spec {
    
    export function init(jasmineEnv) {        
        jasmineEnv.execute(); 
    }
}