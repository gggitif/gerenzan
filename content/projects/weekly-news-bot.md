---
title: AI 周报整理机器人
description: 自动抓取一周技术新闻,用 AI 总结成一份邮件周报。
date: 2026-06-28
tags:
  - AI
  - 自动化
  - 脚本
demo: https://example.com/newsbot
source: https://github.com/yourname/newsbot
featured: true
---

## 起因

每周五看完一堆 RSS 都要花一个多小时整理,干脆让 AI 干。

## 怎么跑的

1. 定时任务拉各个 RSS 源
2. 把内容喂给模型让它抽取要点
3. 模板渲染成 HTML 邮件发出

## 效果

省下来的时间拿来摸鱼了。

> 一开始总结总是太长,后来在 prompt 里加了「每条不超过两句话」就乖了。
