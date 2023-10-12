'use strict';

import { equal, deepEqual } from 'assert';

import { UndoQueue, UndoAction } from '../lib/undo-queue';

describe(`UndoQueue`, function () {

    describe('base', () => {
        it('基础信息', () => {
            const recordArray: string[] = [];
            class TestUndoAction extends UndoAction {
                exec(): TestUndoAction {
                    recordArray.push(this.detail.id);
                    const uid = this.detail.id + '\'';
                    return this.target || new TestUndoAction({ id: uid, }, this);
                }
            }
            const manager = new UndoQueue();
            equal(manager.length, 0);
            manager.record(new TestUndoAction({ id: `a`, }));
            equal(manager.length, 1);
            manager.record(new TestUndoAction({ id: `b`, }));
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
                const recordArray: string[] = [];
                class TestUndoAction extends UndoAction {
                    exec(): TestUndoAction {
                        recordArray.push(this.detail.id);
                        const uid = this.detail.id + '\'';
                        return this.target || new TestUndoAction({ id: uid, }, this);
                    }
                }
                const manager = new UndoQueue();
                item.source.forEach((id) => {
                    manager.record(new TestUndoAction({ id, }));
                });
                item.action.forEach((action) => {
                    manager[action]();
                });
                deepEqual(manager.queue.map(action => action.detail.id), item.result);
            });
        });
    });

});