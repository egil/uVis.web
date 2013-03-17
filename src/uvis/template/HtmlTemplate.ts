import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import uueM = module('uvis/util/Extensions');
import utatM = module('uvis/template/AbstractTemplate');
import utptM = module('uvis/template/PropertyTemplate');
import uihtiM = module('uvis/instance/HTMLTemplateInstance');

export module uvis.template {
    import uud = uudM.uvis.util;
    import uup = uupM.uvis.util;
    import utpt = utptM.uvis.template;
    import uue = uueM.uvis.util;

    export class HtmlTemplate extends utatM.uvis.template.AbstractTemplate {
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

        public createInstance(index = 1): uupM.uvis.util.IPromise {
            // if there is a data source, we first get the data and then
            // handle the different cases according to the type of data
            if (this.dataSource) {
                return this.dataSource.getData()
                    .then((data) => {
                        if (Array.isArray(data)) {
                            // create an instance for each object in the array,
                            // or return undefined if array is empty
                            return data.length > 0 ? uup.Promise.when(data.map((d, i) => {
                                return this.createSingleInstance(i, d);
                            })) : undefined;
                        }
                        else if (typeof data === 'number') {
                            // if data is a number N, create N instances
                            var counter = 0, temp = [];
                            while (counter < data) {
                                temp.push(this.createSingleInstance(counter));
                                counter++;
                            }
                            return uup.Promise.when(temp);
                        } else {
                            // if data is an object or anything else, 
                            // create a single instance
                            return this.createSingleInstance(1, data);
                        }
                    });
            } else {
                // if there are no data source, we simple return a single instance
                return this.createSingleInstance();
            }
        }

        private createSingleInstance(index = 1, data = undefined): uupM.uvis.util.IPromise {
            // first we get the actual html element
            var element = HtmlTemplate.createHTMLElement(this.tag, this.createUniqueId());

            // then we schedule the computation of each property
            var propertyComputePromises = this.properties.map((name, prop: utpt.PropertyTemplate) => {
                return prop.computeValue({ index: index, parent: this, data: data });
            });

            // then we wait for the computation to finish
            var promise = uup.Promise.when(propertyComputePromises)

            // then we move all calculated results into a dictionary for easier lookup later
            .then((properties: any[]) => {
                var d = new uud.Dictionary();
                properties.forEach((pair) => {
                    d.add(pair.name, pair.value);
                });
                return d;
            })

            // then we assign the calculated properties to the html element we created
            .then((properties: uud.Dictionary) => {
                HtmlTemplate.setAttributes(element, properties);
                return new uihtiM.uvis.instance.HTMLTemplateInstance(element, properties);
            })

            // then save the new instance in the instance array
            .then((instance) => {
                this.instances.push(instance);
                return instance;
            });

            return promise;
        }

        private static createHTMLElement(tag: string, id: string): HTMLElement {
            var e = document.createElement(tag);
            e.setAttribute('id', id);
            return e;
        }

        private static setAttributes(element: HTMLElement, properties: uud.Dictionary): HTMLElement {
            // set text content
            if (properties.contains('text')) {
                element.innerHTML = properties.get('text');
            }

            // add properties
            properties.forEach((name: string, value: any) => {
                // fastest way to set attributes on html elements
                // http://jsperf.com/jquery-data-vs-jqueryselection-data/49
                if (value !== undefined && value !== null) {
                    element.setAttribute(name, value);
                }
            });

            return element;
        }

        private static bindEvents(element: HTMLElement, events: any[]) {

        }

