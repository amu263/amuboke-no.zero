// 单元 7 — 全局启动 Splash 的「退出时序 + 归位交接」。
// AGENTS.md §9.3: composable 必须以 use 开头。
//
// 为什么时序放在这里而不是组件里：
//   - Splash 的 DOM 与关键 CSS 都在 index.html（预 hydration 帘幕），
//     首帧即可绘制，且它不在 <div id="app"> 内 —— Vue 从不 hydrate 它，
//     因此不可能造成 hydration mismatch。
//   - 帘幕的「进入 / 删除」判定在 index.html 的引导脚本里完成（首绘之前，
//     避免刷新时闪一下帘幕）；这里负责在应用就绪后把它撤掉。
//
// 时间基准：performance.now() 的原点就是 navigation start，所以
// BOOT_SPLASH_MIN_VISIBLE_MS 是「从开始导航到帘幕可撤」的总时长，而不是
// 「从 JS 执行到撤帘」——JS 加载慢时不会人为多等。

import { nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/** 帘幕最短可见时长（毫秒），从 navigation start 起算。
 *  index.html 里的进度条动画与 boot log 错落时间表必须与此一致。 */
export const BOOT_SPLASH_MIN_VISIBLE_MS = 3800

/** 淡出时长（毫秒）。index.html 里 boot-splash--leaving 的 transition 必须与此一致。 */
export const BOOT_SPLASH_FADE_MS = 600

/** 归位飞行时长（毫秒）。index.html 里 @keyframes boot-dock 的时长必须与此一致。 */
export const BOOT_SPLASH_DOCK_MS = 1150

/** 落地复测后的微调时长（毫秒）。飞行期间页面还在入场，目标可能又移动了几个像素
 *  （实测移动端偏 12px、桌面 0px），这一步把落点重新量准并补上差值。 */
export const BOOT_SPLASH_SETTLE_MS = 160

/** 路由 ready 的最长等待：超过就撤帘，帘幕绝不阻塞内容。 */
const ROUTER_READY_TIMEOUT_MS = 2500

export const BOOT_SPLASH_ELEMENT_ID = 'app-loading'
export const BOOT_SPLASH_LEAVE_CLASS = 'boot-splash--leaving'
export const BOOT_SPLASH_DOCKING_CLASS = 'boot-splash--docking'
/** index.html 在「本次不播放」时挂到 <html> 上的类。 */
export const BOOT_SPLASH_OFF_CLASS = 'boot-splash-off'
/** 归位交接期间挂在 <html> 上：隐藏首页里那个「等着被接住」的肖像。 */
export const BOOT_DOCKING_ROOT_CLASS = 'boot-docking'
/** 首页肖像上的归位锚点（用 data 属性而不是 class，避免被样式重构改坏）。 */
const DOCK_TARGET_SELECTOR = '[data-boot-dock]'
/** 帘幕期间挂在 <html> 上：锁滚动 + 冻结页面入场动画（见 app.vue）。
 *  在**淡出开始**那一刻移除——早放白播，晚放淡出会露出停在 opacity:0 的空页面。 */
const BOOTING_CLASS = 'booting'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/** object-fit: contain 下真正可见的图片矩形（可能比元素盒子小）。 */
function containedRect(img: HTMLImageElement): Rect | null {
  const box = img.getBoundingClientRect()
  if (!box.width || !box.height) return null
  const natural = img.naturalWidth / img.naturalHeight
  const declared =
    Number(img.getAttribute('width')) / Number(img.getAttribute('height'))
  const ratio = Number.isFinite(natural) && natural > 0 ? natural : declared
  if (!Number.isFinite(ratio) || ratio <= 0) return null
  let w = box.width
  let h = box.height
  if (w / h > ratio) w = h * ratio
  else h = w / ratio
  return {
    left: box.left + (box.width - w) / 2,
    top: box.top + (box.height - h) / 2,
    width: w,
    height: h
  }
}

/** 入场动画（home-rise）此刻可能还停在 translateY(8px) 的起始帧上，
 *  直接量会把落点算偏 8px。这里累加祖先链上的平移，把 rect 还原成
 *  「动画跑完后」的位置——落点必须对准终态，而不是冻结帧。 */
function settledOffset(el: HTMLElement): { dx: number; dy: number } {
  let dx = 0
  let dy = 0
  let node: HTMLElement | null = el
  while (node && node !== document.documentElement) {
    const transform = getComputedStyle(node).transform
    if (transform && transform !== 'none') {
      try {
        const m = new DOMMatrixReadOnly(transform)
        dx += m.e
        dy += m.f
      } catch {
        // 不支持的 matrix 形式：忽略这一层
      }
    }
    node = node.parentElement
  }
  return { dx, dy }
}

interface DockPose {
  x: number
  y: number
  scale: number
  radius: number
  from: DOMRect
}

/** 读元素左上角半径并解析成 px：百分比按盒子尺寸换算（Chrome 的
 *  getComputedStyle 对 `border-radius: 50%` 直接返回 "50%"）。 */
function resolveRadius(el: HTMLElement, box: Rect): number {
  const raw = getComputedStyle(el).borderTopLeftRadius
  if (!raw) return 0
  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value) || value <= 0) return 0
  if (raw.trim().endsWith('%')) {
    return (value / 100) * Math.min(box.width, box.height)
  }
  return value
}

