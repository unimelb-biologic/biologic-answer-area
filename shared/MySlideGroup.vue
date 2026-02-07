<template>
  <div
    class="my-slide-shell"
    :style="{ height }"
    :class="{ 'is-pair-fullscreen': pairFs.active }"
  >
    <!-- Left arrow -->
    <div class="my-slide-shell__nav">
      <v-btn
        class="nav-arrow-btn"
        variant="text"
        :disabled="!canScrollLeft || pairFs.active"
        :style="{ width: navBtnSizePx + 'px', height: navBtnSizePx + 'px' }"
        @click="scrollLeft"
      >
        <v-icon :size="iconSizePx">mdi-chevron-left</v-icon>
      </v-btn>
    </div>

    <!-- Fullscreen wrapper (this is what we fullscreen for a pair) -->
    <div ref="fsWrapperRef" class="my-slide-fs-wrapper">
      <div
        ref="scrollerRef"
        class="my-slide-scroller"
        @scroll.passive="onScroll"
      >
        <div ref="trackRef" class="my-slide-track">
          <slot />
        </div>
      </div>
    </div>

    <!-- Right arrow -->
    <div class="my-slide-shell__nav">
      <v-btn
        class="nav-arrow-btn"
        variant="text"
        :disabled="!canScrollRight || pairFs.active"
        :style="{ width: navBtnSizePx + 'px', height: navBtnSizePx + 'px' }"
        @click="scrollRight"
      >
        <v-icon :size="iconSizePx">mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MySlideGroup',

  props: {
    height: { type: String, default: '100%' },
    iconSizePx: { type: Number, default: 100 },
    behavior: { type: String, default: 'smooth' },
    edgeEpsilon: { type: Number, default: 2 },
    navBtnSizePx: { type: Number, default: 110 },
  },

  data() {
    return {
      canScrollLeft: false,
      canScrollRight: false,
      raf: null,
      ro: null,

      pairFs: {
        active: false,
        a: -1,
        b: -1,
        growA: 1,
        growB: 1,
      },
    };
  },

  provide() {
    return {
      // now accepts a DOM element (the clicked item wrapper)
      mySlideGroupRequestPairFullscreen: this.requestPairFullscreen,
      mySlideGroupExitPairFullscreen: this.exitPairFullscreen,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.updateScrollState();

      document.addEventListener('fullscreenchange', this.onFullscreenChange);

      if (window.ResizeObserver) {
        this.ro = new ResizeObserver(() => {
          this.updateScrollState();
          if (this.pairFs.active) this.applyPairStyles();
        });
        if (this.$refs.scrollerRef) this.ro.observe(this.$refs.scrollerRef);
        if (this.$refs.trackRef) this.ro.observe(this.$refs.trackRef);
      } else {
        window.addEventListener('resize', this.onResizeFallback, {
          passive: true,
        });
      }
    });
  },

  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    if (this.ro) this.ro.disconnect();
    window.removeEventListener('resize', this.onResizeFallback);
    if (this.raf) cancelAnimationFrame(this.raf);
  },

  methods: {
    onResizeFallback() {
      this.updateScrollState();
      if (this.pairFs.active) this.applyPairStyles();
    },

    getScroller() {
      return this.$refs.scrollerRef || null;
    },

    getItems() {
      const track = this.$refs.trackRef;
      if (!track) return [];
      return Array.from(track.children || []);
    },

    onScroll() {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = null;
        this.updateScrollState();
      });
    },

    updateScrollState() {
      const el = this.getScroller();
      if (!el) return;

      const max = el.scrollWidth - el.clientWidth;
      const pos = el.scrollLeft;

      this.canScrollLeft = pos > this.edgeEpsilon;
      this.canScrollRight = pos < max - this.edgeEpsilon;
    },

    getAlignedIndex() {
      const scroller = this.getScroller();
      const items = this.getItems();
      if (!scroller || !items.length) return 0;

      const scrollerLeft = scroller.getBoundingClientRect().left;
      let bestI = 0;
      let bestDist = Infinity;

      for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect();

        // skip fully offscreen to the right/left relative to the scroller viewport
        if (r.right <= scrollerLeft + this.edgeEpsilon) continue;

        const dist = Math.abs(r.left - scrollerLeft);
        if (dist < bestDist) {
          bestDist = dist;
          bestI = i;
        }
      }

      return bestI;
    },

    scrollLeft() {
      if (this.pairFs?.active) return;
      this.scrollToIndex(this.getAlignedIndex() - 1);
    },

    scrollRight() {
      if (this.pairFs?.active) return;
      this.scrollToIndex(this.getAlignedIndex() + 1);
    },

    scrollToIndex(index) {
      const scroller = this.getScroller();
      const items = this.getItems();
      if (!scroller || !items.length) return;

      const i = Math.max(0, Math.min(index, items.length - 1));
      const item = items[i];

      // Current positions in viewport coordinates
      const scrollerRect = scroller.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      // How far the item's left edge is from the scroller's left edge
      const delta = itemRect.left - scrollerRect.left;

      // New scrollLeft so item aligns with scroller left edge
      const target = scroller.scrollLeft + delta;

      const max = scroller.scrollWidth - scroller.clientWidth;
      scroller.scrollTo({
        left: Math.max(0, Math.min(target, max)),
        behavior: this.behavior,
      });
    },

    /* -------- pair fullscreen: now takes the clicked element -------- */

    async requestPairFullscreen(clickedEl) {
      const kids = this.getItems();
      const a = kids.indexOf(clickedEl);
      const b = a + 1;

      // nothing happens if there's no adjacent item (a==-1 or last item)
      if (a < 0 || b >= kids.length) return;

      const elA = kids[a];
      const elB = kids[b];

      const wA = elA.getBoundingClientRect().width;
      const wB = elB.getBoundingClientRect().width;
      const denom = Math.max(1, wA + wB);

      this.pairFs = {
        active: true,
        a,
        b,
        growA: wA / denom,
        growB: wB / denom,
      };

      this.$nextTick(() => this.applyPairStyles());

      const fsEl = this.$refs.fsWrapperRef;
      if (!fsEl?.requestFullscreen) {
        this.exitPairFullscreen();
        return;
      }

      try {
        if (!document.fullscreenElement) {
          await fsEl.requestFullscreen();
        }
      } catch (e) {
        this.exitPairFullscreen();
      }
    },

    async exitPairFullscreen() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch (e) {}

      this.pairFs = { active: false, a: -1, b: -1, growA: 1, growB: 1 };

      this.$nextTick(() => {
        this.applyPairStyles();
        this.updateScrollState();
      });
    },

    onFullscreenChange() {
      // Esc / browser UI exit
      if (!document.fullscreenElement && this.pairFs.active) {
        this.pairFs = { active: false, a: -1, b: -1, growA: 1, growB: 1 };
        this.$nextTick(() => {
          this.applyPairStyles();
          this.updateScrollState();
        });
      } else if (document.fullscreenElement && this.pairFs.active) {
        this.$nextTick(() => this.applyPairStyles());
      }
    },

    applyPairStyles() {
      const track = this.$refs.trackRef;
      if (!track) return;

      const kids = Array.from(track.children || []);

      kids.forEach((el, i) => {
        if (!this.pairFs.active) {
          el.style.display = '';
          el.style.flex = '';
          return;
        }

        if (i === this.pairFs.a) {
          el.style.display = '';
          el.style.flex = `${this.pairFs.growA} 1 0`;
        } else if (i === this.pairFs.b) {
          el.style.display = '';
          el.style.flex = `${this.pairFs.growB} 1 0`;
        } else {
          el.style.display = 'none';
          el.style.flex = '';
        }
      });
    },
  },
};
</script>

<style scoped>
.my-slide-shell {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
}

.my-slide-shell__nav {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-slide-fs-wrapper {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
}

.my-slide-scroller {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.my-slide-track {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  height: 100%;
}
.my-slide-track > * {
  flex: 0 0 auto !important;
  max-width: none !important;
}

.nav-arrow-btn {
  padding: 0 !important;
}

.nav-arrow-btn :deep(.v-btn__content),
.nav-arrow-btn :deep(.v-btn__overlay),
.nav-arrow-btn :deep(.v-btn__underlay) {
  width: 100% !important;
  height: 100% !important;
}

/* Pair fullscreen mode */
.is-pair-fullscreen .my-slide-scroller {
  overflow: hidden;
  height: 100vh;
}
.is-pair-fullscreen .my-slide-track {
  width: 100%;
  height: 100%;
  align-items: stretch;
}
.my-slide-fs-wrapper:fullscreen {
  width: 100vw;
  height: 100vh;
  background: white;
}

.my-slide-fs-wrapper:fullscreen .my-slide-scroller {
  width: 100%;
  height: 100%;
}
</style>
