/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');

export module uvis.data {
    import udds = uddsM.uvis.data;

    export class SessionDataSource extends uddsM.uvis.data.DataChangeNotifier implements uddsM.uvis.data.IChangeableDataSource {
        private _id: string;
        private _entities: any[];
        private comparer: (entity1: any, entity2: any) => number;

        constructor(id: string, comparer: (entity1: any, entity2: any) => number, initialEntities?: any[]) {
            super();
            this._id = id;
            this.comparer = comparer;
            this._entities = initialEntities || [];
        }

        public get id() {
            return this._id;
        }

        public get entities() {
            return this._entities;
        }

        public query(): Rx.Internals.AnonymousObservable {
            // first we get the entities and append metadata to them
            // to indicate their state (NEW)
            return this.appendChangeMetadata(Rx.Observable.fromArray(this._entities));
        }

        public add(entity) {
            this._entities.push(entity);
            super.add(entity);
        }

        public update(entity) {
            var i = this.indexOf(entity);
            // if found, replace existing
            if (i > -1) {
                this._entities[i] = entity;

                // only push changes to super if update succeded.
                super.update(entity);
            } else {
                throw new Error('Unable to update existing entity. Entity was not found.');
            }
        }

        public remove(entity) {
            var i = this.indexOf(entity);
            if (i > -1) {
                this._entities.splice(i, 1);

                // only push changes to super if delete succeded.
                super.remove(entity);
            }
        }

        private indexOf(entity): number {
            var i = 0, entities = this._entities, len = entities.length;
            for (; i < len; i += 1) {
                if (this.comparer(entity, entities[i]) === 0)
                    return i;
            }
            return -1;
        }

    }
}