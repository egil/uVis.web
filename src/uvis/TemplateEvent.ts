/// <reference path="../.typings/rx.js.binding.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('../util/Dictionary');

export module uvis {

    export interface TemplateEvent<T> {
        callback: (obs: Rx.IObservable<T>) => Rx._IDisposable;
        observable?: Rx.IObservable<T>;
    }
    
    export class TemplateObservableEvent<T> {
        private _name: string;
        private _initialValue: T;
        private _modifier: (evtObs: Rx.IObservable) => Rx.IObservable<T>;

        constructor(name: string, modifier?: (evtObs: Rx.IObservable) => Rx.IObservable<T>, initialValue?: T) {
            this._name = name;
            this._modifier = modifier;
            this._initialValue = initialValue;
        }

        get name() {
            return this._name;
        }

        get initialValue(): T {
            return this._initialValue;
        }

        create() : TemplateEvent<T> {
            var res = {
                observable: this._initialValue === undefined ? new Rx.ReplaySubject(1) : new Rx.BehaviorSubject(this._initialValue),
                callback: (evtObs: Rx.IObservable<T>) => {
                    // apply modifier if one is provided
                    if (this._modifier !== undefined) {
                        evtObs = this._modifier(evtObs);
                    }
                    return evtObs.subscribe((value: T) => {
                            res.observable.onNext(value);
                        },
                        (err) => {
                            console.error('Error with property observable (name = ' + name + '). ' + err);
                        });
                }
            };
            return res;
        }
    }
}