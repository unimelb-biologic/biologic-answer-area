<template>
  <div
    class="scaffold-container"
    :class="{ 'current-hover-target': showButtons }"
    :style="{
      left: scaffoldData.left + 'px',
      top: scaffoldData.top + 'px',
      position: scaffoldData.position,
    }"
    ref="scaffoldContainerRef"
    draggable="true"
    :data-hover-id="scaffoldData.scaffoldID"
    :data-hover-depth="depth"
    @dragstart.stop="startDrag"
    @dragend="endDrag"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Action buttons — same hover pattern as Connector.vue -->
    <div
      v-if="showButtons && !dragInProgress && !displayOnly"
      class="buttons-container"
    >
      <Tooltip :text="scaffoldData.collapsed ? 'Expand' : 'Collapse'">
        <v-btn
          icon
          size="xx-small"
          class="scaffold-button"
          @click="handleToggleCollapsed"
          :aria-label="scaffoldData.collapsed ? 'Expand' : 'Collapse'"
        >
          <v-icon>{{
            scaffoldData.collapsed ? 'mdi-arrow-expand' : 'mdi-arrow-collapse'
          }}</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip text="Duplicate this scaffold and all its children">
        <v-btn
          icon
          size="xx-small"
          class="scaffold-button"
          @click="handleDuplicate"
        >
          <v-icon>mdi-content-duplicate</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip :text="deleteTooltip">
        <v-btn
          icon
          size="xx-small"
          class="scaffold-button"
          :disabled="!allSlotsEmpty"
          @click="handleDelete"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </Tooltip>
    </div>

    <!-- Collapsed view -->
    <div v-if="scaffoldData.collapsed" class="scaffold-collapsed-text">
      {{ scaffoldData.title }}
    </div>

    <!-- Expanded card -->
    <div v-else class="scaffold-card">
      <!-- Folded corner is rendered via ::before / ::after in CSS -->

      <!-- Title bar -->
      <div class="scaffold-title-bar">
        <v-icon size="14" class="scaffold-title-icon"
          >mdi-file-document-outline</v-icon
        >
        <span class="scaffold-title-text">{{ scaffoldData.title }}</span>
      </div>

      <!-- Slots -->
      <div class="scaffold-slots">
        <div
          v-for="(child, index) in scaffoldData.children"
          :key="child.childID ?? 'empty-' + index"
          class="scaffold-slot"
          :class="slotLayoutClass"
        >
          <!-- Label -->
          <div class="scaffold-slot-label">
            <span class="scaffold-slot-number">{{ index + 1 }}.</span>
            <span class="scaffold-slot-label-text">{{ child.label }}</span>
          </div>

          <!-- Target or occupied child -->
          <div class="scaffold-slot-target-area">
            <!-- Empty target box -->
            <div
              v-if="child.isEmpty()"
              class="scaffold-target-box"
              :ref="(el) => setTargetBoxRef(el, index)"
              @drop.stop="onDropOnSlot($event, index)"
              @dragover.prevent="handleDragOver"
              @dragenter.prevent="handleDragEnterSlot($event, index)"
              @dragleave.prevent="handleDragLeaveSlot($event, index)"
            />

            <!-- Occupied: Statement -->
            <RenderStatement
              v-else-if="child.childType === 'statement'"
              :statement-data="allStatements[child.childID]"
              :show-toggle="true"
              :depth="depthPlusOne"
              :exnet-type="exnetType"
              @update-statement-content="
                (info) => handleUpdateChildStatementContent(info, index)
              "
              @duplicate-statement="
                (payload) => $emit('duplicate-statement', payload)
              "
              @delete-statement="(id) => $emit('delete-statement', id)"
              @connector-dropped-on-statement="
                (info) => $emit('connector-dropped-on-statement', info)
              "
              @toggle-collapsed-renderstatement="
                (id) =>
                  $emit('toggle-collapsed-renderstatement-from-scaffold', id)
              "
              @toggle-showPopup-fromrenderstatement="
                (id) => $emit('toggle-showPopup-fromscaffold', id)
              "
            />

            <!-- Occupied: Connector -->
            <Connector
              v-else-if="child.childType === 'connector'"
              :connector-i-d="child.childID"
              :connector-content-i-d="
                allConnectors[child.childID].connectorContentID
              "
              :connector-content="allConnectors[child.childID].connectorContent"
              :all-statements="allStatements"
              :all-connectors="allConnectors"
              :all-scaffolds="allScaffolds"
              :parent="allConnectors[child.childID].parent"
              :left-i-d="allConnectors[child.childID].leftID"
              :left-type="allConnectors[child.childID].leftType"
              :left-content="allConnectors[child.childID].leftContent"
              :right-i-d="allConnectors[child.childID].rightID"
              :right-type="allConnectors[child.childID].rightType"
              :right-content="allConnectors[child.childID].rightContent"
              :click-count="allConnectors[child.childID].clickCount"
              :orientation="allConnectors[child.childID].orientation"
              :selected-phrase="allConnectors[child.childID].selectedPhrase"
              :root-connector-i-d="child.childID"
              :depth="depthPlusOne"
              :exnet-type="exnetType"
              @delete-connector="
                handleDeleteChildConnector({
                  id: child.childID,
                  slotIndex: index,
                })
              "
              @delete-child-connector="
                (params) => $emit('delete-child-connector', params)
              "
              @duplicate-statement="
                (payload) => $emit('duplicate-statement', payload)
              "
              @duplicate-connector="
                (payload) => $emit('duplicate-connector', payload)
              "
              @delete-statement="(id) => $emit('delete-statement', id)"
              @dropped-astat="handleAStatementDrop"
              @dropped-bstat="handleBStatementDrop"
              @dropped-aconn="handleAConnectorDrop"
              @dropped-bconn="handleBConnectorDrop"
              @dropped-ascaff="handleAScaffoldDrop"
              @dropped-bscaff="handleBScaffoldDrop"
              @link-word-changed="(info) => $emit('link-word-changed', info)"
              @update-connector-content="
                (info) => $emit('update-connector-content', info)
              "
              @update-click-count="(id) => $emit('update-click-count', id)"
              @toggle-orientation="
                (params) => $emit('toggle-orientation', params)
              "
              @update-child-connector-content="
                (info) => $emit('update-child-connector-content', info)
              "
              @update-child-stat="(info) => $emit('update-child-stat', info)"
              @new-connector-dropped-on-connector="
                (info) => $emit('new-connector-dropped-on-connector', info)
              "
              @connector-dropped-on-statement="
                (info) => $emit('connector-dropped-on-statement', info)
              "
              @toggle-collapsed-renderstatement-from-connector="
                (id) =>
                  $emit('toggle-collapsed-renderstatement-from-scaffold', id)
              "
              @toggle-showPopup-fromconnector="
                (id) => $emit('toggle-showPopup-fromscaffold', id)
              "
              @exnet-dropped-on-scaffold-slot="handleExNetDroppedOnScaffoldSlot"
            />

            <!-- Occupied: nested Scaffold -->
            <Scaffold
              v-else-if="child.childType === 'scaffold'"
              :scaffold-data="allScaffolds[child.childID]"
              :all-statements="allStatements"
              :all-connectors="allConnectors"
              :all-scaffolds="allScaffolds"
              :depth="depthPlusOne"
              :exnet-type="exnetType"
              :slot-layout="slotLayout"
              @delete-scaffold="
                (params) => $emit('delete-child-scaffold', params)
              "
              @delete-child-scaffold="
                (params) => $emit('delete-child-scaffold', params)
              "
              @duplicate-statement="
                (payload) => $emit('duplicate-statement', payload)
              "
              @duplicate-connector="
                (payload) => $emit('duplicate-connector', payload)
              "
              @duplicate-scaffold="
                (payload) => $emit('duplicate-scaffold', payload)
              "
              @delete-statement="(id) => $emit('delete-statement', id)"
              @connector-dropped-on-statement="
                (info) => $emit('connector-dropped-on-statement', info)
              "
              @new-connector-dropped-on-connector="
                (info) => $emit('new-connector-dropped-on-connector', info)
              "
              @toggle-collapsed-renderstatement-from-scaffold="
                (id) =>
                  $emit('toggle-collapsed-renderstatement-from-scaffold', id)
              "
              @toggle-showPopup-fromscaffold="
                (id) => $emit('toggle-showPopup-fromscaffold', id)
              "
              @exnet-dropped-on-scaffold-slot="handleExNetDroppedOnScaffoldSlot"
              @dropped-astat="handleAStatementDrop"
              @dropped-bstat="handleBStatementDrop"
              @dropped-aconn="handleAConnectorDrop"
              @dropped-bconn="handleBConnectorDrop"
              @dropped-ascaff="handleAScaffoldDrop"
              @dropped-bscaff="handleBScaffoldDrop"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, defineAsyncComponent } from 'vue';

