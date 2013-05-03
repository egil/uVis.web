/// <reference path="../../.typings/rx.d.ts" />
import uccM = module('uvis/component/Context');
import ucpM = module('uvis/component/Property');
import uudM = module('uvis/util/Dictionary');

export module uvis.component {
    import ucc = uccM.uvis.component;
    import ucp = ucpM.uvis.component;

    export class PropertySet extends ucp.ReadOnlyProperty implements ucp.IProperty {
        private _properties: uudM.uvis.util.Dictionary;

        constructor(id: string) {
            super(id);
            this._properties = new uudM.uvis.util.Dictionary();
        }

        get properties() {
            return this._properties;
        }

        public addProperties(properties: ucp.IProperty[]) {
            properties.forEach((prop: ucp.IProperty) => {
                this.properties.add(prop.id, prop);
            });
        }

        public getValue(context?: uccM.uvis.component.Context): Rx.Internals.AnonymousObservable {
            var total = this.properties.count();
            var completeCounter = 0;
            var valueCounter = 0;
            var propValues = new uudM.uvis.util.Dictionary();
            var subs = new Array(total);
            var dispose = () => {
                // remove property observers
                if (subs !== undefined) {
                    subs.forEach(sub => {
                        sub.dispose();
                    });
                    subs.length = 0;
                    subs = undefined;
                }
                propValues = undefined;
            };

            return Rx.Observable.createWithDisposable((observer: Rx.AnonymousObserver) => {
                this.properties.forEach((key, prop: Rx.Internals.AnonymousObservable, index) => {
                    var sub = prop.subscribe((value) => {
                        // when we have one copy of all properties, we return the generated output
                        propValues.set(key, value);
                        if (propValues.count() === total) {
                            observer.onNext(this.createOutput(propValues));
                        }
                    },
                    // pass any errors to the observer
                    observer.onError.bind(observer),
                    () => {
                        // when all child props have completed, we do too.
                        completeCounter++;
                        if (total == completeCounter) {
                            observer.onCompleted();
                            dispose();
                        }
                    });
                    subs[index] = sub;
                });

                return { dispose: dispose };
            });
            return Rx.Observable.fromArray(this._properties.map((k, p) => {
                return p.getValue(context);
            }));
        }

        private createOutput(props: uudM.uvis.util.Dictionary): any { }
    }

    export class StylePropertySet extends PropertySet {
        private createOutput(props: uudM.uvis.util.Dictionary): string {
            // build a style attribute according to specifications
            // @see http://www.w3.org/TR/css-style-attr/
            var output = '';
            props.forEach((name: string, value: any) => {
                output += name + ':' + value + ';';
            });
            return output;
        }
    }
}