import uudM = module('uvis/util/Dictionary');
import uccM = module('uvis/component/Context');
import ucpM = module('uvis/component/Property');
import uddsM = module('uvis/data/DataSource');
import ucciM = module('uvis/component/ComponentInstance');
import uceM = module('uvis/component/Event');

export module uvis.component {
    import ucci = ucciM.uvis.component;
    import ucc = uccM.uvis.component;
    import ucp = ucpM.uvis.component;
    import uce = uceM.uvis.component;

    export class ComponentTemplate {
        private _id: string;
        private _parent: ComponentTemplate;
        // Dictionary <key: string, IProperty >
        private _properties: uudM.uvis.util.Dictionary;
        private _data: uddsM.uvis.data.IDataSource;
        private _children: ComponentTemplate[];
        private _events: uce.Event[];

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

        get events(): uce.Event[]{
            return this._events;
        }

        public addEvent(evt: uce.Event) {
            if (this._events === undefined) this._events = new Array();
            this._events.push(evt);
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

        /**
         * Create the instances of this template.
         */
        public create(context?: ucc.Context): Rx.Internals.AnonymousObservable {
            // get context and update it, or create new.
            context = context !== undefined ? context.clone({ template: this }) : new ucc.Context({ template: this });

            // one or both of this.data or context.data have to have an observable data stream
            var data = this.data !== undefined ? this.data.query() : context.data;
            data = data || Rx.Observable.returnValue(undefined);

            var res = data.select(d => {
                // wrap data in observable to keep interface consistent
                return d === undefined ? d : Rx.Observable.returnValue(d);
            }).select((d, i) => {
                // add data to new context
                return context.clone({ data: d, index: i });
            }).select(ctx => {
                // create instance object and assign context
                var ci = this.createInstanceObject();
                ci.context = ctx;
                return ci;
            }).select(ci => {
                // assign properties to it instance object
                this.properties.forEach((key, prop: ucp.IProperty) => {
                    ci.properties.add(key, prop.getValue(ci.context));
                });
                return ci;
            });

            // if there are any child objects, generate these as well
            if (this._children !== undefined && this._children.length > 0) {
                res = res.selectMany(ci => {
                    // we create a new shared context for all the children
                    var childContext = ci.context.clone({ parent: ci });
                    // then we get all the create observables for the children
                    var childrenObs = this._children.map(ct => ct.create(childContext));
                    // then we subscribe to each and aggregate their result into ci
                    return Rx.Observable.concat(childrenObs)
                        .aggregate(ci, (ci, child) => {
                            ci.addChild(child);
                            return ci;
                        });
                });
            }

            return res;
        }

        private createInstanceObject(): ucci.IComponentInstance { }
    }

    export class HTMLComponentTemplate extends ComponentTemplate {
        private _tag: string;
        constructor(tag: string, id?: string, parent?: ComponentTemplate) {
            super(id, parent);
            this._tag = tag;
        }

        private createInstanceObject(): ucci.IComponentInstance {
            return new ucci.HTMLComponentInstance(this._tag);
        }
    }
}