import RenderStatement from './RenderStatement.vue';
import Tooltip from './shared/Tooltip.vue';
import {
  Scaffold_T,
  ScaffoldID_T,
  StatementID_T,
  ConnectorID_T,
  ElementID_T,
  ElementTypes_T,
  Statement_T,
  Connector_T,
} from './AnswerAreaTypes';

export default defineComponent({
  name: 'Scaffold',

  components: {
    RenderStatement,
    Tooltip,
    // Scaffold is self-referential; Vue resolves this automatically
    // when using defineComponent with a name.
  },

  inject: [
    'displayOnly',
    'globalDebugMode',
    'activeHover',
    'setActiveHover',
    'clearActiveHover',
  ] as any,

  emits: [
    // Upward tree propagation (mirrors Connector.vue pattern)
    'delete-scaffold',
    'delete-child-scaffold',
    'duplicate-scaffold',
    'duplicate-statement',
    'duplicate-connector',
    'delete-statement',
    'delete-child-connector',
    'connector-dropped-on-statement',
    'new-connector-dropped-on-connector',
    'toggle-collapsed-renderstatement-from-scaffold',
    'toggle-showPopup-fromscaffold',
    // Scaffold-specific drop event — AnswerArea handles the tree surgery
    'exnet-dropped-on-scaffold-slot',
    // Content / state updates
    'update-child-statement-content',
    'update-connector-content',
    'update-click-count',
    'toggle-orientation',
    'update-child-connector-content',
    'update-child-stat',
    'link-word-changed',
    'dropped-astat',
    'dropped-bstat',
    'dropped-aconn',
    'dropped-bconn',
  ],

  props: {
    scaffoldData: {
      type: Object as PropType<Scaffold_T>,
      required: true,
    },
    allStatements: {
      type: Object as PropType<{ [key: StatementID_T]: Statement_T }>,
      required: true,
    },
    allConnectors: {
      type: Object as PropType<{ [key: ConnectorID_T]: Connector_T }>,
      required: true,
    },
    allScaffolds: {
      type: Object as PropType<{ [key: ScaffoldID_T]: Scaffold_T }>,
      required: true,
    },
    depth: {
      type: Number,
      required: true,
    },
    exnetType: {
      type: String,
      default: 'student',
    },
    /**
     * 'beside' — label on the left, target box on the right (default, compact)
     * 'below'  — label above, target box below (more spacious)
     */
    slotLayout: {
      type: String as PropType<'beside' | 'below'>,
      default: 'beside',
    },
  },

  data() {
    return {
      dragInProgress: false,
      // Holds refs to each target box DOM element, keyed by slot index.
      targetBoxRefs: {} as { [index: number]: HTMLElement | null },
    };
  },

  mounted() {
    // Lazy registration breaks the circular dependency between
    // Scaffold.vue and Connector.vue.
    this.$options.components.Connector = defineAsyncComponent(
      () => import('./Connector.vue'),
    );
  },
  computed: {
    showButtons(): boolean {
      return (this as any).activeHover.id === this.scaffoldData.scaffoldID;
    },

    depthPlusOne(): number {
      return this.depth + 1;
    },

    allSlotsEmpty(): boolean {
      return this.scaffoldData.children.every((c) => c.isEmpty());
    },

    deleteTooltip(): string {
      return this.allSlotsEmpty
        ? 'Delete scaffold'
        : 'Delete scaffold. DISABLED — remove all children first.';
    },

    slotLayoutClass(): string {
      return this.slotLayout === 'beside'
        ? 'scaffold-slot--beside'
        : 'scaffold-slot--below';
    },
  },

  methods: {
    // --- Hover ---

    handleMouseEnter() {
      (this as any).setActiveHover(this.scaffoldData.scaffoldID, this.depth);
    },

    handleMouseLeave(e: MouseEvent) {
      const rt = e.relatedTarget as HTMLElement | null;
      const next = rt?.closest?.('[data-hover-id]');
      if (next) {
        const nextId = next.getAttribute('data-hover-id');
        const nextDepth = Number(next.getAttribute('data-hover-depth'));
        (this as any).setActiveHover(nextId, nextDepth);
        return;
      }
      (this as any).clearActiveHover(this.scaffoldData.scaffoldID);
    },

    // --- Drag (scaffold being dragged out) ---

    startDrag(e: DragEvent) {
      if ((this as any).displayOnly) return;
      this.dragInProgress = true;
      e.stopImmediatePropagation();
      e.dataTransfer!.dropEffect = 'move';
      e.dataTransfer!.effectAllowed = 'move';
      e.dataTransfer!.setData(
        'data',
        JSON.stringify({
          scaffoldID: this.scaffoldData.scaffoldID,
          parentID: this.scaffoldData.parent,
        }),
      );
      e.dataTransfer!.setData('type', 'scaffold');
      e.dataTransfer!.setData('content', this.scaffoldData.title);

      const el = this.$refs.scaffoldContainerRef as HTMLElement;
      const rect = el.getBoundingClientRect();
      e.dataTransfer!.setData('grabOffsetLeft', String(e.clientX - rect.left));
      e.dataTransfer!.setData('grabOffsetTop', String(e.clientY - rect.top));

      // Encode geometry into type names for dragenter inspection
      e.dataTransfer!.setData(`draggedWidth/${el.offsetWidth}`, '0');
      e.dataTransfer!.setData(`draggedHeight/${el.offsetHeight}`, '0');
      e.dataTransfer!.setData('draggedType/scaffold', '0');
      e.dataTransfer!.setData(
        `draggedScaffoldID/${this.scaffoldData.scaffoldID}`,
        '0',
      );
    },

    endDrag() {
      this.dragInProgress = false;
    },

    // --- Target box refs ---

    setTargetBoxRef(el: HTMLElement | null, index: number) {
      this.targetBoxRefs[index] = el;
    },

    // --- Drag over / enter / leave on individual slots ---

    handleDragOver(e: DragEvent) {
      e.preventDefault();
    },

    handleDragEnterSlot(e: DragEvent, index: number) {
      e.preventDefault();
      const ref = this.targetBoxRefs[index];
      if (!ref) return;

      // Resize the target box to match the dragged element (same trick as Connector.vue)
      const types = Array.from(e.dataTransfer!.types);
      const wType = types.find((t) => t.startsWith('draggedwidth'));
      const hType = types.find((t) => t.startsWith('draggedheight'));
      if (wType) ref.style.width = wType.split('/')[1] + 'px';
      if (hType) ref.style.height = hType.split('/')[1] + 'px';
      ref.style.border = '10px solid green';
    },

    handleDragLeaveSlot(e: DragEvent, index: number) {
      e.preventDefault();
      const ref = this.targetBoxRefs[index];
      if (!ref) return;
      ref.style.width = '20px';
      ref.style.height = '20px';
      ref.style.border = '';
    },

    // --- Drop on a slot ---

    onDropOnSlot(e: DragEvent, index: number) {
      e.stopImmediatePropagation();
      e.preventDefault();

      // Reset target box appearance
      const ref = this.targetBoxRefs[index];
      if (ref) {
        ref.style.width = '20px';
        ref.style.height = '20px';
        ref.style.border = '';
      }

      const type = e.dataTransfer!.getData('type');
      const data = JSON.parse(e.dataTransfer!.getData('data'));
      const content = e.dataTransfer!.getData('content');

      // Emit a single event upward; AnswerArea.vue will do the tree surgery.
      this.$emit('exnet-dropped-on-scaffold-slot', {
        scaffoldID: this.scaffoldData.scaffoldID,
        slotIndex: index,
        droppedType: type as ElementTypes_T,
        data,
        content,
        event: e,
      });
    },

    // --- Button handlers (emit upward; AnswerArea does the work) ---

    handleToggleCollapsed() {
      this.$emit(
        'toggle-collapsed-renderstatement-from-scaffold',
        this.scaffoldData.scaffoldID,
      );
    },

    handleDuplicate() {
      const el = this.$refs.scaffoldContainerRef as HTMLElement;
      const rect = el.getBoundingClientRect();
      this.$emit('duplicate-scaffold', {
        id: this.scaffoldData.scaffoldID,
        posX: rect.right + 10,
        posY: rect.top,
      });
    },

    handleDelete() {
      this.$emit('delete-scaffold', { id: this.scaffoldData.scaffoldID });
    },

    handleDeleteChildConnector(params: {
      id: ConnectorID_T;
      slotIndex: number;
    }) {
      this.$emit('delete-child-connector', {
        id: params.id,
        parentId: this.scaffoldData.scaffoldID,
        position: params.slotIndex,
      });
    },

    handleUpdateChildStatementContent(info: any, index: number) {
      this.$emit('update-child-statement-content', {
        ...info,
        slotIndex: index,
      });
    },

    handleExNetDroppedOnScaffoldSlot(info) {
      this.$emit('exnet-dropped-on-scaffold-slot', info);
    },

    handleAStatementDrop(info) {
      this.$emit('dropped-astat', info);
    },

    handleBStatementDrop(info) {
      this.$emit('dropped-bstat', info);
    },

    handleAConnectorDrop(info) {
      this.$emit('dropped-aconn', info);
    },

    handleBConnectorDrop(info) {
      this.$emit('dropped-bconn', info);
    },

    handleAScaffoldDrop(info) {
      this.$emit('dropped-ascaff', info);
    },

    handleBScaffoldDrop(info) {
      this.$emit('dropped-bscaff', info);
    },
  },
});
</script>

