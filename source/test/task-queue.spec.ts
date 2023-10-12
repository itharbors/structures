'use strict';

import { equal } from 'assert';

import { TaskManager, Task } from '../lib/task-queue';

describe(`TaskManager`, function () {

    describe('base', () => {

        it('properties', function () {
            const manager = new TaskManager({
                name: 'test',
                maxConcurrent: 1,
            });
            equal(manager.name, 'test');
            equal(manager.length, 0);
            equal(manager.progress, 0);
        });

        it('准备任务队列', async function () {
            const manager = new TaskManager({
                name: 'test',
                maxConcurrent: 1,
            });
    
            let execTask = 0;
            let finishTask = 0;
            class TimeTask extends Task {
                t: number;
                constructor(t: number) {
                    super();
                    this.t = t;
                }
    
                handle() {
                    execTask++;
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            finishTask++;
                            resolve(void 0);
                        }, this.t);
                    });
                }
            }
            const tTaskA = new TimeTask(200);
            const tTaskB = new TimeTask(100);
            manager.push(tTaskA);
            equal(manager.progress, 0);
            equal(manager.length, 1);

            manager.push(tTaskB);
            equal(manager.progress, 0);
            equal(manager.length, 2);

            await new Promise((resolve) => {
                setTimeout(resolve, 200);
            });

            // 没有开始的情况下不会执行代码
            equal(manager.progress, 0);
            equal(manager.length, 2);
            equal(execTask, 0);
            equal(finishTask, 0);
        });

        it('执行任务', async () => {
            const manager = new TaskManager({
                name: 'test',
                maxConcurrent: 1,
            });
    
            let execTask = 0;
            let finishTask = 0;
            class TimeTask extends Task {
                t: number;
                constructor(t: number) {
                    super();
                    this.t = t;
                }
    
                handle() {
                    execTask++;
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            finishTask++;
                            resolve(void 0);
                        }, this.t);
                    });
                }
            }
            const tTaskA = new TimeTask(100);
            const tTaskB = new TimeTask(200);
            manager.push(tTaskA);
            manager.push(tTaskB);
            manager.start();

            equal(manager.progress, 0);
            equal(manager.length, 2);
            equal(execTask, 1);
            equal(finishTask, 0);

            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });

            equal(manager.length, 2);
            equal(execTask, 2);
            equal(finishTask, 1);
            equal(manager.progress, 0.5);
        });

        it('暂停 / 恢复任务', async () => {
            const manager = new TaskManager({
                name: 'test',
                maxConcurrent: 1,
            });
    
            let execTask = 0;
            let finishTask = 0;
            class TimeTask extends Task {
                t: number;
                constructor(t: number) {
                    super();
                    this.t = t;
                }
    
                handle() {
                    execTask++;
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            finishTask++;
                            resolve(void 0);
                        }, this.t);
                    });
                }
            }
            const tTaskA = new TimeTask(100);
            const tTaskB = new TimeTask(100);

            manager.push(tTaskA);
            manager.push(tTaskB);
            manager.start();
            manager.pause();
            equal(manager.progress, 0);
            equal(manager.length, 2);
            equal(execTask, 1);
            equal(finishTask, 0);

            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });
            equal(manager.progress, 0.5);
            equal(manager.length, 2);
            equal(execTask, 1);
            equal(finishTask, 1);

            manager.resume();
            equal(manager.progress, 0.5);
            equal(manager.length, 2);
            equal(execTask, 2);
            equal(finishTask, 1);

            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });

            equal(manager.progress, 1);
            equal(manager.length, 2);
            equal(execTask, 2);
            equal(finishTask, 2);
        });

        it('并行任务', async () => {
            const manager = new TaskManager({
                name: 'test',
                maxConcurrent: 2,
            });
    
            let execTask = 0;
            let finishTask = 0;
            class TimeTask extends Task {
                t: number;
                constructor(t: number) {
                    super();
                    this.t = t;
                }
    
                handle() {
                    execTask++;
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            finishTask++;
                            resolve(void 0);
                        }, this.t);
                    });
                }
            }
            const tTaskA = new TimeTask(100);
            const tTaskB = new TimeTask(100);
            const tTaskC = new TimeTask(100);

            manager.push(tTaskA);
            manager.push(tTaskB);
            manager.push(tTaskC);
            manager.start();
            equal(manager.progress, 0);
            equal(manager.length, 3);
            equal(execTask, 2);
            equal(finishTask, 0);

            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });
            equal(manager.progress, 2 / 3);
            equal(manager.length, 3);
            equal(execTask, 3);
            equal(finishTask, 2);

            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });

            equal(manager.progress, 1);
            equal(manager.length, 3);
            equal(execTask, 3);
            equal(finishTask, 3);
        });
    });
});