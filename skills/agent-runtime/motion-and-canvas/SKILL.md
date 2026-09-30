---
name: motion-and-canvas
title: "动效与 Canvas 特效（GSAP / canvas-ui）"
description: "需要更强的动效或 Canvas/WebGL 特效时用这个技能：它说明哪些能力可用、在什么场合可用，以及与开心 K12 契约（零外部请求、禁 WebGL、克制的动效）的边界。Use when a page needs timeline-driven motion, scroll-linked animation, or a WebGL/WebGPU canvas effect."
---

# 动效与 Canvas 特效：能力与边界

这份技能不是教程，是**边界**。它把两套外部能力（GSAP 动效、canvas-ui 的 WebGL/WebGPU 特效）
接到开心智课现有的规范上，说清"什么时候能用、什么时候不能"，避免它们和 K12 契约打架。

具体怎么写 GSAP / 怎么调 canvas-ui 的组件，读对应的技能：

- GSAP 官方技能：`gsap-core`、`gsap-timeline`、`gsap-scrolltrigger`、`gsap-plugins`、
  `gsap-utils`、`gsap-react`、`gsap-performance`、`gsap-frameworks`（GreenSock 官方仓库
  `greensock/gsap-skills`）。
- Canvas 特效：`canvas-ui-design`（封装 DavidHDev/canvas-ui 的 WebGL/WebGPU 效果组件，
  支持 React / Solid / Preact / Vue / Svelte / vanilla）。

## 一句话边界

| 场景 | GSAP | canvas-ui（WebGL/WebGPU） |
|---|---|---|
| 开心 K12 课件（讲解视频 / 互动网页 / 交互程序） | 仅当**能内联**且确有timeline需求 | **禁止**（K12 契约明令排除 3D 与 WebGL） |
| 非 K12 的演示页、实验页、老师自己要的视觉demo | 可以 | 可以 |
| 老师明确要求"要一个 WebGL/粒子/3D 效果" | — | 可以，但只用来做那一页 |

## 三条硬约束（任何场景都不放宽）

1. **零外部请求**。K12 契约要求产物自包含（平台 CSP `default-src 'self'`，离线导出更严）。
   所以 GSAP **不能**用 `<script src="https://cdn…">`——必须内联。cdnjs/unpkg 这类外链在
   我们这里等于"页面上线后随机挂掉"。要用就先把库内联进页面（大约 70KB），并在交付说明里
   写明体积代价。
2. **`prefers-reduced-motion` 优先**。这是 K12 契约的既有条款，任何动效库都不得绕过：
   用户开了减少动效，就不许有位移与缩放。
3. **动效服务教学，不做装饰**。这条不因换了库而改变：GSAP 让"教学变化"更容易表达
   （状态机、时间线、序列），不是让页面更花。全屏 fade、漂浮卡片、无限 pulse、
   随机粒子，用 GSAP 实现出来仍然是禁止项。

## 什么时候值得上 GSAP

值得：

- 一页里有**多步序列**且要能暂停/回放（实验步骤、解题过程、时间轴讲解）；
- 动画要**跟着滚动**或跟着某个滑块精确映射（`gsap-scrolltrigger`）；
- 同一元素上叠加多个属性的编排，用 WAAPI/CSS 写起来会变成一堆 `setTimeout`。

不值得（用 CSS/WAAPI 就够，别引入 70KB）：

- 按钮按下反馈、元素出现、进度条增长这类一次性短动画；
- 纯静态页面的"更好看"。

## 与 canvas-ui 的关系

canvas-ui 给的是**视觉特效组件**（WebGL/WebGPU shader 类效果）。它们和 K12 的浅色教学界面
不是一套语言，所以：

- 不要把它们用在 K12 课件的骨架或题型区里（会同时踩"禁 WebGL"和"配色只用 4 个色"两条）；
- 用在**演示页 / 实验页 / 老师点名的视觉demo**里是合适的，但同样要满足上面三条硬约束：
  自包含、尊重 `prefers-reduced-motion`（WebGL 动效的降级要显式写）、不喧宾夺主。

## 交付前自查

1. 产物里没有任何外部请求（`<script src>`、`<link href>`、`url(https://…)`、字体外链）。
2. `@media (prefers-reduced-motion: reduce)` 下没有位移/缩放。
3. 用的是哪套能力、为什么用它（timeline/scroll 需求？还是仅仅好看），说得出来。
4. 不用 GSAP 也能达成时，就别用。