<style scoped>
/* ── Container ── */
.scaffold-container {
  display: inline-flex;
  flex-direction: row;
  position: relative;
  width: fit-content;
  height: fit-content;
}

/* ── Action buttons (identical pattern to Connector.vue) ── */
.buttons-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-100%);
  pointer-events: auto;
  border-radius: 6px;
  border: 1px solid var(--biologic-hover-border-color);
  z-index: 10;
}

.scaffold-button {
  cursor: pointer;
  width: 24px;
  height: 24px;
  margin: 2px;
  padding: 1px;
}

/* ── Hover border ── */
.current-hover-target {
  border-radius: 6px;
  outline: 1px solid var(--biologic-hover-border-color);
  cursor: move;
}

/* ── Collapsed view ── */
.scaffold-collapsed-text {
  background-color: var(--biologic-grey-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: var(--biologic-statement-font-size);
  max-width: 200px;
  overflow-wrap: break-word;
}

/* ── Card with folded corner ── */
.scaffold-card {
  position: relative;
  background: #fffdf4;
  border: 1px solid #c8b97a;
  border-radius: 4px;
  min-width: 180px;
  width: fit-content; /* ADD: grow horizontally with content */
  height: fit-content; /* ADD: grow vertically with content */
  --fold-size: 22px;
  /* REMOVE clip-path entirely */
  overflow: visible; /* allow children to expand the card */
}

.scaffold-card::after {
  content: '';
  position: absolute;
  top: -1px; /* overlap the border */
  right: -1px; /* overlap the border */
  width: var(--fold-size);
  height: var(--fold-size);
  background: linear-gradient(
    225deg,
    #c8b97a 50%,
    #fffdf4 50% /* match card background */
  );
  z-index: 2;
  pointer-events: none;
  border-top-right-radius: 4px;
}

/* ── Title bar ── */
.scaffold-title-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  /* Leave room for the fold in the top-right */
  padding-right: calc(var(--fold-size) + 6px);
  background: #f5e9b8;
  border-bottom: 1px solid #c8b97a;
  font-weight: 600;
  font-size: var(--biologic-statement-font-size);
  color: #4a3800;
  position: relative;
  z-index: 2;
}

