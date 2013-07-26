/// <reference path="../.typings/rx.js.d.ts" />

import ut = require('uvis/Template');
import uc = require('uvis/Component');

Rx.Observable.prototype.get = function (bundle: string, index: number = 0): Rx.IObservable<uvis.ComponentRequest> {
    return this.select((request: uvis.ComponentRequest) => {
        return request.getNext(bundle, index);
    }).switchLatest();
};

Rx.Observable.prototype.property = function (name: string) {
    return this.select((request: uvis.ComponentRequest) => {
        var finalComponent = request.latest;
        request.dispose();
        return finalComponent.property('text');
    }).switchLatest();
};

export module uvis {
    export class ComponentRequest {
        private _bundle: string;
        private _index: number;
        private _templateHistory: string[] = [];
        private _localHistory: string[] = [];
        private _latest: uc.uvis.Component;
        private _source: ut.uvis.Template;

        constructor(source: ut.uvis.Template, treeRoot: uc.uvis.Component, index: number) {
            this._source = source;
            this._latest = treeRoot;

            // Register in template
            this._source.activeRequests.push(this._templateHistory);

            // Add initial history
            this._templateHistory.push(source.name);
            this._localHistory.push(source.name);

            // Add tree root to history, if source is not the form.
            if (treeRoot.template !== source) {
                this._templateHistory.push(treeRoot.template.name);
                this._localHistory.push(treeRoot.template.name);
            }

            this._index = index;
        }

        getNext(bundle: string, index: number): Rx.IObservable<ComponentRequest> {
            this._bundle = bundle;
            this._index = index;
            this._templateHistory.push(bundle);
            return this._latest.get(this);
        }

        get bundle(): string {
            return this._bundle;
        }

        get index(): number {
            return this._index;
        }

        get history(): string[] {
            return this._localHistory;
        }

        get latest(): uc.uvis.Component {
            return this._latest;
        }

        set latest(component: uc.uvis.Component) {
            this._latest = component;
            this._localHistory.push(this._bundle);
        }

        dispose() {
            this._source.activeRequests.splice(this._source.activeRequests.indexOf(this._templateHistory), 1);
            this._source = null;
            this._templateHistory = null;
            this._localHistory = null;
            this._latest = null;
        }
    }
}