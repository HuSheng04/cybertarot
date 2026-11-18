# 环形缩略图选牌与大图展示

打开画廊时，缩略图围成一个横向椭圆，正前方是选牌位。左右滑动带动牌环旋转，松手后最近的牌吸附到正前方。点击「查看大图」或按 Enter 确认，即可用现有尺寸看清整张牌。将“滑到”和“选定”分成两步，方便连续浏览；返回牌环时，刚看过的牌仍在正前方。

## 1. 把当前牌交给画廊管理

在 [CardGallery.tsx](../src/components/CardGallery.tsx) 中增加视图状态 `mode: "ring" | "detail"` 和连续位置 `position`，初始为 `"ring"` 和 `0`。`position = 2.4` 表示牌环正从第 3 张转向第 4 张。用同一位置计算缩略图选中态、页码和大图，替换现有按 `scrollLeft / clientWidth` 推算索引的逻辑。

```ts
const wrap = (n: number, total: number) => ((n % total) + total) % total
const index = wrap(Math.round(position), CARDS.length)
const card = CARDS[index]
```

循环取模只用于查询牌数据。动画位置可以从 77 走到 78，以一个牌位的距离从最后一张转回第一张。对应移除现有首尾按钮的禁用条件。

## 2. 画出能旋转的缩略图环

新增 `src/components/CardRing.tsx`。桌面先用 9 个可见牌位，窄屏用 5 个，其余牌随旋转从后方依次补入。所有缩略图保持竖直，前排稍大、后排稍小。使用项目现有图片和 CSS 即可。

以最靠近正前方的整数位置为中心，遍历左右相同数量的牌位。下面的 `slot` 是连续牌位编号，可以为负；`count` 是可见牌位数。容器中心为原点，横纵半径按容器可用宽高计算，并为牌面本身预留边距。

```ts
const theta = (slot - position) * 2 * Math.PI / count
const depth = (Math.cos(theta) + 1) / 2
const x = radiusX * Math.sin(theta)
const y = radiusY * Math.cos(theta)
const scale = 0.55 + depth * 0.45
const thumbnail = CARDS[wrap(slot, CARDS.length)]
```

在 [globals.css](../src/app/globals.css) 中让环容器相对定位，卡片绝对定位在中心，用 `translate(-50%, -50%) translate(x, y) scale(scale)` 排列，按 `depth` 设置层叠顺序。这样正下方是最近的牌，后排经过交叠时会被前排遮住。缩略图的 `Image.sizes` 按实际缩略宽度填写，大图沿用已有的 `object-fit: contain`。

## 3. 统一滑动、挥手和选定

| 操作 | 实现 |
| --- | --- |
| 鼠标拖动或手指滑动 | 按下时记录横坐标和起始位置，用 Pointer Events 捕获拖动。令 `position = 起始位置 - 横向位移 / 每牌拖动距离`，可先取 90 像素一张。松手时吸附到最近整数；越过拖动阈值后抑制本次点击，避免松手误开大图。 |
| 触控板横滑 | 累积横向滚动量更新位置，事件停止约 150 毫秒后吸附。只处理以横向为主的输入。 |
| 方向键、按钮或摄像头挥手 | 共用 `step(-1 或 +1)`。以最近一次目标牌位为基准前进或后退一步，便于连续输入。把已有 `useHandSwipe(onSwipe)` 的回调接到这里；在大图中挥手则直接切换相邻大图。 |
| 确认与返回 | 点击侧边缩略图先将它转到前方；点击前方牌、「查看大图」或按 Enter 打开大图。大图提供「返回牌环」，支持 Esc，返回时将键盘焦点还给选牌控件。 |

## 4. 复用现有大图并验收

在 `detail` 视图只渲染当前牌，复用现有 `gallery-artwork`、`gallery-image` 和中英文牌名。摄像头开关、视频元素及手势识别留在两个视图的共同父组件中，切换视图时沿用同一次摄像头会话。启用“减少动态效果”时直接定位目标牌位。

- [ ] 桌面和手机都能连续转过全部 78 张牌，第 78 张与第 1 张之间双向衔接。
- [ ] 快速滑过多张后，松手只吸附；确认后，大图与前方缩略图、牌名和页码一致。
- [ ] 在大图中换一张再返回，牌环定位到最后查看的牌。
- [ ] 鼠标、触摸、触控板、键盘及现有摄像头挥手都能选到同一张牌。
