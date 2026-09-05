<template>
  <div
    :class="['connectorContainer', { currentHoverTarget: showButtons }]"
    :style="{
      left: connleft + 'px',
      top: conntop + 'px',
      padding: parent === undefined ? '1px' : '10px',
    }"
    ref="connectorContainerRef"
    draggable="true"
    :data-hover-id="connectorID"
    :data-hover-depth="depth"
    @dragstart="startDragConnector"
    @drop="onDrop($event, 'x')"
    @dragend="endDragConnector"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      v-if="this.parent !== undefined && showButtons && !dragInProgress"
      class="buttons-container"
    >
      <Tooltip :text="this.clickCount % 2 === 1 ? 'expand' : 'collapse'">
        <v-btn
          icon
          size="xx-small"
          @click="displayFormChanged"
          class="connectorButton"
          :aria-label="this.clickCount % 2 === 1 ? 'Expand' : 'Collapse'"
        >
          <v-icon>{{
            this.clickCount % 2 === 1
              ? 'mdi-arrow-expand'
              : 'mdi-arrow-collapse'
          }}</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip
        text="duplicate this connector and all the sub-connectors/statements"
      >
        <v-btn
          size="x-small"
          v-if="!displayOnly"
          @click="onDuplicateConnectorClick($event, connectorID)"
          class="connectorButton"
        >
          <v-icon>mdi-content-duplicate</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip :text="deleteButtonTooltipText">
        <v-btn
          v-if="!displayOnly"
          :disabled="!hasNoChildren"
          icon
          size="xx-small"
          @click="deleteConnector({ id: connectorID })"
          class="connectorButton"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </Tooltip>
    </div>

    <div class="onlyText" v-if="clickCount % 2 === 1">
      {{ this.contentTextAll }}
    </div>
    <div
      class="connectorBox"
      v-if="clickCount % 2 === 0 || clickCount === undefined"
      :style="{ flexDirection: orientation }"
    >
      <div class="connectorText" v-if="connectorContent[selectedPhrase][0]">
        <ConnectorContextMenu
          v-if="!displayOnly"
          :choice="selectedPhrase"
          :options="connectorContent"
          :connector-i-d="connectorID"
          :parent-i-d="parent"
          :index="0"
          @change-link-word="handleLinkWordChange"
        />
      </div>

      <!-- ═══════════════════════════════════════════════════════════
           LEFT SECTION
           ═══════════════════════════════════════════════════════════ -->
      <div class="tooltip">
        <!--div v-if="globalDebugMode">LEFT = {{ leftID }}</div-->

        <!-- Empty left target -->
        <div
          class="connector-sections"
          v-if="this.leftType === undefined"
          @drop="onDrop($event, 'a')"
          @dragover.prevent
        >
          <Tooltip
            text="This is a target box. Drop a Statement or Network here."
          >
            <div
              v-if="this.connectorContentID == 2"
              class="connector-a-picture-parent"
              ref="targetBoxRefLeft"
              @dragover.prevent="
                this.parent !== undefined ? handleDragOver : null
              "
              @dragleave.prevent="
                this.parent !== undefined
                  ? handleDragLeaveTargetBoxLeft($event)
                  : null
              "
              @dragenter.prevent="
                this.parent !== undefined
                  ? handleDragEnterTargetBoxLeft($event)
                  : null
              "
            >
              <v-icon color="grey lighten-1" class="image-target-icon"
                >mdi-image-outline</v-icon
              >
            </div>

            <div
              v-else
              class="connector-target-box"
              ref="targetBoxRefLeft"
              @dragover.prevent="
                this.parent !== undefined ? handleDragOver : null
              "
              @dragleave.prevent="
                this.parent !== undefined
                  ? handleDragLeaveTargetBoxLeft($event)
                  : null
              "
              @dragenter.prevent="
                this.parent !== undefined
                  ? handleDragEnterTargetBoxLeft($event)
                  : null
              "
            />
          </Tooltip>
        </div>

        <!-- Left child: statement -->
        <div class="connector-sections" v-if="this.leftType === 'statement'">
          <RenderStatement
            ref="leftChildRenderStatement"
            :statement-data="this.allStatements[this.leftID]"
            :showToggle="true"
            :depth="depthPlusOne"
            :exnetType="exnetType"
            @update-statement-content="handleUpdateStatContentA"
            @mousedown="onMousedown('leftType')"
            @duplicate-statement="duplicateStatement"
            @delete-statement="deleteStatement"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
            @toggle-showPopup-fromrenderstatement="
              toggleShowPopupFromRenderStatement
            "
          />
        </div>

        <!-- Left child: connector -->
        <div class="connector-sections" v-if="this.leftType === 'connector'">
          <Connector
            ref="leftChildConnector"
            :connector-i-d="this.leftID"
            :connector-content-i-d="
              allConnectors[this.leftID].connectorContentID
            "
            :connector-content="allConnectors[this.leftID].connectorContent"
            :all-statements="this.allStatements"
            :all-connectors="this.allConnectors"
            :all-scaffolds="this.allScaffolds"
            :rootConnectorID="rootConnectorID"
            :parent="allConnectors[this.leftID].parent"
            :left-i-d="allConnectors[this.leftID].leftID"
            :left-type="allConnectors[this.leftID].leftType"
            :left-content="allConnectors[this.leftID].leftContent"
            :right-i-d="allConnectors[this.leftID].rightID"
            :right-type="allConnectors[this.leftID].rightType"
            :right-content="allConnectors[this.leftID].rightContent"
            :click-count="allConnectors[this.leftID].clickCount"
            :orientation="allConnectors[this.leftID].orientation"
            :selected-phrase="allConnectors[this.leftID].selectedPhrase"
            :depth="depthPlusOne"
            :exnetType="exnetType"
            @delete-connector="
              deleteChildConnector({
                id: this.leftID,
                parentId: this.connectorID,
                position: 'left',
              })
            "
            @delete-child-connector="deleteChildConnector"
            @dropped-aconn="handleAConnectorDrop"
            @dropped-bconn="handleBConnectorDrop"
            @dropped-astat="handleAStatementDrop"
            @dropped-bstat="handleBStatementDrop"
            @dropped-ascaff="handleAScaffoldDrop"
            @dropped-bscaff="handleBScaffoldDrop"
            @link-word-changed="handleChildLinkWordChange"
            @update-connector-content="handleUpdateConnectorContentA"
            @toggle-orientation="handleToggleOrientation"
            @update-click-count="handleUpdateChildClickCount"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
            @new-connector-dropped-on-connector="
              handleNewConnectorDroppedOnConnector
            "
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @duplicate-statement="duplicateStatement"
            @duplicate-connector="duplicateConnector"
            @delete-statement="deleteStatement"
            @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
            @toggle-collapsed-renderstatement-from-connector="
              toggleCollapsedRenderStatementFromConnector
            "
            @exnet-dropped-on-scaffold-slot="handleExnetDroppedOnScaffoldSlot"
            @delete-scaffold="handleDeleteScaffold"
            @delete-child-scaffold="handleDeleteChildScaffold"
            @duplicate-scaffold="duplicateScaffold"
            @toggle-collapsed-renderstatement-from-scaffold="
              toggleCollapsedRenderStatementFromConnector
            "
            @toggle-showPopup-fromscaffold="toggleShowPopupFromConnector"
          />
        </div>

        <!-- Left child: scaffold -->
        <div class="connector-sections" v-if="this.leftType === 'scaffold'">
          <Scaffold
            :scaffold-data="allScaffolds[this.leftID]"
            :all-statements="allStatements"
            :all-connectors="allConnectors"
            :all-scaffolds="allScaffolds"
            :depth="depthPlusOne"
            :exnet-type="exnetType"
            @delete-scaffold="handleDeleteChildScaffoldLeft"
            @delete-child-scaffold="handleDeleteChildScaffold"
            @duplicate-statement="duplicateStatement"
            @duplicate-connector="duplicateConnector"
            @duplicate-scaffold="duplicateScaffold"
            @delete-statement="deleteStatement"
            @delete-child-connector="deleteChildConnector"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @new-connector-dropped-on-connector="
              handleNewConnectorDroppedOnConnector
            "
            @exnet-dropped-on-scaffold-slot="handleExnetDroppedOnScaffoldSlot"
            @update-child-statement-content="handleUpdateStatContentA"
            @update-connector-content="handleUpdateConnectorContentA"
            @update-click-count="handleUpdateChildClickCount"
            @toggle-orientation="handleToggleOrientation"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
            @link-word-changed="handleChildLinkWordChange"
            @toggle-collapsed-renderstatement-from-scaffold="
              toggleCollapsedRenderStatementFromConnector
            "
            @toggle-showPopup-fromscaffold="toggleShowPopupFromConnector"
            @dropped-astat="handleAStatementDrop"
            @dropped-bstat="handleBStatementDrop"
            @dropped-aconn="handleAConnectorDrop"
            @dropped-bconn="handleBConnectorDrop"
            @dropped-ascaff="handleAScaffoldDrop"
            @dropped-bscaff="handleBScaffoldDrop"
          />
        </div>
      </div>

      <div class="connectorTextContainerNew">
        <Tooltip text="change orientation to horizontal or vertical">
          <v-btn
            size="xx-small"
            v-if="this.clickCount % 2 === 0"
            @click="handleToggleOrientation({ id: connectorID })"
            class="connectorButton"
          >
            <img
              class="rotate-button"
              src="./assets/rotate_icon.png"
              alt="Rotate"
              width="20"
            />
          </v-btn>
        </Tooltip>
        <div
          :class="['connectorMenu', rubricBorderClass]"
          v-if="connectorContent[selectedPhrase][1]"
        >
          <ConnectorContextMenu
            v-if="!displayOnly"
            :choice="selectedPhrase"
            :options="connectorContent"
            :connector-i-d="connectorID"
            :parent-i-d="parent"
            :index="1"
            @change-link-word="handleLinkWordChange"
          />
          <span v-if="globalDebugMode">{{ connectorID }}</span>
        </div>
      </div>

      <FeedbackRubric
        :isVisible="showAllFeedback || showThisFeedback"
        :exnetID="connectorID"
        :exnetType="exnetType"
        :isConnector="true"
        @feedback-visibility-changed="handleFeedbackVisibility"
      />

      <!-- ═══════════════════════════════════════════════════════════
           RIGHT SECTION
           ═══════════════════════════════════════════════════════════ -->
      <div class="tooltip">
        <!--div v-if="globalDebugMode">RIGHT = {{ rightID }}</div-->

        <!-- Empty right target -->
        <div
          class="connector-sections"
          v-if="this.rightType === undefined"
          @drop="onDrop($event, 'b')"
          @dragover.prevent
          @dragenter.prevent
        >
          <Tooltip
            text="This is a target box. Drop a Statement or Network on here."
          >
            <div
              class="connector-target-box"
              ref="targetBoxRefRight"
              @dragover.prevent="
                this.parent !== undefined ? handleDragOver : null
              "
              @dragleave.prevent="
                this.parent !== undefined
                  ? handleDragLeaveTargetBoxRight($event)
                  : null
              "
              @dragenter.prevent="
                this.parent !== undefined
                  ? handleDragEnterTargetBoxRight($event)
                  : null
              "
            />
          </Tooltip>
        </div>

        <!-- Right child: statement -->
        <div class="connector-sections" v-if="this.rightType === 'statement'">
          <RenderStatement
            ref="rightChildRenderStatement"
            :statement-data="this.allStatements[this.rightID]"
            :showToggle="true"
            :depth="depthPlusOne"
            :exnetType="exnetType"
            @update-statement-content="handleUpdateStatContentB"
            @mousedown="onMousedown('rightType')"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @duplicate-statement="duplicateStatement"
            @delete-statement="deleteStatement"
            @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
            @toggle-showPopup-fromrenderstatement="
              toggleShowPopupFromRenderStatement
            "
          />
        </div>

        <!-- Right child: connector -->
        <div class="connector-sections" v-if="this.rightType === 'connector'">
          <Connector
            ref="rightChildConnector"
            :connector-i-d="this.rightID"
            :connector-content-i-d="
              allConnectors[this.rightID].connectorContentID
            "
            :connector-content="allConnectors[this.rightID].connectorContent"
            :all-statements="this.allStatements"
            :all-connectors="this.allConnectors"
            :all-scaffolds="this.allScaffolds"
            :parent="allConnectors[this.rightID].parent"
            :left-i-d="allConnectors[this.rightID].leftID"
            :left-type="allConnectors[this.rightID].leftType"
            :left-content="allConnectors[this.rightID].leftContent"
            :right-i-d="allConnectors[this.rightID].rightID"
            :right-type="allConnectors[this.rightID].rightType"
            :right-content="allConnectors[this.rightID].rightContent"
            :click-count="allConnectors[this.rightID].clickCount"
            :orientation="allConnectors[this.rightID].orientation"
            :selected-phrase="allConnectors[this.rightID].selectedPhrase"
            :rootConnectorID="rootConnectorID"
            :depth="depthPlusOne"
            :exnetType="exnetType"
            @delete-connector="
              deleteChildConnector({
                id: this.rightID,
                parentId: this.connectorID,
                position: 'right',
              })
            "
            @delete-child-connector="deleteChildConnector"
            @dropped-aconn="handleAConnectorDrop"
            @dropped-bconn="handleBConnectorDrop"
            @dropped-astat="handleAStatementDrop"
            @dropped-bstat="handleBStatementDrop"
            @dropped-ascaff="handleAScaffoldDrop"
            @dropped-bscaff="handleBScaffoldDrop"
            @link-word-changed="handleChildLinkWordChange"
            @update-connector-content="handleUpdateConnectorContentB"
            @update-click-count="handleUpdateChildClickCount"
            @toggle-orientation="handleToggleOrientation"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
            @new-connector-dropped-on-connector="
              handleNewConnectorDroppedOnConnector
            "
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @duplicate-statement="duplicateStatement"
            @duplicate-connector="duplicateConnector"
            @delete-statement="deleteStatement"
            @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
            @toggle-collapsed-renderstatement-from-connector="
              toggleCollapsedRenderStatementFromConnector
            "
            @exnet-dropped-on-scaffold-slot="handleExnetDroppedOnScaffoldSlot"
            @delete-scaffold="handleDeleteScaffold"
            @delete-child-scaffold="handleDeleteChildScaffold"
            @duplicate-scaffold="duplicateScaffold"
            @toggle-collapsed-renderstatement-from-scaffold="
              toggleCollapsedRenderStatementFromConnector
            "
            @toggle-showPopup-fromscaffold="toggleShowPopupFromConnector"
          />
        </div>

        <!-- Right child: scaffold -->
        <div class="connector-sections" v-if="this.rightType === 'scaffold'">
          <Scaffold
            :scaffold-data="allScaffolds[this.rightID]"
            :all-statements="allStatements"
            :all-connectors="allConnectors"
            :all-scaffolds="allScaffolds"
            :depth="depthPlusOne"
            :exnet-type="exnetType"
            @delete-scaffold="handleDeleteChildScaffoldRight"
            @delete-child-scaffold="handleDeleteChildScaffold"
            @duplicate-statement="duplicateStatement"
            @duplicate-connector="duplicateConnector"
            @duplicate-scaffold="duplicateScaffold"
            @delete-statement="deleteStatement"
            @delete-child-connector="deleteChildConnector"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @new-connector-dropped-on-connector="
              handleNewConnectorDroppedOnConnector
            "
            @exnet-dropped-on-scaffold-slot="handleExnetDroppedOnScaffoldSlot"
            @update-child-statement-content="handleUpdateStatContentB"
            @update-connector-content="handleUpdateConnectorContentB"
            @update-click-count="handleUpdateChildClickCount"
            @toggle-orientation="handleToggleOrientation"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
            @link-word-changed="handleChildLinkWordChange"
            @toggle-collapsed-renderstatement-from-scaffold="
              toggleCollapsedRenderStatementFromConnector
            "
            @toggle-showPopup-fromscaffold="toggleShowPopupFromConnector"
            @dropped-astat="handleAStatementDrop"
            @dropped-bstat="handleBStatementDrop"
            @dropped-aconn="handleAConnectorDrop"
            @dropped-bconn="handleBConnectorDrop"
            @dropped-ascaff="handleAScaffoldDrop"
            @dropped-bscaff="handleBScaffoldDrop"
          />
        </div>
      </div>

      <div class="connectorText" v-if="connectorContent[selectedPhrase][2]">
        <ConnectorContextMenu
          v-if="!displayOnly"
          :choice="selectedPhrase"
          :options="connectorContent"
          :connector-i-d="connectorID"
          :parent-i-d="parent"
          :index="2"
          @change-link-word="handleLinkWordChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import RenderStatement from './RenderStatement.vue';
