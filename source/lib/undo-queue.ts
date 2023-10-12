'use strict';

export abstract class UndoAction<Detail = { [key: string]: any }> {
    // 生成这个 action 的 action
    target?: UndoAction;

    detail: Detail;

    constructor(detail: Detail, action?: UndoAction) {
        this.target = action;
        this.detail = detail;
    }
    abstract exec(): UndoAction;
}

export class UndoQueue {

    private redoOffset = 0;

    public queue: UndoAction[] = [];

    get length() {
        return this.queue.length;
    }

    /**
     * 记录一个操作
     * @param action 
     */
    record(action: UndoAction) {
        this.queue.push(action);
        this.redoOffset = 0;
    }

    /**
     * 执行一次撤销
     */
    undo() {
        const setter = new Set();
        let undoAction: UndoAction | undefined;

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
            const redoAction = undoAction.exec();
            this.queue.push(redoAction);
        }

        this.redoOffset = 0;
    }

    /**
     * 执行一次重做
     */
    redo() {
        const action = this.queue[this.queue.length - 1 - this.redoOffset];
        if (action && action.target) {
            const execAction = action.exec();
            this.queue.push(execAction);
            this.redoOffset += 2;
        }
    }
}
