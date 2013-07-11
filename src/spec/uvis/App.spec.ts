/// <reference path="../../.typings/jasmine.d.ts" />

import dict = require('util/Dictionary');
import a = require('uvis/App');
import ct = require('uvis/Template');

export module uvis.spec {
    var baseUrl = '/src/spec/uvis/testdefs/';

    describe('App:', () => {
        it('should set ctor arguments correctly', () => {
            var a1 = new a.uvis.App();
            var a2 = new a.uvis.App(baseUrl);
            expect(a1.baseUrl).toBe('');
            expect(a2.baseUrl).toBe(baseUrl);
        });

        it('should add form definitions correctly', () => {
            var def: a.uvis.FormDefinition = { id: 't1', visible: true };
            var a1 = new a.uvis.App();
            a1.addFormDef(def);
            expect(a1.formDefs.get(def.id)).toBe(def);
        });

        it('should throw if form definition has already been added', () => {
            var def: a.uvis.FormDefinition = { id: 't1', visible: true };
            var a1 = new a.uvis.App();
            a1.addFormDef(def);
            expect(a1.addFormDef.bind(a1, def)).toThrow('Form definition with same id has already been added to application. { id: ' + def.id + ' }');
        });

        it('should add forms correctly', () => {
            var a1 = new a.uvis.App();
            var t1 = new ct.uvis.Template('t1', 'html');
            a1.addForm(t1);
            expect(a1.forms.get(t1.id)).toBe(t1);
        });

        it('should throw if forms has already been added', () => {
            var a1 = new a.uvis.App();
            var t1 = new ct.uvis.Template('t1', 'html');
            a1.addForm(t1);
            expect(a1.addForm.bind(a1, t1)).toThrow('Form  with same id has already been added to application. { id: ' + t1.id + ' }');
        });

        xdescribe('Initialize:', () => {
            it('should retrive content of form definition marked as visible', () => {
                var td1: a.uvis.FormDefinition = { id: 't1', visible: true };
                var td2: a.uvis.FormDefinition = { id: 't2', visible: false };
                var td3: a.uvis.FormDefinition = { id: 't3', visible: true, content: 'yyyy', downloaded: true };
                var td4: a.uvis.FormDefinition = { id: 't4', visible: false, content: 'xxxx', downloaded: true };

                var a1 = new a.uvis.App(baseUrl);
                a1.addFormDef(td1);
                a1.addFormDef(td2);
                a1.addFormDef(td3);
                a1.addFormDef(td4);

                a1.initialize();

                expect(a1.formDefs.get(td1.id).downloaded).toBeTruthy();
                expect(a1.formDefs.get(td2.id).downloaded).toBeFalsy();
                expect(a1.formDefs.get(td3.id).downloaded).toBeTruthy();
                expect(a1.formDefs.get(td4.id).downloaded).toBeTruthy();
            });
        });
    });
}