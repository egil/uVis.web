/// <reference path="../../.typings/rx.js.d.ts" />

export module uvis.data {
    export interface DataSourceDefinition {
        name: string;
        type: string;
        configuration: Object;
    }
    
    export interface IDataSource {
        new (config?: Object): IDataSource;
        name: string;
        create<T>(...args: any[]): Rx.IObservable<T>;
    }
}