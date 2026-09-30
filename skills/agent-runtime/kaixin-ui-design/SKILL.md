---
name: kaixin-ui-design
title: "开心智课 UI 设计"
description: "为开心智课生成或修改网页、互动课件和 PPT 时，统一使用品牌 Logo、浅色教学界面、清新天真的视觉语言与横竖屏布局。Use when creating, reviewing, regenerating, exporting, or styling 开心智课 web courseware or presentation slides."
---

# 开心智课 UI 设计

目标不是做通用 SaaS 页面，而是做一套让老师、学生都能一眼认出“开心智课”的教学界面：
明亮、轻松、清楚、有一点天真感，但不能花、不能拥挤、不能像 AI 自动拼出来的模板。

## 必须使用的品牌资产

运行时资产：

- `public/brand/kaixin/logo-horizontal.png`
- `public/brand/kaixin/mark.png`
- `public/brand/kaixin/ui/brand-corner.svg`
- `public/brand/kaixin/ui/web-landscape.png`
- `public/brand/kaixin/ui/web-portrait.png`
- `public/brand/kaixin/ui/ppt-slide.png`

角色（吉祥物 / 引导角色）：

- `public/brand/kaixin/avatars/assistant.webp`（开心小助手）
- `public/brand/kaixin/avatars/student-girl.webp` / `student-boy.webp` / `student-boy-glasses.webp`
- `public/brand/kaixin/avatars/teacher-female.webp` / `teacher-male.webp`

技能内可随包分发：

- `assets/brand-corner.svg`
- `assets/logo-horizontal.png`
- `assets/mark.png`
- `assets/web-landscape.svg`
- `assets/web-portrait.svg`
- `assets/ppt-slide.svg`

网页和 PPT 都必须带品牌标识。网页优先放 `brand-corner.svg`；PPT 每页右上角放同一标识或原 Logo。禁止改色、拉伸、裁切 Logo，也不要用文字临时仿造 Logo。

## 平台已注入的品牌角标（不要重复画）

- **交互页（H5 / 互动网页）**：页面渲染与导出时，平台会**自动**在左下角注入品牌角标——
  官方「开心」圆形 mark + 吉祥物「开心小助手」+ 文字「开心智课」，带
  `data-anchor="brand.corner"`，定位 `left:12px; bottom:12px`，约 132×38，且不可点击
  （见 `lib/interactive-site/brand-shell.ts`）。
  所以：**不要**自己再画 logo、加水印、重复写「开心智课」字样，也**不要**在左下角
  `150×52` 区域内放任何可点元素或重要文字。
- **幻灯片**：播放器与课件库封面由平台叠加同一角标；导出 PPTX 时每页右上角由导出器盖章
  （见 `lib/export/use-export-pptx.ts`），模型不需要也不应该在幻灯片内容里再放一个。
- **引导角色**（`coach.avatar`）用系统 emoji 或纯 CSS 绘制即可；需要角色图时只用上面的
  品牌角色素材，不要引用任何外链图片——离线导出的 CSP 不允许外部请求。

## 参考文件

- `references/h5-page-spec.md`：**交互 H5（「交互程序」模式）的完整生成契约**——设计令牌实测值、
  固定 6 区页面骨架、`data-anchor` / `data-role` 寻址契约（AI 二次修改的唯一入口）、
  支持的题型与明确排除项、小学生适配硬规则、平台发布契约。
  **生成或修改单页交互 H5 之前必须先读它。**
- `motion-and-canvas` 技能：需要 timeline 动效或 Canvas/WebGL 特效时读它——那里写清了
  哪些能力可用、在什么场合可用，以及与本文（零外部请求、禁 WebGL、克制动效）的边界。

## 视觉方向

- 背景使用白色、天空蓝 `#B2E6FD`、浅蓝 `#EAF7FE`、奶油白 `#FDF6EA`。
- 正文与标题使用深海军蓝 `#00214E`，辅助文字使用低对比灰蓝。
- 品牌红 `#D60010` 只用于 Logo、关键按钮、当前进度和重点强调。
- 暖木色 `#F5CC9C` 只做少量学习场景点缀。
- 中文正文优先使用 `Noto Sans SC`，展示标题可少量使用 `LXGW WenKai`。
- 卡片圆角保持 16-24px，阴影轻，边框细；不要所有内容都套卡片。
- 天真感来自颜色、圆润图标、轻微手绘星星和简短鼓励语，不来自过量动画。
- 默认浅色界面。不得生成黑底、深灰底、暗黑科技风或大面积黑色控制台。

## 网页布局

横屏网页参考 `assets/web-landscape.svg`：

1. 顶部保留 Logo、返回、课程名、进度和设置。
2. 左侧目录为白色或浅蓝底，首次进入默认展开。
3. 正文以一个大内容画布为主，不堆满卡片。
4. 教师提示靠近主要内容，但不得覆盖互动区。
5. 一个页面只放一个主要互动和一段简短总结。

竖屏网页参考 `assets/web-portrait.svg`：

1. 顶部压缩为品牌、进度和目录按钮。
2. 教师提示、正文、互动、反馈依次单列排列。
3. 底部操作区使用 sticky，并处理安全区域。
4. 不横向滚动，不把桌面双栏直接缩小。

横竖屏必须共用同一页面状态。方向切换时不能重载 iframe，不能丢失答案、步骤和滚动位置。

## PPT 设计

参考 `assets/ppt-slide.png`：

1. 保持 16:9，建议 1600x900 逻辑尺寸。
2. 每页只讲一个主要知识点或一个题目。
3. 左上或右上固定放置开心智课 Logo 或 `brand-corner.svg`。
4. 标题使用深海军蓝，关键词才使用品牌红。
5. 内容最多分为两个视觉区，避免三列以上的小卡片。
6. 图表、实验图或角色图占主视觉，正文只保留必要结论。
7. 封面使用浅蓝背景和大标题；内容页使用白色或浅蓝画布；总结页可用奶油白。
8. 不使用黑底白字作为默认封面或章节页。

## 互动与动效

- 互动控件必须有真实反馈，按钮不能只是装饰。
- 动画只用于教学变化、答题反馈、拖拽吸附、图表变化和步骤切换。
- 禁止全屏 fade、逐块 slide-up、漂浮卡片、无限 pulse、光晕和随机粒子。
- 支持 `prefers-reduced-motion`。
- 互动内容允许嵌入视频、GIF、SVG、Canvas 或 Lottie，但必须服务教学目标，并默认允许暂停。

## 生成约束

- 生成互动网页时，先套开心智课 shell，再填充内容。
- 生成 PPT 时，先套开心智课页面框架，再填写标题、正文、图表或题目。
- 不自行发明品牌色、Logo、导航和按钮样式。
- 不从外部项目复制 UI；参考只能是设计方法，不能复制其品牌或素材。
- 页面导出后必须继续显示 Logo、色彩、目录、横竖屏布局和编辑补丁。
- 遇到资产无法加载时，使用同目录 Logo 回退；不要显示破图或远程占位图。

## 完成前检查

1. 网页和 PPT 都含开心智课 Logo 或 `brand-corner.svg`。
2. 页面为浅色，未出现默认黑底。
3. 一页只有一个主要互动，内容不拥挤。
4. 横屏和竖屏都能正常使用。
5. Logo 未变形，品牌红未滥用。
6. 教学动画清晰，装饰动画已移除。
7. 导出文件中品牌资产仍然可用。