        // private static LIST_OF_ATTRIBUTES = ['abbr', 'accept', 'accept-charset', 'accesskey', 'action', 'allowfullscreen', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'border', 'challenge', 'charset', 'checked', 'cite', 'class', 'cols', 'colspan', 'command', 'content', 'contenteditable', 'contextmenu', 'controls', 'coords', 'crossorigin', 'data', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'draggable', 'dropzone', 'enctype', 'for', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'icon', 'id', 'inert', 'inputmode', 'ismap', 'keytype', 'kind', 'label', 'lang', 'list', 'loop', 'low', 'manifest', 'max', 'maxlength', 'media', 'mediagroup', 'method', 'min', 'multiple', 'muted', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'radiogroup', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'spellcheck', 'scope', 'scoped', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'src', 'srcdoc', 'srclang', 'start', 'step', 'style', 'tabindex', 'target', 'title', 'translate', 'type', 'typemustmatch', 'usemap', 'value', 'width', 'wrap'];
        // private static LIST_OF_CSS_PROPERTIES = ['@keframes', 'animation', 'animation-delay', 'animation-direction', 'animation-duration', 'animation-fill-mode', 'animation-iteration-count', 'animation-name', 'animation-play-state', 'animation-timing-function', 'azimuth', 'backface-visibility', 'background', 'background-attachment', 'background-clip', 'background-color', 'background-image', 'background-origin', 'background-position', 'background-repeat', 'background-size', 'border', 'border-bottom', 'border-bottom-color', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-style', 'border-bottom-width', 'border-collapse', 'border-color', 'border-image', 'border-image-outset', 'border-image-repeat', 'border-image-slice', 'border-image-source', 'border-image-width', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-radius', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-top-left-radius', 'border-top-right-radius', 'border-top-style', 'border-top-width', 'border-width', 'bottom', 'box-decoration-break', 'box-shadow', 'break-after', 'break-before', 'break-inside', 'caption-side', 'clear', 'clip', 'color', 'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'content', 'counter-increment', 'counter-reset', 'cue', 'cue-after', 'cue-before', 'cursor', 'direction', 'display', 'elevation', 'empty-cells', 'float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height', 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'marker-offset', 'marks', 'marquee-direction', 'marquee-play-count', 'marquee-speed', 'marquee-style', 'max-height', 'max-width', 'min-height', 'min-width', 'opacity', 'orphans', 'outline', 'outline-color', 'outline-style', 'outline-width', 'overflow', 'overflow-style', 'overflow-x', 'overflow-y', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'page', 'page-break-after', 'page-break-before', 'page-break-inside', 'pause', 'pause-after', 'pause-before', 'perspective', 'perspective-origin', 'pitch', 'pitch-range', 'play-during', 'position', 'quotes', 'richness', 'right', 'size', 'speak', 'speak-header', 'speak-numeral', 'speak-punctuation', 'speech-rate', 'stress', 'table-layout', 'text-align', 'text-decoration', 'text-indent', 'text-shadow', 'text-transform', 'top', 'transform', 'transform-origin', 'transform-style', 'transition', 'transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function', 'unicode-bidi', 'vertical-align', 'visibility', 'voice-family', 'volume', 'white-space', 'widows', 'width', 'word-spacing', 'z-index'];

        //createContent(): util.Promise {
        //    var res = new util.Promise();
        //    var elm: HTMLElement;
        //    var propPromise: util.IPromise;
        //    var propPromises: util.IPromise[];
        //    var childrenPromise: util.IPromise;
        //    var childrenPromises: util.IPromise[];

        //    // retrive all properties on this component first.
        //    // child components will likely use the same data
        //    // as the parent component, so triggering a data collection
        //    // now for this component may save some web services calls.
        //    propPromises = this.properties.map((key, prop) => { return prop.calculate(); });

        //    // create a promise that waits till all property promises have been fulfilled
        //    propPromise = util.Promise.when(propPromises);

        //    // retrive the content of all children, if any.
        //    propPromise.then((props) => {
        //        // retrive content from each child
        //        childrenPromises = this.children.map((child) => { return child.createContent(); });

        //        // create a promise that waits till all child primses have been fulfilled
        //        childrenPromise = util.Promise.when(childrenPromises);

        //        // wait for content from all children
        //        childrenPromise.then((childrenContent) => {
        //            // get this components element
        //            elm = this.createElement();

        //            // assign properties to elm
        //            this.setProperties(elm);

        //            // add content 
        //            this.appendContent(elm);

        //            // add children to elm
        //            childrenContent.forEach((child) => {
        //                elm.appendChild(child);
        //            });

        //            res.fulfill(elm);

        //        }, (err) => {
        //            res.reject(err);
        //        });

        //    }, (err) => {
        //        res.reject(err);
        //    });

        //    // add children and properties to elm            
        //    return res;
        //}

        //private setProperties(element: HTMLElement) {
        //    var styleAttr;
        //    this.properties.forEach((key: string, prop: prop.Property) => {
        //        // if property is a CSS property, add it to styleAttr
        //        if (helpers.binarySearch(HtmlTemplate.LIST_OF_CSS_PROPERTIES, key) !== -1) {
        //            styleAttr += key + ':' + prop.value + ';';
        //        } else {
        //            // else add a the attribute directly.
        //            element.setAttribute(key, prop.value);
        //        }
        //    });
        //    // if style attributes have been found, add it.
        //    if (styleAttr) {
        //        element.setAttribute('style', styleAttr);
        //    }
        //}

        //private appendContent(element: HTMLElement) {
        //    // set content of node
        //    if (this.properties.contains('text')) {
        //        element.appendChild(this.properties.get('text'));
        //    }
        //}
    }
}