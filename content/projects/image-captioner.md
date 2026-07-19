---
title: 用 AI 做的图片描述生成器
description: 让 AI 看图说话的工具,上传图片即可生成中英文描述。
date: 2026-07-10
tags:
  - AI
  - 视觉
  - 工具
cover: /next.svg
demo: https://example.com/demo
source: https://github.com/yourname/img-caption
featured: true
---

## 这个项目是什么

这是一个用 AI 模型给图片自动生成描述的小工具。最初是想给自己整理照片时省点打字的时间,后来发现拿来给网页做 alt 文本也很合适。

## 我用了什么

- 一个多模态大模型(看图 + 生成文本)
- 前端用 Next.js,拖拽上传
- 描述可以一键复制,支持中英双语

## 过程里踩的坑

模型对中文标点经常漏掉,后处理加了一道正则补全才稳定。

> 整个项目从想法到上线大概花了一个下午,大部分代码是和 AI 一起写出来的。
