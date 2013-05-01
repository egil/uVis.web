/// <reference path="../../.typings/jasmine.d.ts" />

import dictionaryModule = module('uvis/util/Dictionary');
import util = dictionaryModule.uvis.util;

export module uvis.spec {
    describe('Dictionary', () => {
        it('should return a value added to it', () => {
            var d = new util.Dictionary();
            var actual;
            var key = 'k1';
            var expected = 'v1';
            d.add(key, expected);
            actual = d.get(key);
            expect(actual).toBe(expected);
        });

        it('should only return key-value pairs added to it', () => {
            var d = new util.Dictionary();
            var c = 0;
            d.add('k1', 'v1');
            d.add('k2', 'v2');
            d.add('k3', 'v3');

            d.forEach((k, v) => {
                c++;
            });
            
            expect(c).toBe(3);
            expect(d.contains('k1')).toBeTruthy();
            expect(d.contains('k2')).toBeTruthy();
            expect(d.contains('k3')).toBeTruthy();
        });

        it('should not be possible to replace built in functions', () => {
            var d = new util.Dictionary();
            var orgAdd = d.add;
            var actual;
            var key = 'add';
            var expected = 'v1';
            d.add(key, expected);
            actual = d.get(key);
            expect(actual).toBe(expected);
            expect(d.add).toBe(orgAdd);
        });

        it('set should override existing values', () => {
            var d = new util.Dictionary();
            var actual;
            var key = 'add';
            var expected = 'exp';
            d.set(key, 'asdf');
            d.set(key, expected);
            actual = d.get(key);
            expect(actual).toBe(expected);
        });

        it('add should throw an error if key already exists in dictionary', () => {
            var d = new util.Dictionary();
            var actual;
            var key = 'add';
            d.add(key, 'one valu');

            var mustThrow = function () {
                d.add(key, 'another value');
            }

            expect(mustThrow).toThrow();
        });

        it('should return the correct number of entries in the dictionary', () => {
            var d = new util.Dictionary();
            var e = 3;
            d.add('k1', 'v1');
            d.add('k2', 'v2');
            d.add('k3', 'v3');
            expect(d.count()).toBe(e);
        });

        it('should should return the number of items returned so far in .forEach', () => {
            var d = new util.Dictionary();
            d.add('k1', 'v1');
            d.add('k2', 'v2');
            d.add('k3', 'v3');
            var expected = 0;
            d.forEach((x, y, count) => {
                expect(count).toBe(expected++);
            })                        
        });

        it('should should return the number of items returned so far in .map', () => {
            var d = new util.Dictionary();
            d.add('k1', 'v1');
            d.add('k2', 'v2');
            d.add('k3', 'v3');
            var expected = 0;
            d.map((x, y, count) => {
                expect(count).toBe(expected++);
            })
        });
    });
}