.scaffold-title-icon {
  flex-shrink: 0;
  color: #7a5c00;
}

.scaffold-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Slots container ── */
.scaffold-slots {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
}

/* ── Individual slot ── */
.scaffold-slot {
  display: flex;
  gap: 8px;
  width: fit-content; /* ADD */
  align-items: flex-start; /* ADD: so slot grows with its tallest child */
}

/* Label left, target right */
.scaffold-slot--beside {
  flex-direction: row;
  align-items: flex-start;
}

/* Label above, target below */
.scaffold-slot--below {
  flex-direction: column;
  align-items: stretch;
}

/* ── Slot label ── */
.scaffold-slot-label {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
  font-size: var(--biologic-statement-font-size);
  color: #4a3800;
}

.scaffold-slot--beside .scaffold-slot-label {
  min-width: 120px;
  max-width: 180px;
  padding-top: 4px;
}

.scaffold-slot-number {
  font-weight: 700;
  color: #7a5c00;
}

.scaffold-slot-label-text {
  font-style: italic;
}

/* ── Target area wrapper ── */
.scaffold-slot-target-area {
  flex: 1 1 auto;
  min-width: 0;
  width: fit-content;
  height: fit-content;
}

/* ── Empty target box (mirrors Connector.vue .connector-target-box) ── */
.scaffold-target-box {
  display: flex;
  padding: 10px;
  flex-grow: 1;
  box-sizing: border-box;
  border: 1px solid rgb(144, 207, 142);
  min-width: 20px;
  min-height: 20px;
  width: 20px;
  height: 20px;
  transition:
    width 80ms ease,
    height 80ms ease,
    border 80ms ease;
}
</style>
