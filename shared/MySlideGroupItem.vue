<template>
  <div
    ref="panelWrapperRef"
    class="my-slide-item"
    :class="{ 'my-slide-item--collapsed': isCollapsed }"
    :style="itemStyle"
  >
    <!-- Collapsed appearance -->
    <button
      v-show="isCollapsed"
      type="button"
      class="collapsed-panel"
      :style="collapsedPanelStyle"
      :aria-label="`Expand ${title || 'panel'}`"
      @click="expandPanel"
    >
      <v-icon size="16">mdi-chevron-right</v-icon>

      <span class="collapsed-panel__title">
        {{ title }}
      </span>
    </button>

    <!-- Normal expanded appearance -->
    <div v-show="!isCollapsed" class="panel-content" :style="panelStyle">
      <!-- Header -->
      <div class="panel-header">
        <!-- Left cluster: resize controls + optional left actions -->
        <div class="panel-left-cluster">
          <div class="panel-controls panel-controls--left">
            <Tooltip text="Decrease the width of this panel">
              <v-btn
                size="xx-small"
                variant="text"
                :disabled="atMin || isAnyFullscreenReactive"
                :class="{ 'panel-btn--inactive': isAnyFullscreenReactive }"
                @click="decreaseWidth"
              >
                <v-icon size="16">mdi-minus</v-icon>
              </v-btn>
            </Tooltip>

            <Tooltip text="Increase the width of this panel">
              <v-btn
                size="xx-small"
                variant="text"
                :disabled="atMax || isAnyFullscreenReactive"
                :class="{ 'panel-btn--inactive': isAnyFullscreenReactive }"
                @click="increaseWidth"
              >
                <v-icon size="16">mdi-plus</v-icon>
              </v-btn>
            </Tooltip>
          </div>

          <!-- Actions to the left of the title -->
          <div v-if="leftActions.length" class="panel-actions-row">
            <Tooltip
              v-for="action in leftActions"
              :key="action.id"
              :text="action.tooltip || ''"
            >
              <!-- Toggle action -->
              <v-btn
                v-if="action.kind === 'toggle'"
                :icon="actionHasIconOnly(action)"
                size="x-small"
                variant="text"
                :disabled="actionDisabled(action)"
                :class="{
                  'is-toggled': !!action.value,
                  'panel-btn--inactive': actionDisabled(action),
                }"
                @click="emitToggle(action)"
              >
                <v-icon v-if="toggleIcon(action)" size="16">
                  {{ toggleIcon(action) }}
                </v-icon>

                <span v-if="toggleText(action)" class="action-button-text">
                  {{ toggleText(action) }}
                </span>
              </v-btn>

              <!-- Ordinary button action -->
              <v-btn
                v-else
                :icon="actionHasIconOnly(action)"
                size="x-small"
                variant="text"
                :disabled="actionDisabled(action)"
                :class="{
                  'panel-btn--inactive': actionDisabled(action),
                }"
                @click="emitAction(action)"
              >
                <v-icon v-if="action.icon" size="16">
                  {{ action.icon }}
                </v-icon>

                <span v-if="action.btnText" class="action-button-text">
                  {{ action.btnText }}
                </span>
              </v-btn>
            </Tooltip>
          </div>
        </div>

        <!-- Title -->
        <div class="panel-title-wrap">
          <Tooltip v-if="titleTooltip" :text="titleTooltip">
            <div class="panel-title">{{ title }}</div>
          </Tooltip>

          <div v-else class="panel-title">
            {{ title }}
          </div>
        </div>

        <!-- Right cluster: actions + collapse/fullscreen controls -->
        <div class="panel-right-cluster">
          <!-- Actions to the right of the title -->
          <div v-if="rightActions.length" class="panel-actions-row">
            <Tooltip
              v-for="action in rightActions"
              :key="action.id"
              :text="action.tooltip || ''"
            >
              <!-- Toggle action -->
              <v-btn
                v-if="action.kind === 'toggle'"
                :icon="actionHasIconOnly(action)"
                size="x-small"
                variant="text"
                :disabled="actionDisabled(action)"
                :class="{
                  'is-toggled': !!action.value,
                  'panel-btn--inactive': actionDisabled(action),
                }"
                @click="emitToggle(action)"
              >
                <v-icon v-if="toggleIcon(action)" size="16">
                  {{ toggleIcon(action) }}
                </v-icon>

                <span v-if="toggleText(action)" class="action-button-text">
                  {{ toggleText(action) }}
                </span>
              </v-btn>

              <!-- Ordinary button action -->
              <v-btn
                v-else
                :icon="actionHasIconOnly(action)"
                size="x-small"
                variant="text"
                :disabled="actionDisabled(action)"
                :class="{
                  'panel-btn--inactive': actionDisabled(action),
                }"
                @click="emitAction(action)"
              >
                <v-icon v-if="action.icon" size="16">
                  {{ action.icon }}
                </v-icon>

                <span v-if="action.btnText" class="action-button-text">
                  {{ action.btnText }}
                </span>
              </v-btn>
            </Tooltip>
          </div>

          <div class="panel-controls panel-controls--right">
            <!-- Collapse -->
            <Tooltip v-if="allowCollapse" text="Collapse this panel">
              <v-btn
                size="xx-small"
                variant="text"
                :disabled="isAnyFullscreenReactive"
                :class="{ 'panel-btn--inactive': isAnyFullscreenReactive }"
                @click="collapsePanel"
              >
                <v-icon size="16">mdi-chevron-left</v-icon>
              </v-btn>
            </Tooltip>

            <!-- Single fullscreen -->
            <Tooltip
              v-if="allowFullscreen"
              :text="
                isFullscreen ? 'Exit fullscreen' : 'Show this panel fullscreen'
              "
            >
              <v-btn
                size="xx-small"
                variant="text"
                :disabled="isAnyFullscreenReactive && !isFullscreen"
                :class="{
                  'panel-btn--inactive':
                    isAnyFullscreenReactive && !isFullscreen,
                }"
                @click="toggleSingleFullscreen"
              >
                <v-icon size="16">
                  {{ isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
                </v-icon>
              </v-btn>
            </Tooltip>

            <!-- Paired fullscreen -->
            <Tooltip
              v-if="hasNext && allowPairedFullscreen"
              text="Show this panel and the next panel fullscreen"
            >
              <v-btn
                size="xx-small"
                variant="text"
                :disabled="isFullscreen || isAnyFullscreenReactive"
                :class="{
                  'panel-btn--inactive':
                    isFullscreen || isAnyFullscreenReactive,
                }"
                @click="pairFullscreen"
              >
                <v-icon size="16">mdi-arrow-expand-horizontal</v-icon>
              </v-btn>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="panel-body" :class="{ 'panel-body--scrollable': scrollable }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import Tooltip from './Tooltip.vue';

export default {
  name: 'MySlideGroupItem',

  components: {
    Tooltip,
  },

  inject: {
    requestPairFs: {
      from: 'mySlideGroupRequestPairFullscreen',
      default: null,
    },
  },

  emits: ['action', 'toggle', 'collapse-change'],

  props: {
    title: {
      type: String,
      default: '',
    },

    titleTooltip: {
      type: String,
      default: '',
    },

    width: {
      type: String,
      default: '30vw',
    },

    height: {
      type: String,
      default: '90%',
    },

    collapsedWidth: {
      type: String,
      default: '44px',
    },

    initiallyCollapsed: {
      type: Boolean,
      default: false,
    },

    allowCollapse: {
      type: Boolean,
      default: true,
    },

    // Can be rgb(...), #hex, or var(--something).
    bg: {
      type: String,
      default: '#f9f9f9',
    },

    borderColor: {
      type: String,
      default: '#ccc',
    },

    borderWidth: {
      type: String,
      default: '2px',
    },

    radius: {
      type: String,
      default: '8px',
    },

    shadow: {
      type: String,
      default: '0px 18px 40px rgba(15, 23, 42, 0.08)',
    },

    padding: {
      type: String,
      default: '12px',
    },

    margin: {
      type: String,
      default: '10px',
    },

    scrollable: {
      type: Boolean,
      default: true,
    },

    allowFullscreen: {
      type: Boolean,
      default: true,
    },

    allowPairedFullscreen: {
      type: Boolean,
      default: true,
    },

    actions: {
      type: Array,
      default: () => [],
      /*
       * Button:
       * {
       *   id,
       *   kind: 'button',       // optional; button is the default
       *   icon,
       *   btnText,
       *   tooltip,
       *   side: 'left'|'right',
       *   disabled,
       *   disableWhenFullscreen
       * }
       *
       * Toggle:
       * {
       *   id,
       *   kind: 'toggle',
       *   value,
       *   icon,
       *   iconOn,
       *   iconOff,
       *   btnText,
       *   btnTextOn,
       *   btnTextOff,
       *   tooltip,
       *   side: 'left'|'right',
       *   disabled,
       *   disableWhenFullscreen
       * }
       */
    },

    hasNext: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      widths: [10, 20, 30, 40, 50, 60, 70, 80],
      currentVw: 30,
      isCollapsed: this.initiallyCollapsed,
      isFullscreen: false,
      isAnyFullscreenReactive: false,
    };
  },

  computed: {
    normalizedActions() {
      return (this.actions || []).map((action) => ({
        kind: 'button',
        side: 'right',
        value: false,
        disabled: false,
        disableWhenFullscreen: false,
        ...action,
      }));
    },

    leftActions() {
      return this.normalizedActions.filter((action) => action.side === 'left');
    },

    rightActions() {
      return this.normalizedActions.filter((action) => action.side === 'right');
    },

    isAnyFullscreen() {
      return this.isAnyFullscreenReactive;
    },

    itemStyle() {
      if (this.isFullscreen) {
        return {};
      }

      return {
        width: this.isCollapsed ? this.collapsedWidth : `${this.currentVw}vw`,
        height: this.height,
      };
    },

    colourStyles() {
      const bg = (this.bg || '').trim();
      const isCssVar = bg.startsWith('var(');

      const bg10 = isCssVar
        ? `color-mix(in srgb, ${bg} 2%, white)`
        : this.toRgba(bg, 0.1);

      const bg01 = isCssVar
        ? `color-mix(in srgb, ${bg} 1%, white)`
        : this.toRgba(bg, 0.01);

      return {
        '--panel-bg': bg,
        '--panel-bg-10': bg10,
        '--panel-bg-01': bg01,
      };
    },

    panelStyle() {
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
        ...this.colourStyles,
      };
    },

    collapsedPanelStyle() {
      return {
        border: `${this.borderWidth} solid ${this.borderColor}`,
        borderRadius: this.radius,
        boxShadow: this.shadow,
        margin: this.margin,
        ...this.colourStyles,
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
    const initialWidth = parseInt(this.width, 10);

    this.currentVw = this.widths.includes(initialWidth) ? initialWidth : 30;

    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  },

  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  },

  methods: {
    collapsePanel() {
      if (!this.allowCollapse || this.isAnyFullscreenReactive) {
        return;
      }

      this.isCollapsed = true;
      this.$emit('collapse-change', true);
    },

    expandPanel() {
      this.isCollapsed = false;
      this.$emit('collapse-change', false);
    },

    actionDisabled(action) {
      if (action.disabled) {
        return true;
      }

      return action.disableWhenFullscreen && this.isAnyFullscreenReactive;
    },

    actionHasIconOnly(action) {
      const icon =
        action.kind === 'toggle' ? this.toggleIcon(action) : action.icon;

      const text =
        action.kind === 'toggle' ? this.toggleText(action) : action.btnText;

      return !!icon && !text;
    },

    toggleIcon(action) {
      if (action.value) {
        return action.iconOn || action.icon || '';
      }

      return action.iconOff || action.icon || '';
    },

    toggleText(action) {
      if (action.value) {
        return action.btnTextOn || action.btnText || '';
      }

      return action.btnTextOff || action.btnText || '';
    },

    emitAction(action) {
      if (this.actionDisabled(action)) {
        return;
      }

      this.$emit('action', {
        id: action.id,
      });
    },

    emitToggle(action) {
      if (this.actionDisabled(action)) {
        return;
      }

      this.$emit('toggle', {
        id: action.id,
        value: !action.value,
      });
    },

    toRgba(color, alpha) {
      if (!color || typeof color !== 'string') {
        return color;
      }

      const trimmedColour = color.trim();

      const rgbMatch = trimmedColour.match(
        /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)$/i,
      );

      if (rgbMatch) {
        const red = Number(rgbMatch[1]);
        const green = Number(rgbMatch[2]);
        const blue = Number(rgbMatch[3]);

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      }

      const hexMatch = trimmedColour.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

      if (hexMatch) {
        let hex = hexMatch[1];

        if (hex.length === 3) {
          hex = hex
            .split('')
            .map((character) => character + character)
            .join('');
        }

        const red = parseInt(hex.slice(0, 2), 16);
        const green = parseInt(hex.slice(2, 4), 16);
        const blue = parseInt(hex.slice(4, 6), 16);

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      }

      return trimmedColour;
    },

    increaseWidth() {
      if (this.atMax || this.isAnyFullscreen || this.isCollapsed) {
        return;
      }

      const currentIndex = this.widths.indexOf(this.currentVw);
      this.currentVw = this.widths[currentIndex + 1];
    },

    decreaseWidth() {
      if (this.atMin || this.isAnyFullscreen || this.isCollapsed) {
        return;
      }

      const currentIndex = this.widths.indexOf(this.currentVw);
      this.currentVw = this.widths[currentIndex - 1];
    },

    pairFullscreen() {
      if (
        !this.requestPairFs ||
        this.isCollapsed ||
        document.fullscreenElement
      ) {
        return;
      }

      const element = this.$refs.panelWrapperRef;

      if (!element) {
        return;
      }

      this.requestPairFs(element);
    },

    onFullscreenChange() {
      const fullscreenElement = document.fullscreenElement;
      const panelElement = this.$refs.panelWrapperRef;

      this.isAnyFullscreenReactive = !!fullscreenElement;
      this.isFullscreen = fullscreenElement === panelElement;
    },

    async toggleSingleFullscreen() {
      if (this.isCollapsed) {
        return;
      }

      const element = this.$refs.panelWrapperRef;

      if (!element) {
        return;
      }

      try {
        if (!document.fullscreenElement) {
          await element.requestFullscreen();
        } else if (document.fullscreenElement === element) {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.warn('Unable to toggle fullscreen:', error);
      }
    },
  },
};
</script>

