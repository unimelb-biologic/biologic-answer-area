<template>
  <div ref="panelWrapperRef" class="my-slide-item" :style="itemStyle">
    <div class="panel-content" :style="panelStyle">
      <!-- Header -->
      <div class="panel-header">
        <!-- Left cluster: resize controls + optional left actions -->
        <div class="panel-left-cluster">
          <div class="panel-controls panel-controls--left">
            <v-btn
              size="xx-small"
              variant="text"
              :disabled="atMin || isAnyFullscreenReactive"
              :class="{ 'panel-btn--inactive': isAnyFullscreenReactive }"
              @click="decreaseWidth"
            >
              <v-icon size="16">mdi-minus</v-icon>
            </v-btn>

            <v-btn
              size="xx-small"
              variant="text"
              :disabled="atMax || isAnyFullscreenReactive"
              :class="{ 'panel-btn--inactive': isAnyFullscreenReactive }"
              @click="increaseWidth"
            >
              <v-icon size="16">mdi-plus</v-icon>
            </v-btn>
          </div>

          <!-- actions to the LEFT of title (row) -->
          <div v-if="leftActions.length" class="panel-actions-row">
            <Tooltip v-for="a in leftActions" :key="a.id" :text="a.tooltip">
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="$emit('action', { id: a.id })"
              >
                <v-icon size="16">{{ a.icon }}</v-icon>
              </v-btn>
            </Tooltip>
          </div>
        </div>

        <!-- Title -->
        <div class="panel-title-wrap">
          <Tooltip
            v-if="titleTooltip"
            :text="titleTooltip"
            :disabled="isAnyFullscreenReactive"
          >
            <div class="panel-title">{{ title }}</div>
          </Tooltip>
          <div v-else class="panel-title">{{ title }}</div>
        </div>

        <!-- Right cluster: right actions (row) + fullscreen controls -->
        <div class="panel-right-cluster">
          <!-- actions to the RIGHT of title (row) -->
          <div v-if="rightActions.length" class="panel-actions-row">
            <Tooltip v-for="a in rightActions" :key="a.id" :text="a.tooltip">
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="$emit('action', { id: a.id })"
              >
                <v-icon size="16">{{ a.icon }}</v-icon>
              </v-btn>
            </Tooltip>
          </div>

          <div class="panel-controls panel-controls--right">
            <v-btn
              size="xx-small"
              variant="text"
              @click="toggleSingleFullscreen"
            >
              <v-icon size="16">
                {{ isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
              </v-icon>
            </v-btn>

            <v-btn
              v-if="hasNext"
              size="xx-small"
              variant="text"
              :disabled="isFullscreen || isAnyFullscreenReactive"
              :class="{
                'panel-btn--inactive': isFullscreen || isAnyFullscreenReactive,
              }"
              @click="pairFullscreen"
            >
              <v-icon size="16">mdi-arrow-expand-horizontal</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="panel-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import Tooltip from './Tooltip.vue';

export default {
  name: 'MySlideGroupItem',
  components: { Tooltip },

  inject: {
    requestPairFs: { from: 'mySlideGroupRequestPairFullscreen', default: null },
  },

  props: {
    title: { type: String, default: '' },
    titleTooltip: { type: String, default: '' },

    width: { type: String, default: '30vw' },
    height: { type: String, default: '90%' },

    // Can be rgb(...), #hex, or var(--something)
    bg: { type: String, default: '#f9f9f9' },

    borderColor: { type: String, default: '#ccc' },
    borderWidth: { type: String, default: '2px' },
    radius: { type: String, default: '8px' },
    shadow: { type: String, default: '0px 18px 40px rgba(15, 23, 42, 0.08)' },
    padding: { type: String, default: '12px' },
    margin: { type: String, default: '10px' },

    scrollable: { type: Boolean, default: true },

    actions: {
      type: Array,
      default: () => [],
      // [{ id, icon, tooltip, side: 'left'|'right', disableWhenFullscreen?: boolean }]
    },
  },

  data() {
    return {
      widths: [10, 20, 30, 40, 50, 60, 70, 80],
      currentVw: 60,
      hasNext: true,
      isFullscreen: false,
      isAnyFullscreenReactive: false,
    };
  },

  computed: {
    leftActions() {
      return (this.actions || []).filter((a) => (a.side || 'right') === 'left');
    },
    rightActions() {
      return (this.actions || []).filter(
        (a) => (a.side || 'right') === 'right',
      );
    },
    isAnyFullscreen() {
      return this.isAnyFullscreenReactive;
    },

    itemStyle() {
      if (this.isFullscreen) return {};
      return {
        width: `${this.currentVw}vw`,
        height: this.height,
      };
    },

    panelStyle() {
      const bg = (this.bg || '').trim();
      const isCssVar = bg.startsWith('var(');

      // If bg is var(--x), rely on CSS color-mix; otherwise compute rgba in JS.
      const bg10 = isCssVar
        ? `color-mix(in srgb, ${bg} 2%, white)`
        : this.toRgba(bg, 0.1); // ok to keep, but see note below

      const bg01 = isCssVar
        ? `color-mix(in srgb, ${bg} 1%, white)`
        : this.toRgba(bg, 0.01);

      return {
        height: '100%',
        border: `${this.borderWidth} solid ${this.borderColor}`,
        borderRadius: this.radius,
        boxShadow: this.shadow,
        padding: this.padding,
        margin: this.margin,

        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',

        // CSS variables consumed in <style>
        '--panel-bg': bg,
        '--panel-bg-10': bg10,
        '--panel-bg-01': bg01,
      };
    },

    atMin() {
      return this.currentVw === this.widths[0];
    },

    atMax() {
      return this.currentVw === this.widths[this.widths.length - 1];
    },
  },

  mounted() {
    const match = parseInt(this.width, 10);
    this.currentVw = this.widths.includes(match) ? match : 30;

    this.$nextTick(() => {
      const el = this.$refs.panelWrapperRef;
      this.hasNext = !!(el && el.nextElementSibling);
    });

    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  },

  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  },
  methods: {
    // Converts rgb(...) / rgba(...) / #hex to rgba(..., alpha).
    // If it can't parse (e.g. named colors), it returns input unchanged.
    toRgba(color, alpha) {
      if (!color || typeof color !== 'string') return color;

      const c = color.trim();

      // rgb(r,g,b) or rgba(r,g,b,a)
      const rgbMatch = c.match(
        /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)$/i,
      );
      if (rgbMatch) {
        const r = Number(rgbMatch[1]);
        const g = Number(rgbMatch[2]);
        const b = Number(rgbMatch[3]);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      // #rgb or #rrggbb
      const hexMatch = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3)
          hex = hex
            .split('')
            .map((ch) => ch + ch)
            .join('');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      return c;
    },

    increaseWidth() {
      console.log(
        'increaseWidth ',
        this.currentVw,
        this.widths[this.widths.length - 1],
      );
      if (this.atMax || this.isAnyFullscreen) return;
      const i = this.widths.indexOf(this.currentVw);
      this.currentVw = this.widths[i + 1];
      console.log('currentVw now ', this.currentVw);
    },

    decreaseWidth() {
      if (this.atMin || this.isAnyFullscreen) return;
      const i = this.widths.indexOf(this.currentVw);
      this.currentVw = this.widths[i - 1];
    },

    pairFullscreen() {
      if (!this.requestPairFs) return;
      const el = this.$refs.panelWrapperRef;
      if (!el) return;
      if (document.fullscreenElement) return;
      this.requestPairFs(el);
    },

    onFullscreenChange() {
      const fsEl = document.fullscreenElement;
      const myEl = this.$refs.panelWrapperRef;

      this.isAnyFullscreenReactive = !!fsEl;
      this.isFullscreen = fsEl === myEl;
      console.log(
        'onFullscreenChange. this.isAnyFullscreenReactive=',
        this.isAnyFullscreenReactive,
        ' this.isFullscreen= ',
        this.isFullscreen,
      );
    },

    async toggleSingleFullscreen() {
      const el = this.$refs.panelWrapperRef;
      if (!el) return;

      try {
        if (!document.fullscreenElement) {
          await el.requestFullscreen();
        } else if (document.fullscreenElement === el) {
          await document.exitFullscreen();
        }
      } catch (e) {}
    },
  },
};
</script>

