/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');
import uccM = module('uvis/component/Context');

export module uvis.data {
    export class DataGenerator implements uddsM.uvis.data.IDataSource {
        private _id: string;
        private _sourceSelector: () => uddsM.uvis.data.IChangeableDataSource;
        private _generator: (context?: uccM.uvis.component.Context) => Rx.Internals.AnonymousObservable;

        constructor(id: string, generator: (context?: uccM.uvis.component.Context) => Rx.Internals.AnonymousObservable) {
            this._id = id;
            this._generator = generator;
        }

        get id(): string {
            return this._id;
        }

        public query(context?:uccM.uvis.component.Context): Rx.Internals.AnonymousObservable {
            return this._generator(context);
        }
    }
}