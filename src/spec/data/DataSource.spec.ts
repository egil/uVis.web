/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');
import udsdsM = module('uvis/data/SessionDataSource');

export module uvis.spec {
    import udds = uddsM.uvis.data;
    import udsds = udsdsM.uvis.data;

    describe('DataSource', () => {

        describe('DataChangeNotifier', () => {
            it('should push objects when added with state === ADDED', () => {
                var cds = new udds.DataChangeNotifier();
                var exp = [{ id: 1 }, { id: 2 }];
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = cds.changes().subscribe((entity) => { res.data.push(entity); }, err => { res.err = err; }, () => { res.completed = true; });
                    cds.add(exp[0]);
                    cds.add(exp[1]);
                });
                
                waitsFor(() => res.data.length === 2, "Entities not pushed to change stream.", 100);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.data.length).toBe(2);
                    expect(res.data[0].__uvis.state).toBe(udds.ChangeType.ADDED);
                    expect(res.data[1].__uvis.state).toBe(udds.ChangeType.ADDED);
                });
            });

            it('should push objects when updated with state === UPDATED', () => {
                var cds = new udds.DataChangeNotifier();
                var exp = [{ id: 1 }, { id: 2 }];
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = cds.changes().subscribe((entity) => { res.data.push(entity); }, err => { res.err = err; }, () => { res.completed = true; });
                    cds.update(exp[0]);
                    cds.update(exp[1]);
                });

                waitsFor(() => res.data.length === 2, "Entities not pushed to change stream.", 100);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.data.length).toBe(2);
                    expect(res.data[0].__uvis.state).toBe(udds.ChangeType.UPDATED);
                    expect(res.data[1].__uvis.state).toBe(udds.ChangeType.UPDATED);
                });
            });

            it('should push objects when removed with state === REMOVED', () => {
                var cds = new udds.DataChangeNotifier();
                var exp = [{ id: 1 }, { id: 2 }];
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = cds.changes().subscribe((entity) => { res.data.push(entity); }, err => { res.err = err; }, () => { res.completed = true; });
                    cds.remove(exp[0]);
                    cds.remove(exp[1]);
                });

                waitsFor(() => res.data.length === 2, "Entities not pushed to change stream.", 100);

                runs(() => {
                    expect(res.err).toBeUndefined();
                    expect(res.data.length).toBe(2);
                    expect(res.data[0].__uvis.state).toBe(udds.ChangeType.REMOVED);
                    expect(res.data[1].__uvis.state).toBe(udds.ChangeType.REMOVED);
                });
            });

            describe('appendChangeMetadata', () => {
                it('should state === NEW to elements in stream', () => {
                    var cds = new udds.DataChangeNotifier();
                    var exp = [{ id: 1 }, { id: 2 }];
                    var obs = cds.appendChangeMetadata(Rx.Observable.fromArray(exp));
                    var res = { data: [], err: undefined, completed: false };
                    var sub;
                    
                    runs(() => {
                        sub = obs.subscribe((entity) => { res.data.push(entity); }, err => { res.err = err; }, () => { res.completed = true; });
                    });

                    waitsFor(() => res.completed, "Entities not pushed to change stream.", 100);

                    runs(() => {
                        expect(res.err).toBeUndefined();
                        expect(res.data.length).toBe(2);
                        expect(res.data[0].__uvis.state).toBe(udds.ChangeType.NEW);
                        expect(res.data[1].__uvis.state).toBe(udds.ChangeType.NEW);
                    });
                });
            });
        });


        describe('SessionDataSource', () => {
            // ctor
            it('should set id, comparer and initial entities correctly during ctor', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                expect(ds.id).toBe(id);
                expect(ds.entities).toBe(initValues);
            });

            // add
            it('should add a new item correctly', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var marge = { id: 3, name: 'Marge' };
                ds.add(marge);
                expect(ds.entities).toContain(marge);
            });

            xit('should add multiple new items correctly', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var marge = { id: 3, name: 'Marge' };
                var lisa = { id: 4, name: 'Lisa' };
                ds.add([marge, lisa]);
                expect(ds.entities).toContain(marge);
                expect(ds.entities).toContain(lisa);
            });

            // update
            it('should update an item correctly', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var homerUpdated = { id: 2, name: 'Homer Simpson' };
                ds.update(homerUpdated);
                expect(ds.entities).toContain(homerUpdated);
            });

            xit('should update multiple items correctly', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var bartUpdated = { id: 1, name: 'Bart Simpson' };
                var homerUpdated = { id: 2, name: 'Homer Simpson' };
                ds.update([homerUpdated, bartUpdated]);
                expect(ds.entities).toContain(bartUpdated);
                expect(ds.entities).toContain(homerUpdated);
            });

            it('should throw error if trying to update unknown entity', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var lisa = { id: 4, name: 'Lisa' };
                expect(() => ds.update(lisa)).toThrow('Unable to update existing entity. Entity was not found.');
            });

            // remove
            it('should remove an item correctly', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var item1 = initValues[0];
                ds.remove(item1);
                expect(ds.entities).toNotContain(item1);
            });

            xit('should remove multiple items correctly', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var item1 = initValues[0];
                var item2 = initValues[1];
                ds.remove([item1, item2]);
                expect(ds.entities).toNotContain(item1);
            });

            it('should remove items with only id specified', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var item1 = initValues[0];
                var itemRemoveIdOnly = { id: item1.id };
                ds.remove(itemRemoveIdOnly);
                expect(ds.entities).toNotContain(item1);
            });

            it('should not remove any items if the supplied item does not match any curren items', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource(id, comparer, initValues);
                var itemRemoveIdOnly = { id: 42 };
                ds.remove(itemRemoveIdOnly);
                initValues.forEach((iv) => expect(ds.entities).toContain(iv));
            });
            
            it('should return an observable stream of values followed by changes', () => {
                var id = 'id';
                var comparer = (x, y) => x.id < y.id ? -1 : x.id === y.id ? 0 : 1;
                var initValues = [{ id: 1, name: 'Bart' }, { id: 2, name: 'Homer' }];
                var ds = new udsds.SessionDataSource('ds', comparer, initValues);
                var res = { data: [], err: undefined, completed: false };
                var sub;

                runs(() => {
                    sub = ds.query().subscribe((entity) => { res.data.push(entity); }, err => { res.err = err; }, () => { res.completed = true; });
                });

                waitsFor(() => res.completed, "Entities not pushed to change stream.", 100);

                runs(() => {
                    expect(res.data.length).toBe(2);
                    expect(res.data[0].__uvis.state).toBe(udds.ChangeType.NEW);
                    expect(res.data[1].__uvis.state).toBe(udds.ChangeType.NEW);
                });
            });
        });
    })
}