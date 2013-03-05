import dictModule = module('uvis/util/dictionary');
import promiseModule = module('uvis/util/promise');

export module uvis {    
    import dict = dictModule.uvis.util;
    import util = promiseModule.uvis.util;

    export class AbstractComponent {
        private _children: AbstractComponent[];
        private _properties: dict.Dictionary;
        private _id: string;

        constructor(id: string) {
            this._id = id;
            this._children = [];
            this._properties = new dict.Dictionary();
        }

        get id(): string {
            return this._id;
        }

        get children(): AbstractComponent[] {
            return this._children;
        }

        get properties(): dict.Dictionary {
            return this._properties;
        }

        createContent(): util.Promise {
            throw new Error('AbstractComponent.createContent() should never be called directly. Must be overridden. (Component id = ' + this.id + ')');
        }
    }
    
    export class HtmlComponent extends AbstractComponent {
        constructor(id) {
            super(id);
        }

        createElement(): Node {
            throw new Error('HtmlComponent.createElement() should never be called directly. Must be overridden. (Component id = ' + this.id + ')');
        }

        createContent(): util.Promise {
            var res = new util.Promise();
            var elm: Node;
            var propPromise: util.IPromise;
            var propPromises: util.IPromise[];
            var childrenPromise: util.IPromise;
            var childrenPromises: util.IPromise[];

            // retrive all properties on this component first.
            // child components will likely use the same data
            // as the parent component, so triggering a data collection
            // now for this component may save some web services calls.
            propPromises = this.properties.map((key, prop) => { return prop.calculate(); });

            // create a promise that waits till all property promises have been fulfilled
            propPromise = util.Promise.when(propPromises);
            
            // retrive the content of all children, if any.
            propPromise.then((props) => {
                // retrive content from each child
                childrenPromises = this.children.map((child) => { return child.createContent(); });

                // create a promise that waits till all child primses have been fulfilled
                childrenPromise = util.Promise.when(childrenPromises);
                
                // wait for content from all children
                childrenPromise.then((childrenContent) => {
                    // get this components element
                    elm = this.createElement();

                    // TODO assign properties to elm

                    // TODO assign content to elm

                    res.fulfill(elm);

                }, (err) => {
                    res.reject(err);
                });

            }, (err) => {
                res.reject(err);
            });
            

            // add children and properties to elm            
            return res;
        }
    }

//        render(): DocumentFragment {
//            var fragment = document.createDocumentFragment();
//            var elm = document.createElement('div');            
//            elm.setAttribute('id', this.id);
//            elm.innerText = this.properties['text'].value;
            
//            var styles = '';
//            _.each(_.omit(this.properties, 'id', 'text', 'type'),
//                (obj: any, key?: string) => {
//                    if (obj instanceof propertyModule.uvis.property.Property) {
//                        styles += obj.key + ':' + obj.value + ';';
//                    }
//                });
//            elm.setAttribute('style', styles);
            
//            _.each(this.children, (comp: any, id?: string) => {                
//                elm.appendChild(comp.render());
//            });

//            fragment.appendChild(elm);
//            return fragment;
//        }
//    }
}