<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { ActivityHeatmapYear } from '@/content/build-time-index'

const props = defineProps<{ years: readonly ActivityHeatmapYear[] }>()

// ── Constants ─────────────────────────────────────────────────────────
const WEEKS = 52
const DAYS = 7          // Mon–Sun
const CELL = 15         // px, square cell
const GAP = 3          // px

// Weekday labels: row 0=Mon ... 6=Sun; only Mon/Wed/Fri shown
const WD_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── Selected year state (default: most recent) ─────────────────────
const selectedYear = ref<number>(props.years[0]?.year ?? new Date().getUTCFullYear())

// ── Derived: selected year's grid ───────────────────────────────────
const selectedYearData = computed(() =>
  props.years.find(y => y.year === selectedYear.value) ?? props.years[0]
)

// ── Month labels for the selected year ────────────────────────────
const monthLabels = computed(() => {
  const yearData = selectedYearData.value
  if (!yearData) return []
  // Find the day-of-week of Jan 1 (0=Mon ... 6=Sun)
  const jan1 = new Date(Date.UTC(yearData.year, 0, 1))
  const jan1Weekday = (jan1.getUTCDay() + 6) % 7  // Mon=0, Sun=6
  const jan1Time = jan1.getTime()
  const result: { month: string; col: number }[] = []
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = new Date(Date.UTC(yearData.year, m, 1))
    const dayIndex = Math.floor((firstOfMonth.getTime() - jan1Time) / 86400000)
    if (dayIndex < 0 || dayIndex >= yearData.days.length) continue
    const col = Math.floor((dayIndex + jan1Weekday) / 7)
    result.push({ month: MONTHS[m], col })
  }
  return result
})

// ── Grid cells: 7 rows × 52 cols for the selected year ────────────
const gridCells = computed(() => {
  const yearData = selectedYearData.value
  if (!yearData) return []
  // Each year has days in order. dayIndex = col * 7 + row.
  const rows: { date: string; level: number; count: number }[][] = []
  for (let r = 0; r < DAYS; r++) {
    rows[r] = []
    for (let c = 0; c < WEEKS; c++) {
      const dayIndex = c * DAYS + r
      const day = yearData.days[dayIndex]
      rows[r][c] = {
        date: day?.date ?? '',
        level: day?.level ?? 0,
        count: day?.count ?? 0
      }
    }
  }
  return rows
})

// ── Total contributions for selected year ──────────────────────────
const total = computed(() =>
  (selectedYearData.value?.days ?? []).reduce((s, d) => s + d.count, 0)
)

// ── Tooltip ──────────────────────────────────────────────────────
const tip = ref<{ date: string; count: number; x: number; y: number } | null>(null)
const tipLabel = computed(() => {
  if (!tip.value) return ''
  const { date, count } = tip.value
  const d = new Date(date + 'T00:00:00.000Z')
  const cn = ['周日','周一','周二','周三','周四','周五','周六']
  const ds = cn[d.getUTCDay()]
  const fmt = `${d.getUTCFullYear()}年${d.getUTCMonth()+1}月${d.getUTCDate()}日 ${ds}`
  return count > 0 ? `${fmt} — ${count} 条更新` : `${fmt} — 无更新`
})
function showTip(row: number, col: number, e: MouseEvent) {
  const yearData = selectedYearData.value
  if (!yearData) return
  const dayIndex = col * DAYS + row
  const day = yearData.days[dayIndex]
  if (day) { tip.value = { date: day.date, count: day.count, x: e.clientX, y: e.clientY } }
}
function moveTip(e: MouseEvent) { if (tip.value) { tip.value.x = e.clientX; tip.value.y = e.clientY } }
function hideTip() { tip.value = null }

// ── Year selector: vertical scroll ───────────────────────────────
const yearListRef = ref<HTMLElement | null>(null)
function selectYear(year: number) {
  selectedYear.value = year
}

