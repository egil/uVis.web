/// <reference path="../.typings/jasmine.d.ts" />

import propertyModule = module('uvis/property');
import pm = propertyModule.uvis.property;

export module uvis.spec {    

    describe('Property should', () => {
        it('have the correct key after construction', () => {
            var property = new pm.Property('key', 'value');
            expect(property.key).toBe('key');
        });
    });

}