'use strict';

/**
 * 对象回收池
 */
export class ObjectRecycler<T extends { initialize(): void, destroy?(): void}> {

    objectPool: T[] = [];

    option: {
        generate(): T,
    };

    constructor(
        option: {
            generate(): T,
        }
    ) {
        this.option = option;
    }
  
    /**
     * 从对象池获取对象
     * @returns 
     */
    acquireObject(): T {
        if (this.objectPool.length > 0) {
            const object = this.objectPool.pop()!;
            // 重新初始化对象
            object.initialize();
            return object;
        } else {
            // 如果对象池为空，创建一个新对象并初始化
            const obj = this.option.generate();
            obj.initialize();
            return obj;
        }
    }
  
    /**
     * 回收对象到对象池
     * @param object 
     */
    recycleObject(object: T) {
        // 执行销毁操作，如果需要的话
        if (object.destroy) {
            object.destroy();
        }
        
        // 放入对象池
        const index = this.objectPool.indexOf(object);
        if (index === -1) {
            this.objectPool.push(object);
        }
    }
}
