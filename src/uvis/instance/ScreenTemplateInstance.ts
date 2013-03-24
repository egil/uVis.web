import uiatiM = module('uvis/instance/AbstractTemplateInstance');
import uihtiM = module('uvis/instance/HTMLTemplateInstance');
import utccM = module('uvis/template/ComputeContext');

export module uvis.instance {
    export class ScreenTemplateInstance extends uiatiM.uvis.instance.AbstractTemplateInstance {

        public getContent(): DocumentFragment {  
            // append each node to a document fragment.
            // this will insert very node in one call later, 
            // making the insertion go faster.
            var fragment = document.createDocumentFragment();
            this.children.forEach((instance: uihtiM.uvis.instance.HTMLTemplateInstance) => {
                fragment.appendChild(instance.element);
            });

            return fragment;
        }
    }
}