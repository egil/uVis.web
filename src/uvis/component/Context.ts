/// <reference path="../../.typings/rx.d.ts" />
import uddsM = module('uvis/data/DataSource');
import ucciM = module('uvis/component/ComponentInstance');
import ucctM = module('uvis/component/ComponentTemplate');
import uudM = module('uvis/util/Dictionary');

export module uvis.component {
    export class Context {
        constructor(properties?: { index?: number; parent?: ucciM.uvis.component.IComponentInstance; template?; data?: any; }) {
            this.index = 0;
            if (properties !== undefined) {
                this.index = properties.index || 0;
                this.parent = properties.parent;
                this.template = properties.template;
                this.data = properties.data;
            }
        }

        public clone(properties?: { index?: number; parent?: ucciM.uvis.component.IComponentInstance; template?; data?: any; }): Context {
            var clone = new Context();
            if (properties !== undefined) {
                clone.index = properties.index || this.index;
                clone.parent = properties.parent || this.parent;
                clone.template = properties.template || this.template;
                clone.data = properties.data || this.data;
            } else {
                clone.index = this.index;
                clone.parent = this.parent;
                clone.template = this.template;
                clone.data = this.data;
            }
            return clone;
        }

        /**
         * Index of the data from data property.
         */
        public index: number;

        /**
         * The parent instance
         */
        public parent: ucciM.uvis.component.IComponentInstance;

        /**
         * The parent instance's ComponentTemplate.
         */
        public template: ucctM.uvis.component.ComponentTemplate;

        /**
         * Data provided by parent instance to the current instance.
         */
        public data: Rx.Internals.AnonymousObservable;

        /**
         * Global dictionary of available forms in the app
         */
        public get forms(): uudM.uvis.util.Dictionary {
            return Context.forms;
        }

        /**
         * Gobal dictionary of available data sources in the app
         */
        public get dataSources(): uudM.uvis.util.Dictionary {
            return Context.dataSources;
        }

        /**
         * Gobal dictionary of available data sources in the app
         */
        public get instances(): uudM.uvis.util.Dictionary {
            return Context._instances;
        }

        /**
         * Shortcut to Rx.Observable.combineLatest method.
         */
        public combine(...sources: any[]): Rx.Internals.AnonymousObservable {
            var target: Rx.Internals.AnonymousObservable = sources[0];
            var args: Rx.Internals.AnonymousObservable[] = sources.slice(1);
            return target.combineLatest.apply(target, args);
        }

        /**
         * Global dictionary of available forms in the app
         */
        public static get forms(): uudM.uvis.util.Dictionary {
            return Context._forms;
        }

        /**
         * Gobal dictionary of available data sources in the app
         */
        public static get dataSources(): uudM.uvis.util.Dictionary {
            return Context._dataSources;
        }

        /**
         * Gobal dictionary of available data sources in the app
         */
        public static get instances(): uudM.uvis.util.Dictionary {
            return Context._instances;
        }

        private static _forms = new uudM.uvis.util.Dictionary();
        private static _dataSources = new uudM.uvis.util.Dictionary();
        private static _instances = new uudM.uvis.util.Dictionary();
    }

}