'use strict';

class Task {

    // 该任务的名字
    name: string;
    // 该任务是否已经执行过
    executed: boolean = false;
    // 该任务是否正在执行
    running: boolean = false;
    // 配置
    option: TaskOption;

    constructor(name: string, option: TaskOption) {
        this.option = option || {};
        // 该任务的名字
        this.name = name;
    }
}

interface TaskOption {
    // 该任务依赖的任务队列
    depends: string[];
    // 任务实际处理的函数
    execute(): void;
    // 任务重置过程中的还原操作函数
    revert(): void;
}

export class TaskScheduler {

    get size() {
        return Object.keys(this.name2item).length;
    }

    name2item: { [key: string]: Task } = {};
    depend2item: { [key: string]: Task[] } = {};

    /**
     * 添加一个任务
     * @param name 
     * @param option 
     */
    add(name: string, option: TaskOption) {
        const item = this.name2item[name] = new Task(name, option);

        if (item.option.depends) {
            item.option.depends.forEach((name) => {
                const array = this.depend2item[name] = this.depend2item[name] || [];
                array.push(item);
            });
        }
    }

    /**
     * 移出一个任务
     * @param name 
     */
    remove(name: string) {
        const item = this.name2item[name];
        if (!item) {
            return;
        }

        delete this.name2item[name];
        if (item.option.depends) {
            item.option.depends.forEach((name) => {
                const array = this.depend2item[name];
                const index = array.indexOf(item);
                array.splice(index, 1);
                if (!array.length) {
                    delete this.depend2item[name];
                }
            });
        }
    }

    /**
     * 执行某个任务
     * @param name 
     */
    async execute(name: string) {
        const item = this.name2item[name];
        if (!item) {
            console.warn(`Task execution failed: '${name}' does not exist.`);
            return null;
        }

        // 检查依赖是否都运行
        const refused = item.option.depends.some((name) => {
            const depend = this.name2item[name];
            return !depend.executed;
        });

        if (refused) {
            console.warn(`Task execution failed: '${name}' dependencies are not completed.`);
            return null;
        }

        if (!item.executed && !item.running) {
            item.running = true;
            const result = await item.option.execute();
            item.running = false;
            item.executed = true;

            // 任务执行完毕之后，执行依赖这个任务的其他任务
            const depends = this.depend2item[name] || [];

            for (let i = 0; i < depends.length; i++) {
                const child = depends[i];

                // 检查依赖这个任务的某个任务是否达到了执行标准
                const allow = !child.option.depends.some((name) => {
                    return !this.name2item[name] || !this.name2item[name].executed;
                });
                
                if (allow) {
                    this.execute(child.name);
                }
            }

            return result;
        }

        return null;
    }

    /**
     * 重置一个任务的标记
     * 会将依赖该任务的其他任务也一并重制
     * @param name 
     */
    async revert(name: string) {
        const item = this.name2item[name];
        if (!item) {
            return;
        }
        await item.option.revert();
        item.executed = false;
        item.running = false;

        const depends = this.depend2item[name] || [];

        for (let i = 0; i < depends.length; i++) {
            const child = depends[i];
            this.revert(child.name);
        }
    }
}
