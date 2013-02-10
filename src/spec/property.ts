/// <reference path="../.typings/jasmine.d.ts" />

import propertyModule = module('uvis/property');

export module uvis.spec {    

    describe('Property should', () => {
        it('have the correct key after construction', () => {
            var property = new propertyModule.uvis.property.Property('key', 'value');
            expect(property.key).toBe('key');
        });
    });

}