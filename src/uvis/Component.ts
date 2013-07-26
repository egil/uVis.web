/// <reference path="../.typings/rx.js.aggregates.d.ts" />
/// <reference path="../.typings/rx.js.uvis.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />
import ud = require('util/Dictionary');
import ut = require('uvis/Template');
import pt = require('uvis/TemplateProperty');
import ub = require('uvis/Bundle');

export module uvis {

    export interface ComponentProperty<T, O extends Rx.IObservable<T>> {
        property?: O;
        creating: bool;
    }

    export interface ICanvas {
        addVisualComponent(vc);
        removeVisualComponent(vc);
    }

    export interface Request {
        bundle: string;
        index?: number;
        component?: Component;
    }

    export interface RequestInfo {
        current: Request;
        history: string[];
        source?: ut.uvis.Template;
        templateHistory?: string[];
    }

    export class Component implements ICanvas {
        private _template: ut.uvis.Template;
        private _index: number;
        private _parent: Component;
        private _form: Component;
        private _canvasSource: Rx.ISubject<ICanvas>;
        private _visualComponent;
        private _currentCanvas: ICanvas;
        private _bundle: ub.uvis.Bundle;
        private _bundles: ud.Dictionary<ub.uvis.Bundle>;
        private _properties: ud.Dictionary<ComponentProperty<any, Rx.IObservable<any>>> = new ud.Dictionary<ComponentProperty>();
        private _subscriptions: Rx.CompositeDisposable;

        static unfulfilledRequest = false;

        constructor(template: ut.uvis.Template, bundle: ub.uvis.Bundle, index: number, parent?: Component) {
            this._template = template;
            this._bundle = bundle;
            this._index = index;
            this._parent = parent;
            this._subscriptions = new Rx.CompositeDisposable();

            // Run up the instance data tree to find the root component, i.e. the form.
            this._form = this;
            while (this._form.parent !== undefined) {
                this._form = this._form.parent;
            }

            // Set up subscription to canvas component.
            // If there is no explicit canvas defined via a property,
            // we use the form component as the canvas.
            var canvasObservable = this.template.properties.contains('canvas') ?
                this.property<ICanvas>('canvas') :
                this.form.canvas;

            this._subscriptions.add(canvasObservable.subscribe(this.onNextCanvas.bind(this), error => {
                console.error('Error with canvas observable. ' + error);
            }));
        }

        /**
         * Get the template that created the component.
         */
        get template(): ut.uvis.Template {
            return this._template;
        }

        /**
         * Get the bundle that the component belongs to.
         */
        get bundle(): ub.uvis.Bundle {
            return this._bundle;
        }

        /**
         * Get the components index in the bundle it belongs to.
         */
        get index(): number {
            return this._index;
        }

        /**
         * Get the components parent in the instance data tree.
         */
        get parent(): Component {
            return this._parent;
        }

        /**
         * Get the form component for this components the instance data tree.
         */
        get form(): Component {
            return this._form;
        }

        /**
         * Get the visual component for this component.
         */
        get visualComponent() {
            return this._visualComponent;
        }


        /**
         * Get the canvas this component makes available to other components.
         */
        get canvas(): Rx.IObservable<ICanvas> {
            if (this._canvasSource === undefined) {
                this._canvasSource = new Rx.ReplaySubject<ICanvas>(1);

                if (this._currentCanvas !== undefined) {
                    this._canvasSource.onNext(this);
                }
            }

            return this._canvasSource;
        }

        /**
         * Get the bundles the component is the parent of.
         */
        get bundles(): ud.Dictionary<ub.uvis.Bundle> {
            if (this._bundles === undefined) {
                this._bundles = new ud.Dictionary<ub.uvis.Bundle>();
            }
            return this._bundles;
        }

        /**
         * Function that will return an specific component in a specific bundle.
         */
        //get(info: RequestInfo): Rx.IObservable<RequestInfo> {
        //    var res: Rx.IObservable<RequestInfo>;
        //    var bundle = this.bundles.get(info.current.bundle);

