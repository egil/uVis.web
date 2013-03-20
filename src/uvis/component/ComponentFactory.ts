///// <reference path="../../.typings/require.d.ts" />
//import uupM = module('uvis/util/Promise');
//import uudM = module('uvis/util/Dictionary');
//import uccdM = module('uvis/component/ComponentDefinition');

//export module uvis.component {
//    export class ComponentFactory {
//        // <component id, component>
//        private static _componentDictionary = new uudM.uvis.util.Dictionary();
        
//        public static create(componentTypeId: string, id: string): uupM.uvis.util.IPromise {
//            var compDef: uccdM.uvis.component.ComponentDefinition, p = new uupM.uvis.util.Promise();
//            if (!ComponentFactory._componentDictionary.contains(componentTypeId)) {
//                p.reject('Unable to find component type with id: ' + componentTypeId);
//            } else {
//                compDef = ComponentFactory._componentDictionary.get(componentTypeId);
//                if (compDef.sourceFile === undefined || compDef.component !== undefined) {
//                    p.fulfill(compDef.create(compDef.component, id));
//                } else {
//                    require([compDef.sourceFile], (comp) => {
//                        compDef.component = comp;
//                        p.fulfill(compDef.create(comp, id));
//                    }, (err) => {
//                        p.reject(err);
//                    });
//                }
//            }
//            return p;
//        }

//        public static addDefinition(def: uccdM.uvis.component.ComponentDefinition) {
//            ComponentFactory._componentDictionary.add(def.id, def);
//        }
//    }
//}