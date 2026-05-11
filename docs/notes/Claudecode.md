---
title: Claude Code
date: 2026-05-11
tags:
  - AI 工具
  - Claude Code
summary: 记录 Claude Code 接入 DeepSeek 以节省 token 成本的参考资料与实践入口。
---

# Claude code

### claude code接入deepseek节省token的方式  

[高手进阶 成本优化篇：Claude Code 配 DeepSeek 几天就烧完余额？Token 消耗拆解 + 六步省费法，月账单从 300 压到 30_java使用claudecode加deepseek 一个月使用消耗大概多少钱-CSDN博客](https://blog.csdn.net/weixin_63132747/article/details/160767863)



## claude code 常用指令

按**shift+tab** 

切换模式（Normal → Auto-accept → Plan）

- Normal:在每次操作之前都需要询问你是否同意
- Auto-accept:全自动（一些高危操作会询问）
- Plan:只列计划不执行操作



/compact  提炼并压缩上下文

/clear 清空上下文

当上下文窗口占用超过50%的时候，cc的执行质量就会降低



查看聊天记录列表  /resume

Esc+Esc   或   /rewind   回退对话或代码