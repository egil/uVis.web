/// <reference path="../.typings/rx.js.aggregates.d.ts" />
/// <reference path="../.typings/rx.js.uvis.d.ts" />
/// <reference path="../.typings/rx.js.d.ts" />
import ud = require('util/Dictionary');
import ut = require('uvis/Template');
import pt = require('uvis/TemplateProperty');
import ub = require('uvis/Bundle');
import ps = require('uvis/PropertySet');
import ucr = require('uvis/ComponentRequest');

export module uvis {

    export interface ICanvas {
        addVisualComponent(vc);
        removeVisualComponent(vc);
    }

    export class Component extends ps.uvis.PropertySet implements ICanvas {
        private _index: number;
        private _parent: Component;
        private _form: Component;
        private _canvasSource: Rx.ISubject<ICanvas>;
        private _visualComponent;
        private _currentCanvas: ICanvas;
        private _bundle: ub.uvis.Bundle;
        private _bundles: ud.Dictionary<ub.uvis.Bundle>;

        constructor(template: ut.uvis.Template, bundle: ub.uvis.Bundle, index: number, parent?: Component) {            
            super(template);
            this._bundle = bundle;
            this._index = index;
            this._parent = parent;

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

            this.subscriptions.add(canvasObservable.subscribe(this.onNextCanvas.bind(this), error => {
                console.error('Error with canvas observable. ' + error);
            }));
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

        get(request: ucr.uvis.ComponentRequest): Rx.IObservable<ucr.uvis.ComponentRequest> {
            var bundle = this.bundles.get(request.target);

            // Try to create bundle if it does not exist
            if (bundle === undefined) {
                var template = this.template.children.get(request.target);

                // If there is no template by the requested name,
                // we return an error message
                if (template === undefined) {
                    return Rx.Observable.throwException('There is no such template that can create the requested bundle. Bundle name = ' + request.target);
                }

                // Create the bundle and initialize template to get the bundle filled with components.
                bundle = this.createBundle(template);
                // Make sure the template is initialized so we will not wait indefinitely for the component.
                template.initialize();
            }

            // Check for cyclic dependency between templates
            var foundCyclicDependency = bundle.template.activeRequests.some(tplRequest => {
                return tplRequest.source === request.target && tplRequest.target === request.source;
            });

            // If a cyclic dependency was found, write an error message to the consol 
            // and return an observable that sends an error message to observers.
            if (foundCyclicDependency) {
                var err = 'Cyclic dependency between template "' + bundle.template.name + '" and "' + request.source + '"';
                console.error(err);
                return Rx.Observable.throwException(err);
            }

            // Select the component from the bundle that matches the index. If a component at 'index' is replaced later,
            // the replaced component will be pushed to subscribers.
            return bundle.components.where(component => component.index === request.index).select(component => {
                // Once we have a match, we update the request object
                request.latest = component;
                return request;
            });
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

        attachVisualComponentEvent(name: string, callbackFn: Function): Rx._IDisposable {
            throw new Error('attachVisualComponentEvent(): Abstract method. Implementors must override.');
        }

        private onNextCanvas<T>(canvas: ICanvas) {
            // If the visual component does not exist yet, create it.
            if (this._visualComponent === undefined) {
                this._visualComponent = this.createVisualComponent();

                // Subscribe to properties for visual component
                this.template.properties.forEach((name, prop) => {
                    // Skip internal properties that are not used by visual component.
                    if (prop.internal) return;

                    // Here we subscribe to each property. When a property returns a value the abstract method setVisualComponentProperty,
                    // that will set the value of the actual visual component.
                    this.subscriptions.add(this.property(name).subscribe(
                        value => {
                            this.setVisualComponentProperty(name, value);
                        }, (err) => {
                            console.error('Error with property observable (name = ' + name + '). ' + err);
                        }));
                });

                //// Subscribe to properties for visual component
                //this.template.events.forEach((name) => {
                //    // Here we attach the component events to the visual component.
                //    // The attachVisualComponentEvent returns a disposable that 
                //    // when triggered will detach the event from the visual component again.
                //    this._subscriptions.add(this.attachVisualComponentEvent(name, this.events(name)));
                //});
            }

            // If there is a current canvas, remove the visual component from it
            if (this._currentCanvas !== undefined && this._currentCanvas !== canvas) {
                this._currentCanvas.removeVisualComponent(this._visualComponent);
            }

            // If this component is a canvas, notify subscribers that they can add themselves to this components visual component.
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
            super.dispose();

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

            // Unreference parent, etc.            
            this._parent = null;
            this._form = null;
            this._bundle = null;
            this._bundles = null;
            this._canvasSource = null;
            this._currentCanvas = null;
            this._visualComponent = null;
        }
    }
}