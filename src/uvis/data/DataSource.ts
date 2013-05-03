/// <reference path="../../.typings/rx.d.ts" />

import uccM = module('uvis/component/Context');

export module uvis.data {

    export interface IDataSource {
        id: string;
        query(context?: uccM.uvis.component.Context): Rx.Internals.AnonymousObservable;
    }

    export interface IDataChangeNotifier {
        changes(): Rx.Internals.AnonymousObservable;
        add(entity): void;
        update(entity): void;
        remove(entity): void;
    }

    export interface IChangeableDataSource extends IDataChangeNotifier extends IDataSource {
    }

    export class DataChangeNotifier implements IDataChangeNotifier {
        private _changesSubject: Rx.Subject;

        constructor() {
            this._changesSubject = new Rx.Subject();
        }

        /**
         * Returns an observable stream of changes, e.g. changed objects.
         */
        public changes(): Rx.Internals.AnonymousObservable {
            return this._changesSubject.asObservable();
        }

        public add(entity) {
            this.publishChange(entity, ChangeType.ADDED);
        }

        public update(entity) {
            this.publishChange(entity, ChangeType.UPDATED);
        }

        public remove(entity) {
            this.publishChange(entity, ChangeType.REMOVED);
        }

        public appendChangeMetadata(obs: Rx.Internals.AnonymousObservable): Rx.Internals.AnonymousObservable {
            return obs.select(entity => this.appendMetadata(entity, { state: ChangeType.NEW }));
        }

        public appendMetadata(entity, metadata: Object) {
            if (entity.__uvis === undefined) {
                entity.__uvis = metadata;
            }
            else {
                for (var prop in metadata) {
                    if (metadata.hasOwnProperty(prop)) {
                        entity.__uvis[prop] = metadata[prop];
                    }
                }
            }
            return entity;
        }

        private publishChange(entity, change: ChangeType) {
            this._changesSubject.onNext(this.appendMetadata(entity, { state: change }));
        }
    }

    export enum ChangeType {
        ADDED,
        NEW,
        REMOVED,
        UPDATED,
    }
}