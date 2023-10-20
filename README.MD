# Structures

常用数据结构和小工具

[![NPM](https://img.shields.io/npm/v/@itharbors/structures)](https://www.npmjs.com/package/@itharbors/structures)
[![CI Status](https://github.com/itharbors/structures/actions/workflows/ci.yaml/badge.svg)](https://github.com/itharbors/structures/actions/workflows/ci.yaml)

## 对象列表

- event
- object-recycler
- queue
- task-scheduler
- task-queue
- undo-queue

## undo-queue

一个通用的 UNDO 队列管理工具。满足：

1. 队列只增不减
2. 数据驱动
3. 能够自生成反向操作

例如：

a->b->c 三个操作后，执行 undo，队列变为 a->b->c->c'，这时候继续 undo，队列变为 a->b->c->c'->b'。

这之后就有两个分支，一个是执行了新的操作，另一个是执行了重做。

我们先看执行了新的操作的情况：

a->b->c->c'->b'->d 等效于 a->d

再看执行了重做的情况:

a->b->c->c'->b'->b'' 等效于 a->b
