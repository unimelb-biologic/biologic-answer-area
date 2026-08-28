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
        :disabled="pairFs.active || fitAllAutomatically"
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
        :disabled="pairFs.active || fitAllAutomatically"
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

    // NEW: automatically size all non-collapsed items to fill the group
    fitAllAutomatically: { type: Boolean, default: false },
  },

  data() {
    return {
      canScrollLeft: false,
      canScrollRight: false,
      raf: null,
      ro: null,
      mo: null, //  MutationObserver handle
      pairFs: {
        active: false,
        a: -1,
        b: -1,
        growA: 1,
        growB: 1,
        returnIndex: 0,
      },
    };
  },

  provide() {
    return {
      // keeps existing pair fullscreen API
      mySlideGroupRequestPairFullscreen: this.requestPairFullscreen,
      mySlideGroupExitPairFullscreen: this.exitPairFullscreen,

      // NEW: let children query whether fit-all is active and notify parent on collapse changes
      mySlideGroupFitAllAuto: () => this.fitAllAutomatically,
      mySlideGroupNotifyCollapseChanged: this.onChildCollapseChanged,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.updateScrollState();

      document.addEventListener('fullscreenchange', this.onFullscreenChange);

      if (window.ResizeObserver) {
        this.ro = new ResizeObserver(() => {
          this.updateScrollState();
          // pair fullscreen takes precedence
          if (this.pairFs.active) {
            this.applyPairStyles();
          } else if (this.fitAllAutomatically) {
            this.applyFitAllStyles();
          } else {
            // ensure we clear any inline styles that belong to fitAll if turned off unexpectedly
            this.applyNormalStyles();
          }
        });
        if (this.$refs.scrollerRef) this.ro.observe(this.$refs.scrollerRef);
        if (this.$refs.trackRef) this.ro.observe(this.$refs.trackRef);
      } else {
        window.addEventListener('resize', this.onResizeFallback, {
          passive: true,
        });
      }

      // Ensure initial layout for fitAll if requested
      if (!this.pairFs.active && this.fitAllAutomatically) {
        this.applyFitAllStyles();
      }

      // observe children added/removed so we can re-apply fit-all after new items mount
      try {
        const track = this.$refs.trackRef;
        if (track && window.MutationObserver) {
          this.mo = new MutationObserver(() => {
            // let Vue mount child and let browser settle; schedule application
            this.$nextTick(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (this.pairFs.active) {
                    this.applyPairStyles();
                  } else if (this.fitAllAutomatically) {
                    this.applyFitAllStyles();
                  } else {
                    this.applyNormalStyles();
                  }
                });
              });
            });
          });
          this.mo.observe(track, {
            childList: true /* don't need subtree */,
            attributes: false,
          });
        }
      } catch (e) {
        // no-op if MutationObserver not available
        // eslint-disable-next-line no-console
        console.warn('MySlideGroup: MutationObserver not available', e);
      }
    });
  },

  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    if (this.ro) this.ro.disconnect();
    if (this.mo) this.mo.disconnect(); // <- disconnect the mutation observer
    window.removeEventListener('resize', this.onResizeFallback);
    if (this.raf) cancelAnimationFrame(this.raf);
  },

  watch: {
    // react to the prop changing
    fitAllAutomatically(newVal) {
      this.$nextTick(() => {
        if (this.pairFs.active) {
          // pair fullscreen overrides fit-all; nothing to do now
          return;
        }
        if (newVal) this.applyFitAllStyles();
        else this.applyNormalStyles();
      });
    },
  },

  methods: {
    onResizeFallback() {
      this.updateScrollState();
      if (this.pairFs.active) this.applyPairStyles();
      else if (this.fitAllAutomatically) this.applyFitAllStyles();
      else this.applyNormalStyles();
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

      // When fitAllAutomatically is active we hide overflow; set canScrollLeft/Right to false
      if (this.fitAllAutomatically && !this.pairFs.active) {
        this.canScrollLeft = false;
        this.canScrollRight = false;
        return;
      }

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
      if (this.pairFs?.active || this.fitAllAutomatically) return;
      this.scrollToIndex(this.getAlignedIndex() - 1);
    },

    scrollRight() {
      if (this.pairFs?.active || this.fitAllAutomatically) return;
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

    /* -------- pair fullscreen (unchanged behaviour) -------- */

    async requestPairFullscreen(clickedEl) {
      const kids = this.getItems();
      const a = kids.indexOf(clickedEl);

      if (a < 0) return;

      // Skip any collapsed panels after the clicked panel.
      const b = kids.findIndex(
        (item, index) =>
          index > a && !item.classList.contains('my-slide-item--collapsed'),
      );

      // No expanded panel exists to the right.
      if (b < 0) return;

      const elA = kids[a];
      const elB = kids[b];

      const alignedBeforeFs = this.getAlignedIndex();

      const wA = elA.getBoundingClientRect().width;
      const wB = elB.getBoundingClientRect().width;
      const denom = Math.max(1, wA + wB);

      this.pairFs = {
        active: true,
        a,
        b,
        growA: wA / denom,
        growB: wB / denom,
        returnIndex: alignedBeforeFs,
      };

      this.$nextTick(() => this.applyPairStyles());

      const fsEl = this.$refs.fsWrapperRef;

      if (!fsEl?.requestFullscreen) {
        await this.exitPairFullscreen();
        return;
      }

      try {
        if (!document.fullscreenElement) {
          await fsEl.requestFullscreen();
        }
      } catch (error) {
        await this.exitPairFullscreen();
      }
    },

    async exitPairFullscreen() {
      const returnIndex = this.pairFs?.returnIndex ?? 0;

      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch (e) {}

      this.pairFs = {
        active: false,
        a: -1,
        b: -1,
        growA: 1,
        growB: 1,
        returnIndex,
      };

      this.$nextTick(() => {
        this.applyPairStyles();

        // Let layout + scrollWidth settle before scrolling
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.scrollToIndex(returnIndex);
            this.updateScrollState();
          });
        });
      });
    },

    onFullscreenChange() {
      // Esc / browser UI exit
      if (!document.fullscreenElement && this.pairFs.active) {
        const returnIndex = this.pairFs?.returnIndex ?? 0;

        this.pairFs = {
          active: false,
          a: -1,
          b: -1,
          growA: 1,
          growB: 1,
          returnIndex,
        };

        this.$nextTick(() => {
          this.applyPairStyles();
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.scrollToIndex(returnIndex);
              this.updateScrollState();
            });
          });
        });
      } else if (document.fullscreenElement && this.pairFs.active) {
        this.$nextTick(() => this.applyPairStyles());
      }
    },

    applyPairStyles() {
      const track = this.$refs.trackRef;
      if (!track) return;

      const kids = Array.from(track.children || []);

      if (!this.pairFs.active) {
        // If fit-all is enabled, let that layout take precedence
        if (this.fitAllAutomatically) {
          this.applyFitAllStyles();
          return;
        }

        // restore regular (non-pair) styles
        kids.forEach((el) => {
          el.style.display = '';
          el.style.removeProperty('flex');
        });

        // ensure scroller overflow is default when not fit-all
        const scroller = this.getScroller();
        if (scroller) scroller.style.removeProperty('overflow-x');

        return;
      }

      // pairFS active: follow the existing pair fullscreen behaviour
      kids.forEach((el, i) => {
        if (!this.pairFs.active) {
          el.style.display = '';
          el.style.removeProperty('flex');
          return;
        }

        if (i === this.pairFs.a) {
          el.style.display = '';
          el.style.setProperty('flex', `${this.pairFs.growA} 1 0`, 'important');
        } else if (i === this.pairFs.b) {
          el.style.display = '';
          el.style.setProperty('flex', `${this.pairFs.growB} 1 0`, 'important');
        } else {
          el.style.display = 'none';
          el.style.removeProperty('flex');
        }
      });

      // hide scroller overflow during pair fullscreen
      const scroller = this.getScroller();
      if (scroller) scroller.style.overflowX = 'hidden';
    },

    /* -------- fit-all behaviour -------- */

    // Called by items when their collapse state changes
    onChildCollapseChanged() {
      this.$nextTick(() => {
        if (this.pairFs.active) {
          // pair fullscreen has priority; let applyPairStyles handle it
          this.applyPairStyles();
        } else if (this.fitAllAutomatically) {
          this.applyFitAllStyles();
        } else {
          this.applyNormalStyles();
        }
        this.updateScrollState();
      });
    },

    applyFitAllStyles() {
      if (!this.fitAllAutomatically) {
        this.applyNormalStyles();
        return;
      }

      const track = this.$refs.trackRef;
      if (!track) return;

      const kids = Array.from(track.children || []);

      const collapsedKids = [];
      const expandedKids = [];

      for (const el of kids) {
        if (el.classList.contains('my-slide-item--collapsed')) {
          collapsedKids.push(el);
        } else {
          expandedKids.push(el);
        }
      }

      // Apply collapsed widths (via data attribute) and fix flex for collapsed items
      collapsedKids.forEach((el) => {
        const cw = el.getAttribute('data-collapsed-width') || '44px';
        el.style.display = '';
        el.style.setProperty('flex', `0 0 ${cw}`, 'important');
        el.style.removeProperty('width');
      });

      // Expanded items share leftover space equally
      if (expandedKids.length > 0) {
        expandedKids.forEach((el) => {
          el.style.display = '';
          el.style.setProperty('flex', `1 1 0`, 'important');
          el.style.removeProperty('width');
        });
      } else {
        // If no expanded items, keep collapsed items as-is; ensure others reset
        kids.forEach((el) => {
          if (!el.classList.contains('my-slide-item--collapsed')) {
            el.style.removeProperty('flex');
          }
        });
      }

      // hide horizontal scrolling when using fit-all
      const scroller = this.getScroller();
      if (scroller) scroller.style.overflowX = 'hidden';

      // update nav state
      this.updateScrollState();
    },

    // Restore "normal" behaviour (remove inline flex and overflow-x overrides)
    applyNormalStyles() {
      const track = this.$refs.trackRef;
      if (!track) return;

      const kids = Array.from(track.children || []);
      kids.forEach((el) => {
        el.style.display = '';
        el.style.removeProperty('flex');
        // Do not forcibly remove width here; items compute widths themselves when not fit-all
      });

      const scroller = this.getScroller();
      if (scroller) scroller.style.removeProperty('overflow-x');

      this.updateScrollState();
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
:deep(.my-slide-track > *) {
  flex: 0 0 auto;
  max-width: none;
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

/* Optional small transition for smoother flex changes */
.my-slide-track > * {
  transition:
    flex 180ms ease,
    width 180ms ease;
}
</style>
