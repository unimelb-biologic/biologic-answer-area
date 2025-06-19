<template>
  <vue-draggable-resizable :x="position.x" :y="position.y" :w="200" :h="collapsed ? 35 : 400" :min-width="200"
    :min-height="400" @dragging="onDragging" class="draggable-box" drag-handle=".header" :resizable="true"
    :handles="['tl', 'tr', 'bl', 'br', 'tm', 'bm', 'ml', 'mr']">
    <Tooltip
      :text="collapsed ? 'This panel contains connector elements which you can drag into your answer area. Click the down-arrow to reveal them.' : 'This panel contains connector elements which you can drag into your answer area. Click the up-arrow to collapse the panel.'">
      <div class="header" style="display:flex; justify-content: space-between;">
        <span>CONNECTORS &nbsp;&nbsp;&nbsp; </span><!--{{ position.x }}, {{ position.y }}-->
        <v-spacer></v-spacer>
        <v-btn size="xx-small" @click="toggleCollapse">
          <v-icon>{{ collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
        </v-btn>
      </div>
    </Tooltip>
    <div v-show="!collapsed" class="content-container">
      <Connector v-for="connector in this.connectors" :key="connector" :connector-i-d="undefined" :selected-phrase="0"
        :connector-content-i-d="connector[0]" :connector-content="connector[1]" />

    </div>
  </vue-draggable-resizable>
</template>

<script>
import Connector from "./Connector.vue";
import VueDraggableResizable from "vue-draggable-resizable";
import "./assets/VueDraggableResizable_Style.css";
import Tooltip from "./Tooltip.vue";

export default {
  name: "ConnectorArea",
  props: {
  },
  emits: [],
  components: {
    Connector,
    VueDraggableResizable,
    Tooltip
  },
  methods: {
    onDragging(newX, newY) {
      this.position.x = newX;
      this.position.y = newY;
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    }
  },
  data() {
    return {
      connectors: [
        [
          0,
          [
            [undefined, " because ", undefined],
            [undefined, ". The reason for this is that ", undefined],
            [undefined, " due to the fact that ", undefined],
          ],
        ],

        [
          1,
          [
            [undefined, " so ", undefined],
            [undefined, ". This implies that ", undefined],
            [undefined, " which implies that ", undefined],
            [undefined, " hence ", undefined],
            [undefined, ". Thus, ", undefined],
            [undefined, " which suggests that ", undefined],
            [undefined, ". This suggests that ", undefined],
            [undefined, " indicating that ", undefined],
            [undefined, " suggesting the possibility that ", undefined],
          ],
        ],

        [
          2,
          [
            [undefined, " shows that ", undefined],
          ],
        ],

        [
          3,
          [
            [undefined, " and ", undefined],
            [undefined, ". In addition, ", undefined],
            [undefined, " together with the fact that ", undefined],
            [undefined, ". Furthermore, ", undefined],
            [undefined, ". Moreover, ", undefined],
            [undefined, ". Similarly, ", undefined],
          ],
        ],

        [
          4,
          [
            [undefined, " whereas ", undefined],
            [undefined, ". On the other hand ", undefined],
            [undefined, " but ", undefined],
            [undefined, " however ", undefined],
            [undefined, ". In contrast, ", undefined],
          ],
        ],

        [7,
          [
            [undefined, " e.g. ", undefined],
            [undefined, ". For example, ", undefined],
          ],
        ],
        [8,
          [
            [undefined, " i.e. ", undefined],
            [undefined, ". In other words, ", undefined]
          ]
        ]

      ],
      position: { x: 0, y: 0 }, // iniitial position
      collapsed: false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      const parent = this.$el.parentElement;
      if (parent) {
        this.position.x = parent.clientWidth - 200 - 20; // Adjust based on component width
        this.position.y = 20; // Top position
      }
    });
  }
};
</script>

<style scoped>
.draggable-box {
  border: 1px solid #ccc;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.3);
  background: rgb(243, 245, 251);
  overflow: hidden;
  /* Ensures no content spills out of the resizable box */
}

.content-container {
  /*display: grid;
  grid-template-columns: repeat(1,1fr);
  gap: 0px;*/
  width: 100%;
  height: 100%;
  overflow: auto;
  /* Adds scrollbars if content overflows */
  padding: 10px;
  /* Optional padding for content spacing */
  box-sizing: border-box;
  /* Ensures padding is included in width/height */
}

.header {
  background-color: var(--biologic-grey-color);
  color: var(--biologic-blue-color);
  padding: 4px;
  cursor: move;
  /* Indicates draggable area */
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

::v-deep(.handle-tl),
::v-deep(.handle-tr),
::v-deep(.handle-bl),
::v-deep(.handle-br),
::v-deep(.handle-tm),
::v-deep(.handle-bm),
::v-deep(.handle-ml),
::v-deep(.handle-mr) {
  width: 10px;
  height: 10px;
  background-color: #1976D2;
  /* Handle color */
  position: absolute;
  z-index: 10;
}

.handle-tl {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.handle-tr {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.handle-bl {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.handle-br {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

.handle-tm {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}

.handle-bm {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}

.handle-ml {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: w-resize;
}

.handle-mr {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: e-resize;
}
</style>
