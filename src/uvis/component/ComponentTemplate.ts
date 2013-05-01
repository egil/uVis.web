import uudM = module('uvis/util/Dictionary');
import ucpM = module('uvis/component/Property');
import uccM = module('uvis/component/Context');
import ucciM = module('uvis/component/ComponentInstance');
import uddsM = module('uvis/data/DataSource');

export module uvis.component {
    import ucci = ucciM.uvis.component;
    import ucc = uccM.uvis.component;
    import ucp = ucpM.uvis.component;

    export class ComponentTemplate {
        private _id: string;
        private _parent: ComponentTemplate;
        // Dictionary <key: string, IProperty >
        private _properties: uudM.uvis.util.Dictionary;
        private _data: uddsM.uvis.data.IDataSource;
        private _children: ComponentTemplate[];

        constructor(id?: string, parent?: ComponentTemplate) {
            this._id = id;
            this._parent = parent;
            this._properties = new uudM.uvis.util.Dictionary();
        }

        get id(): string {
            return this._id;
        }

        get parent(): ComponentTemplate {
            return this._parent;
        }

        get data(): uddsM.uvis.data.IDataSource {
            return this._data;
        }

        set data(value: uddsM.uvis.data.IDataSource) {
            this._data = value;
        }

        /**
         * Dictionary<key:string, IProperty>
         */
        get properties(): uudM.uvis.util.Dictionary {
            return this._properties;
        }

        public addChild(child: ComponentTemplate) {
            if (this._children === undefined) this._children = new Array();

            if (child.id === undefined || this._children.filter(c => c.id !== undefined).every(c => c.id !== child.id)) {
                this._children.push(child);
            } else {
                throw new Error('Children with duplicated id\'s detected. Id = ' + child.id);
            }
        }

        public addChildren(children: ComponentTemplate[]) {
            children.forEach(this.addChild, this);
        }

        public addProperty(property: ucpM.uvis.component.IProperty) {
            if (!this._properties.contains(property.id))
                this._properties.add(property.id, property);
            else
                throw new Error('Property with duplicated id\'s detected. Id = ' + property.id);
        }

        public addProperties(properties: ucpM.uvis.component.IProperty[]) {
            properties.forEach(this.addProperty, this);
        }

        public create(context?: ucc.Context): Rx.Internals.AnonymousObservable {
            return this.createInstances(context);
        }

        private createInstances(context?: ucc.Context): Rx.Internals.AnonymousObservable {
            return Rx.Observable.empty();
            
            // get context and update it
            context = context !== undefined ? context.clone({ template: this }) : new ucc.Context({ template: this });
            
            if (context.data === undefined && this.data === undefined) {
                // since there is neither data from parent nor this template,
                // we make sure index is set to 0. Index should always
                // point to the context.data index compared.
                context.index = 0;  
                return this.createSingleInstance(context);

            } else if (this.data !== undefined) {
                // for each entity in the query, produce one instance
                return this.data.query().select((entity, index) => {
                    var instContext = context.clone({ data: entity, index: index });
                    return this.createSingleInstance(instContext);
                }).concatObservable();

            } else if (Array.isArray(context.data)) {
                var observables = (<Array>context.data).map((entity, index) => {
                    var instContext = context.clone({ data: entity, index: index });
                    return this.createSingleInstance(instContext);
                });
                return Rx.Observable.fromArray(observables).concatObservable();

            } if (typeof context.data === 'number') {
                // if data is a number N, create N instances
                if (context.data > 0) {
                    var counter = context.data, index = 0, observables = new Array(counter);
                    // remove data do make sure child instances do not inherit 
                    context.data = undefined;
                    while (index < counter) {
                        observables.push(this.createSingleInstance(context.clone({ index: index })));
                        index++;
                    }
                    return Rx.Observable.fromArray(observables).concatObservable();
                } else {
                    return Rx.Observable.empty();
                }

            } else {
                // else, data is a single object
                return this.createSingleInstance(context);
            }
        }

        // PRIVATE METHODS
        //private createSingleInstance(context: ucc.Context): Rx.Internals.AnonymousObservable {
        //    return null;
        //}
        //    var instance = new ucci.HTMLComponentInstance();

        //    // for each property, create

        //    // for each event, create

        //    // create child context
        //    var childContext = context.clone({ parent: instance, index: 0 });

        //    // for each child, create

        //    return Rx.Observable.empty();
        //}

        // STATICS
    }
}