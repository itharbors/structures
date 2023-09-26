'use strict';

import { equal, deepEqual } from 'assert';

import { TaskScheduler } from '../lib/task-scheduler';

describe(`TaskScheduler`, function () {

    describe('add', function () {

        it('添加一个任务', function () {
            const scheduler = new TaskScheduler();
            equal(scheduler.size, 0);

            scheduler.add('test', {
                depends: [],
                execute() {},
                revert() {},
            });
            equal(scheduler.size, 1);
        });

        it('重复添加任务', function () {
            const scheduler = new TaskScheduler();
            equal(scheduler.size, 0);

            scheduler.add('test1', {
                depends: [],
                execute() {},
                revert() {},
            });
            scheduler.add('test2', {
                depends: [],
                execute() {},
                revert() {},
            });
            equal(scheduler.size, 2);
        });

        it('添加相同的任务', function () {
            const scheduler = new TaskScheduler();
            equal(scheduler.size, 0);

            scheduler.add('test', {
                depends: [],
                execute() {},
                revert() {},
            });
            scheduler.add('test', {
                depends: [],
                execute() {},
                revert() {},
            });
            equal(scheduler.size, 1);
        });
    });

    describe('remove', function () {

        it('删除不存在的任务', function () {
            const scheduler = new TaskScheduler();
            scheduler.add('test', {
                depends: [],
                execute() {},
                revert() {},
            });
            equal(scheduler.size, 1);

            scheduler.remove('test1');
            equal(scheduler.size, 1);
        });

        it('删除存在的任务', function () {
            const scheduler = new TaskScheduler();
            scheduler.add('test1', {
                depends: [],
                execute() {},
                revert() {},
            });
            scheduler.add('test2', {
                depends: [],
                execute() {},
                revert() {},
            });
            equal(scheduler.size, 2);

            scheduler.remove('test1');
            equal(scheduler.size, 1);
        });

        it('添加后立即删除', function () {
            const scheduler = new TaskScheduler();
            scheduler.add('test', {
                depends: [],
                execute() {},
                revert() {},
            });
            equal(scheduler.size, 1);

            scheduler.remove('test');
            equal(scheduler.size, 0);
        });

        it('添加后延迟删除', async function () {
            const scheduler = new TaskScheduler();
            scheduler.add('test', {
                depends: [],
                execute() {},
                revert() {},
            });
            equal(scheduler.size, 1);

            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            });
            scheduler.remove('test');
            equal(scheduler.size, 0);
        });
    });

    describe('execute', function () {

        it('执行一个任务', function () {
            const scheduler = new TaskScheduler();
            let execNum = 0;
            let revertNum = 0;
            scheduler.add('test', {
                depends: [],
                execute() { execNum++; },
                revert() { revertNum++; },
            });

            scheduler.execute('test');
            equal(revertNum, 0);
            equal(execNum, 1);
        });

        it('执行任务后自动执行依赖任务', async function () {
            const scheduler = new TaskScheduler();
            const execList: string[] = [];
            const revertList: string[] = [];
            scheduler.add('a', {
                depends: [],
                execute() { execList.push('a'); },
                revert() { revertList.push('a'); },
            });
            scheduler.add('b', {
                depends: ['a'],
                execute() { execList.push('b'); },
                revert() { revertList.push('b'); },
            });
            scheduler.add('c', {
                depends: ['b'],
                execute() { execList.push('c'); },
                revert() { revertList.push('c'); },
            });
            scheduler.add('d', {
                depends: [],
                execute() { execList.push('d'); },
                revert() { revertList.push('d'); },
            });

            scheduler.execute('a');
            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            });

            deepEqual(execList, ['a', 'b', 'c']);
            deepEqual(revertList, []);
        });

        it('执行并行依赖', async function () {
            const scheduler = new TaskScheduler();
            const execList: string[] = [];
            const revertList: string[] = [];
            scheduler.add('a', {
                depends: [],
                execute() { execList.push('a'); },
                revert() { revertList.push('a'); },
            });
            scheduler.add('b', {
                depends: ['a'],
                execute() { execList.push('b'); },
                revert() { revertList.push('b'); },
            });
            scheduler.add('c', {
                depends: ['b'],
                execute() { execList.push('c'); },
                revert() { revertList.push('c'); },
            });
            scheduler.add('d', {
                depends: ['b'],
                execute() { execList.push('d'); },
                revert() { revertList.push('d'); },
            });

            scheduler.execute('a');
            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            });

            deepEqual(execList, ['a', 'b', 'c', 'd']);
            deepEqual(revertList, []);
        });
    });

    describe('revert', function () {

        it('撤销一个任务', function () {
            const scheduler = new TaskScheduler();
            let execNum = 0;
            let revertNum = 0;
            scheduler.add('test', {
                depends: [],
                execute() { execNum++; },
                revert() { revertNum++; },
            });

            scheduler.execute('test');
            equal(revertNum, 0);
            equal(execNum, 1);

            scheduler.revert('test');
            equal(revertNum, 1);
            equal(execNum, 1);
        });

        it('撤销任务的时候，连带撤销后续任务', async function () {
            const scheduler = new TaskScheduler();
            const execList: string[] = [];
            const revertList: string[] = [];
            scheduler.add('a', {
                depends: [],
                execute() { execList.push('a'); },
                revert() { revertList.push('a'); },
            });
            scheduler.add('b', {
                depends: ['a'],
                execute() { execList.push('b'); },
                revert() { revertList.push('b'); },
            });
            scheduler.add('c', {
                depends: ['b'],
                execute() { execList.push('c'); },
                revert() { revertList.push('c'); },
            });
            scheduler.add('d', {
                depends: ['b'],
                execute() { execList.push('d'); },
                revert() { revertList.push('d'); },
            });

            scheduler.execute('a');
            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            });
            scheduler.revert('a');
            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            });

            deepEqual(revertList, ['a', 'b', 'c', 'd']);
        });
    });
});