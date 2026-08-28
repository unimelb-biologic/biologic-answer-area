<script>
import { h, reactive, resolveComponent } from 'vue';

export default {
  name: 'MyStackedPanels',

  provide() {
    const sharedState = reactive({ isHorizontal: false });
    this._sharedState = sharedState;
    return {
      myStackedPanelsRegister: this.register,
      myStackedPanelsUnregister: this.unregister,
      myStackedPanelsNotifyCollapse: this.notifyCollapse,
      myStackedPanelsGetState: this.getState,
      myStackedPanelsState: sharedState,
    };
  },

  data() {
    return {
      panels: [],
      isHorizontal: false,
      drag: null,
    };
  },

  mounted() {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  },

  beforeUnmount() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  },

  methods: {
    /* ── Panel registration ── */

    register(id, collapsed, flex) {
      this.panels.push({ id, collapsed, flex });
    },

    unregister(id) {
      this.panels = this.panels.filter((p) => p.id !== id);
    },

    notifyCollapse(id, collapsed) {
      const panel = this.panels.find((p) => p.id === id);
      if (panel) panel.collapsed = collapsed;
    },

    getState(id) {
      return this.panels.find((p) => p.id === id) ?? null;
    },

    /* ── Direction toggle ── */

    toggleDirection() {
      this.isHorizontal = !this.isHorizontal;
      this._sharedState.isHorizontal = this.isHorizontal;
    },

    /* ── Divider visibility ──
       Only show a divider between two adjacent expanded panels. */

    isDividerVisible(index) {
      if (index === 0 || index >= this.panels.length) return false;
      const before = this.panels[index - 1];
      const after = this.panels[index];
      return before && after && !before.collapsed && !after.collapsed;
    },

    /* ── Drag ── */

    startDrag(event, afterIndex) {
      event.preventDefault();

      const beforePanel = this.panels[afterIndex - 1];
      const afterPanel = this.panels[afterIndex];

      if (!beforePanel || !afterPanel) return;
      if (beforePanel.collapsed || afterPanel.collapsed) return;

      const container = this.$refs.containerRef;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerSize = this.isHorizontal ? rect.width : rect.height;

      this.drag = {
        beforeId: beforePanel.id,
        afterId: afterPanel.id,
        startPos: this.isHorizontal ? event.clientX : event.clientY,
        beforeFlex: beforePanel.flex,
        afterFlex: afterPanel.flex,
        containerSize,
      };
    },

    onPointerMove(event) {
      if (!this.drag) return;

      const currentPos = this.isHorizontal ? event.clientX : event.clientY;
      const delta = currentPos - this.drag.startPos;

      const totalFlex = this.drag.beforeFlex + this.drag.afterFlex;
      const flexDelta = (delta / this.drag.containerSize) * totalFlex;
      const minFlex = totalFlex * 0.1;

      const newBeforeFlex = Math.min(
        Math.max(this.drag.beforeFlex + flexDelta, minFlex),
        totalFlex - minFlex,
      );
      const newAfterFlex = totalFlex - newBeforeFlex;

      const beforePanel = this.panels.find((p) => p.id === this.drag.beforeId);
      const afterPanel = this.panels.find((p) => p.id === this.drag.afterId);

      if (beforePanel) beforePanel.flex = newBeforeFlex;
      if (afterPanel) afterPanel.flex = newAfterFlex;
    },

    onPointerUp() {
      this.drag = null;
    },

    /* ── Render helpers ── */

    renderDivider(index) {
      return h(
        'div',
        {
          class: [
            'my-stacked-panels__divider',
            this.isHorizontal
              ? 'my-stacked-panels__divider--vertical'
              : 'my-stacked-panels__divider--horizontal',
          ],
          onPointerdown: (e) => this.startDrag(e, index),
        },
        [h('div', { class: 'my-stacked-panels__divider-handle' })],
      );
    },

    renderToolbar() {
      const VIcon = resolveComponent('VIcon');

      return h('div', { class: 'my-stacked-panels__toolbar' }, [
        h(
          'button',
          {
            type: 'button',
            class: 'my-stacked-panels__direction-btn',
            onClick: this.toggleDirection,
          },
          [
            h(
              VIcon,
              { size: 14 },
              {
                default: () =>
                  this.isHorizontal
                    ? 'mdi-arrow-split-vertical'
                    : 'mdi-arrow-split-horizontal',
              },
            ),
          ],
        ),
      ]);
    },
  },

  render() {
    const slotChildren = this.$slots.default?.() ?? [];

    const interleaved = [];
    slotChildren.forEach((child, index) => {
      if (index > 0 && this.isDividerVisible(index)) {
        interleaved.push(this.renderDivider(index));
      }
      interleaved.push(child);
    });

    const container = h(
      'div',
      {
        ref: 'containerRef',
        class: [
          'my-stacked-panels__container',
          this.isHorizontal
            ? 'my-stacked-panels__container--horizontal'
            : 'my-stacked-panels__container--vertical',
        ],
      },
      interleaved,
    );

    return h('div', { class: 'my-stacked-panels' }, [
      this.renderToolbar(),
      container,
    ]);
  },
};
</script>

<style scoped>
.my-stacked-panels {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* ── Toolbar ── */
.my-stacked-panels__toolbar {
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 2px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 22px;
}

.my-stacked-panels__direction-btn {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
  transition:
    opacity 150ms ease,
    background 150ms ease;
}

.my-stacked-panels__direction-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.08);
}

.my-stacked-panels__direction-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.my-stacked-panels__direction-icon {
  font-size: 14px;
  line-height: 1;
}

/* ── Container ── */
.my-stacked-panels__container {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  display: flex;
  overflow: hidden;
}

.my-stacked-panels__container--vertical {
  flex-direction: column;
}

.my-stacked-panels__container--horizontal {
  flex-direction: row;
}

/* ── Dividers ── */
.my-stacked-panels__divider {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.my-stacked-panels__divider--horizontal {
  width: 100%;
  height: 8px;
  cursor: row-resize;
}

.my-stacked-panels__divider--vertical {
  width: 8px;
  height: 100%;
  cursor: col-resize;
}

.my-stacked-panels__divider-handle {
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none;
}

.my-stacked-panels__divider:hover .my-stacked-panels__divider-handle,
.my-stacked-panels__divider:active .my-stacked-panels__divider-handle {
  opacity: 1;
}

.my-stacked-panels__divider--horizontal .my-stacked-panels__divider-handle {
  width: 40px;
  height: 3px;
}

.my-stacked-panels__divider--vertical .my-stacked-panels__divider-handle {
  width: 3px;
  height: 40px;
}
</style>
