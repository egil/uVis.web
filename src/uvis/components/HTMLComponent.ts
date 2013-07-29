/// <reference path="../../.typings/rx.js.binding.d.ts" />
/// <reference path="../../.typings/rx.js.d.ts" />

import uc = require('uvis/Component');

export module uvis.component {
    export class HTMLComponent extends uc.uvis.Component implements uc.uvis.ICanvas {

        //#region Canvas / Visual Component method

        createVisualComponent() {
            var elm = document.createElement(this.template.subtype);
            return elm;
        }

        addVisualComponent(vc: HTMLElement) {
            var elm = <HTMLElement>this.visualComponent;
            elm.appendChild(vc);
        }

        removeVisualComponent(vc: HTMLElement) {
            var elm = <HTMLElement>this.visualComponent;
            elm.removeChild(vc);
        }

        setVisualComponentProperty(name: string, value?: any) {
            var elm = <HTMLElement>this.visualComponent;
            if (name === 'text') {
                elm.innerHTML = value;
            } else if (value === undefined) {
                elm.removeAttribute(name);
            } else {
                elm.setAttribute(name, value);
            }
        }

        //#endregion
    }
}