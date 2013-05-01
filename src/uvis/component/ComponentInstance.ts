/// <reference path="../../.typings/rx.d.ts" />
import ucpM = module('uvis/component/Property');
import uudM = module('uvis/util/Dictionary');
import uccM = module('uvis/component/Context');
import uddsM = module('uvis/data/DataSource');
import ucctM = module('uvis/component/ComponentTemplate');
import uueM = module('uvis/util/Extensions');

export module uvis.component {
    import uvis = uueM.uvis;

    export interface IComponentInstance {
        children: IComponentInstance[];
        context: uccM.uvis.component.Context;
        /**
         * Dictionary<string, Rx.Internals.AnonymousObservable>
         */
        properties: uudM.uvis.util.Dictionary;
        addChild(child: IComponentInstance): void;
        removeChild(child: IComponentInstance): void;
        hide(): void;
        show(): void;
        dispose(): void;
        create(): Rx.Internals.AnonymousObservable;
    }

    export class AbstractComponentInstance {
        private _context: uccM.uvis.component.Context;
        private _children: IComponentInstance[];
        // dictionary<string, Rx.Internals.AnonymousObservable>
        private _properties: uudM.uvis.util.Dictionary;

        constructor() {
            this._properties = new uudM.uvis.util.Dictionary();
            this._children = new Array();
        }

        public get children() {
            return this._children;
        }

        public get context() {
            return this._context;
        }

        public set context(value) {
            this._context = value;
        }

        /**
         * Dictionary<string, Rx.Internals.AnonymousObservable>
         */
        public get properties() {
            return this._properties;
        }

        public addChild(child: IComponentInstance) {
            this._children.push(child);
        }

        public removeChild(child: IComponentInstance) {
            this._children.splice(this._children.indexOf(child), 1);
        }
    }

    export class HTMLComponentInstance extends AbstractComponentInstance implements IComponentInstance {
        private _tag: string;
        private _element: HTMLElement;
        public _subscriptions: Rx.IObserver[];

        constructor(tag: string) {
            super();
            this._tag = tag.toUpperCase();
        }

        public get tag(): string {
            return this._tag;
        }

        public get element(): HTMLElement {
            return this._element;
        }

        // triggers recalculation of properties
        // updates to visual component
        public update() {

        }

        // forwards hide request to visual component
        public hide() {

        }

        // forwards show request to visual component
        public show() {

        }

        public dispose() {
            // remove property observers
            if (this._subscriptions !== undefined) {
                this._subscriptions.forEach(sub => {
                    sub.dispose();
                });
                this._subscriptions.length = 0;
                this._subscriptions = undefined;
            }
            
            // remove the element from parent
            if (this._element !== undefined && this._element.parentElement !== undefined) {
                this._element.parentElement.removeChild(this._element);
            }

            // element.removeEventListener...
            this.children.forEach(child => child.dispose());

            // null element to make it collectable
            this._element = undefined;
        }

        public create(): Rx.Internals.AnonymousObservable {
            return Rx.Observable.createWithDisposable((observer: Rx.AnonymousObserver) => {
                // target
                var propertiesCount = this.properties.count();
                // number of properties/children still not created
                var missing = propertiesCount + this.children.length;
                // index number of finished property/child
                var indexCounter = 0;
                // have we called onCompleted on observer
                var hasCompleted = false;
                // array for tracking status individual
                var isItemDone: bool[];
                // function for determining progress status
                var done = (index?) => {
                    if (missing > 0) {
                        // if isItemDone is undefined for the item, we can
                        // now consider it done and substract one from 
                        // the missing counter
                        missing -= isItemDone[index] === undefined ? 1 : 0;

                        // set the current index
                        isItemDone[index] = true;
                    }

                    if (!hasCompleted && missing === 0) {
                        hasCompleted = true;
                        observer.onNext(this._element);
                        observer.onCompleted();
                    }
                };
                // the actual html element to produce
                this._element = document.createElement(this._tag);

                if (missing > 0) {
                    isItemDone = new Array(missing);

                    // a array of property subscriptions, these are hot observables
                    // and need explicit diposing when this._element is no longer in use
                    if (propertiesCount > 0) {
                        this._subscriptions = new Array(propertiesCount);

                        // subscribe to all properties
                        this.properties.forEach((key, prop: Rx.Internals.AnonymousObservable) => {
                            var index = indexCounter++;
                            var sub = prop.subscribe((value) => {
                                // each time the onNext is triggered we update the
                                // provided attribute
                                this._element.setAttribute(key, value);
                                done(index);
                            },
                                // pass any errors to the observer
                                observer.onError.bind(observer)
                            );
                            this._subscriptions[index] = sub;
                        });
                    }

                    // create children
                    this.children.forEach(instance => {
                        var index = indexCounter++;
                        instance.create().subscribe((child: HTMLElement) => {
                            this._element.appendChild(child);
                        },
                        // pass any errors to the observer
                        observer.onError.bind(observer),
                        // once the child is complete, we can mark it as complete in our tracking as well
                        () => { done(index); });
                    });
                } else {
                    // trigger done incase there are no properties or children
                    done();
                }

                return Rx.Disposable.empty;
            });
        }
    }
}