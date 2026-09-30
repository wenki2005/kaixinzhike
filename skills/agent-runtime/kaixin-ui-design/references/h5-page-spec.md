# 开心 K12 交互 H5 规格（交互程序模式）

本文是「交互程序」模式的生成契约。来源：`D:\work` 下 20+ 个交互 H5 项目的实测考古 +
`D:\类openmaic\UI视觉图` 设计稿的像素采样。**设计令牌以设计稿为准，不要抄 D:\work 各 demo 的色板**
（实测：`#B2E6FD/#00214E/#D60010/#F5CC9C` 在 `D:\work` 全部源码里 **grep 零命中**，每个 demo 各写各的，
且多数是被用户判为"偏素"的淡彩）。

---

## 1. 定位

- **产物**：一个能直接打开就玩的单文件 `index.html`。不是整门课，不是多页课件。
- **与「互动网页」的关系**：共用同一条交互生成管线，唯一差别是页数约束（只做一页）。
- **必须可被 AI 二次修改**：靠第 3 节的寻址契约实现，锚点是硬要求。

## 2. 视觉令牌（实测值）

| 令牌 | 值 | 用途 |
|---|---|---|
| 天空蓝 | `#B2E6FD` | 页面底色（设计稿通道差 0，精确命中） |
| 暖木色 | `#F5CC9C` | 辅助底/装饰，可降透明度（占设计稿底色 12–40%） |
| 深海军蓝 | `#00214E` | 正文与标题墨色 |
| 品牌红 | `#D60010` | **唯一点缀色**与主按钮 |
| 派生 | `--red-dark:#A8000C`、`--wood-dark:#D9A96A` | 主按钮底边、进度填充 |

- 圆角：卡片 24px；按钮/胶囊 999px 或 14px。
- 阴影：只用低透明度深蓝，如 `0 8px 20px rgba(0,33,78,.14)`。
- 字体：**只用系统字体栈** `"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",system-ui`。
  **禁止 `@font-face`、禁止外链字体**——平台 CSP 是 `default-src 'self'`。
- 字号：标题 `clamp(24px,6.4vw,32px)`；正文 `clamp(17px,4.4vw,20px)`；**最小不低于 13px**。
  （实测现状：多个 demo 的装饰小字低到 5–6px，这类小字**不进契约**。）
- 用户明确要求**高饱和、色彩鲜艳**；现有 demo 的淡彩是被判"偏素"的反例。
- 禁止：暗色底、纯黑、霓虹发光、密集渐变、超过 4 个主色。

## 3. 寻址契约（AI 二次修改的唯一入口）

| 属性 | 语义 | 示例 |
|---|---|---|
| `data-demo-id` | 页面稳定 id，**生成后永不改** | `demo-word-sort-001` |
| `data-form` | 题型枚举，决定 `stage` 插槽内容 | `choice`/`sort`/`builder`/`lab`/`reveal` |
| `data-block` | 语义区域（**固定 6 区**） | `topbar`/`heading`/`stage`/`coach`/`actions`/`result` |
| `data-anchor` | **全局唯一、稳定、可读**，AI patch 的唯一入口 | `task.option.a`、`actions.submit` |
| `data-editable` | 该锚点允许改的类型 | `text`/`image`/`choice` |
| `data-action` | 行为，由根节点**唯一事件代理**消费 | `choose`/`submit`/`restart` |
| `data-role` | 运行时会写入内容的节点 | `progress-fill`/`flash`/`stat-correct` |

规则：
1. **每个用户可见或可点的元素都必须有 `data-anchor`**；缺失即视为生成不合格（可校验）。
2. `data-role` 与 `data-anchor` **互斥**：运行时节点不要当静态文本改。
3. 这样 AI 的 patch 可归约为 4 种操作：`setText(anchor)` / `setImage(anchor)` /
   `setOptions(anchor)` / `setToken(name, value)`——都可校验、可预览、可撤销。

## 4. 页面骨架（固定壳 + 唯一题型插槽）

23 个 demo 的页面模式全部共享同一个三层壳，变化只在中部：

```
<div class="app" data-demo-id data-form data-version>
  <header data-block="topbar">   返回 / 进度条(role=progressbar) / 徽章 / 设置
  <div    data-block="heading">  标题 + 一句话说明
  <main   data-block="stage">    ← 唯一题型插槽（按 data-form 换内容）
  <aside  data-block="coach">    引导角色 img + 气泡 p[role=status]
  <footer data-block="actions">  ghost 次操作 + primary 主操作
  <div    data-block="result">   结算：标题 + 两格统计 + 再来一次
```

生成器**只替换 `stage` 的内容**，其余 5 区保持骨架不动。这跟 OpenMAIC 自己的
`packages/@openmaic/generation` 里"新增题型只注册模板、不改主入口"的思路一致。

### 4.1 房子有多大，壳就得跟着变（自适应，硬要求）

同一页会被放进差别很大的容器里：整页演示（可能 1600px 宽）、对话右侧的预览栏
（可能只有 400px 宽）、固定 1280×720 的课堂画布。所以：

