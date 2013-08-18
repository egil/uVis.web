/// <reference path="../uvis/Component.ts" />
declare module Rx {
	interface IObservable<T> {
        get<T>(bundle: string, index?: number): IObservable<T>;
        property<T>(name: string): IObservable<T>;
        event<T>(name: string): IObservable<T>;
        canvas<T>(): IObservable<T>;
	}
}