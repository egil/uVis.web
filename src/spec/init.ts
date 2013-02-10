import propSpec = module('spec/property');
export module uvis.spec {
    import ps = propSpec;

    export function init(jasmineEnv) {

        jasmineEnv.execute();
    }
}