/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />

import ucctM = module('uvis/component/ComponentTemplate');
import ucciM = module('uvis/component/ComponentInstance');
import ucpM = module('uvis/component/Property');
import uccM = module('uvis/component/Context');
import uceM = module('uvis/component/Event');

export module uvis.spec {
    import utcc = ucctM.uvis.component;
    import ucp = ucpM.uvis.component;
    import ucci = ucciM.uvis.component;
    import ucc = uccM.uvis.component;
    import uce = uceM.uvis.component;

    describe('Event:', () => {
        it('should set name correctly during ctor', () => {
            var name = 'onclick';
            var e = new uce.Event(name, (ctx) => {
                ctx.index + 1;
            });

            expect(e.name).toBe(name);
        });

        it('should return a function that captures the context passed to it', () => {
            var name = 'onclick';
            var context = new ucc.Context({ index: 42 });
            var e = new uce.Event(name, (ctx) => {
                ctx.index = ctx.index + 1;
            });

            var fn = e.create(context);
            fn();

            expect(context.index).toBe(43);
        });

    });

}