import ConnectorContextMenu from './ConnectorContextMenu.vue';
import FeedbackRubric from './FeedbackRubric.vue';
import Tooltip from './shared/Tooltip.vue';
import Scaffold from './Scaffold.vue';

export default {
  name: 'Connector',
  components: {
    ConnectorContextMenu,
    RenderStatement,
    FeedbackRubric,
    Tooltip,
    Scaffold,
  },
  inject: [
    'feedbackIsAvailable',
    'showAllFeedback',
    'globalTooltipState',
    'globalDebugMode',
    'displayOnly',
    'activeHover',
    'setActiveHover',
    'clearActiveHover',
  ],
  emits: [
    'droppedAstat',
    'droppedBstat',
    'delete-connector',
    'delete-child-connector',
    'droppedAconn',
    'droppedBconn',
    'update-connector-content',
    'update-click-count',
    'linkWordChanged',
    'update-stat-data',
    'delDroppedItem',
    'update-child-connector-content',
    'droppedAscaff',
    'droppedBscaff',
    'update-child-stat',
    'toggle-orientation',
    'new-connector-dropped-on-connector',
    'duplicate-statement',
    'duplicate-connector',
    'delete-statement',
    'toggle-collapsed-renderstatement-from-connector',
    'toggle-showPopup-fromconnector',
    'connector-dropped-on-statement',
    // Scaffold-related
    'exnet-dropped-on-scaffold-slot',
    'delete-scaffold',
    'delete-child-scaffold',
    'duplicate-scaffold',
  ],
  props: {
    connectorContentID: Number,
    connectorContent: Object,
    selectedPhrase: Number,
    rootConnectorID: String,
    connectorID: String,
    parent: String,
    leftID: String,
    leftType: String,
    leftContent: String,
    rightID: String,
    rightType: String,
    rightContent: String,
    conntop: Number,
    connleft: Number,
    connectorRelationships: Object,
    allConnectors: Object,
    allStatements: Object,
    allScaffolds: {
      type: Object,
      default: () => ({}),
    },
    clickCount: Number,
    orientation: String,
    depth: {
      type: Number,
      required: true,
    },
    exnetType: {
      type: String,
      default: 'student',
    },
  },
  data() {
    return {
      currConnectorContent: {},
      acontent: null,
      aindex: -1,
      bcontent: null,
      bindex: -1,
      word: null,
      contentTextAll: null,
      showThisFeedback: false,
      dragInProgress: false,
      rubricBorderStatus: null,
    };
  },
  computed: {
    rubricBorderClass() {
      return 'rubric-border--' + this.rubricBorderStatus;
    },
    depthPlusOne() {
      return this.depth + 1;
    },
    deleteButtonTooltipText() {
      if (this.leftID === undefined && this.rightID === undefined)
        return 'Delete Connector';
      else
        return 'Delete Connector. DISABLED. Remove child elements to enable.';
    },
    hasNoChildren() {
      return this.leftID === undefined && this.rightID === undefined;
    },
    getCollapseExpandIcon() {
      return this.clickCount % 2 === 0
        ? './assets/collapse_icon.png'
        : './assets/expand_icon.png';
    },
    bulletPointList() {
      return this.connectorContent
        .map((item) => item[1])
        .filter(Boolean)
        .join('\n');
    },
    showButtons() {
      return this.activeHover.id === this.connectorID;
    },
  },
  methods: {
    handleFeedbackVisibility({ isVisible, gradingInfo }) {
      this.rubricBorderStatus = isVisible
        ? (gradingInfo?.matchType ?? null)
        : null;
    },

    handleMouseEnter() {
      this.setActiveHover(this.connectorID, this.depth);
    },

    handleMouseLeave(e) {
      const rt = e.relatedTarget;
      const next = rt && rt.closest && rt.closest('[data-hover-id]');
      if (next) {
        const nextId = Number(next.getAttribute('data-hover-id'));
        const nextDepth = Number(next.getAttribute('data-hover-depth'));
        this.setActiveHover(nextId, nextDepth);
        return;
      }
      this.clearActiveHover(this.connectorID);
    },

    // ── Statement passthrough ──────────────────────────────────────

    duplicateStatement(payload) {
      this.$emit('duplicate-statement', payload);
    },

    deleteStatement(id) {
      this.$emit('delete-statement', id);
    },

    toggleCollapsedRenderStatement(id) {
      this.$emit('toggle-collapsed-renderstatement-from-connector', id);
    },

    toggleCollapsedRenderStatementFromConnector(id) {
      this.$emit('toggle-collapsed-renderstatement-from-connector', id);
    },

    toggleShowPopupFromRenderStatement(id) {
      this.$emit('toggle-showPopup-fromconnector', id);
    },

    toggleShowPopupFromConnector(id) {
      this.$emit('toggle-showPopup-fromconnector', id);
    },

    // ── Scaffold passthrough ───────────────────────────────────────

    handleExnetDroppedOnScaffoldSlot(info) {
      this.$emit('exnet-dropped-on-scaffold-slot', info);
    },

    handleDeleteScaffold(params) {
      this.$emit('delete-scaffold', params);
    },

    handleDeleteChildScaffold(params) {
      this.$emit('delete-child-scaffold', params);
    },

    handleDeleteChildScaffoldLeft(params) {
      this.$emit('delete-child-scaffold', {
        ...params,
        parentId: this.connectorID,
        position: 'left',
      });
    },

    handleDeleteChildScaffoldRight(params) {
      this.$emit('delete-child-scaffold', {
        ...params,
        parentId: this.connectorID,
        position: 'right',
      });
    },

    duplicateScaffold(payload) {
      this.$emit('duplicate-scaffold', payload);
    },

    // ── Circular reference check ───────────────────────────────────

    connector1IsInTreeOfconnector2(conn1, conn2) {
      let inLeftTree = false;
      if (this.allConnectors[conn2]['leftType'] == 'connector') {
        const leftConnID = this.allConnectors[conn2]['leftID'];
        inLeftTree =
          leftConnID !== undefined &&
          (conn1 === leftConnID ||
            this.connector1IsInTreeOfconnector2(conn1, leftConnID));
      } else if (this.allConnectors[conn2]['leftType'] == 'scaffold') {
        // descend into scaffold children looking for conn1
        inLeftTree = this.connector1IsInTreeOfScaffold(
          conn1,
          this.allConnectors[conn2]['leftID'],
        );
      }
      let inRightTree = false;
      if (this.allConnectors[conn2]['rightType'] == 'connector') {
        const rightConnID = this.allConnectors[conn2]['rightID'];
        inRightTree =
          rightConnID !== undefined &&
          (conn1 === rightConnID ||
            this.connector1IsInTreeOfconnector2(conn1, rightConnID));
      } else if (this.allConnectors[conn2]['rightType'] == 'scaffold') {
        inRightTree = this.connector1IsInTreeOfScaffold(
          conn1,
          this.allConnectors[conn2]['rightID'],
        );
      }
      return inLeftTree || inRightTree;
    },

    // NEW helper
    connector1IsInTreeOfScaffold(conn1, scaffoldID) {
      const scaffold = this.allScaffolds[scaffoldID];
      if (!scaffold) return false;
      for (const child of scaffold.children) {
        if (child.childID === undefined) continue;
        if (child.childType === 'connector') {
          if (child.childID === conn1) return true;
          if (this.connector1IsInTreeOfconnector2(conn1, child.childID))
            return true;
        } else if (child.childType === 'scaffold') {
          if (this.connector1IsInTreeOfScaffold(conn1, child.childID))
            return true;
        }
      }
      return false;
    },

    dropIsPermissible(connectorBeingDroppedOn, connectorBeingDropped) {
      if (Number(connectorBeingDroppedOn) === Number(connectorBeingDropped)) {
        return false;
      } else {
        const inTree =
          this.connectorBeingDropped !== undefined &&
          this.connector1IsInTreeOfconnector2(
            connectorBeingDroppedOn,
            connectorBeingDropped,
          );
        return !inTree;
      }
    },

    connectorDroppedOnStatement(info) {
      this.$emit('connector-dropped-on-statement', info);
    },

    // ── Drag information decoding ──────────────────────────────────

    decodeDragInformation(event) {
      const types = Array.from(event.dataTransfer.types);
      const widthType = types.find((type) => type.startsWith('draggedwidth'));
      const heightType = types.find((type) => type.startsWith('draggedheight'));
      const typeType = types.find((type) => type.startsWith('draggedtype'));
      const connectorIDType = types.find((type) =>
        type.startsWith('draggedconnectorid'),
      );
      return {
        draggedWidth: widthType ? widthType.split('/')[1] : null,
        draggedHeight: heightType ? heightType.split('/')[1] : null,
        drageeType: typeType ? typeType.split('/')[1] : null,
        drageeConnectorID: connectorIDType
          ? connectorIDType.split('/')[1]
          : null,
      };
    },

    // ── Target box drag feedback ───────────────────────────────────

    handleDragOver(event) {
      event.preventDefault();
    },

    handleDragEnterTargetBoxLeft(event) {
      const dragInformation = this.decodeDragInformation(event);
      if (dragInformation.drageeType === 'connector') {
        if (
          !this.dropIsPermissible(
            this.connectorID,
            dragInformation.drageeConnectorID,
          )
        )
          return;
      }
      event.preventDefault();
      const targetRef = this.$refs.targetBoxRefLeft;
      targetRef.style.width = dragInformation.draggedWidth + 'px';
      targetRef.style.height = dragInformation.draggedHeight + 'px';
      targetRef.style.border = '10px solid green';
    },

    handleDragLeaveTargetBoxLeft(event) {
      event.preventDefault();
      const targetRef = this.$refs.targetBoxRefLeft;
      targetRef.style.width = 20 + 'px';
      targetRef.style.height = 20 + 'px';
      targetRef.style.border = '';
    },

    handleDragEnterTargetBoxRight(event) {
      const dragInformation = this.decodeDragInformation(event);
      if (dragInformation.drageeType === 'connector') {
        if (
          !this.dropIsPermissible(
            this.connectorID,
            dragInformation.drageeConnectorID,
          )
        )
          return;
      }
      event.preventDefault();
      const targetRef = this.$refs.targetBoxRefRight;
      targetRef.style.width = dragInformation.draggedWidth + 'px';
      targetRef.style.height = dragInformation.draggedHeight + 'px';
      targetRef.style.border = '10px solid green';
    },

    handleDragLeaveTargetBoxRight(event) {
      event.preventDefault();
      const targetRef = this.$refs.targetBoxRefRight;
      targetRef.style.width = 20 + 'px';
      targetRef.style.height = 20 + 'px';
      targetRef.style.border = '';
    },

    // ── Misc ──────────────────────────────────────────────────────

    onMousedown() {
      let parent = this.$parent;
      while (parent.$options.name !== 'AnswerArea') {
        parent = parent.$parent;
      }
    },

    connectorString() {
      let resultString = 'connectorString';
      if (this.leftType === 'connector') {
        resultString =
          this.$refs.leftChildConnector.connectorString() + resultString;
      }
      if (this.rightType === 'connector') {
        resultString =
          resultString + this.$refs.rightChildConnector.connectorString();
      }
      return resultString;
    },

    // ── Link word ─────────────────────────────────────────────────

    handleLinkWordChange(info) {
      const newChoice = info['selectedPhrase'];
      this.currConnectorContent = JSON.parse(
        JSON.stringify(this.connectorContent[newChoice]),
      );
      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ''
          : this.currConnectorContent[0]) +
        (this.acontent === null ? '' : this.acontent) +
        (this.currConnectorContent[1] === null
          ? ''
          : this.currConnectorContent[1]) +
        (this.bcontent === null ? '' : this.bcontent) +
        (this.currConnectorContent[2] === null
          ? ''
          : this.currConnectorContent[2]);
      this.$emit('linkWordChanged', info);
    },

    handleChildLinkWordChange(info) {
      this.$emit('linkWordChanged', info);
    },

    // ── Drag start / end ──────────────────────────────────────────

    startDragConnector(e) {
      if (this.displayOnly) return;
      this.dragInProgress = true;
      this.globalTooltipState.showTooltips = false;
      this.globalTooltipState.animal = 'cat';
      e.stopImmediatePropagation();
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'data',
        JSON.stringify({
          connectorContentID: this.connectorContentID,
          connectorContent: this.connectorContent,
          selectedPhrase: this.selectedPhrase,
          connectorID: this.connectorID,
          parentID: this.parent,
        }),
      );
      e.dataTransfer.setData('type', 'connector');
      e.dataTransfer.setData('content', this.contentTextAll);

      const connectorContainerRef = this.$refs.connectorContainerRef;
      const rectInViewport = connectorContainerRef.getBoundingClientRect();
      e.dataTransfer.setData(
        'grabOffsetLeft',
        String(e.clientX - rectInViewport.left),
      );
      e.dataTransfer.setData(
        'grabOffsetTop',
        String(e.clientY - rectInViewport.top),
      );

      e.dataTransfer.setData(
        'draggedWidth/' + e.currentTarget.offsetWidth,
        '0',
      );
      e.dataTransfer.setData(
        'draggedHeight/' + e.currentTarget.offsetHeight,
        '0',
      );
      e.dataTransfer.setData('draggedType/connector', '0');
      e.dataTransfer.setData('draggedConnectorID/' + this.connectorID, '0');
    },

    endDragConnector() {
      this.globalTooltipState.showTooltips = true;
      this.globalTooltipState.animal = 'mouse';
      this.dragInProgress = false;
    },

    // ── Content text helpers ──────────────────────────────────────

    updateContentTextAll() {
      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ''
          : this.currConnectorContent[0]) +
        (this.acontent === null ? '' : this.acontent) +
        (this.currConnectorContent[1] === null
          ? ''
          : this.currConnectorContent[1]) +
        (this.bcontent === null ? '' : this.bcontent) +
        (this.currConnectorContent[2] === null
          ? ''
          : this.currConnectorContent[2]);
    },

    // ── Drop on connector body / target boxes ─────────────────────

    onDrop(e, side) {
      e.stopImmediatePropagation();
      const type = e.dataTransfer.getData('type');
      const data = JSON.parse(e.dataTransfer.getData('data'));
      const transContent = e.dataTransfer.getData('content');

      this.$el.classList.remove('drag-over-happening');

      const ret = {
        connectorID: this.connectorID,
        statementID: data?.id || undefined,
        content: transContent,
        event: e,
        data: data,
      };

      if (side === 'a' && type === 'statement') {
        this.acontent = transContent;
        this.updateContentTextAll();
        this.$emit('droppedAstat', ret);
      } else if (side === 'b' && type === 'statement') {
        this.$emit('droppedBstat', ret);
        this.bcontent = transContent;
        this.updateContentTextAll();
      } else if (side === 'a' && type === 'connector') {
        this.acontent = transContent;
        this.updateContentTextAll();
        this.$emit('droppedAconn', ret);
      } else if (side === 'b' && type === 'connector') {
        this.bcontent = transContent;
        this.updateContentTextAll();
        this.$emit('droppedBconn', ret);
      } else if (side === 'x' && type === 'connector') {
        this.$emit('new-connector-dropped-on-connector', ret);
      } else if (side === 'a' && type === 'scaffold') {
        this.acontent = transContent;
        this.updateContentTextAll();
        this.$emit('droppedAscaff', ret);
      } else if (side === 'b' && type === 'scaffold') {
        this.bcontent = transContent;
        this.updateContentTextAll();
        this.$emit('droppedBscaff', ret);
      } else if (side === 'x' && type === 'scaffold') {
        // A scaffold dropped onto the body of a connector — bubble up
        // so AnswerArea can handle the tree insertion.
        this.$emit('new-connector-dropped-on-connector', ret);
      }
    },

    handleAStatementDrop(info) {
      this.$emit('droppedAstat', info);
    },
    handleBStatementDrop(info) {
      this.$emit('droppedBstat', info);
    },
    handleAConnectorDrop(info) {
      this.$emit('droppedAconn', info);
    },
    handleBConnectorDrop(info) {
      this.$emit('droppedBconn', info);
    },

    handleNewConnectorDroppedOnConnector(info) {
      this.$emit('new-connector-dropped-on-connector', info);
    },
    handleAScaffoldDrop(info) {
      this.$emit('droppedAscaff', info);
    },
    handleBScaffoldDrop(info) {
      this.$emit('droppedBscaff', info);
    },

    handleExnetDroppedOnScaffoldSlot(info) {
      this.$emit('exnet-dropped-on-scaffold-slot', info);
    },

    // ── Child content updates ─────────────────────────────────────

    handleUpdateStatContentA(info) {
      this.acontent = [info['content'], info['statement']];
      this.updateContentTextAll();
      this.$emit('update-stat-data', info['statementID']);
      this.$emit('update-child-stat', {
        connectorID: this.connectorID,
        content: this.acontent,
        direction: 'left',
      });
    },

    handleUpdateStatContentB(info) {
      this.bcontent = [info['content'], info['statement']];
      this.updateContentTextAll();
      this.$emit('update-stat-data', info['statementID']);
      this.$emit('update-child-stat', {
        connectorID: this.connectorID,
        content: this.bcontent,
        direction: 'right',
      });
    },

    handleStatDataChange(info) {
      this.$emit('update-stat-data', info);
    },

    handleUpdateChildStat(info) {
      this.$emit('update-child-stat', info);
    },

    handleUpdateConnectorContentA(info) {
      this.acontent = info['content'];
      this.updateContentTextAll();
      this.$emit('update-child-connector-content', {
        content: this.acontent,
        connectorID: this.connectorID,
        direction: 'left',
      });
    },

    handleUpdateConnectorContentB(info) {
      this.bcontent = info['content'];
      this.updateContentTextAll();
      this.$emit('update-child-connector-content', {
        content: this.bcontent,
        connectorID: this.connectorID,
        direction: 'right',
      });
    },

    handleUpdateChildClickCount(info) {
      this.$emit('update-click-count', info);
    },

    handleToggleOrientation({ id }) {
      this.$emit('toggle-orientation', { id });
    },

    handleUpdateChildConnector(info) {
      this.$emit('update-child-connector-content', info);
    },

    displayFormChanged() {
      this.$emit('update-click-count', this.connectorID);
      if (this.clickCount % 2 === 0) {
        this.acontent =
          this.allConnectors[this.connectorID].leftContent === undefined
            ? '...'
            : this.allConnectors[this.connectorID].leftContent;
        this.bcontent =
          this.allConnectors[this.connectorID].rightContent === undefined
            ? '...'
            : this.allConnectors[this.connectorID].rightContent;
        this.updateContentTextAll();
      }
    },

    initContent() {
      this.currConnectorContent = JSON.parse(
        JSON.stringify(this.connectorContent[this.selectedPhrase]),
      );
      if (this.allConnectors !== undefined) {
        this.acontent =
          this.allConnectors[this.connectorID].leftContent === undefined
            ? '...'
            : this.allConnectors[this.connectorID].leftContent;
        this.bcontent =
          this.allConnectors[this.connectorID].rightContent === undefined
            ? '...'
            : this.allConnectors[this.connectorID].rightContent;
        this.updateContentTextAll();
        this.word = this.connectorContent[this.selectedPhrase].join('');
      }
    },

    deleteChildConnector({ id, parentId, position = '' }) {
      this.$emit('delete-child-connector', { id, parentId, position });
    },

    onDuplicateConnectorClick(event, theID) {
      this.$emit('duplicate-connector', {
        id: theID,
        posX: event.clientX,
        posY: event.clientY,
      });
    },

    duplicateConnector(payload) {
      this.$emit('duplicate-connector', payload);
    },

    deleteConnector({ id }) {
      this.$emit('delete-connector', { id });
    },

    showInfo() {
      this.$forceUpdate();
    },
  },

  watch: {
    contentTextAll(newConnectorContent) {
      this.$emit('update-connector-content', {
        connectorID: this.connectorID,
        content: newConnectorContent,
      });
    },

    connectorID() {
      this.initContent();
    },

    leftContent() {
      this.acontent =
        this.allConnectors[this.connectorID].leftContent === undefined
          ? '...'
          : this.allConnectors[this.connectorID].leftContent;
      this.updateContentTextAll();
    },

    rightContent() {
      this.bcontent =
        this.allConnectors[this.connectorID].rightContent === undefined
          ? '...'
          : this.allConnectors[this.connectorID].rightContent;
      this.updateContentTextAll();
    },
  },

  created() {
    if (this.allConnectors == undefined) {
      this.contentTextAll =
        '[A]' + this.connectorContent[this.selectedPhrase].join('') + '[B]';
    }
    this.initContent();
  },
};
</script>

