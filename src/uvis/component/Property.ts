/// <reference path="../../.typings/rx.d.ts" />
import uccM = module('uvis/component/Context');

export module uvis.component {
    export interface IProperty {
        id: string;
        /**
         * Create an observable for this property, i.e. and instance of this property.
         */
        create(context?: uccM.uvis.component.Context): Rx.Internals.AnonymousObservable;
    }

    export interface IWriteProperty {
        setValue(value): void;
    }

    export class ReadOnlyProperty implements IProperty {
        private _id: string;
        private _value;
        constructor(id: string, value?) {
            this._id = id;
            this._value = value;
        }
        get id(): string {
            return this._id;
        }

        /**
         * Create an observable for this property, i.e. and instance of this property.
         */
        public create(): Rx.Internals.AnonymousObservable {
            return Rx.Observable.returnValue(this._value);
        }
    }

    export class ReadWriteProperty extends ReadOnlyProperty implements IProperty implements IWriteProperty {
        private _subject: Rx.BehaviorSubject;

        constructor(id: string, initialvalue?: any) {
            super(id);
            this._subject = new Rx.BehaviorSubject(initialvalue);
        }

        public create(): Rx.Internals.AnonymousObservable {
            return this._subject.distinctUntilChanged();
        }

        public setValue(value) {
            this._subject.onNext(value);
        }
    }

    export class CalculatedProperty extends ReadOnlyProperty implements IProperty {
        private _valueFactory: (context?: uccM.uvis.component.Context) => any;
        private _defaultValue;

        constructor(id: string, valueFactory: (context?: uccM.uvis.component.Context) => any, defaultValue?: any) {
            super(id);
            this._valueFactory = valueFactory;
            this._defaultValue = defaultValue;
        }

        /**
         * Create an observable for this property, i.e. and instance of this property.
         */
        public create(context?: uccM.uvis.component.Context): Rx.Internals.AnonymousObservable {
            var isSubjectSubscribed = false;
            var subject = new Rx.ReplaySubject(1);

            // additional filters on subject
            var output = subject
                .distinctUntilChanged() // only publish new values                
                .catchException((err) => {
                    return Rx.Observable.throwException(new Error('Possible cyclic dependencies detected.'));
                }) // catch possible exception that most likely indicate cyclic dependencies                       
                .defaultIfEmpty(this._defaultValue); // if the stream completes without a value, used the default

            return Rx.Observable.defer(() => {
                var orgStream: Rx.Internals.AnonymousObservable;

                // Delay calling valueFactory till subscription, otherwise
                // we cannot loosely couple properties etc, with eachother.
                // Also, only subscribe once to prevent duplicated values
                if (!isSubjectSubscribed) {
                    isSubjectSubscribed = true;
                    orgStream = this._valueFactory(context);
                    // If the result of the value factory is not an 
                    // observable, we wrap the result in an observable and 
                    // continue. This can happen as there are no type
                    // checking in pure javascript, and valueFactory is parsed
                    // directly to JavaScript.
                    if (!(orgStream instanceof Rx.Internals.AnonymousObservable)) {
                        orgStream = Rx.Observable.returnValue(orgStream);
                    }
                    orgStream.subscribe(subject);
                }
                return output;
            });
        }
    }
}