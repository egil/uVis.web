/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');
import uccM = module('uvis/component/Context');

export module uvis.data {
    export class DataView implements uddsM.uvis.data.IChangeableDataSource {
        private _id: string;
        private _sourceSelector: () => uddsM.uvis.data.IChangeableDataSource;
        private _query: (source: Rx.Internals.AnonymousObservable, context?: uccM.uvis.component.Context) => Rx.Internals.AnonymousObservable;

        constructor(id: string, sourceSelector: () => uddsM.uvis.data.IChangeableDataSource, query: (source: Rx.Internals.AnonymousObservable, context?:uccM.uvis.component.Context) => Rx.Internals.AnonymousObservable) {
            this._id = id;
            this._sourceSelector = sourceSelector;
            this._query = query;
        }

        get id(): string {
            return this._id;
        }

        get source(): uddsM.uvis.data.IChangeableDataSource {
            return this._sourceSelector();
        }

        public query(context?:uccM.uvis.component.Context): Rx.Internals.AnonymousObservable {
            var base = this.source.query();
            return this._query(base, context);
        }

        public changes(): Rx.Internals.AnonymousObservable {                        
            var base = this.source.changes();
            return this._query(base);
        }
        
        public add(entity): void {
            this.source.add(entity);
        }

        public update(entity): void {
            this.source.update(entity);
        }

        public remove(entity): void {
            this.source.remove(entity);
        }
    }   
}