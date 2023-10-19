'use strict';

import { equal, deepEqual } from 'assert';

import { ActionQueue, Action, ActionList } from '../lib/action-queue';

describe(`UndoQueue`, function () {

    describe('base', () => {
        it('基础信息', () => {
            const execArray: string[] = [];
            class TestAction extends Action {
                exec(params: any) {
                    execArray.push(this.detail.id);
                }
                revertAction(): TestAction {
                    const uid = this.detail.id + '\'';
                    return this.target || new TestAction({ id: uid, });
                }
            }
            const manager = new ActionQueue({});
            equal(manager.length, 0);
            manager.exec(new TestAction({ id: `a`, }));
            equal(manager.length, 1);
            manager.exec(new TestAction({ id: `b`, }));
            equal(manager.length, 2);
            deepEqual(manager.queue.map(action => action.detail.id), [`a`, `b`]);
        });
    });

    describe('undo / redo', () => {   

        const TestList: {
            source: string[],
            action: ('undo' | 'redo')[],
            result: string[],
        }[] = [
            {
                source: [],
                action: [`undo`],
                result: [],
            },
            {
                source: [],
                action: [`redo`],
                result: [],
            },
            {
                source: [`a`],
                action: [`undo`],
                result: [`a`, `a'`],
            },
            {
                source: [`a`],
                action: [`redo`],
                result: [`a`],
            },

            {
                source: [`a`, `b`],
                action: [`undo`, `undo`],
                result: [`a`, `b`, `b'`, `a'`],
            },
            {
                source: [`a`, `b`],
                action: [`undo`, `redo`],
                result: [`a`, `b`, `b'`, `b`],
            },
            {
                source: [`a`, `b`],
                action: [`undo`, `redo`, `redo`],
                result: [`a`, `b`, `b'`, `b`],
            },
            {
                source: [`a`, `b`],
                action: [`undo`, `redo`, `undo`],
                result: [`a`, `b`, `b'`, `b`, `b'`],
            },
            {
                source: [`a`, `b`],
                action: [`undo`, `undo`, `redo`, `redo`],
                result: [`a`, `b`, `b'`, `a'`, `a`, `b`],
            },
            {
                source: [`a`, `b`],
                action: [`undo`, `undo`, `redo`, `undo`, `redo`],
                result: [`a`, `b`, `b'`, `a'`, `a`, `a'`, `a`],
            },
            {
                source: [`a`, `b`],
                action: [`undo`, `undo`, `redo`, `undo`, `redo`, `redo`],
                result: [`a`, `b`, `b'`, `a'`, `a`, `a'`, `a`],
            },
            {
                source: [`a`, `b`],
                action: [`undo`, `undo`, `redo`, `undo`, `undo`],
                result: [`a`, `b`, `b'`, `a'`, `a`, `a'`],
            },
        ];

        TestList.forEach((item) => {
            it(`${JSON.stringify(item.source)} -> ${item.action + ''} -> ${JSON.stringify(item.result)}`, () => {
                const execArray: string[] = [];
                class TestAction extends Action {
                    exec(params: any) {
                        execArray.push(this.detail.id);
                    }
                    revertAction(): TestAction {
                        const uid = this.detail.id + '\'';
                        return this.target || new TestAction({ id: uid, });
                    }
                }
                const manager = new ActionQueue({});
                item.source.forEach((id) => {
                    manager.exec(new TestAction({ id, }));
                });
                item.action.forEach((action) => {
                    manager[action]();
                });
                const idArray = manager.queue.map(action => action.detail.id);
                deepEqual(idArray, item.result);
                deepEqual(execArray, item.result);
            });
        });
    });

    describe('ActionList', () => {
        const TestList: {
            source: string[][],
            action: ('undo' | 'redo')[],
            result: string[],
        }[] = [
            {
                source: [],
                action: [`undo`],
                result: [],
            },
            {
                source: [],
                action: [`redo`],
                result: [],
            },
            {
                source: [[`a`, `b`]],
                action: [],
                result: [`a`, `b`],
            },
            {
                source: [[`a`, `b`]],
                action: [`undo`],
                result: [`a`, `b`, `b'`, `a'`],
            },
            {
                source: [[`a`, `b`]],
                action: [`undo`, `redo`],
                result: [`a`, `b`, `b'`, `a'`, `a`, `b`],
            },
            {
                source: [[`a`, `b`], [`c`, `d`]],
                action: [],
                result: [`a`, `b`, `c`, `d`],
            },
            {
                source: [[`a`, `b`], [`c`, `d`]],
                action: [`undo`, `undo`, `redo`],
                result: [`a`, `b`, `c`, `d`, `d'`, `c'`, `b'`, `a'`, `a`, `b`],
            },
        ];

        TestList.forEach((item) => {
            it(`${JSON.stringify(item.source)} -> ${item.action + ''} -> ${JSON.stringify(item.result)}`, async () => {
                const execArray: string[] = [];
                class TestAction extends Action {
                    exec(params: any) {
                        execArray.push(this.detail.id);
                    }
                    revertAction(): TestAction {
                        const uid = this.detail.id + '\'';
                        return this.target || new TestAction({ id: uid, });
                    }
                }
                const manager = new ActionQueue({});
                for (let IDList of item.source) {
                    const action = new ActionList({
                        queue: IDList.map(id => new TestAction({ id, })),
                    });
                    await manager.exec(action);
                }
                for (let action of item.action) {
                    await manager[action]();
                }
                deepEqual(execArray, item.result);
            });
        });
    });
});