import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import utatM = module('uvis/template/AbstractTemplate');
import utptM = module('uvis/template/PropertyTemplate');
import uiptM = module('uvis/instance/PropertyInstance')
import uihtiM = module('uvis/instance/HTMLTemplateInstance');
import utccM = module('uvis/template/ComputeContext');

export module uvis.template {
    import uud = uudM.uvis.util;
    import uup = uupM.uvis.util;
    import utpt = utptM.uvis.template;
    import cc = utccM.uvis.template;

    export class HTMLTemplate extends utatM.uvis.template.AbstractTemplate {
        private _tag: string;
        constructor(id, tag) {
            super(id);

            // validate tag
            // question: should it check the tag against a list of known html tags?
            if (typeof (tag) !== 'string' || tag.length === 0) {
                throw new Error('Supplied tag is not a string or an empty string.');
            }

            this._tag = tag;
        }

        get tag(): string {
            return this._tag;
        }

        public createInstance(context: utccM.uvis.template.ComputeContext): uupM.uvis.util.IPromise {
            // return already created instances if called before
            if (this.instances.length > 0) {
                return this.instances.length === 1 ?
                    uup.Promise.resolve(this.instances[0]) :
                    uup.Promise.resolve(this.instances);
            }
                // if there is a data source, we first get the data and then
                // handle the different cases according to the type of data
            else if (this.dataQuery) {
                return this.dataQuery.getData(context)
                    .then((data) => {
                        if (Array.isArray(data)) {
                            // create an instance for each object in the array,
                            // or return undefined if array is empty
                            if (data.length > 1) {
                                return uup.Promise.when(data.map((d, i) => {
                                    return this.createSingleInstance(cc.extend(context, { index: i, data: d, parent: context.parent }));
                                }));
                            }
                            // if there is only one element in the data array, treat it as if there was 
                            // only one object passed to it
                            if (data.length === 1) {
                                return this.createSingleInstance(cc.extend(context, { index: 0, data: data[0] }));
                            }
                            // if there are zero we return nothing
                            return undefined;
                        }
                        else if (typeof data === 'number') {
                            // if data is a number N, create N instances
                            var counter = 0, temp = [];
                            while (counter < data) {
                                temp.push(this.createSingleInstance(cc.extend(context, { index: counter })));
                                counter++;
                            }
                            return uup.Promise.when(temp);
                        } else {
                            // if data is an object or anything else, 
                            // create a single instance
                            return this.createSingleInstance(cc.extend(context, { index: 0, data: data === undefined ? context.data : data }));
                        }
                    })
                    // before returning the result, we wrap it if it is in the form of an array
                    .then((singleOrMany) => {
                        var res = singleOrMany;
                        if (Array.isArray(res)) {
                            // Since all other calls to createInstance results in a Template Instance
                            // we wrap the instances created in a "wrapper" instance                                     
                            // Note: there is no properties set on the wrapper instance since
                            // it does not have any properties itself. All children holds their own
                            // properties.
                            res = new uihtiM.uvis.instance.HTMLTemplateInstance();
                            res.element = document.createDocumentFragment();
                            res.children = singleOrMany;
                            res.parent = context.parent;

                            // add all children to the document fragment
                            singleOrMany.forEach((instance) => {
                                res.element.appendChild(instance.element);
                            });
                        }

                        return res;
                    });
            } else {
                // if there are no data source, we simple return a single instance
                return this.createSingleInstance(cc.extend(context, { index: 0 }));
            }
        }

        private createSingleInstance(context: utccM.uvis.template.ComputeContext): uupM.uvis.util.IPromise {
            // first we get the actual html element
            //var instanceId = this.createId(context.index);
            var element = HTMLTemplate.createHTMLElement(this.tag);

            // then we schedule the computation of each property
            var propertyComputePromises = this.properties.map((name, prop: utpt.PropertyTemplate) => {
                return prop.computeValue(context);
            });

            // then we wait for the computation to finish
            var promise = uup.Promise.when(propertyComputePromises)

            // then we move all calculated results into a dictionary for easier lookup later
            .then((propertiesInstances: any[]) => {
                var d = new uud.Dictionary();
                propertiesInstances.forEach((propertyInstance: uiptM.uvis.instance.PropertyInstance) => {
                    d.add(propertyInstance.id, propertyInstance);
                });
                return d;
            })

            // then we assign the calculated properties to the html element we created
            // and create an template instance to store the end result in
            .then((properties: uud.Dictionary) => {
                var instance = new uihtiM.uvis.instance.HTMLTemplateInstance();

                HTMLTemplate.setAttributes(element, properties);

                instance.element = element;
                instance.properties = properties;
                instance.parent = context.parent;
                instance.data = context.data;
                instance.template = this;

                return instance;
            })

            // then create all children and add them to the instance
            .then((instance) => {
                var childCreateInstancePromises;

                // if there are any children, first create them,
                // then add them to the current created instance.
                // otherwise we return the current created instance as is.
                if (this.children.length > 0) {
                    childCreateInstancePromises = this.children.map((t, i) => {
                        // create each child with the instance this template just created as the parent
                        // pass in the parents data, the child will decide to use it or override it
                        // with its own.
                        return t.createInstance(cc.extend(context, { index: i, parent: instance }));
                    });
                    return uup.Promise.when(childCreateInstancePromises).then((childInstances) => {
                        instance.children = childInstances;
                        // add html elements to each other
                        childInstances.forEach((c) => {
                            if (c !== undefined) {
                                instance.element.appendChild(c.element);
                            }
                        });
                        return instance;
                    });
                } else {
                    return instance;
                }
            })

            // then save the new instance in the instance array
            .then((instance) => {
                this.instances.push(instance);
                return instance;
            });

            return promise;
        }

