///// <reference path="../../.typings/rx.js.binding.d.ts" />
///// <reference path="../../.typings/jasmine.d.ts" />

//import dep = require('uvis/Dependency');

//export module uvis.spec {

//    class DepObj extends dep.uvis.Dependency {
//        constructor(public name: string, public data: Rx.ISubject<dep.uvis.Walk<DepObj>>) { super(); }
                
//    }
    
//    var as = new Rx.Subject<dep.uvis.Walk<DepObj>>();
//    var bs = new Rx.Subject<dep.uvis.Walk<DepObj>>();
//    var cs = new Rx.Subject<dep.uvis.Walk<DepObj>>();
//    var ds = new Rx.Subject<dep.uvis.Walk<DepObj>>();
//    var es = new Rx.Subject<dep.uvis.Walk<DepObj>>();
//    var fs = new Rx.Subject<dep.uvis.Walk<DepObj>>();

//    describe('Dependency', () => {           
//        var cycdep = false;
//        var a = new DepObj('a', as);
//        var b = new DepObj('b', bs);
//        var c = new DepObj('b', bs);
//        var d = new DepObj('d', bs);
        
//        var aobs = a.walk(b, b.data).target.select(walk => {   
//            var target = walk.result;
//            walk.source.addDependency(walk.result);
//            // Check for dependencies
//            if (target.hasDependencies && target.checkGraph) {                
//                return Rx.Observable.throwException('CycDep found');
//            }
//            return target.data;
//        });
//        //    .target.select(target => {
//        //    var source = a;
//        //    source.addDependency(target);
            
//        //    // Check for dependencies
//        //    if (target.hasDependencies && target.checkGraph) {                
//        //        return Rx.Observable.throwException('CycDep found');
//        //    }
//        //    return target.data;
//        //}).switchLatest().select(target => {
//        //    var source = a;
//        //    source.addDependency(target);

//        //    // Check for dependencies
//        //    if (target.hasDependencies && target.checkGraph) {
//        //        return Rx.Observable.throwException('CycDep found');
//        //    }

//        //    return x.data;
//        //}).switchLatest();

//        //var bobs = b.data.select(x => {
//        //    if (x.hasDependencies) {
//        //        var depFound = x.dependencies.some(y=> {
//        //            return y === x;
//        //        });
//        //        return Rx.Observable.throwException('CycDep found');
//        //    }
//        //    else {
//        //        return x.data;
//        //    }
//        //}).switchLatest();

//        //runs(() => {
//        //    aobs.subscribe(x=> { }, () => cycdep = true);
//        //    bobs.subscribe(x=> { }, () => cycdep = true);
//        //    as.onNext(b);
//        //    bs.onNext(b);
//        //});
        
//        //waitsFor(() => cycdep, 'no cyc dep found', 100);
//    });


//    //Rx.Observable.prototype.get = function (bundle: string, index: number = 0): Rx.IObservable<uvis.ComponentRequest> {
//    //    return this.select((request: uvis.ComponentRequest) => {
//    //        return request.getNext(bundle, index);
//    //    }).switchLatest();
//    //};
//}