/** 由「帘幕头像的静止矩形」与「目标可见矩形」算出落点位姿。 */
function poseFor(from: DOMRect, target: HTMLImageElement): DockPose | null {
  const visible = containedRect(target)
  if (!visible || !from.width || !from.height) return null
  const offset = settledOffset(target)
  const scale = visible.width / from.width
  if (!Number.isFinite(scale) || scale < 0.2 || scale > 20) return null
  // 落点方框的圆角：优先读肖像 img 自己的角半径（圆框裁剪切在 img 上，
  // 这样归位全程保持圆形），再退到容器。
  // 注意 getComputedStyle 对百分比圆角**返回百分比字符串**（"50%"），
  // 直接 parseFloat 会把它当 50px —— 必须先按盒子尺寸换算成 px，
  // 否则圆框落地时会退化成小圆角（实测只剩 3%）。最后再换算回缩放前的
  // 本地坐标（transform: scale 会把 border-radius 一起放大）。
  const frame = target.parentElement ?? target
  const radius = resolveRadius(target, visible) || resolveRadius(frame, visible)
  return {
    x: visible.left - offset.dx + visible.width / 2 - (from.left + from.width / 2),
    y: visible.top - offset.dy + visible.height / 2 - (from.top + from.height / 2),
    scale,
    radius: radius / scale,
    from
  }
}

/** 把帘幕头像的落点算好并写进 CSS 变量；返回本次飞行的位姿，不能起飞时返回 null。 */
function startDock(overlay: HTMLElement): DockPose | null {
  const avatar = overlay.querySelector<HTMLElement>('.boot-core__avatar')
  const target = document.querySelector<HTMLImageElement>(DOCK_TARGET_SELECTOR)
  if (!avatar || !target) return null

  const from = avatar.getBoundingClientRect()
  const pose = poseFor(from, target)
  if (!pose) return null

  // 目标此刻可能还没进入视口（比如用户落在别的路由又切回来）：不硬飞。
  const visible = containedRect(target)
  if (
    !visible ||
    visible.left > window.innerWidth ||
    visible.top > window.innerHeight ||
    visible.left + visible.width < 0 ||
    visible.top + visible.height < 0
  ) {
    return null
  }

  avatar.style.setProperty('--dock-x', pose.x.toFixed(2) + 'px')
  avatar.style.setProperty('--dock-y', pose.y.toFixed(2) + 'px')
  avatar.style.setProperty('--dock-scale', pose.scale.toFixed(4))
  avatar.style.setProperty('--dock-radius', pose.radius.toFixed(2) + 'px')
  avatar.style.setProperty('--dock-duration', BOOT_SPLASH_DOCK_MS + 'ms')

  overlay.classList.add(BOOT_SPLASH_DOCKING_CLASS)
  document.documentElement.classList.add(BOOT_DOCKING_ROOT_CLASS)
  return pose
}