// ── Keyboard navigation ──────────────────────────────────────────
const focusIdx = ref<number | null>(null)
const lockedIdx = ref<number | null>(null)
function cellIdx(row: number, col: number) { return col * DAYS + row }
function onKey(e: KeyboardEvent, row: number, col: number) {
  const idx = cellIdx(row, col)
  const lastCol = WEEKS - 1
  let nr: number | undefined, nc: number | undefined
  if (e.key === 'ArrowRight') { nr = row; nc = Math.min(lastCol, col + 1) }
  else if (e.key === 'ArrowLeft') { nr = row; nc = Math.max(0, col - 1) }
  else if (e.key === 'ArrowDown') { nr = Math.min(DAYS - 1, row + 1); nc = col }
  else if (e.key === 'ArrowUp') { nr = Math.max(0, row - 1); nc = col }
  else if (e.key === 'Home') { nr = row; nc = 0 }
  else if (e.key === 'End') { nr = row; nc = lastCol }
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lockedIdx.value = lockedIdx.value === idx ? null : idx; focusIdx.value = idx; return }
  if (nr !== undefined && nc !== undefined) {
    e.preventDefault()
    const ni = cellIdx(nr, nc)
    focusIdx.value = ni
    nextTick(() => { document.querySelector<HTMLElement>(`[data-ah="${ni}"]`)?.focus() })
  }
}
</script>


<template>
  <section class="activity-heatmap" aria-labelledby="activity-title">

    <!-- Header row -->
    <div class="ah-header">
      <div class="ah-heading-left">
        <span class="heading" data-level="8">ACTIVITY / 52 WEEKS</span>
        <span class="ah-total">{{ total }} contributions</span>
      </div>
    </div>

    <!-- Month labels + 7×52 heatmap grid -->
    <div class="ah-months" aria-hidden="true">
      <span
        v-for="ml in monthLabels"
        :key="ml.col"
        class="ah-month-label"
        :style="{ gridColumn: ml.col + 1 }"
      >{{ ml.month }}</span>
    </div>

    <div class="ah-grid" role="list" :aria-label="`${selectedYear}年活动热力图`">
      <template v-for="(rowCells, ri) in gridCells" :key="ri">
        <button
          v-for="(cell, ci) in rowCells"
          :key="cell.date"
          type="button"
          class="ah-cell"
          :class="'level-' + cell.level"
          :aria-label="cell.date + (cell.count > 0 ? `, ${cell.count} 条更新` : ', 无更新')"
          tabindex="0"
          @mouseenter="showTip(ri, ci, $event)"
          @mousemove="moveTip"
          @mouseleave="hideTip"
          @focus="focusIdx = cellIdx(ri, ci)"
          @blur="focusIdx = null"
          @keydown="onKey($event, ri, ci)"
        />
      </template>
    </div>

    <!-- Footer: legend (left) + year selector (right) -->
    <div class="ah-footer">
      <div class="ah-legend" aria-label="热力图图例">
        <span class="ah-less">Less</span>
        <div class="ah-legend-cells" aria-hidden="true">
          <div v-for="l in [0,1,2,3,4]" :key="l" class="ah-legend-cell" :class="'level-' + l" />
        </div>
        <span class="ah-more">More</span>
      </div>

      <!-- Vertical year selector -->
      <nav class="ah-year-nav" aria-label="选择年份">
        <button
          v-for="yearData in years"
          :key="yearData.year"
          type="button"
          class="ah-year-btn"
          :class="{ 'is-active': yearData.year === selectedYear }"
          :aria-pressed="yearData.year === selectedYear"
          @click="selectYear(yearData.year)"
        >
          {{ yearData.year }}
        </button>
      </nav>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tip"
      class="ah-tooltip"
      role="tooltip"
      aria-live="polite"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >{{ tipLabel }}</div>

  </section>
</template>

<style scoped>
.activity-heatmap { position: relative; }

/* Header */
.ah-header {
  display: flex;
  align-items: baseline;
  gap: var(--theme-spacing-md);
  margin-bottom: var(--theme-spacing-md);
}
.ah-heading-left {
  display: flex;
  align-items: baseline;
  gap: var(--theme-spacing-md);
}
.ah-total {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-on-background);
  opacity: 0.6;
}

