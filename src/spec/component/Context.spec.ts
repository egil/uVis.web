/// <reference path="../../.typings/jasmine.d.ts" />
/// <reference path="../../.typings/require.d.ts" />
/// <reference path="../../.typings/rx.d.ts" />
import uccM = module('uvis/component/Context');
import ucciM = module('uvis/component/ComponentInstance');
import udsdsM = module('uvis/data/SessionDataSource');
import ucctM = module('uvis/component/ComponentTemplate');

export module uvis.spec {
    import ucc = uccM.uvis.component;
    import ucct = ucctM.uvis.component;
    import ucci = ucciM.uvis.component;

    describe('Context:', () => {
        it('should clone with originals properties copied', () => {
            var org = new ucc.Context();
            org.data = Rx.Observable.empty();
            org.index = 42;
            org.parent = new ucci.HTMLComponentInstance('div');
            org.template = new ucct.ComponentTemplate('parent template');
            var clone = org.clone();

            expect(clone.data).toBe(org.data);
            expect(clone.index).toBe(org.index);
            expect(clone.parent).toBe(org.parent);
            expect(clone.template).toBe(org.template);
        });

        it('should clone with supplied properties overriding originals', () => {
            var org = new ucc.Context();
            org.data = Rx.Observable.empty();
            org.index = 42;
            org.parent = new ucci.HTMLComponentInstance('div');
            org.template = new ucct.ComponentTemplate('parent template');

            var cloneProperties = {
                data: Rx.Observable.never(),
                index: 256,
                parent: new ucci.HTMLComponentInstance('div'),
                template: new ucct.ComponentTemplate('child template')
            };

            var clone = org.clone(cloneProperties);
            
            expect(clone.data).toBe(cloneProperties.data);
            expect(clone.index).toBe(cloneProperties.index);
            expect(clone.parent).toBe(cloneProperties.parent);
            expect(clone.template).toBe(cloneProperties.template);
        });

        it('should share global properties dataSource and forms between instances', () => {
            var c1 = new ucc.Context();
            var c2 = new ucc.Context();
            c1.dataSources.add('ds', new udsdsM.uvis.data.SessionDataSource(null, null, null));
            c2.forms.add('f',new ucct.ComponentTemplate());
            expect(c1.forms.count()).toBe(1);
            expect(c2.dataSources.count()).toBe(1);
        });
    });
}