/** 飞行期间页面仍在入场，目标可能又挪了几像素（实测移动端 12px / 桌面 0px）。
 *  落地后复测一次：把动画停下、用行内样式接住当前姿态，再把差值用一段很短的
 *  过渡补掉——这样交接永远是像素级贴合，且对以后任何布局漂移免疫。 */
function settleDock(overlay: HTMLElement, pose: DockPose): void {
  const avatar = overlay.querySelector<HTMLElement>('.boot-core__avatar')
  const target = document.querySelector<HTMLImageElement>(DOCK_TARGET_SELECTOR)
  if (!avatar || !target) return

  const next = poseFor(pose.from, target)
  if (!next) return
  const moved =
    Math.abs(next.x - pose.x) > 0.5 ||
    Math.abs(next.y - pose.y) > 0.5 ||
    Math.abs(next.scale - pose.scale) > 0.002
  if (!moved) return

  // 同一任务里先停动画、再用行内样式补上动画终态（transform / 圆角 / 阴影），
  // 中间不触发绘制，所以肉眼看不出这一手换手。
  avatar.getAnimations().forEach((animation) => animation.cancel())
  avatar.style.transform = `translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`
  avatar.style.borderRadius = pose.radius.toFixed(2) + 'px'
  avatar.style.boxShadow = 'none'
  void avatar.offsetWidth
  avatar.style.transition = `transform ${BOOT_SPLASH_SETTLE_MS}ms ease-out`
  avatar.style.transform = `translate(${next.x}px, ${next.y}px) scale(${next.scale})`
}

export function useBootSplash(): void {
  const router = useRouter()

  onMounted(async () => {
    const root = document.documentElement
    const overlay = document.getElementById(BOOT_SPLASH_ELEMENT_ID)

    const finish = (): void => {
      overlay?.remove()
      root.classList.remove(BOOTING_CLASS)
      root.classList.remove(BOOT_DOCKING_ROOT_CLASS)
    }

    // 没有帘幕（或被 noscript 规则隐藏）时只解锁滚动。
    if (!overlay) {
      root.classList.remove(BOOTING_CLASS)
      return
    }

    // 本会话已经启动过：帘幕在首帧就是 display:none（零闪烁），这里只做清理。
    if (root.classList.contains(BOOT_SPLASH_OFF_CLASS)) {
      finish()
      return
    }

    try {
      // 路由未就绪也不能把帘幕留在屏幕上。
      await Promise.race([router.isReady(), wait(ROUTER_READY_TIMEOUT_MS)])
      await nextTick()
    } catch {
      finish()
      return
    }

    const hold = BOOT_SPLASH_MIN_VISIBLE_MS - performance.now()
    if (hold > 0) await wait(hold)

    if (overlay.isConnected) {
      // 先量落点、再加类：量的时候入场动画还冻结在起始帧上，settledOffset
      // 会把那 8px 还原掉；一旦 bosting 摘掉，页面马上开始入场。
      const pose = startDock(overlay)
      overlay.classList.add(BOOT_SPLASH_LEAVE_CLASS)
      // 一开始淡出就解锁滚动、解冻页面入场动画。
      root.classList.remove(BOOTING_CLASS)
      if (!pose) {
        await wait(BOOT_SPLASH_FADE_MS)
      } else {
        // 归位飞行比淡出长，得等它落地再把帘幕拿掉；落点还要复测微调一次。
        await wait(BOOT_SPLASH_DOCK_MS)
        settleDock(overlay, pose)
        await wait(BOOT_SPLASH_SETTLE_MS)
      }
    }
    finish()
  })
}
