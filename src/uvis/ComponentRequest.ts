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
        return finalComponent.property(name);
    }).switchLatest();
};

Rx.Observable.prototype.event = function (name: string) {
    return this.select((request: uvis.ComponentRequest) => {
        var finalComponent = request.latest;
        request.dispose();
        return finalComponent.event(name);
    }).switchLatest();
};

export module uvis {

    export class ComponentRequest {
        private _target: string;
        private _index: number;
        private _latest: uc.uvis.Component;
        private _source: ut.uvis.Template;

        constructor(source: ut.uvis.Template, treeRoot: uc.uvis.Component, index: number) {
            this._source = source;
            this._latest = treeRoot;
            this._target = treeRoot.template !== source ? treeRoot.template.name : source.name
                        
            // Register in template
            this._source.activeRequests.push(this);            
            this._index = index;
        }

        getNext(bundle: string, index: number): Rx.IObservable<ComponentRequest> {
            this._target = bundle;
            this._index = index;
            return this._latest.get(this);
        }

        get source(): string {
            return this._source.name;
        }

        get target(): string {
            return this._target;
        }

        get index(): number {
            return this._index;
        }

        get latest(): uc.uvis.Component {
            return this._latest;
        }

        set latest(component: uc.uvis.Component) {
            this._latest = component;
        }

        dispose() {
            this._source.activeRequests.splice(this._source.activeRequests.indexOf(this), 1);
            this._source = null;
            this._latest = null;
        }
    }
}