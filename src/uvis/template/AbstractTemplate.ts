import uudM = module('uvis/util/Dictionary');
import uupM = module('uvis/util/Promise');
import uueM = module('uvis/util/Extensions');
import utptM = module('uvis/template/PropertyTemplate');
import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uddM = module('uvis/data/IData');

export module uvis.template {
    export class AbstractTemplate {
        private _children: AbstractTemplate[] = [];
        private _properties = new uudM.uvis.util.Dictionary();
        private _instances: uiatiM.uvis.instance.AbstractTemplateInstance[] = [];
        private _id: string;
        private _idCounter: number = 0;
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

        public createUniqueId(): string {
            this._idCounter++;
            return this.id + '-' + this._idCounter;
        }

        public addProperty(property: utptM.uvis.template.PropertyTemplate) {
            this.properties.add(property.name, property);
        }

        public createInstance(index = 1): uupM.uvis.util.IPromise {
            throw new Error('AbstractComponent.createInstance() should never be called directly. Must be overridden. (Template id = ' + this.id + ')');
        }
    }
}