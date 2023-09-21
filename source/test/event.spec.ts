'use strict';

import { equal } from 'assert';

import { EventEmitter } from '../lib/event';

describe(`EventEmitter`, function () {
    const emitter = new EventEmitter<{
        'test-a': {
            params: [string, number];
            result: boolean;
        };
        'test-b': {
            params: [string, number];
            result: boolean;
        };
    }>();

    it('addListener / emit', function () {
        let num = 0;
        emitter.emit('test-a', '1', 1);

        function listener(a: string, b: number) {
            num++;
            return false;
        }
        emitter.addListener('test-a', listener);
        emitter.emit('test-a', '1', 1);
        equal(num, 1);
    });

    it('addListener / removeListener', function () {
        let num = 0;
        emitter.emit('test-a', '1', 1);

        function listener(a: string, b: number) {
            num++;
            return false;
        }
        emitter.addListener('test-a', listener);
        emitter.removeListener('test-a', listener);
        emitter.emit('test-a', '1', 1);
        equal(num, 0);
    });

    it('addListener / clear', function () {
        let num = 0;
        emitter.emit('test-a', '1', 1);

        function listener(a: string, b: number) {
            num++;
            return false;
        }
        emitter.addListener('test-a', listener);
        emitter.addListener('test-b', listener);
        emitter.clear('test-a');
        emitter.emit('test-a', '1', 1);
        emitter.emit('test-b', '1', 1);
        equal(num, 1);
    });

    it('addListener / clear 2', function () {
        let num = 0;
        emitter.emit('test-a', '1', 1);

        function listener(a: string, b: number) {
            num++;
            return false;
        }
        emitter.addListener('test-a', listener);
        emitter.addListener('test-b', listener);
        emitter.clear();
        emitter.emit('test-a', '1', 1);
        emitter.emit('test-b', '1', 1);
        equal(num, 0);
    });
});