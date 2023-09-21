'use strict';

import { equal } from 'assert';

async function step(name: keyof typeof import('../queue')) {
    const queue = await import('../index');
    const Ctor = queue[name];

    describe(`Queue: ${name}`, function () {
        describe('default', () => {
            const queue = new Ctor();
            it('size', function () {
                equal(queue.size(), 0);
            });

            it('isEmpty', function () {
                equal(queue.isEmpty(), true);
            });
        });
    
        describe('enqueue', function () {
            const queue = new Ctor();
    
            it('push', function () {
                queue.enqueue('a');
                equal(queue.size(), 1);
                equal(queue.isEmpty(), false);
            });
    
            it('push again', function () {
                queue.enqueue('b');
                equal(queue.size(), 2);
                equal(queue.isEmpty(), false);
            });
        });

        describe('dequeue', function () {
            const queue = new Ctor();

            it('dequeue(empty)', () => {
                equal(queue.dequeue(), undefined);
                equal(queue.size(), 0);
                equal(queue.isEmpty(), true);
            });

            it('dequeue', () => {
                queue.enqueue('a');
                queue.enqueue('b');
                equal(queue.dequeue(), 'a');
                equal(queue.size(), 1);
                equal(queue.isEmpty(), false);
            });

            it('dequeue again', () => {
                equal(queue.dequeue(), 'b');
                equal(queue.size(), 0);
                equal(queue.isEmpty(), true);
            });
        });

        describe('peek', function () {
            const queue = new Ctor();

            it('peek(empty)', () => {
                equal(queue.peek(), undefined);
                equal(queue.size(), 0);
                equal(queue.isEmpty(), true);
            });

            it('peek', () => {
                queue.enqueue('a');
                queue.enqueue('b');
                equal(queue.peek(), 'a');
                equal(queue.size(), 2);
                equal(queue.isEmpty(), false);
            });
    
            it('peek again', () => {
                equal(queue.peek(), 'a');
                equal(queue.size(), 2);
                equal(queue.isEmpty(), false);
            });
        });

        describe('clear', function () {
            const queue = new Ctor();

            it('clear(empty)', () => {
                queue.clear();
                equal(queue.size(), 0);
                equal(queue.isEmpty(), true);
            });

            it('clear', () => {
                queue.enqueue('a');
                queue.enqueue('b');
                queue.clear();
                equal(queue.size(), 0);
                equal(queue.isEmpty(), true);
            });

            it('clear again', () => {
                queue.clear();
                equal(queue.size(), 0);
                equal(queue.isEmpty(), true);
            });
        });

        it('性能测试', function () {
            const queueA = new Ctor();
            console.time('连续操作 10w 数据');
            for (let i = 0; i < 100000; i++) {
                queueA.enqueue('1');
                queueA.dequeue();
            }
            console.timeEnd('连续操作 10w 数据');

            const queueB = new Ctor();
            console.time('添加 10w 次数据，然后删除 10w 数据');
            for (let i = 0; i < 100000; i++) {
                queueB.enqueue('1');
            }
            for (let i = 0; i < 100000; i++) {
                queueB.dequeue();
            }
            console.timeEnd('添加 10w 次数据，然后删除 10w 数据');
        });
    });
    
}

step('ObjectQueue');
step('ArrayQueue');
