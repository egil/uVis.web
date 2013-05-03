/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');
import udodsM = module('uvis/data/ODataDataSource');

export module uvis.spec {
    import udds = uddsM.uvis.data;
    import udods = udodsM.uvis.data;

    describe('ODataDataSource:', () => {
        it('should query the server and return the result if succesful', () => {
            var odata = new udods.ODataDataSource('od', "http://ehrsystem.local:3477/EHRSystemDataService.svc/Patient?$filter=substringof('L',ptName)&$format=json");

            var res = { data: [], err: undefined, completed: false };
            var sub;
            runs(() => {
                sub = odata.query().subscribe((x) => { res.data.push(x); }, err => {
                    console.error(err);
                    res.err = err;
                }, () => {
                    res.completed = true;
                });
            });

            waitsFor(() => res.completed, 'data to be returned.', 2000);

            runs(() => {
                expect(res.err).toBeUndefined();
                expect(res.data.length).toBe(34);
            });
        });
        it('should query the server pass an error if server returned an error', () => {

            var odata = new udods.ODataDataSource('od', "http://ehrsystem.local:3477/EHRSystemDataService.svc/Patient?$filter=substringdfdsdfsdof('Lissss',ptName)&$format=json");

            var res = { data: [], err: undefined, completed: false };
            var sub;
            runs(() => {
                sub = odata.query().subscribe((x) => { res.data.push(x); }, err => {
                    res.err = err;
                }, () => {
                    res.completed = true;
                });
            });

            waitsFor(() => res.err !== undefined, 'error to be returned.', 2000);

            runs(() => {
                expect(res.err).toBeDefined();
                expect(res.err.message).toBe("Error download data from OData server. Error message: Unknown function 'substringdfdsdfsdof' at position 0.");
            });
        });
    });
}