'use strict';

/**
 * Action 抽象类
 * 用于执行一个既定动作
 */
export abstract class Action<Detail = { [key: string]: any }> {
    target?: Action;
    detail: Detail;
    constructor(detail: Detail, action?: Action) {
        this.detail = detail;
        this.target = action;
    }
    /**
     * 执行这个动作
     */
    abstract exec(): void;
    /**
     * 生成一个反向动作
     */
    abstract revertAction(): Action;
}

/**
 * 多个 Action 合并成一个 List
 */
export class ActionList extends Action<{
    queue: Action[];
}> {
    async exec() {
        for (let action of this.detail.queue) {
            await action.exec();
        }
    }
    revertAction(): ActionList {
        const queue = [];
        for (let i = this.detail.queue.length - 1; i >= 0; i--) {
            const action = this.detail.queue[i];
            queue.push(action.revertAction());
        }
        return new ActionList({
            queue,
        }, this);
    }
}

/**
 * Action 队列
 */
export class ActionQueue {

    private redoOffset = 0;

    public queue: Action[] = [];

    get length() {
        return this.queue.length;
    }

    /**
     * 记录一个操作
     * @param action 
     */
    async exec(action: Action) {
        this.queue.push(action);
        this.redoOffset = 0;
        await action.exec();
    }

    /**
     * 执行一次撤销
     */
    async undo() {
        const setter = new Set();
        let undoAction: Action | undefined;

        for (let i = this.queue.length - 1; i >= 0; i--) {
            const action = this.queue[i];
            if (action.target) {
                setter.add(action.target);
            } else if (!setter.has(action)) {
                undoAction = action;
                break;
            }
        }

        if (undoAction) {
            const redoAction = undoAction.target || undoAction.revertAction();
            this.queue.push(redoAction);
            redoAction.exec();
        }

        this.redoOffset = 0;
    }

    /**
     * 执行一次重做
     */
    async redo() {
        const action = this.queue[this.queue.length - 1 - this.redoOffset];
        if (action && action.target) {
            const execAction = action.target || action.revertAction();
            this.queue.push(execAction);
            execAction.exec();
            this.redoOffset += 2;
        }
    }
}