<style scoped>
.connectorContainer {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  flex-basis: auto;
  width: fit-content;
  height: fit-content;
  min-width: 160px;
  min-height: 40px;
  margin-bottom: 10px;
  align-items: center;
  border-radius: 6px;
  border: 1px solid rgb(230, 230, 255);
  background-color: #ffffff;
  padding: 2px;
  overflow: visible;
}

.connectorContainer:hover .buttons-container {
  opacity: 1 !important;
}

.connectorContainer:hover .connectorButton {
  opacity: 1 !important;
}

.currentHoverTarget {
  border: 1px solid var(--biologic-hover-border-color);
  cursor: move;
}

.connectorBox {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}

.onlyText {
  background-color: var(--biologic-collapsed-statement-color);
  max-width: 400px;
  overflow-wrap: break-word;
}

.connector-sections {
  display: flex;
  padding: 0px;
  border: 0px solid rgb(5, 77, 1);
  align-items: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.connector-target-box {
  display: flex;
  padding: 10px;
  flex-grow: 1;
  box-sizing: border-box;
  border: 1px solid rgb(144, 207, 142);
}

.connectorMenu {
  font-weight: bold;
  font-size: var(--biologic-statement-font-size);
}

.tooltip {
  position: relative;
  display: inline-block;
  border: 0px solid rgb(188, 176, 123);
}

.delete-button {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-items: flex-start;
  padding: 10px;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-100%);
  pointer-events: auto;
  border-radius: 6px;
  border: 1px solid var(--biologic-hover-border-color);
}

