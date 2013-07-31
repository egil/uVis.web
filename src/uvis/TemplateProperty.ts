/// <reference path="../.typings/rx.js.binding.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('util/Dictionary');
import uc = require('uvis/Component');

export module uvis {
   
    export interface ITemplateProperty<T, O> {
        name: string;
        create(component?: uc.uvis.Component): O;
        initialValue?: T;
        internal: boolean;
        dispose();
    }

    export class TemplatePropertySet<T> implements ITemplateProperty<T, Rx.IObservable<T>> {
        private _name: string;
        private _combinator: (properties: ITemplateProperty<T, Rx.IObservable<T>>[]) => Rx.IObservable<T>;
        private _initialValue: T;
        private _internal: boolean;
        private _properties = new Array<ITemplateProperty<T, Rx.IObservable<T>>>();

        constructor(name: string, combinator: (properties: ITemplateProperty<T, Rx.IObservable<T>>[]) => Rx.IObservable<T>, initialValue?: T, internal?: boolean) {
            this._name = name;
            this._combinator = combinator;
            this._initialValue = initialValue;
            this._internal = internal || false;
        }

        get name() {
            return this._name;
        }
        
        get initialValue(): T {
            return this._initialValue;
        }

        get internal(): boolean {
            return this._internal;
        }

        addSubProperty(property: ITemplateProperty<T, Rx.IObservable<T>>) {
            this._properties.push(property);
        }

        create(component?: uc.uvis.Component): Rx.ConnectableObservable<T> {
            var obs = this._combinator(this._properties);

            // We add replay to create an observable that can be shared,
            // by multiple observers. It will push the latest value to subscribers,
            // even if they subscribe after the value has been produced. 
            // 
            // If there is a default value, we use startWith to add that value to
            // the observable stream. Should the observable created by factory
            // never produce data, default value is the only value produced by
            // obs.
            //
            // RefCount is used to automatically subscribe and unsubscribe to
            // the underlying observable, depending on the number of subscribers
            // it has.
            return this.initialValue === undefined ?
                obs.replay(null, 1) :
                obs.startWith(this.initialValue).replay(null, 1);
        }

        dispose() { }

    }

    export class TemplateProperty<T> implements ITemplateProperty<T, Rx.ISubject<T>> {
        private _name: string;
        private _initialValue: T;
        private _internal: boolean;

        constructor(name: string, initialValue?: T, internal?: boolean) {
            this._name = name;
            this._initialValue = initialValue;
            this._internal = internal || false;
        }

        get name() {
            return this._name;
        }

        get initialValue(): T {
            return this._initialValue;
        }

        get internal(): boolean {
            return this._internal;
        }

        create(): Rx.ISubject<T> {
            // We either return an ReplaySubject, which will resend
            // the lateset value to new subscribers, or an BehaviorSubject,
            // will takes an initialValue and sends that first.
            // BehaviorSubject gaurrentees that a value will producesed at 
            // some point.
            return this._initialValue === undefined ?
                new Rx.ReplaySubject<T>(1) :
                new Rx.BehaviorSubject<T>(this._initialValue);
        }

        dispose() { }
    }

    export class ComputedTemplateProperty<T> implements ITemplateProperty<T, Rx.IObservable<T>> {
        private _name: string;
        private _initialValue: T;
        private _factory: (component: uc.uvis.Component) => Rx.IObservable<T>;
        private _internal: boolean;

        constructor(name: string, factory: (component: uc.uvis.Component) => Rx.IObservable<T>, initialValue?: T, internal?: boolean) {
            this._name = name;
            this._initialValue = initialValue;
            this._factory = factory;
            this._internal = internal || false;
        }

        get name() {
            return this._name;
        }

        get initialValue(): T {
            return this._initialValue;
        }

        get internal(): boolean {
            return this._internal;
        }

        create(component?: uc.uvis.Component): Rx.ConnectableObservable<T> {
            var obs = this._factory(component);

            // We add replay to create an observable that can be shared,
            // by multiple observers. It will push the latest value to subscribers,
            // even if they subscribe after the value has been produced. 
            // 
            // If there is a default value, we use startWith to add that value to
            // the observable stream. Should the observable created by factory
            // never produce data, default value is the only value produced by
            // obs.
            //
            // RefCount is used to automatically subscribe and unsubscribe to
            // the underlying observable, depending on the number of subscribers
            // it has.
            return this.initialValue === undefined ?
                obs.replay(null, 1) :
                obs.startWith(this.initialValue).replay(null, 1);
        }

        dispose() { }
    }

    export class SharedComputedTemplateProperty<T> implements ITemplateProperty<T, Rx.IObservable<T>>  {
        private _name: string;
        private _sharedObservable: Rx.IObservable<T>;
        private _initialValue;
        private _internal: boolean;

        constructor(name: string, factory: () => Rx.IObservable<T>, initialValue?: T, internal?: boolean) {
            this._name = name;
            this._initialValue = initialValue;
            this._internal = internal || false;

            // We use the factory function to create a single shared observable.
            // We add replay to create a observable, which will push the 
            // latest value to subscribers, even if they subscribe after the value 
            // has been produced. 
            //
            // If there is a default value, we use startWith to add that value to
            // the observable stream. Should the observable created by factory
            // never produce data, default value is the only value produced by
            // _sharedObservable.
            //
            // RefCount is used to automatically subscribe and unsubscribe to
            // the underlying observable, depending on the number of subscribers
            // it has.
            this._sharedObservable = initialValue === undefined ?
            factory().replay(null, 1).refCount() :
            factory().startWith(initialValue).replay(null, 1).refCount();
        }

        get name() {
            return this._name;
        }

        get initialValue(): T {
            return this._initialValue;
        }

        get internal(): boolean {
            return this._internal;
        }

        create(): Rx.IObservable<T> {
            return this._sharedObservable;
        }

        dispose() {
            this._sharedObservable = null;
        }
    }
}