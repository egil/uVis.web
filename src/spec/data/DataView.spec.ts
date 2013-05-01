/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />
import uddvM = module('uvis/data/DataView');
import uddsM = module('uvis/data/DataSource');
import udsdsM = module('uvis/data/SessionDataSource');

export module uvis.spec {
    import uddv = uddvM.uvis.data;
    import udds = uddsM.uvis.data;
    import udsds = udsdsM.uvis.data;

    describe('DataView', () => {
        var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
        var initValues = [{ id: 1, name: 'Bart Simpson' }, { id: 2, name: 'Homer Simpson' }, { id: 3, name: 'Patty Bouvier' }, { id: 4, name: ' Selma Bouvier' }];
        // Filter away none Simpson family characters
        var query = (source: Rx.Internals.AnonymousObservable) => source.where(x => x.name.endsWith('Simpson'));

        it('should set ctor parameters correctly', () => {
            var ds = new udsds.SessionDataSource('ds', comparer, initValues);
            var query = source => source.where(x => x.name.endsWith('son'));
            var dv = new uddv.DataView('id', ds, query);
            expect(dv.id).toBe('id');
            expect(dv.source).toBe(ds);
            // unable to verify query directly as it is private
        });

        it('should apply filter correctly', () => {
            var ds = new udsds.SessionDataSource('ds', comparer, initValues);
            var dv = new uddv.DataView('id', ds, query);

            var res = { data: [], err: undefined, completed: false };
            var sub;

            runs(() => {
                sub = dv.query().subscribe((entity) => { res.data.push(entity); }, err => { res.err = err; }, () => { res.completed = true; });
            });

            waitsFor(() => res.completed, "Entities not pushed to change stream.", 100);

            runs(() => {
                expect(res.err).toBeUndefined();
                expect(res.data.length).toBe(2);
                expect(res.data[0].name).toBe('Bart Simpson');
                expect(res.data[1].name).toBe('Homer Simpson');
            });
        });

        it('should apply filter to changes correctly', () => {
            var ds = new udsds.SessionDataSource('ds', comparer, initValues);
            var dv = new uddv.DataView('id', ds, query);

            var res = { data: [], err: undefined, completed: false };
            var sub;

            runs(() => {
                sub = dv.changes().subscribe((entity) => { res.data.push(entity); }, err => { res.err = err; }, () => { res.completed = true; });
                dv.add({ id: 5, name: 'Groundskeeper Willie' }); // should not be en result stream
                dv.add({ id: 6, name: 'Marge Simpson' });
                dv.update({ id: 5, name: 'Groundskeeper Willis' }); // should not be en result stream
                dv.update({ id: 6, name: 'Marggie Simpson' });
                dv.remove({ id: 5, name: 'Groundskeeper Willis' }); // should not be en result stream
                dv.remove({ id: 6, name: 'Marggie Simpson' });
            });

            waitsFor(() => res.data.length = 3, "Entities not pushed to change stream.", 100);

            runs(() => {
                expect(res.err).toBeUndefined();
                expect(res.data.length).toBe(3);
                expect(res.data[0].__uvis.state).toBe(udds.ChangeType.ADDED);
                expect(res.data[0].name).toBe('Marge Simpson');
                expect(res.data[1].__uvis.state).toBe(udds.ChangeType.UPDATED);
                expect(res.data[1].name).toBe('Marggie Simpson');
                expect(res.data[2].__uvis.state).toBe(udds.ChangeType.REMOVED);
                expect(res.data[2].name).toBe('Marggie Simpson');
            });
        });
    });
}