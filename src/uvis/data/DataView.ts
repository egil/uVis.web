/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');

export module uvis.data {
    export class DataView implements uddsM.uvis.data.IChangeableDataSource {
        private _id: string;
        private _source: uddsM.uvis.data.IChangeableDataSource;
        private _query: (source: Rx.Internals.AnonymousObservable) => Rx.Internals.AnonymousObservable;

        constructor(id: string, source: uddsM.uvis.data.IChangeableDataSource, query: (source: Rx.Internals.AnonymousObservable) => Rx.Internals.AnonymousObservable) {
            this._id = id;
            this._source = source;
            this._query = query;
        }

        get id(): string {
            return this._id;
        }

        get source(): uddsM.uvis.data.IDataSource {
            return this._source;
        }

        public query(): Rx.Internals.AnonymousObservable {
            var base = this._source.query();
            return this._query(base);
        }

        public changes(): Rx.Internals.AnonymousObservable {                        
            var base = this._source.changes();
            return this._query(base);
        }
        
        public add(entity): void {
            this._source.add(entity);
        }

        public update(entity): void {
            this._source.update(entity);
        }

        public remove(entity): void {
            this._source.remove(entity);
        }
    }   
}