        private static createHTMLElement(tag: string): HTMLElement {
            var e = document.createElement(tag);
            return e;
        }

        private static setAttributes(element: HTMLElement, properties: uud.Dictionary): HTMLElement {
            // add properties
            properties.forEach((name: string, propertyInstance: any) => {
                var value = propertyInstance.value;

                // ignore values that undefined or null. There is no
                // reason to set attributes with these values
                if (value !== undefined && value !== null) {
                    // handle special cases
                    if (name === 'text') {
                        element.appendChild(document.createTextNode(value));
                        return;
                    } else if (name === 'style' && value instanceof uud.Dictionary) {
                        // build a style attribute according to specifications
                        // @see http://www.w3.org/TR/css-style-attr/
                        value = '';
                        propertyInstance.value.forEach((name: string, propertyInstance: any) => {
                            value += name + ':' + propertyInstance.value + ';';
                        });
                    } else if (name === 'class' && Array.isArray(value)) {
                        value = value.reduce((previousValue, currentValue) => {
                            return previousValue + ' ' + currentValue;
                        });
                    }

                    element.setAttribute(name, value);
                }
            });

            return element;
        }

        private static bindEvents(element: HTMLElement, events: any[]) {

        }

        // private static LIST_OF_ATTRIBUTES = ['abbr', 'accept', 'accept-charset', 'accesskey', 'action', 'allowfullscreen', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'border', 'challenge', 'charset', 'checked', 'cite', 'class', 'cols', 'colspan', 'command', 'content', 'contenteditable', 'contextmenu', 'controls', 'coords', 'crossorigin', 'data', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'draggable', 'dropzone', 'enctype', 'for', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'icon', 'id', 'inert', 'inputmode', 'ismap', 'keytype', 'kind', 'label', 'lang', 'list', 'loop', 'low', 'manifest', 'max', 'maxlength', 'media', 'mediagroup', 'method', 'min', 'multiple', 'muted', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'radiogroup', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'spellcheck', 'scope', 'scoped', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'src', 'srcdoc', 'srclang', 'start', 'step', 'style', 'tabindex', 'target', 'title', 'translate', 'type', 'typemustmatch', 'usemap', 'value', 'width', 'wrap'];
        // private static LIST_OF_CSS_PROPERTIES = ['@keframes', 'animation', 'animation-delay', 'animation-direction', 'animation-duration', 'animation-fill-mode', 'animation-iteration-count', 'animation-name', 'animation-play-state', 'animation-timing-function', 'azimuth', 'backface-visibility', 'background', 'background-attachment', 'background-clip', 'background-color', 'background-image', 'background-origin', 'background-position', 'background-repeat', 'background-size', 'border', 'border-bottom', 'border-bottom-color', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-style', 'border-bottom-width', 'border-collapse', 'border-color', 'border-image', 'border-image-outset', 'border-image-repeat', 'border-image-slice', 'border-image-source', 'border-image-width', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-radius', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-top-left-radius', 'border-top-right-radius', 'border-top-style', 'border-top-width', 'border-width', 'bottom', 'box-decoration-break', 'box-shadow', 'break-after', 'break-before', 'break-inside', 'caption-side', 'clear', 'clip', 'color', 'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'content', 'counter-increment', 'counter-reset', 'cue', 'cue-after', 'cue-before', 'cursor', 'direction', 'display', 'elevation', 'empty-cells', 'float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height', 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'marker-offset', 'marks', 'marquee-direction', 'marquee-play-count', 'marquee-speed', 'marquee-style', 'max-height', 'max-width', 'min-height', 'min-width', 'opacity', 'orphans', 'outline', 'outline-color', 'outline-style', 'outline-width', 'overflow', 'overflow-style', 'overflow-x', 'overflow-y', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'page', 'page-break-after', 'page-break-before', 'page-break-inside', 'pause', 'pause-after', 'pause-before', 'perspective', 'perspective-origin', 'pitch', 'pitch-range', 'play-during', 'position', 'quotes', 'richness', 'right', 'size', 'speak', 'speak-header', 'speak-numeral', 'speak-punctuation', 'speech-rate', 'stress', 'table-layout', 'text-align', 'text-decoration', 'text-indent', 'text-shadow', 'text-transform', 'top', 'transform', 'transform-origin', 'transform-style', 'transition', 'transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function', 'unicode-bidi', 'vertical-align', 'visibility', 'voice-family', 'volume', 'white-space', 'widows', 'width', 'word-spacing', 'z-index'];
    }
}