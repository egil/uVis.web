import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uddM = module('uvis/data/IData');
import utccM = module('uvis/template/ComputeContext');
import utptM = module('uvis/template/PropertyTemplate');

export module uvis.template {

    export class AbstractTemplate {
        private static _definitions = new uudM.uvis.util.Dictionary();
        private _parent: AbstractTemplate;
        private _children: AbstractTemplate[] = [];
        private _properties = new uudM.uvis.util.Dictionary();
        private _instances: uiatiM.uvis.instance.AbstractTemplateInstance[] = [];
        private _id: string;
        private _dataSource: uddM.uvis.data.IData;

        constructor(id: string) {
            if (typeof (id) !== 'string' || id.length === 0) {
                throw new Error('Supplied id is not a string or an empty string.');
            }
            this._id = id;
        }

        get id(): string {
            return this._id;
        }

        get parent(): AbstractTemplate {
            return this._parent;
        }

        set parent(parent) {
            this._parent = parent;
        }

        get children(): AbstractTemplate[] {
            return this._children;
        }

        get properties(): uudM.uvis.util.Dictionary {
            return this._properties;
        }

        get instances(): uiatiM.uvis.instance.AbstractTemplateInstance[] {
            return this._instances;
        }

        get dataSource(): uddM.uvis.data.IData {
            return this._dataSource;
        }

        set dataSource(value: uddM.uvis.data.IData) {
            this._dataSource = value;
        }

        public createId(index): string {
            return this.id + '-' + index;
        }

        public addChild(child: AbstractTemplate) {
            this.children.push(child);
        }

        public addChildren(...children: AbstractTemplate[]) {
            children.forEach(this.addChild, this);
        }

        public addProperty(property: utptM.uvis.template.PropertyTemplate) {
            this.properties.add(property.name, property);
        }

        public createInstance(context: utccM.uvis.template.ComputeContext): uupM.uvis.util.IPromise {
            throw new Error('AbstractComponent.createInstance() should never be called directly. Must be overridden. (Template id = ' + this.id + ')');
        }

        public static create(id: string, templateTypeId: string): AbstractTemplate {
            var fn = AbstractTemplate._definitions.get('*');
            if (!AbstractTemplate._definitions.contains(templateTypeId)) {
                if (fn instanceof Function) {
                    return fn(id, templateTypeId);
                } else {
                    throw new Error('Unable to find Template type with id: ' + templateTypeId);
                }
            } else {
                fn = AbstractTemplate._definitions.get(templateTypeId);
                return fn(id, templateTypeId);
            }
        }

        public static registerTemplateType(templateTypeId: string, createFunction: (id: string, templateTypeId?: string) => AbstractTemplate) {
            AbstractTemplate._definitions.add(templateTypeId, createFunction);
        }
    }
}