/// <reference path="../.typings/rx.js.binding.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />

import ud = require('../util/Dictionary');
import pt = require('uvis/TemplateProperty');

export module uvis {

    export class PropertySet {
        private _properties = new ud.Dictionary<any>();
        private _subscriptions: Rx.CompositeDisposable;
        private _template;

        constructor(template: { properties: ud.Dictionary<pt.uvis.ITemplateProperty<any, Rx.IObservable<any>>> }) {
            this._template = template;
            this._subscriptions = new Rx.CompositeDisposable();
        }

        public get template() {
            return this._template;
        }

        public get subscriptions(): Rx.CompositeDisposable {
            return this._subscriptions;
        }

        public property<T>(name: string): Rx.IObservable<T> {
            var cp = this._properties.get(name);

            // If the property already exists, return it.
            if (cp !== undefined) {
                return cp;
            }

            // Else we try to create the property
            var propTpl = this.template.properties.get(name);

            if (propTpl !== undefined) {
                // Create property
                cp = propTpl.create(this);

                // Add it to dictionary for reuse later
                this._properties.add(propTpl.name, cp);

                // If it is a ComputedObservable, we must 
                // connect it to its underlying sequence.
                if (propTpl instanceof pt.uvis.ComputedTemplateProperty) {
                    this._subscriptions.add((<Rx.ConnectableObservable>cp).connect());
                }

                // If this is a TemplateProperty, we know that we are handed
                // an subject, so we store a reference to its dispose method 
                // for later use when cleaning up.
                if (propTpl instanceof pt.uvis.TemplateProperty) {
                    this._subscriptions.add(<Rx.ISubject>cp);
                }
                
                return cp;
            } else {
                return Rx.Observable.throwException('Component property "' + name + '" was not found.');
            }
        }

        dispose() {
            // Unsubscribe from all observable subscriptions
            this.subscriptions.dispose();

            // Make sure there are no property references left
            this._properties.removeAll();

            this._properties = null;
            this._subscriptions = null;
            this._template = null;
        }
    }

    //export class ComponentPropertySet<T> extends PropertySet implements ComponentProperty<T, Rx.IObservable<T>> {
    //    private _combinator: (properties: ud.Dictionary<ComponentProperty<T, Rx.IObservable<T>>>) => Rx.IObservable<T>;

    //    constructor(template: { properties: ud.Dictionary<ComponentProperty<T, Rx.IObservable<T>>> },
    //                combinator: (properties: ud.Dictionary<ComponentProperty<T, Rx.IObservable<T>>>) => Rx.IObservable<T>) {
    //        super(template);
    //        this._combinator = combinator;
    //    }

    //    get observable(): Rx.IObservable<T> {

    //    }
    //}    
}