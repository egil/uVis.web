//import utptM = module('uvis/template/PropertyTemplate');
//import uthtM = module('uvis/template/HTMLTemplate');
//import uupM = module('uvis/util/Promise');

//export module uvis.template {
//    import utpt = utptM.uvis.template;

//    export class HTMLTextTemplate extends uthtM.uvis.template.HTMLTemplate {
//        private _visible: bool;
//        private _name: string;

//        constructor(id: string) {
//            super(id, 'text');
//        }

//        private createSingleInstance(context: utpt.ComputeContext): uupM.uvis.util.IPromise {
//            if (this.properties.contains('text')) {
//                var textProp = this.properties.get('text');
//                textProp.computeValue(context).then((text)
//            }
//            var textNode = document.createTextNode(
//        }
//    }
//}