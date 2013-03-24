/// <reference path="../../.typings/jasmine.d.ts" />
import uupM = module('uvis/util/Promise');
import udjdsM = module('uvis/data/JSONDataSource');
import uup = uupM.uvis.util;

export module uvis.spec {
    describe('JSONDataSource:', () => {
        var ds, a, e;

        uupM.uvis.util.Promise.debug = true;

        beforeEach(function () {
            ds = undefined;
            a = undefined;
            e = undefined;
        });

        afterEach(function () {
        });

        it('testing...', () => {
            ds = new udjdsM.uvis.data.JSONDataSource('ds', undefined, {
                People: [{
                    Name: 'Homer Simpson',
                    Role: 'Father'
                }, {
                    Name: 'Marge Simpson',
                    Role: 'Mother'
                }],
                Info: {
                    Type: 'TV Show',
                    Started: 1980
                }
            });

            runs(() => {
                ds.data.then((res) => { return res.People; }).last((res) => { a = res });
            });

            waitsFor(() => {
                return a;
            },'' , 20);

            runs(() => {
                console.log(a);
            });
            
        });

    });

}