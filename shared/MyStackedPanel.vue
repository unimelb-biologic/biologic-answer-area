<template>
  <div
    class="my-stacked-panel"
    :class="[
      isCollapsed ? 'my-stacked-panel--collapsed' : '',
      isHorizontal
        ? 'my-stacked-panel--horizontal'
        : 'my-stacked-panel--vertical',
    ]"
    :style="panelStyle"
  >
    <!-- Mini header -->
    <button
      type="button"
      class="my-stacked-panel__header"
      :class="
        isHorizontal
          ? 'my-stacked-panel__header--horizontal'
          : 'my-stacked-panel__header--vertical'
      "
      :aria-expanded="!isCollapsed"
      :aria-label="isCollapsed ? `Expand ${title}` : `Collapse ${title}`"
      @click="toggleCollapse"
    >
      <v-icon class="my-stacked-panel__chevron" :class="chevronClass" size="14">
        {{ isHorizontal ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
      </v-icon>
      <span
        class="my-stacked-panel__title"
        :class="isHorizontal ? 'my-stacked-panel__title--horizontal' : ''"
      >
        {{ title }}
      </span>
    </button>

    <!-- Body -->
    <div
      class="my-stacked-panel__body"
      :class="[
        'my-stacked-panel__body--' + (isHorizontal ? 'horizontal' : 'vertical'),
        isCollapsed ? 'my-stacked-panel__body--hidden' : '',
      ]"
    >
      <div class="my-stacked-panel__body-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
let nextId = 0;

export default {
  name: 'MyStackedPanel',

  inject: {
    register: {
      from: 'myStackedPanelsRegister',
      default: null,
    },
    unregister: {
      from: 'myStackedPanelsUnregister',
      default: null,
    },
    notifyCollapse: {
      from: 'myStackedPanelsNotifyCollapse',
      default: null,
    },
    getState: {
      from: 'myStackedPanelsGetState',
      default: null,
    },
    myStackedPanelsState: {
      from: 'myStackedPanelsState',
      default: () => ({ isHorizontal: false }),
    },
  },

  props: {
    title: {
      type: String,
      default: '',
    },
    initiallyCollapsed: {
      type: Boolean,
      default: false,
    },
    flex: {
      type: Number,
      default: 1,
    },
  },

  data() {
    return {
      id: nextId++,
      isCollapsed: this.initiallyCollapsed,
    };
  },

  computed: {
    isHorizontal() {
      return this.myStackedPanelsState.isHorizontal;
    },

    currentFlex() {
      return this.getState?.(this.id)?.flex ?? this.flex;
    },

    panelStyle() {
      if (this.isCollapsed) {
        return { flex: '0 0 auto' };
      }
      return {
        flex: `${this.currentFlex} 1 0`,
        minHeight: '0',
        minWidth: '0',
      };
    },

    chevronClass() {
      if (this.isHorizontal) {
        return this.isCollapsed ? 'my-stacked-panel__chevron--collapsed-h' : '';
      }
      return this.isCollapsed ? 'my-stacked-panel__chevron--collapsed-v' : '';
    },
  },

  mounted() {
    this.register?.(this.id, this.isCollapsed, this.flex);
  },

  beforeUnmount() {
    this.unregister?.(this.id);
  },

  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      this.notifyCollapse?.(this.id, this.isCollapsed);
    },
  },
};
</script>

<style scoped>
.my-stacked-panel {
  display: flex;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  transition: flex 250ms ease;
}

.my-stacked-panel--vertical {
  flex-direction: column;
}

.my-stacked-panel--horizontal {
  flex-direction: row;
}

/* ── Mini header ── */
.my-stacked-panel__header {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  cursor: pointer;
  text-align: left;
  user-select: none;
  transition: background 150ms ease;
}

.my-stacked-panel__header:hover {
  background: rgba(0, 0, 0, 0.08);
}

.my-stacked-panel__header:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}

.my-stacked-panel__header--vertical {
  flex-direction: row;
  width: 100%;
  padding: 4px 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.my-stacked-panel__header--horizontal {
  flex-direction: column;
  height: 100%;
  padding: 8px 4px;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  justify-content: flex-start;
}

/* ── Chevron ── */
.my-stacked-panel__chevron {
  flex: 0 0 auto;
  transition: transform 250ms ease;
}

.my-stacked-panel__chevron--collapsed-v {
  transform: rotate(-90deg);
}

.my-stacked-panel__chevron--collapsed-h {
  transform: rotate(90deg);
}

/* ── Title ── */
.my-stacked-panel__title {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  opacity: 0.75;
}

.my-stacked-panel__title--horizontal {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-overflow: clip;
}

/* ── Body ── */
.my-stacked-panel__body {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

/* Vertical: animate rows */
.my-stacked-panel__body--vertical {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 250ms ease;
}

.my-stacked-panel__body--vertical.my-stacked-panel__body--hidden {
  grid-template-rows: 0fr;
}

/* Horizontal: animate columns */
.my-stacked-panel__body--horizontal {
  display: grid;
  grid-template-columns: 1fr;
  transition: grid-template-columns 250ms ease;
}

.my-stacked-panel__body--horizontal.my-stacked-panel__body--hidden {
  grid-template-columns: 0fr;
}

.my-stacked-panel__body-inner {
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  height: 100%;
}

.my-stacked-panel:not(.my-stacked-panel--collapsed)
  .my-stacked-panel__body-inner {
  overflow: auto;
}
</style>