        //    info.current.index = info.current.index || 0;

        //    //console.log(info);

        //    // Try to create bundle if it does not exist
        //    if (bundle === undefined) {
        //        var template = this.template.children.get(info.current.bundle);

        //        // If there is no template by the requested name,
        //        // we return an error message
        //        if (template === undefined) {
        //            return Rx.Observable.throwException('There is no such template that can create the requested bundle. Bundle name = ' + info.current.bundle);
        //        }

        //        // Create the bundle and initialize template to get the bundle filled with components.
        //        // Assert that template is not initialize, otherwise the bundle should exist already.
        //        bundle = this.createBundle(template);
        //        template.initialize();
        //    }

        //    // Check for cyclic dependency between templates
        //    var cyclicDependency = bundle.template.activeRequests.some((hist) => {
        //        return hist[0] === info.current.bundle && info.history[0] === hist[hist.length - 1];
        //    });

        //    if (cyclicDependency) {
        //        console.error('Cyclic dependency between template "' + bundle.template.name + '" and "' + info.history[0] + '"');
        //        return Rx.Observable.throwException('Cyclic dependency between template "' + bundle.template.name + '" and "' + info.history[0] + '"');
        //    }

        //    // Select the component from the bundle that matches
        //    // the index. If a component at 'index' is replaced later,
        //    // the replaced component will be pushed to subscribers.
        //    res = bundle.components
        //        .where(component => component.index === info.current.index)
        //        .select(component => {
        //            // Once we have a match, we update the request object
        //            info.current.component = component;
        //            info.history.push(info.current.bundle);
        //            return info;
        //        });

        //    return res;
        //}

        get(request: ComponentRequest): Rx.IObservable<ComponentRequest> {
            var bundle = this.bundles.get(request.bundle);

            // Try to create bundle if it does not exist
            if (bundle === undefined) {
                var template = this.template.children.get(request.bundle);

                // If there is no template by the requested name,
                // we return an error message
                if (template === undefined) {
                    return Rx.Observable.throwException('There is no such template that can create the requested bundle. Bundle name = ' + request.bundle);
                }

                // Create the bundle and initialize template to get the bundle filled with components.
                // Assert that template is not initialize, otherwise the bundle should exist already.
                bundle = this.createBundle(template);
                template.initialize();
            }

            // Check for cyclic dependency between templates
            var cyclicDependency = bundle.template.activeRequests.some((hist) => {
                return hist[0] === request.bundle && request.history[0] === hist[hist.length - 1];
            });

            if (cyclicDependency) {
                console.error('Cyclic dependency between template "' + bundle.template.name + '" and "' + request.history[0] + '"');
                return Rx.Observable.throwException('Cyclic dependency between template "' + bundle.template.name + '" and "' + request.history[0] + '"');
            }

            // Select the component from the bundle that matches
            // the index. If a component at 'index' is replaced later,
            // the replaced component will be pushed to subscribers.
            return bundle.components.where(component => component.index === request.index)
                .select(component => {
                    // Once we have a match, we update the request object
                    request.latest = component;
                    return request;
                });
        }

