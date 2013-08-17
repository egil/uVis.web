///// <reference path="../.typings/rx.js.d.ts" />
///// <reference path="../.typings/require.d.ts" />

//export module uvis {

//    export class Dependency {
//        private _dependencies: Dependency[];

//        get hasDependencies(): boolean {
//            return this._dependencies === undefined || this._dependencies.length === 0;
//        }

//        addDependency(target: Dependency) {
//            if (this._dependencies === undefined) this._dependencies = [];
//            this._dependencies.push(target);
//        }
//        removeDependency(target: Dependency) {
//            if (this._dependencies === undefined) return;
//            var index = this._dependencies.indexOf(target);
//            if (index > -1) {
//                this._dependencies.splice(index, 1);
//            }
//        }

//        checkGraph() : boolean {
//            var targets: Dependency[] = this.dependencies;
//            var index = 0;
//            // todo search graph
//            return false;
//        }

//        get dependencies() {
//            return this._dependencies;
//        }

//        walk<T extends Dependency>(startDependency: T, targetObservable: Rx.IObservable<Walk<T>>): Walk<T> {            
//            this.addDependency(startDependency);
//            var res = new Walk<T>();
//            res.source = this;
//            res.target = targetObservable;
//            return res;
//        }
//    }

//    export class Walk<T extends Dependency> {
//        public source: Dependency;
//        public target: Rx.IObservable<Walk<T>>;
//        public result: T;
//    }
//}