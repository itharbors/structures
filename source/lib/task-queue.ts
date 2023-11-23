'use strict';

import { EventEmitter } from './event';

type TaskOption = {
    name: string;
    maxConcurrent: number;
}

enum TaskManagerState {
    // 未启动
    idle,
    // 正常启动状态
    normal,
    // 暂停状态
    pause,
}

export class Task {
    // 每个任务的处理函数
    handle() {}
}

export class TaskManager extends EventEmitter<TaskEvents> {

    private pendingQueue = new Array<Task>;
    private executingQueue = new Set<Task>;
    private completedQueue = new Array<Task>;

    private state: TaskManagerState = TaskManagerState.idle;

    private options: TaskOption = {
        name: '',
        maxConcurrent: 1,
    };

    get name() {
        return this.options.name;
    }

    get progress() {
        const length = this.length;
        if (length === 0) {
            return length;
        }
        return this.completedQueue.length / length;
    }

    get length() {
        return this.pendingQueue.length + this.executingQueue.size + this.completedQueue.length;
    }

    constructor (options: TaskOption) {
        super();
        this.options = options || {};
    }

    private async step() {
        if (this.state !== TaskManagerState.normal) {
            return;
        }
        if (this.executingQueue.size >= this.options.maxConcurrent) {
            return;
        }
        const task = this.pendingQueue.shift();
        if (!task) {
            if (this.executingQueue.size === 0) {
                this.emit('finish');
            }
            return;
        }
        this.executingQueue.add(task);
        try {
            await task.handle();
        } catch(error) {
            this.emit('error', error);
        }
        this.executingQueue.delete(task);
        this.completedQueue.push(task);
        if (this.executingQueue.size < this.options.maxConcurrent) {
            this.step();
        }
    }

    /**
     * 开始执行任务队列
     */
    start() {
        if (this.state === TaskManagerState.normal) {
            return;
        }
        this.emit('start');
        this.state = TaskManagerState.normal;
        for (let i = 0; i < this.options.maxConcurrent; i++) {
            this.step();
        }
    }

    /**
     * 暂停后续任务
     */
    pause() {
        if (this.state === TaskManagerState.pause) {
            return;
        }
        this.emit('pause');
        this.state = TaskManagerState.pause;
    }

    /**
     * 重新开始暂停的队列
     */
    resume() {
        if (this.state !== TaskManagerState.pause) {
            return;
        }
        this.emit('resume');
        this.state = TaskManagerState.normal;
        for (let i = 0; i < this.options.maxConcurrent; i++) {
            this.step();
        }
    }

    /**
     * 插入子任务
     * @param task 
     */
    push(task: Task) {
        this.pendingQueue.push(task);
        this.step();
    }

    /**
     * 插入队列头部
     * @param task 
     */
    unshift(task: Task) {
        this.pendingQueue.unshift(task);
        this.step();
    }

    /**
     * 移除自任务
     * @param task 
     */
    remove(task: Task) {
        const index = this.pendingQueue.indexOf(task);
        if (index !== -1) {
            this.pendingQueue.splice(index, 1);
        }
    }

    /**
     * 循环等待队列
     * @param handle 
     */
    forEachPendingQueue(handle: (task: Task) => void) {
        this.pendingQueue.forEach(handle);
    }
}

type TaskEvents = {
    start: {
        params: [];
        result: void;
    };
    pause: {
        params: [];
        result: void;
    };
    resume: {
        params: [];
        result: void;
    };
    finish: {
        params: [];
        result: void;
    };
    error: {
        params: [
            any,
        ];
        result: void;
    };
}
