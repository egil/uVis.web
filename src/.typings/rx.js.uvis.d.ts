declare module Rx {
	interface IObservable<T> {
        get<T>(bundle: string, index: number, name?: string): IObservable<T>;
        property<T>(name: string): IObservable<T>;
	}
}