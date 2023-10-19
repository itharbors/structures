'use strict';

/**
 * Action 抽象类
 * 用于执行一个既定动作
 */
export abstract class Action<Detail = { [key: string]: any }, ExecParams = any> {
    target?: Action;
    detail: Detail;
    constructor(detail: Detail, action?: Action) {
        this.detail = detail;
        this.target = action;
    }
    /**
     * 执行这个动作
     */
    abstract exec(params: ExecParams): void;
    /**
     * 生成一个反向动作
     */
    abstract revertAction(): Action;
}

/**
 * 多个 Action 合并成一个 List
 */
export class ActionList<Params = any> extends Action<{
    queue: Action[];
}, Params> {
    async exec(params: Params) {
        for (let action of this.detail.queue) {
            await action.exec(params);
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

enum ActionQueueState {
    normal,
    record,
}

/**
 * Action 队列
 */
export class ActionQueue<D> {

    private _redoOffset = 0;
    // action 队列
    private _queue: Action[] = [];

    private _state: ActionQueueState = ActionQueueState.normal;
    private _recordActionList: Action[] = [];

    get queue() {
        return this._queue;
    }

    get length() {
        return this._queue.length;
    }

    public _params: D;

    constructor(params: D) {
        this._params = params;
    }

    /**
     * 开始记录 action 队列
     */
    startRecording() {
        if (this._state === ActionQueueState.record) {
            this.stopRecording();
        }
        this._state = ActionQueueState.record;
    }

    /**
     * 结束记录 action 队列，将之前记录的动作全部插入到一个动作里
     */
    stopRecording() {
        if (this._recordActionList.length > 0) {
            this._queue.push(new ActionList({
                queue: this._recordActionList,
            }));
            this._recordActionList = [];
        }
        this._state = ActionQueueState.normal;
    }

    /**
     * 记录一个操作
     * @param action 
     */
    async exec(action: Action) {
        if (this._state === ActionQueueState.record) {
            this._recordActionList.push(action);
        } else {
            this._queue.push(action);
        }
        this._redoOffset = 0;
        await action.exec(this._params);
    }

    /**
     * 执行一次撤销
     */
    async undo() {
        if (this._state === ActionQueueState.record) {
            this.stopRecording();
        }
        const setter = new Set();
        let undoAction: Action | undefined;

        for (let i = this._queue.length - 1; i >= 0; i--) {
            const action = this._queue[i];
            if (action.target) {
                setter.add(action.target);
            } else if (!setter.has(action)) {
                undoAction = action;
                break;
            }
        }

        if (undoAction) {
            let redoAction = undoAction.target;
            if (!redoAction) {
                redoAction = undoAction.revertAction();
                redoAction.target = undoAction;
            }
            this._queue.push(redoAction);
            redoAction.exec(this._params);
        }

        this._redoOffset = 0;
    }

    /**
     * 执行一次重做
     */
    async redo() {
        if (this._state === ActionQueueState.record) {
            this.stopRecording();
        }
        const action = this._queue[this._queue.length - 1 - this._redoOffset];
        if (action && action.target) {
            let execAction = action.target;
            if (!execAction) {
                execAction = action.revertAction();
                execAction.target = action;
            }
            this._queue.push(execAction);
            execAction.exec(this._params);
            this._redoOffset += 2;
        }
    }
}
