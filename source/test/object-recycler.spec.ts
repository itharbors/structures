'use strict';

import { equal } from 'assert';

import { ObjectRecycler } from '../object-recycler';

describe(`ObjectRecycler`, function () {

    describe('default', () => {

        it('acquireObject / releaseObject', function () {
            let ctorNum = 0;
            let initNum = 0;
            let destroyNum = 0;
            class Test {
                constructor() { ctorNum++; }
                initialize() { initNum++; }
                destroy() { destroyNum++; }
            }
            const recycler = new ObjectRecycler<Test>({
                generate() { return new Test(); }
            });

            const obj = recycler.acquireObject();
            equal(ctorNum, 1);
            equal(initNum, 1);
            equal(destroyNum, 0);

            recycler.recycleObject(obj);
            equal(ctorNum, 1);
            equal(initNum, 1);
            equal(destroyNum, 1);
        });

        it('acquireObject / releaseObject', function () {
            let ctorNum = 0;
            let initNum = 0;
            let destroyNum = 0;
            class Test {
                constructor() { ctorNum++; }
                initialize() { initNum++; }
                destroy() { destroyNum++; }
            }
            const recycler = new ObjectRecycler<Test>({
                generate() { return new Test(); }
            });

            const objA = recycler.acquireObject();
            equal(ctorNum, 1);
            equal(initNum, 1);
            equal(destroyNum, 0);

            const objB = recycler.acquireObject();
            equal(ctorNum, 2);
            equal(initNum, 2);
            equal(destroyNum, 0);

            recycler.recycleObject(objA);
            equal(ctorNum, 2);
            equal(initNum, 2);
            equal(destroyNum, 1);

            recycler.recycleObject(objA);
            equal(ctorNum, 2);
            equal(initNum, 2);
            equal(destroyNum, 2);

            recycler.recycleObject(objB);
            equal(ctorNum, 2);
            equal(initNum, 2);
            equal(destroyNum, 3);

            const objC = recycler.acquireObject();
            equal(ctorNum, 2);
            equal(initNum, 3);
            equal(destroyNum, 3);
            equal(objC, objB);

            const objD = recycler.acquireObject();
            equal(ctorNum, 2);
            equal(initNum, 4);
            equal(destroyNum, 3);
            equal(objD, objA);
        });
    });
});