- 根节点 `min-height: 100dvh`（**不要** `height: 100vh`）；宽度一律 `100%` / `clamp()` /
  `min(…)`，**禁止给骨架写死像素宽度或 `min-width`**（`width: 1280px` 这类）。
- 内容区用 `max-width: 960px; margin-inline: auto` 约束居中，而不是固定宽度。
- 媒体元素 `max-width: 100%`；`table` / `pre` 自己内部滚（`overflow-x: auto`），不把整页顶宽。
- flex / grid 子项必要时显式 `min-width: 0`——默认的 `min-width: auto` 会被长内容撑破，
  这是"画面被顶出去"最常见的成因。
- 自查：1280×720、1600×900、**420×900** 三种尺寸下都不能出现横向滚动条，主按钮不能被切掉。

平台另有一层运行时兜底（`overflow-x: clip`、`max-width: 100%`、媒体不撑破、子项 `min-width: 0`，
见 `lib/utils/iframe.ts`）。**兜底是兜底不是许可**：它会把溢出裁掉，也就是把内容切掉。

## 5. 支持 / 谨慎 / 排除

**✅ v1 支持**：`choice` 单选判题（首选，应占多数）、`reveal` 观察点亮、`sort` 拖拽分类
（**必须同时给"点选→点目标"的触摸降级**）、`builder` 词块组句、`lab` 参数调节实验、
`quiz` 逐题闯关（`choice` 的序列化包装）、`result` 结算页、`lecture` 讲解跟读（**必须有无媒体降级**）。

**⚠️ 谨慎**：`fill` 填空（判分歧义，须产出 `acceptedAnswers[]` 白名单，无法穷举答案就拒绝）、
`hotspot`/`camera` 图片热点与大图平移（需真实素材 + 外部坐标 JSON）、`video`（素材体积风险）。

**❌ 排除**（附理由）：
- **3D / WebGL**：**有记录的历史失败点**（用户原话"3d和2d太分割了，而且实际上位置也不对"，
  状态为"停止修改"）；且 three.js 体积撞平台 6MB 单响应上限。
- **跑酷 / 实时物理游戏**：需上万随机种子 + 数百局路线穷举才能证明数值平衡，生成器无法验证；
  用户也说过"跑酷已做过两个，换皮不新增学习闭环"。
- **联网 / 外部 API**；**录音评分**（未成年人数据 + iOS 权限）；**排行榜 / 多人对战**（动机伦理）；
  **自由 JS 逻辑 / 自由画布**（不可寻址、不可校验，与"AI 可局部改"直接冲突）；
  **长滚动单页 / 多页**；**养成 / 商城 / 世界观**。

## 6. 小学生适配硬规则

1. 一屏**只有一个任务、一个主按钮**；次要操作放 ghost。
2. 未满足提交条件时主按钮 `disabled` + `filter:grayscale(.55) opacity(.6)`。
3. 触控目标 ≥48×48px（文档底线 44，现有实现 40；取 48 更稳），按下要有
   `translateY(1px)` 或 `scale(.94)` 反馈。
4. 焦点环统一 `outline:3px solid #D60010; outline-offset:3px`。
5. 即时反馈：对用 `#2E9E4F`、错用 `#C63B43`，**颜色不能是唯一通道**——必须同时有文字或符号
   （考虑色觉障碍）。对比度：正文 ≥4.5:1，图形 ≥3:1。
6. 反馈要**指向具体对象**（哪一项错了就说哪一项），不要只说"错了"。
7. 不用"你真棒"式空洞夸奖；用具体短句（"答对啦！""这题的关键是…"）。
8. 必须写 `[hidden]{display:none!important}`（flex 会覆盖 `hidden`，导致隐藏元素仍拦点击——
   这是 demo 里踩过的真实坑）与 `@media (prefers-reduced-motion:reduce)`。
9. 禁止：长段落、密集表格、英文缩写、多题挤一屏、纯外部奖励驱动。
10. 不靠缩小字体塞内容——内容多就分屏。

## 7. 发布契约（产物要过模板平台）

来自 `D:\work\demo-hub`：入口固定为根 `index.html`；**零外部请求**、**只用相对路径**
（预览是嵌套路径，`/assets/...` 会 404）、**不能用 history 路由**；单响应网关上限 6MB
（>3MB 告警、>6MB 需分块）；封面 `_cover.webp`；ZIP 条目名必须正斜杠。

---

## 附：下一步实现（本文档的下游）

1. 把第 2–6 节做成生成期的 **prompt 片段**（注入 interactive 内容模板，与 `kaixin-ui-design` 技能同源）。
2. 单页模式已通（验证：1 prompt → 1 页，课堂页显示 `1 / 1`）。
3. **AI 二次修改**：新增薄路由 `app/api/classroom/edit-scene`（`{stageId, sceneId, instruction}`），
   复用上游 `course-edit/apply.ts` 的纯函数；前端在页面顶部放"AI 改这个页面"输入框，
   配合第 3 节的锚点做**局部改**（选元素 → 只改它）。上游 `patch_stage` / `edit_deck` 那套
   （见对话中的调研报告）可作为"能力升级版"后置接入。