<style scoped>
.my-slide-item {
  display: block;
}

/* Apply the light gradient using computed CSS vars */
.panel-content {
  box-sizing: border-box;
  background-color: white;
  background-image: linear-gradient(
    180deg,
    var(--panel-bg-10),
    var(--panel-bg-01)
  );
}

/* Fullscreen polish */
.my-slide-item:fullscreen .panel-content {
  height: 100vh;
  margin: 0;
  border-radius: 0;
}

/* Header layout: left stack | title | right stack */
.panel-header {
  position: relative; /* IMPORTANT for ::before */
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 8px;
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Header stripe driven by bg prop */
.panel-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--panel-bg);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.panel-controls {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.panel-controls :deep(.v-btn) {
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 1px !important; /* tighten */
}

.panel-controls :deep(.v-icon) {
  line-height: 1 !important;
}
/* Title */
.panel-title-wrap {
  min-width: 0;
}
.panel-title {
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Body scroll area */
.panel-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.panel-btn--inactive {
  opacity: 0.35;
  pointer-events: none; /* extra safety */
  filter: grayscale(100%);
}

.panel-btn--inactive :deep(.v-icon) {
  opacity: 0.5;
}

/* clusters */
.panel-left-cluster,
.panel-right-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* actions: arranged in a row */
.panel-actions-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}
</style>