<style scoped>
.my-slide-item {
  display: block;
  min-width: 0;
  transition: width 180ms ease;
}

.my-slide-item--collapsed {
  flex: 0 0 auto;
}

/* Expanded panel */
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

/* Collapsed column */
.collapsed-panel {
  appearance: none;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  padding: 8px 4px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  color: inherit;
  background-color: white;
  background-image: linear-gradient(
    180deg,
    var(--panel-bg-10),
    var(--panel-bg-01)
  );

  cursor: pointer;
  overflow: hidden;
  transition:
    background-color 150ms ease,
    box-shadow 150ms ease;
}

.collapsed-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 2px;
  background: var(--panel-bg);
}

.collapsed-panel:hover {
  background-color: var(--panel-bg-10);
}

.collapsed-panel:focus-visible {
  outline: 2px solid var(--panel-bg);
  outline-offset: -2px;
}

.collapsed-panel__title {
  writing-mode: vertical-rl;
  transform: rotate(180deg);

  max-height: calc(100% - 30px);
  font-weight: 600;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Header */
.panel-header {
  position: relative;
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

/* Left/right clusters */
.panel-left-cluster,
.panel-right-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Standard controls remain vertically stacked */
.panel-controls {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.panel-controls :deep(.v-btn) {
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 1px !important;
}

.panel-controls :deep(.v-icon) {
  line-height: 1 !important;
}

/* Custom actions are arranged horizontally */
.panel-actions-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
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

/* Body */
.panel-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.panel-body--scrollable {
  overflow: auto;
}

/* Action text */
.action-button-text {
  line-height: 1;
}

.v-icon + .action-button-text {
  margin-left: 4px;
}

/* Disabled controls */
.panel-btn--inactive {
  opacity: 0.35;
  pointer-events: none;
  filter: grayscale(100%);
}

.panel-btn--inactive :deep(.v-icon) {
  opacity: 0.5;
}

/* Toggle appearance */
.is-toggled {
  background: rgba(255, 0, 0, 0.25);
  border-radius: 6px;
}
</style>
