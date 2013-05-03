import uccM = module('uvis/component/Context');
export module uvis.component {
    import ucc = uccM.uvis.component;

    export class Event {
        private _name: string;
        private _action: (context: ucc.Context) => void;

        constructor(name: string, action: (context: ucc.Context) => void ) {
            this._name = name;
            this._action = action;
        }

        public get name() {
            return this._name;
        }

        public create(context: ucc.Context): () => void {
            return this._action.bind(undefined, context);
        }
    }
}