        property<T>(name: string): Rx.IObservable<T> {
            var cp = this._properties.get(name);

            // If the property already exists, return it.
            if (cp !== undefined && cp.property !== undefined) {
                return cp.property;
            }
            // If we are already creating this property, return an error message
            if (cp !== undefined && cp.creating) {
                return Rx.Observable.throwException('Cyclic dependency detected for property "' + name + '" from template "' + this.template.name);
            }

            // Else we try to create the property
            var propTpl = this.template.properties.get(name);

            if (propTpl !== undefined) {

                // Create ComponentProperty object, mark it as being created
                cp = { creating: true };

                // Add it to dictionary for reuse later
                this._properties.add(propTpl.name, cp);

                // Create property
                cp.property = propTpl.create(this);

                // If it is a ComputedObservable, we must 
                // connect it to its underlying sequence.
                if (propTpl instanceof pt.uvis.ComputedTemplateProperty) {
                    this._subscriptions.add((<Rx.ConnectableObservable>cp.property).connect());
                }

                // If this is a TemplateProperty, we know that we are handed
                // an subject, so we store a reference to its dispose method 
                // for later use when cleaning up.
                if (propTpl instanceof pt.uvis.TemplateProperty) {
                    this._subscriptions.add(<Rx.ISubject>cp.property);
                }

                cp.creating = false;

                return cp.property;
            } else {
                return Rx.Observable.throwException('Component property "' + name + '" was not found.');
            }
        }

        createBundle(template: ut.uvis.Template): ub.uvis.Bundle {
            if (this.bundles.contains(template.name)) {
                throw new Error('A bundle already exists for this template.');
                console.error(template);
                console.error(this);
            }

            // Create the bundle, add it to the local
            // bundles collection and to the templates
            // bundles collection.
            var bundle = new ub.uvis.Bundle(template, this);
            this.bundles.add(template.name, bundle);
            template.bundles.push(bundle);

            return bundle;
        }

        //#region Canvas / Visual tree methods

        createVisualComponent(): any {
            throw new Error('createVisualComponent(): Abstract method. Implementors must override.');
        }

        addVisualComponent(vc) {
            throw new Error('addVisualComponent(): Abstract method. Implementors must override.');
        }

        removeVisualComponent(vc) {
            throw new Error('removeVisualComponent(): Abstract method. Implementors must override.');
        }

        setVisualComponentProperty(name: string, value?: any) {
            throw new Error('setVisualComponentProperty(): Abstract method. Implementors must override.');
        }

        private onNextCanvas<T>(canvas: ICanvas) {
            // If the visual component does not exist yet, create it.
            if (this._visualComponent === undefined) {
                this._visualComponent = this.createVisualComponent();

                // Subscribe to properties for visual component
                this.template.properties.forEach((name, prop) => {
                    // Skip internal properties that are not used by visual component.
                    if (prop.internal) return;

                    // Here we subscribe to each property, first retriving it
                    // through the components property function, that will create
                    // a property observable to us. Then we pass each value it
                    // produces to the abstract method setVisualComponentProperty,
                    // that will set the value of the actual visual component.
                    // All subscribions are added to the subscriptions collection 
                    // for each unsubscription/disposing later.
                    this._subscriptions.add(this.property(name).subscribe(
                        value => {
                            this.setVisualComponentProperty(name, value);
                        }, (err) => {
                            console.error('Error with property observable (name = ' + name + '). ' + err);
                        }));
                });
            }

            // If there is a current canvas, remove the visual component from it
            if (this._currentCanvas !== undefined && this._currentCanvas !== canvas) {
                this._currentCanvas.removeVisualComponent(this._visualComponent);
            }

            // If this component is a canvas, notify subscribers that they can
            // add themselves to this components visual component.
            if (this._canvasSource !== undefined) {
                this._canvasSource.onNext(this)
            }

            // Add it to new canvas
            canvas.addVisualComponent(this._visualComponent);

            // Save canvas for later
            this._currentCanvas = canvas;
        }

        //#endregion

