<template>
  <span
    ref="anchor"
    class="tooltip-anchor"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focus="onEnter"
    @blur="onLeave"
  >
    <slot />
  </span>

  <teleport :to="teleportTarget">
    <div
      v-show="rendered"
      class="tooltip-layer"
      :style="layerStyle"
      role="tooltip"
    >
      <div
        class="tooltip-bubble"
        :class="[{ 'is-visible': visible }, position]"
      >
        {{ text }}
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: "Tooltip",
  props: {
    text: { type: String, required: true },
    position: { type: String, default: "bottom" }, // top|bottom|left|right
    offset: { type: Number, default: 8 },
    showDelay: { type: Number, default: 300 },
    hideDelay: { type: Number, default: 120 },
  },
  data() {
    return {
      visible: false,
      rendered: false,
      layerStyle: {},
      teleportTarget: typeof document !== "undefined" ? document.body : null,
      showTimer: null,
      hideTimer: null,
    };
  },
  mounted() {
    // handle entering/leaving fullscreen
    document.addEventListener("fullscreenchange", this.updateTeleportTarget, {
      passive: true,
    });
    // keep position correct while visible
    window.addEventListener("resize", this.onViewportChange, { passive: true });
    window.addEventListener("scroll", this.onViewportChange, { passive: true });
  },
  beforeUnmount() {
    document.removeEventListener("fullscreenchange", this.updateTeleportTarget);
    window.removeEventListener("resize", this.onViewportChange);
    window.removeEventListener("scroll", this.onViewportChange);
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
  },
  methods: {
    updateTeleportTarget() {
      const fsEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      this.teleportTarget = fsEl || document.body;
      if (this.visible) this.positionTooltip();
    },
    onViewportChange() {
      if (this.visible) this.positionTooltip();
    },
    onEnter() {
      clearTimeout(this.hideTimer);
      clearTimeout(this.showTimer);
      this.showTimer = setTimeout(() => {
        this.positionTooltip();
        this.rendered = true;
        this.visible = true;
      }, this.showDelay);
    },
    onLeave() {
      clearTimeout(this.showTimer);
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        this.visible = false;
        setTimeout(() => (this.rendered = false), 200); // match CSS transition
      }, this.hideDelay);
    },
    positionTooltip() {
      const r = this.$refs.anchor.getBoundingClientRect();
      const pad = this.offset;
      let top = 0,
        left = 0,
        transform = "translate(-50%, -100%)";

      switch (this.position) {
        case "top":
          top = r.top - pad;
          left = r.left + r.width / 2;
          transform = "translate(-50%, -100%)";
          break;
        case "bottom":
          top = r.bottom + pad;
          left = r.left + r.width / 2;
          transform = "translate(-50%, 0)";
          break;
        case "left":
          top = r.top + r.height / 2;
          left = r.left - pad;
          transform = "translate(-100%, -50%)";
          break;
        case "right":
          top = r.top + r.height / 2;
          left = r.right + pad;
          transform = "translate(0, -50%)";
          break;
      }

      this.layerStyle = {
        position: "fixed", // fixed to the current viewport (fullscreen viewport when active)
        top: `${top}px`,
        left: `${left}px`,
        transform,
        pointerEvents: "none",
        zIndex: 20000,
      };
    },
  },
};
</script>

<style scoped>
.tooltip-anchor {
  position: relative;
  display: inline-flex;
}
.tooltip-layer {
  max-width: 380px;
}

/* bubble + transitions */
.tooltip-bubble {
  background: #f3f2fd;
  color: #16003c;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 18px;
  line-height: 1.2;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  white-space: normal;
  opacity: 0;
  transform: translateY(2px);
  transition:
    opacity 150ms ease,
    transform 150ms ease;
  pointer-events: none;
}
.tooltip-bubble.is-visible {
  opacity: 1;
}

/* directional micro-slide */
.tooltip-bubble.top {
  transform: translateY(2px);
}
.tooltip-bubble.top.is-visible {
  transform: translateY(0);
}
.tooltip-bubble.bottom {
  transform: translateY(-2px);
}
.tooltip-bubble.bottom.is-visible {
  transform: translateY(0);
}
.tooltip-bubble.left {
  transform: translateX(2px);
}
.tooltip-bubble.left.is-visible {
  transform: translateX(0);
}
.tooltip-bubble.right {
  transform: translateX(-2px);
}
.tooltip-bubble.right.is-visible {
  transform: translateX(0);
}
</style>