/* Month labels */
.ah-months {
  display: grid;
  grid-template-columns: repeat(52, 15px);
  gap: 3px;
  margin-bottom: 3px;
  height: 20px;
}
.ah-month-label {
  font-family: var(--theme-font-mono);
  font-size: 10px;
  color: var(--theme-on-background);
  opacity: 0.45;
  line-height: 20px;
  white-space: nowrap;
}

/* 7 rows × 52 cols heatmap grid */
.ah-grid {
  display: grid;
  grid-template-columns: repeat(52, 15px);
  grid-template-rows: repeat(7, 15px);
  gap: 3px;
  /* Weekday labels on left */
  padding-left: 3.5rem;
  position: relative;
}
/* Add Mon/Wed/Fri labels as CSS ::before on first column of each row */
.ah-grid::before {
  content: '';
  display: block;
}

.ah-cell {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  padding: 0;
  cursor: pointer;
  background: var(--theme-scrim);
  transition: transform 100ms ease;
  outline: none;
  border: 0;
}
.ah-cell:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: 1px;
  transform: scale(1.3);
  z-index: 1;
  position: relative;
}
.ah-cell:hover {
  transform: scale(1.3);
  position: relative;
  z-index: 1;
}

/* 5-level blue */
.ah-cell.level-0 { background: var(--theme-scrim); }
.ah-cell.level-1 { background: color-mix(in srgb, var(--theme-primary) 50%, var(--theme-background)); }
.ah-cell.level-2 { background: color-mix(in srgb, var(--theme-primary) 68%, var(--theme-background)); }
.ah-cell.level-3 { background: color-mix(in srgb, var(--theme-primary) 85%, var(--theme-background)); }
.ah-cell.level-4 { background: var(--theme-primary); }

/* Footer: legend (left) + year selector (right) */
.ah-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--theme-spacing-sm);
  gap: var(--theme-spacing-lg);
}

/* Legend */
.ah-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--theme-font-mono);
  font-size: 9px;
  color: var(--theme-on-background);
  opacity: 0.5;
}
.ah-legend-cells { display: flex; gap: 3px; }
.ah-legend-cell { width: 15px; height: 15px; border-radius: 3px; }
.ah-legend-cell.level-0 { background: var(--theme-scrim); }
.ah-legend-cell.level-1 { background: color-mix(in srgb, var(--theme-primary) 50%, var(--theme-background)); }
.ah-legend-cell.level-2 { background: color-mix(in srgb, var(--theme-primary) 68%, var(--theme-background)); }
.ah-legend-cell.level-3 { background: color-mix(in srgb, var(--theme-primary) 85%, var(--theme-background)); }
.ah-legend-cell.level-4 { background: var(--theme-primary); }

/* Year selector: vertical scrollable list */
.ah-year-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.ah-year-btn {
  min-width: 44px;
  height: 28px;
  border: 0;
  border-radius: var(--theme-radius-md);
  background: transparent;
  color: var(--theme-on-background);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
  white-space: nowrap;
  opacity: 0.5;
  padding: 0 8px;
}
.ah-year-btn:hover {
  opacity: 0.85;
  background: var(--theme-scrim);
}
.ah-year-btn.is-active {
  background: var(--theme-primary);
  color: var(--theme-background);
  opacity: 1;
  font-weight: 600;
}

/* Tooltip */
.ah-tooltip {
  position: fixed;
  z-index: 100;
  transform: translate(-50%, calc(-100% - 18px));
  white-space: nowrap;
  padding: 4px 10px;
  background: var(--theme-scrimStrong);
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-sm);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-on-background);
  backdrop-filter: blur(8px);
  pointer-events: none;
  box-shadow: var(--theme-shadow-md);
}
.ah-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 3px solid transparent;
  border-top-color: var(--theme-scrimStrong);
}

@media (prefers-reduced-motion: reduce) {
  .ah-cell, .ah-tooltip { transition: none; }
}
</style>