        /**
         * Dispose of this component.
         */
        dispose(removeFromBundle: boolean = true) {
            // Unsubscribe from all observable subscriptions
            this._subscriptions.dispose();

            // Make sure there are no property references left
            this._properties.removeAll();

            // Remove visual component from canvas
            if (this._currentCanvas !== undefined && this._visualComponent !== undefined) {
                this._currentCanvas.removeVisualComponent(this._visualComponent);
            }

            // Dispose of my child components
            this.bundles.forEach((name, bundle) => {
                // First remove the bundle from the template, so it 
                // knows not to produce more components for the bundle.
                var bindex = bundle.template.bundles.indexOf(bundle);
                bundle.template.bundles.splice(bindex, 1);
                // Then dispose of the bundle, disposing of all 
                // child components in the bundle.
                bundle.dispose();
            });

            // Make sure there are no references left
            this.bundles.removeAll();

            // Remove this component from its bundle
            if (removeFromBundle) this.bundle.remove(this.index);

            // Dispose of canvas subject.
            if (this._canvasSource !== undefined) this._canvasSource.dispose();

            // Unreference template, parent, etc.
            this._template = null;
            this._parent = null;
            this._form = null;
            this._bundle = null;
            this._bundles = null;
            this._properties = null;
            this._subscriptions = null;
            this._canvasSource = null;
            this._currentCanvas = null;
            this._visualComponent = null;
        }
    }

    export class ComponentRequest {
        private _bundle: string;
        private _index: number;
        private _templateHistory: string[] = [];
        private _localHistory: string[] = [];
        private _latest: Component;
        private _source: ut.uvis.Template;

        constructor(source: ut.uvis.Template, treeRoot: Component,index: number) {
            this._source = source;
            this._latest = treeRoot;

            // Register in template
            this._source.activeRequests.push(this._templateHistory);

            // Add initial history
            this._templateHistory.push(source.name);
            this._localHistory.push(source.name);

            // Add tree root to history, if source is not the form.
            if (treeRoot.template !== source) {
                this._templateHistory.push(treeRoot.template.name);
                this._localHistory.push(treeRoot.template.name);
            }

            this._index = index;
        }

        getNext(bundle: string, index: number): Rx.IObservable<ComponentRequest> {
            this._bundle = bundle;
            this._index = index;
            this._templateHistory.push(bundle);
            return this._latest.get(this);
        }

        get bundle(): string {
            return this._bundle;
        }

        get index(): number {
            return this._index;
        }

        get history(): string[] {
            return this._localHistory;
        }

        get latest(): Component {
            return this._latest;
        }

        set latest(component: Component) {
            this._latest = component;
            this._localHistory.push(this._bundle);
        }

        dispose() {
            this._source.activeRequests.splice(this._source.activeRequests.indexOf(this._templateHistory), 1);
            this._source = null;
            this._templateHistory = null;
            this._localHistory = null;
            this._latest = null;
        }
    }
}

//Rx.Observable.prototype.getTracked = function (bundle: string, index: number = 0) {
//    return this.select<RequestInfo>(info: RequestInfo => {
//        component.get(bundle, index)
//    });
//};

//Rx.Observable.prototype.get = function (bundle: string, index: number = 0): Rx.IObservable<uvis.RequestInfo> {
//    return this.select((info: uvis.RequestInfo) => {
//        var comp = info.current.component;
//        info.templateHistory.push(bundle);
//        info.current = { bundle: bundle, index: index };
//        return comp.get(info);
//    }).switchLatest();
//    //return this.select(component => component.get(bundle, index));
//};

//Rx.Observable.prototype.property = function (name: string) {
//    return this.select((info: uvis.RequestInfo) => {
//        var comp = info.current.component;
//        console.log(info.templateHistory);
//        info.source.activeRequests.splice(info.source.activeRequests.indexOf(info.templateHistory), 1);
//        return comp.property('text');
//    }).switchLatest();
//    //return this.select(component => component.property(name)).switchLatest();
//};


Rx.Observable.prototype.get = function (bundle: string, index: number = 0): Rx.IObservable<uvis.ComponentRequest> {
    return this.select((request: uvis.ComponentRequest) => {
        return request.getNext(bundle, index);
    }).switchLatest();
};

Rx.Observable.prototype.property = function (name: string) {
    return this.select((request: uvis.ComponentRequest) => {
        var finalComponent = request.latest;
        request.dispose();
        return finalComponent.property('text');
    }).switchLatest();
};