.connectorButton {
  cursor: pointer;
  width: 24px;
  height: 24px;
  margin: 2px;
  padding: 1px;
  align-items: center;
  opacity: 0.05 !important;
  transition: opacity 0.3s ease;
}

.connector-a-picture-parent {
  width: 20px;
  height: 20px;
  align-items: center;
}

.connector-a-picture {
  width: 20px;
  height: 20px;
  margin: 1px;
  padding: 1px;
  align-items: center;
}

.drag-over-happening {
  border: 2px solid rgb(0, 178, 42);
  transform: translate(-1px, -1px);
}

.connectorTextContainerNew {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.connectorText {
  font-size: var(--biologic-statement-font-size);
  font-weight: bold;
  max-width: 80px;
  margin: 0px 5px 0px 5px;
}

.image-target-icon {
  pointer-events: none;
}

.rubric-border--direct {
  outline: 10px solid #16a34a;
  outline-offset: 2px;
}
.rubric-border--target {
  outline: 2px solid #16a34a;
  outline-offset: 2px;
}
.rubric-border--matching {
  outline: 2px solid #16a34a;
  outline-offset: 2px;
}
.rubric-border--missing {
  outline: 2px solid #dc2626;
  outline-offset: 2px;
}
.rubric-border--extra {
  outline: 2px solid #d97706;
  outline-offset: 2px;
}
</style>
