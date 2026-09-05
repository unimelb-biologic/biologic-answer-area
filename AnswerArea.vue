<template>
  <div class="answer-area-container" ref="answerAreaContainer">
    <div v-if="!displayOnly" class="answer-area-toolbar">
      <div class="answer-area-toolbar-buttons">
        <ConnectorArea class="answer-area-toolbar-connectors" toolbar-mode />
        <Tooltip text="Undo last change">
          <v-btn
            class="answer-area-button"
            size="small"
            id="undoBtn"
            :disabled="!canUndo"
            @click="undo"
          >
            <v-icon class="answer-area-icon" size="20">mdi-undo</v-icon>
          </v-btn>
        </Tooltip>
        <Tooltip text="Redo last change">
          <v-btn
            class="answer-area-button"
            size="small"
            id="redoBtn"
            :disabled="!canRedo"
            @click="redo"
          >
            <v-icon class="answer-area-icon" size="20">mdi-redo</v-icon>
          </v-btn>
        </Tooltip>
      </div>
    </div>
    <div
      class="answer-area-workspace"
      style="display: flex; flex-direction: row"
    >
      <div
        ref="answer_area_ref"
        class="answer_area_class"
        @drop="onDrop"
        @dragover.prevent
      >
        <!-- Root statements -->
        <RenderStatement
          v-for="item in data.rootStatementIDs"
          :key="item"
          :statement-data="data.getStatement(item)"
          :showToggle="true"
          :depth="0"
          :exnetType="exnetType"
          @duplicate-statement="duplicateStatement"
          @delete-statement="deleteStatement"
          @update-statement-content="handleUpdateStatementContent"
          @connector-dropped-on-statement="handleNewConnectorDroppedOnSomething"
          @statement-dropped-on-statement="handleStatementDroppedOnStatement"
          @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
          @toggle-showPopup-fromrenderstatement="
            toggleShowPopupFromRenderStatement
          "
        />

        <!-- Root connectors -->
        <Connector
          v-for="rootConnectorID in data.rootConnectorIDs"
          :key="rootConnectorID"
          :connector-i-d="rootConnectorID"
          :connector-content-i-d="
            data.getConnector(rootConnectorID).connectorContentID
          "
          :connector-content="
            data.getConnector(rootConnectorID).connectorContent
          "
          :all-statements="data.statements"
          :all-connectors="data.connectors"
          :all-scaffolds="data.scaffolds"
          :parent="data.getConnector(rootConnectorID).parent"
          :left-i-d="data.getConnector(rootConnectorID).leftID"
          :left-type="data.getConnector(rootConnectorID).leftType"
          :left-content="data.getConnector(rootConnectorID).leftContent"
          :right-i-d="data.getConnector(rootConnectorID).rightID"
          :right-type="data.getConnector(rootConnectorID).rightType"
          :right-content="data.getConnector(rootConnectorID).rightContent"
          :click-count="data.getConnector(rootConnectorID).clickCount"
          :orientation="data.getConnector(rootConnectorID).orientation"
          :selected-phrase="data.getConnector(rootConnectorID).selectedPhrase"
          :conntop="data.getConnector(rootConnectorID).top"
          :connleft="data.getConnector(rootConnectorID).left"
          :rootConnectorID="rootConnectorID"
          :depth="0"
          :exnetType="exnetType"
          @delete-child-connector="deleteChildConnector"
          @delete-connector="deleteConnector"
          @dropped-astat="(info) => handleStatementDrop(info, 'left')"
          @dropped-bstat="(info) => handleStatementDrop(info, 'right')"
          @dropped-aconn="(info) => handleConnectorDrop(info, 'left')"
          @dropped-bconn="(info) => handleConnectorDrop(info, 'right')"
          @dropped-ascaff="(info) => handleScaffoldDrop(info, 'left')"
          @dropped-bscaff="(info) => handleScaffoldDrop(info, 'right')"
          @link-word-changed="handleLinkWordChange"
          @update-connector-content="handleConnectContentChange"
          @update-click-count="handleUpdateClickCount"
          @toggle-orientation="handleToggleOrientation"
          @update-child-connector-content="handleUpdateChildConnector"
          @update-child-stat="handleUpdateChildStat"
          @new-connector-dropped-on-connector="
            handleNewConnectorDroppedOnSomething
          "
          @connector-dropped-on-statement="handleNewConnectorDroppedOnSomething"
          @duplicate-statement="duplicateStatement"
          @duplicate-connector="duplicateConnector"
          @delete-statement="deleteStatement"
          @toggle-collapsed-renderstatement-from-connector="
            toggleCollapsedRenderStatementFromConnector
          "
          @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
          @exnet-dropped-on-scaffold-slot="handleExnetDroppedOnScaffoldSlot"
          @delete-scaffold="deleteScaffold"
          @delete-child-scaffold="deleteChildScaffold"
          @duplicate-scaffold="duplicateScaffold"
          @toggle-collapsed-renderstatement-from-scaffold="
            toggleCollapsedRenderStatementFromConnector
          "
          @toggle-showPopup-fromscaffold="toggleShowPopupFromConnector"
        />

        <!-- Root scaffolds -->
        <Scaffold
          v-for="rootScaffoldID in data.rootScaffoldIDs"
          :key="rootScaffoldID"
          :scaffold-data="data.getScaffold(rootScaffoldID)"
          :all-statements="data.statements"
          :all-connectors="data.connectors"
          :all-scaffolds="data.scaffolds"
          :depth="0"
          :exnetType="exnetType"
          @delete-scaffold="deleteScaffold"
          @delete-child-scaffold="deleteChildScaffold"
          @duplicate-statement="duplicateStatement"
          @duplicate-connector="duplicateConnector"
          @duplicate-scaffold="duplicateScaffold"
          @delete-statement="deleteStatement"
          @delete-child-connector="deleteChildConnector"
          @connector-dropped-on-statement="handleNewConnectorDroppedOnSomething"
          @new-connector-dropped-on-connector="
            handleNewConnectorDroppedOnSomething
          "
          @exnet-dropped-on-scaffold-slot="handleExnetDroppedOnScaffoldSlot"
          @toggle-collapsed-renderstatement-from-scaffold="
            toggleCollapsedRenderStatement
          "
          @toggle-showPopup-fromscaffold="toggleShowPopupFromRenderStatement"
          @dropped-astat="(info) => handleStatementDrop(info, 'left')"
          @dropped-bstat="(info) => handleStatementDrop(info, 'right')"
          @dropped-aconn="(info) => handleConnectorDrop(info, 'left')"
          @dropped-bconn="(info) => handleConnectorDrop(info, 'right')"
          @dropped-ascaff="(info) => handleScaffoldDrop(info, 'left')"
          @dropped-bscaff="(info) => handleScaffoldDrop(info, 'right')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Connector from './Connector.vue';
import RenderStatement from './RenderStatement.vue';
import ConnectorArea from './ConnectorArea.vue';
import Scaffold from './Scaffold.vue';
import _, { cloneDeep } from 'lodash';
import stringify from 'json-stringify-pretty-compact';
import isEqual from 'lodash/isEqual';
import Tooltip from './shared/Tooltip.vue';
import { newElementId, validDirection } from './util';
import {
  AnswerAreaData_T,
  ConnectorID_T,
  Connector_T,
  StatementID_T,
  Statement_T,
  ElementID_T,
  ConnectorEmittedInfo_T,
  ElementTypes_T,
  Direction_T,
  AnswerContent_T,
  Element_T,
  Scaffold_T,
  ScaffoldID_T,
  ScaffoldChild_T,
} from './AnswerAreaTypes.js';

export default {
  name: 'AnswerArea',
  components: {
    Connector,
    RenderStatement,
    ConnectorArea,
    Scaffold,
    Tooltip,
  },
  emits: [
    'update-answer-area-content',
    'connector-deleted',
    'answer-data',
    'answerarea-state-change',
    'statement-used',
    'statement-removed',
  ],
  props: {
    displayOnly: Boolean,
    testProp: Number,
    exnetType: {
      type: String,
      default: 'student',
    },
  },
  setup() {
    return {
      Connector_T,
    };
  },
  data() {
    return {
      data: new AnswerAreaData_T(),
    };
  },
  provide() {
    return {
      displayOnly: this.displayOnly,
      activeHover: this.data.hoverInfo,
      setActiveHover: this.setActiveHover,
      clearActiveHover: this.clearActiveHover,
    };
  },
  inject: [
    'feedbackIsAvailable',
    'showDataStructures',
    'globalDebugMode',
    'showAllFeedback',
  ],
  computed: {
    isDev() {
      return this.$route.query.isDev;
    },
    canUndo() {
      return this.data.undoStack.length > 0;
    },
    canRedo() {
      return this.data.redoStack.length > 0;
    },
  },

  methods: {
    // ── Hover ────────────────────────────────────────────────────────

    setActiveHover(id: ElementID_T | null, depth: number) {
      this.data.hoverInfo = { id: id, depth: depth };
    },

    clearActiveHover(id: ElementID_T) {
      if (this.data.activeHoverID === id) {
        this.data.clearActiveHover();
      }
    },

    // ── State / undo / redo ──────────────────────────────────────────

    getCurrentState() {
      return this.data.state;
    },

    getScrollableWorkspace(element: HTMLElement) {
      if (!element) return null;
      return (
        element.closest('.answer-area-workspace') ||
        this.$el?.querySelector('.answer-area-workspace') ||
        (this.$refs.answer_area_ref as HTMLElement)?.parentElement ||
        null
      );
    },

    resetStateHistory() {
      this.data.resetUndoStack();
      this.data.resetRedoStack();
      this.data.saveState();
    },

    notifyStateChange() {
      if (this.data.ignoringStateChanges) return;
      const nextState = this.data.state;
      if (this.data.currentState) {
        if (!isEqual(this.data.currentState, nextState)) {
          this.data.undoStack.push(this.data.currentState);
        } else {
          return;
        }
      }
      this.data.currentState = nextState;
      this.data.resetRedoStack();
      this.$emit('answerarea-state-change');
    },

    async undo() {
      if (this.data.undoStack.length === 0) return;
      this.data.redoStack.push(this.data.currentState);
      this.data.currentState = this.data.undoStack.pop()!;
      this.data.ignoreStateChanges();
      await this.loadPreviousAnswer(this.data.currentState);
      this.data.unignoreStateChanges();
      this.$emit('answerarea-state-change');
    },

    async redo() {
      if (this.data.redoStack.length === 0) return;
      this.data.undoStack.push(this.data.currentState);
      this.data.currentState = this.data.redoStack.pop()!;
      this.data.ignoreStateChanges();
      await this.loadPreviousAnswer(this.data.currentState);
      this.data.unignoreStateChanges();
      this.$emit('answerarea-state-change');
    },

    async toggleFullscreen() {
      const element = this.$refs.answerAreaContainer as HTMLElement;
      if (!element) return;
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    },

    // ── Position helpers ─────────────────────────────────────────────

    calculateNewPositionWithinAnswerArea(e: DragEvent) {
      const grabOffsetLeft = parseInt(
        e.dataTransfer!.getData('grabOffsetLeft'),
      );
      const grabOffsetTop = parseInt(e.dataTransfer!.getData('grabOffsetTop'));

      const scrollableDisplayWorkspace = this.getScrollableWorkspace(
        e.currentTarget as HTMLElement,
      );
      const scrollLeft = scrollableDisplayWorkspace?.scrollLeft ?? 0;
      const scrollTop = scrollableDisplayWorkspace?.scrollTop ?? 0;

      const workspaceRect = (
        scrollableDisplayWorkspace || e.currentTarget
      ).getBoundingClientRect();
      return [
        e.clientX - workspaceRect.left - grabOffsetLeft + scrollLeft,
        e.clientY - workspaceRect.top - grabOffsetTop + scrollTop,
      ];
    },

    // ── Tree helpers ─────────────────────────────────────────────────

    /**
     * Returns true if `thingID` of type `objTypeStr` appears anywhere
     * in the subtree rooted at `connID`.
     * Extended to also descend into scaffold children.
     */
    thingIsInTreeOfconnector(
      objTypeStr: ElementTypes_T,
      thingID: ElementID_T,
      connID: ConnectorID_T,
    ): boolean {
      const con = this.data.getConnector(connID);
      const sides: Array<'left' | 'right'> = ['left', 'right'];
      for (const side of sides) {
        const childID = con[`${side}ID`];
        const childType = con[`${side}Type`];
        if (childID === undefined) continue;
        if (childType === 'connector') {
          if (thingID === childID) return true;
          if (this.thingIsInTreeOfconnector(objTypeStr, thingID, childID))
            return true;
        } else if (childType === 'statement') {
          if (objTypeStr === 'statement' && thingID === childID) return true;
        } else if (childType === 'scaffold') {
          if (objTypeStr === 'scaffold' && thingID === childID) return true;
          if (this.thingIsInTreeOfScaffold(objTypeStr, thingID, childID))
            return true;
        }
      }
      return false;
    },

    /**
     * Returns true if `thingID` of type `objTypeStr` appears anywhere
     * in the subtree rooted at scaffold `scaffoldID`.
     */
    thingIsInTreeOfScaffold(
      objTypeStr: ElementTypes_T,
      thingID: ElementID_T,
      scaffoldID: ScaffoldID_T,
    ): boolean {
      const scaffold = this.data.getScaffold(scaffoldID);
      if (!scaffold) return false;
      for (const child of scaffold.children) {
        if (child.childID === undefined) continue;
        if (child.childType === 'statement') {
          if (objTypeStr === 'statement' && thingID === child.childID)
            return true;
        } else if (child.childType === 'connector') {
          if (objTypeStr === 'connector' && thingID === child.childID)
            return true;
          if (this.thingIsInTreeOfconnector(objTypeStr, thingID, child.childID))
            return true;
        } else if (child.childType === 'scaffold') {
          if (objTypeStr === 'scaffold' && thingID === child.childID)
            return true;
          if (this.thingIsInTreeOfScaffold(objTypeStr, thingID, child.childID))
            return true;
        }
      }
      return false;
    },

    dropIsPermissible(
      objectTypeString: ElementTypes_T,
      thingBeingDroppedOnID: ElementID_T,
      connectorBeingDroppedID: ConnectorID_T,
    ): boolean {
      if (
        objectTypeString === 'connector' &&
        thingBeingDroppedOnID === connectorBeingDroppedID
      ) {
        return false;
      }
      return !this.thingIsInTreeOfconnector(
        objectTypeString,
        thingBeingDroppedOnID,
        connectorBeingDroppedID,
      );
    },

    // ── Connector drop handling (existing, unchanged logic) ──────────

    handleLinkWordChange(info: ConnectorEmittedInfo_T) {
      const connectorID = info['connectorID'];
      this.data.getConnector(connectorID)['selectedPhrase'] =
        info['selectedPhrase'];
      this.notifyStateChange();
    },

    handleStatementDrop(
      info: Partial<ConnectorEmittedInfo_T>,
      direction: Direction_T,
    ) {
      const connectorID = info['connectorID']!;
      const statementID = info['statementID']!;
      const statementContent = info['content'];

      const statementDropped = this.data.getStatement(statementID);
      const statementOldParent = statementDropped['parent'];
      const statementOldSide = statementDropped['side'];

      statementDropped['parent'] = connectorID;
      statementDropped['position'] = undefined;
      statementDropped['top'] = undefined;
      statementDropped['left'] = undefined;
      statementDropped['side'] = direction;

      if (statementOldParent === undefined) {
        this.$emit('statement-used', statementID);
      } else if (!Element_T.validParentId(statementOldParent)) {
        this.data.deleteRootStatementID(statementID);
      } else {
        const oldParentConnector = this.data.getConnector(statementOldParent);
        if (oldParentConnector) {
          oldParentConnector.deleteChild(statementOldSide!);
        } else {
          const oldParentScaffold = this.data.getScaffold(statementOldParent);
          if (oldParentScaffold) {
            const idx = oldParentScaffold.indexOfChild(statementID);
            if (idx !== -1) oldParentScaffold.clearChild(idx);
          }
        }
      }

      const newParent = this.data.getConnector(connectorID);
      newParent[`${direction}ID`] = statementID;
      newParent[`${direction}Type`] = 'statement';
      newParent[`${direction}Content`] = statementContent;

      this.notifyStateChange();
    },

    handleConnectorDrop(info: ConnectorEmittedInfo_T, dir: Direction_T) {
      const connectorID = info['connectorID'];
      const con = Connector_T.fromJSON(info['data']);
      const evt = info['event'];
      const connectorIsNew = !info['data'].connectorID;
      const droppedConnectorID = connectorIsNew ? newElementId() : con.Id;

      if (
        !connectorIsNew &&
        !this.dropIsPermissible('connector', connectorID, droppedConnectorID)
      ) {
        evt.preventDefault();
        this.data.getConnector(droppedConnectorID).exNetPosition =
          this.calculateNewPositionWithinAnswerArea(evt);
        evt.stopImmediatePropagation();
        this.notifyStateChange();
        return;
      }

      if (connectorIsNew) {
        con.deleteLeftChild();
        con.deleteRightChild();
        con.Id = droppedConnectorID;
        con.parent = connectorID;
        con.resetClickCount();
        con.resetOrientation();
        this.data.addConnector(con);
      } else if (!con.hasParent()) {
        if (this.data.hasRootConnectorID(droppedConnectorID)) {
          this.data.deleteRootConnectorID(droppedConnectorID);
        }
        this.data.getConnector(droppedConnectorID).parent = connectorID;
      } else {
        const oldParentConnector = this.data.getConnector(con.parent);
        if (oldParentConnector) {
          if (oldParentConnector.leftID === droppedConnectorID) {
            oldParentConnector.deleteLeftChild();
          } else if (oldParentConnector.rightID === droppedConnectorID) {
            oldParentConnector.deleteRightChild();
          }
        } else {
          const oldParentScaffold = this.data.getScaffold(con.parent);
          if (oldParentScaffold) {
            const idx = oldParentScaffold.indexOfChild(droppedConnectorID);
            if (idx !== -1) oldParentScaffold.clearChild(idx);
          }
        }
        this.data.getConnector(droppedConnectorID).parent = connectorID;
      }

      this.data
        .getConnector(connectorID)
        .addChild(dir, droppedConnectorID, 'connector', info['content']);
      this.data.allAnswerContent[droppedConnectorID] = info['content'];
      this.notifyStateChange();
    },

    handleScaffoldDrop(info: ConnectorEmittedInfo_T, direction: Direction_T) {
      const connectorID = info['connectorID'];
      const scaffoldID = info['data'].scaffoldID;
      const droppedScaffold = this.data.getScaffold(scaffoldID);
      if (!droppedScaffold) return;

      const oldParent = droppedScaffold.parent;

      // Detach from old location
      if (!Element_T.validParentId(oldParent)) {
        this.data.deleteRootScaffoldID(scaffoldID);
      } else {
        const oldParentConnector = this.data.getConnector(oldParent);
        if (oldParentConnector) {
          if (oldParentConnector.leftID === scaffoldID)
            oldParentConnector.deleteLeftChild();
          else if (oldParentConnector.rightID === scaffoldID)
            oldParentConnector.deleteRightChild();
        } else {
          const oldParentScaffold = this.data.getScaffold(oldParent);
          if (oldParentScaffold) {
            const idx = oldParentScaffold.indexOfChild(scaffoldID);
            if (idx !== -1) oldParentScaffold.clearChild(idx);
          }
        }
      }

      // Attach to connector
      droppedScaffold.parent = connectorID;
      droppedScaffold.resetExNetPosition();
      droppedScaffold.position = undefined; // ← ADD THIS: clear absolute positioning

      const parentConnector = this.data.getConnector(connectorID);
      parentConnector[`${direction}ID`] = scaffoldID;
      parentConnector[`${direction}Type`] = 'scaffold';
      parentConnector[`${direction}Content`] = info['content'];

      this.data.allAnswerContent[scaffoldID] = info['content'];
      this.notifyStateChange();
    },

    handleStatementDroppedOnStatement(info: ConnectorEmittedInfo_T) {
      const e = info['event'];
      const statementData = JSON.parse(e.dataTransfer!.getData('data'));
      const droppedStatementID = statementData.id;
      const statement = this.data.getStatement(droppedStatementID);
      if (!statement.hasParent()) return;

      statement.position = 'absolute';
      statement.exNetPosition = this.calculateNewPositionWithinAnswerArea(e);
      this.notifyStateChange();
    },

    handleNewConnectorDroppedOnSomething(info: ConnectorEmittedInfo_T) {
      const droppedOnStatementID = info['statementID'];
      const droppedOnConnectorID = info['connectorID'];
      const droppedOn_is_Statement = droppedOnConnectorID == undefined;

      const e = info['event'];
      const data = JSON.parse(e.dataTransfer!.getData('data'));

      let droppedConnectorID = data.connectorID;
      const connector = this.data.getConnector(droppedConnectorID);

      if (
        droppedConnectorID !== undefined &&
        !this.dropIsPermissible(
          droppedOn_is_Statement ? 'statement' : 'connector',
          droppedOn_is_Statement ? droppedOnStatementID : droppedOnConnectorID,
          droppedConnectorID,
        )
      ) {
        e.preventDefault();
        connector.exNetPosition = this.calculateNewPositionWithinAnswerArea(e);
        e.stopImmediatePropagation();
        this.notifyStateChange();
        return;
      }

      let targetStr: Direction_T;
      if (droppedConnectorID == undefined) {
        targetStr = 'left';
      } else if (connector['leftID'] == undefined) {
        targetStr = 'left';
      } else if (connector['rightID'] == undefined) {
        targetStr = 'right';
      } else {
        return;
      }

      if (droppedConnectorID !== undefined) {
        if (connector.hasParent()) {
          const oldParentID = connector.parent;
          const oldParentConnector = this.data.getConnector(oldParentID);
          if (oldParentConnector) {
            if (oldParentConnector.leftID === droppedConnectorID) {
              oldParentConnector.deleteLeftChild();
            } else {
              oldParentConnector.deleteRightChild();
            }
          } else {
            const oldParentScaffold = this.data.getScaffold(oldParentID);
            if (oldParentScaffold) {
              const idx = oldParentScaffold.indexOfChild(droppedConnectorID);
              if (idx !== -1) oldParentScaffold.clearChild(idx);
            }
          }
        } else {
          if (this.data.hasRootConnectorID(droppedConnectorID)) {
            this.data.deleteRootConnectorID(droppedConnectorID);
          }
        }
      }

      let parentID = undefined;
      if (droppedOn_is_Statement) {
        parentID = this.data.getStatement(droppedOnStatementID)['parent'];
      } else {
        parentID = this.data.getConnector(droppedOnConnectorID)['parent'];
      }

      if (droppedConnectorID === undefined) {
        droppedConnectorID = newElementId();
        const con: Connector_T = Connector_T.fromJSON(data);
        con.Id = droppedConnectorID;
        con.deleteLeftChild();
        con.deleteRightChild();
        con.resetClickCount();
        con.resetOrientation();
        this.data.addConnector(con);
      }

      const droppedCon = this.data.getConnector(droppedConnectorID);
      droppedCon.parent = parentID;
      droppedCon[`${targetStr}ID`] = droppedOn_is_Statement
        ? droppedOnStatementID
        : droppedOnConnectorID;
      droppedCon[`${targetStr}Type`] = droppedOn_is_Statement
        ? 'statement'
        : 'connector';
      droppedCon[`${targetStr}Content`] = undefined;

      let parentConnID = undefined;
      if (droppedOn_is_Statement) {
        const statement = this.data.getStatement(droppedOnStatementID);
        const hasParent = statement.hasParent();
        parentConnID = statement.parent;
        statement.parent = droppedConnectorID;
        statement.side = targetStr;
        if (!hasParent) {
          if (this.data.hasRootStatementID(droppedOnStatementID)) {
            this.data.deleteRootStatementID(droppedOnStatementID);
            statement.position = 'relative';
          }
          this.data.addRootConnectorID(droppedConnectorID);
          droppedCon['top'] = statement['top'];
          droppedCon['left'] = statement['left'];
          statement.resetExNetPosition();
        } else {
          const originalParentConnector = this.data.getConnector(parentConnID);
          if (originalParentConnector) {
            if (originalParentConnector.leftID == droppedOnStatementID) {
              originalParentConnector.leftID = droppedConnectorID;
              originalParentConnector.leftType = 'connector';
            } else {
              originalParentConnector.rightID = droppedConnectorID;
              originalParentConnector.rightType = 'connector';
            }
          } else {
            const originalParentScaffold = this.data.getScaffold(parentConnID);
            if (originalParentScaffold) {
              const idx =
                originalParentScaffold.indexOfChild(droppedOnStatementID);
              if (idx !== -1)
                originalParentScaffold.setChild(
                  idx,
                  droppedConnectorID,
                  'connector',
                  undefined,
                );
            }
          }
          droppedCon.parent = parentConnID;
        }
      } else {
        const droppedOnCon = this.data.getConnector(droppedOnConnectorID);
        const hasParent = droppedOnCon.hasParent();
        parentConnID = droppedOnCon.parent;
        droppedOnCon.parent = droppedConnectorID;
        if (!hasParent) {
          if (this.data.hasRootConnectorID(droppedOnConnectorID))
            this.data.deleteRootConnectorID(droppedOnConnectorID);
          this.data.addRootConnectorID(droppedConnectorID);
          droppedCon.top = droppedOnCon.top;
          droppedCon.left = droppedOnCon.left;
          droppedOnCon.resetExNetPosition();
        } else {
          const oldParentConnector = this.data.getConnector(parentConnID);
          if (oldParentConnector) {
            if (oldParentConnector.leftID == droppedOnConnectorID) {
              oldParentConnector.leftID = droppedConnectorID;
            } else {
              oldParentConnector.rightID = droppedConnectorID;
            }
          } else {
            const oldParentScaffold = this.data.getScaffold(parentConnID);
            if (oldParentScaffold) {
              const idx = oldParentScaffold.indexOfChild(droppedOnConnectorID);
              if (idx !== -1)
                oldParentScaffold.setChild(
                  idx,
                  droppedConnectorID,
                  'connector',
                  undefined,
                );
            }
          }
        }
      }
      this.notifyStateChange();
    },

    // ── Scaffold drop handling (new) ─────────────────────────────────

    /**
     * Called when any ExNet element is dropped onto a scaffold slot.
     * Handles all three dropped types: statement, connector, scaffold.
     */
    handleExnetDroppedOnScaffoldSlot(info: {
      scaffoldID: ScaffoldID_T;
      slotIndex: number;
      droppedType: ElementTypes_T;
      data: any;
      content: string;
      event: DragEvent;
    }) {
      const { scaffoldID, slotIndex, droppedType, data, content, event } = info;
      const targetScaffold = this.data.getScaffold(scaffoldID);
      if (!targetScaffold) return;

      if (droppedType === 'statement') {
        this._dropStatementOnScaffoldSlot(
          targetScaffold,
          slotIndex,
          data,
          content,
        );
      } else if (droppedType === 'connector') {
        this._dropConnectorOnScaffoldSlot(
          targetScaffold,
          slotIndex,
          data,
          content,
          event,
        );
      } else if (droppedType === 'scaffold') {
        this._dropScaffoldOnScaffoldSlot(
          targetScaffold,
          slotIndex,
          data,
          event,
        );
      }

      this.notifyStateChange();
    },

    _dropStatementOnScaffoldSlot(
      targetScaffold: Scaffold_T,
      slotIndex: number,
      data: any,
      content: string,
    ) {
      const statementID = data.id;
      const statement = this.data.getStatement(statementID);
      if (!statement) return;

      const oldParent = statement.parent;

      // Detach from old location
      if (!Element_T.validParentId(oldParent)) {
        // Was a root statement
        this.data.deleteRootStatementID(statementID);
      } else {
        // Was a child of a connector — find and clear the slot
        const parentConnector = this.data.getConnector(oldParent);
        if (parentConnector) {
          if (parentConnector.leftID === statementID)
            parentConnector.deleteLeftChild();
          else if (parentConnector.rightID === statementID)
            parentConnector.deleteRightChild();
        } else {
          // Was a child of a scaffold
          const parentScaffold = this.data.getScaffold(oldParent);
          if (parentScaffold) {
            const idx = parentScaffold.indexOfChild(statementID);
            if (idx !== -1) parentScaffold.clearChild(idx);
          }
        }
      }

      // Attach to new scaffold slot
      statement.parent = targetScaffold.scaffoldID;
      statement.side = undefined;
      statement.position = 'relative';
      statement.resetExNetPosition();
      targetScaffold.setChild(slotIndex, statementID, 'statement', content);
      this.data.allAnswerContent[statementID] = content;
    },

    _dropConnectorOnScaffoldSlot(
      targetScaffold: Scaffold_T,
      slotIndex: number,
      data: any,
      content: string,
      event: DragEvent,
    ) {
      const connectorIsNew = !data.connectorID;
      const droppedConnectorID = connectorIsNew
        ? newElementId()
        : data.connectorID;

      if (connectorIsNew) {
        const con = Connector_T.fromJSON(data);
        con.Id = droppedConnectorID;
        con.parent = targetScaffold.scaffoldID;
        con.deleteLeftChild();
        con.deleteRightChild();
        con.resetClickCount();
        con.resetOrientation();
        this.data.addConnector(con);
      } else {
        const con = this.data.getConnector(droppedConnectorID);
        const oldParent = con.parent;

        // Detach from old location
        if (!Element_T.validParentId(oldParent)) {
          this.data.deleteRootConnectorID(droppedConnectorID);
        } else {
          const parentConnector = this.data.getConnector(oldParent);
          if (parentConnector) {
            if (parentConnector.leftID === droppedConnectorID)
              parentConnector.deleteLeftChild();
            else if (parentConnector.rightID === droppedConnectorID)
              parentConnector.deleteRightChild();
          } else {
            const parentScaffold = this.data.getScaffold(oldParent);
            if (parentScaffold) {
              const idx = parentScaffold.indexOfChild(droppedConnectorID);
              if (idx !== -1) parentScaffold.clearChild(idx);
            }
          }
        }
        con.parent = targetScaffold.scaffoldID;
        con.resetExNetPosition();
      }

      targetScaffold.setChild(
        slotIndex,
        droppedConnectorID,
        'connector',
        content,
      );
      this.data.allAnswerContent[droppedConnectorID] = content;
    },

    _dropScaffoldOnScaffoldSlot(
      targetScaffold: Scaffold_T,
      slotIndex: number,
      data: any,
      event: DragEvent,
    ) {
      const droppedScaffoldID = data.scaffoldID;
      if (!droppedScaffoldID) return;

      // Prevent dropping a scaffold into its own subtree
      if (
        droppedScaffoldID === targetScaffold.scaffoldID ||
        this.thingIsInTreeOfScaffold(
          'scaffold',
          targetScaffold.scaffoldID,
          droppedScaffoldID,
        )
      ) {
        return;
      }

      const droppedScaffold = this.data.getScaffold(droppedScaffoldID);
      if (!droppedScaffold) return;

      const oldParent = droppedScaffold.parent;

      // Detach from old location
      if (!Element_T.validParentId(oldParent)) {
        this.data.deleteRootScaffoldID(droppedScaffoldID);
      } else {
        const parentConnector = this.data.getConnector(oldParent);
        if (parentConnector) {
          if (parentConnector.leftID === droppedScaffoldID)
            parentConnector.deleteLeftChild();
          else if (parentConnector.rightID === droppedScaffoldID)
            parentConnector.deleteRightChild();
        } else {
          const parentScaffold = this.data.getScaffold(oldParent);
          if (parentScaffold) {
            const idx = parentScaffold.indexOfChild(droppedScaffoldID);
            if (idx !== -1) parentScaffold.clearChild(idx);
          }
        }
      }

      droppedScaffold.parent = targetScaffold.scaffoldID;
      droppedScaffold.resetExNetPosition();
      droppedScaffold.position = undefined; // ← clear absolute positioning
      targetScaffold.setChild(
        slotIndex,
        droppedScaffoldID,
        'scaffold',
        droppedScaffold.title,
      );
      this.data.allAnswerContent[droppedScaffoldID] = droppedScaffold.title;
    },

    // ── onDrop (answer area root drop zone) ──────────────────────────

    onDrop(e: DragEvent) {
      if (this.displayOnly) return;
      e.preventDefault();

      const exNetPosition = this.calculateNewPositionWithinAnswerArea(e);
      e.stopImmediatePropagation();

      const type = e.dataTransfer!.getData('type');
      const data = JSON.parse(e.dataTransfer!.getData('data'));
      const transContent = e.dataTransfer!.getData('content');

      this.data.ignoreStateChanges();

      if (type === 'connector') {
        if (data.connectorID === undefined) {
          const newConnectorID = newElementId();
          const con = Connector_T.fromJSON(data);
          con.Id = newConnectorID;
          con.deleteParent();
          con.deleteLeftChild();
          con.deleteRightChild();
          con.resetClickCount();
          con.resetOrientation();
          con.exNetPosition = exNetPosition;
          this.data.addConnector(con);
          this.data.addRootConnectorID(newConnectorID);
          this.data.allAnswerContent[newConnectorID] = transContent;
        } else {
          const con = this.data.getConnector(data.connectorID);
          con.deleteParent();
          this.data.addRootConnectorID(data.connectorID);
          this.data.allAnswerContent[data.connectorID] = transContent;
          con.exNetPosition = exNetPosition;

          const oldParentConnector = this.data.getConnector(data.parentID);
          if (oldParentConnector !== undefined) {
            if (
              oldParentConnector.leftID !== undefined &&
              oldParentConnector.leftID === data.connectorID
            ) {
              oldParentConnector.deleteLeftChild();
            } else {
              oldParentConnector.deleteRightChild();
            }
          } else {
            // Parent may be a scaffold
            const oldParentScaffold = this.data.getScaffold(data.parentID);
            if (oldParentScaffold !== undefined) {
              const idx = oldParentScaffold.indexOfChild(data.connectorID);
              if (idx !== -1) oldParentScaffold.clearChild(idx);
            }
          }
        }
      } else if (type === 'statement') {
        const statementID = data.id;
        const getStatement = this.data.getStatement(statementID);
        const statementOldParent = getStatement
          ? getStatement.parent
          : undefined;

        if (statementOldParent === undefined) {
          getStatement.deleteParent();
          getStatement.position = 'absolute';
          getStatement.exNetPosition = exNetPosition;
          this.data.addRootStatementID(statementID);
          this.$emit('statement-used', statementID);
        } else if (!getStatement.hasParent()) {
          getStatement.position = 'absolute';
          getStatement.exNetPosition = exNetPosition;
        } else {
          getStatement.deleteParent();
          getStatement.position = 'absolute';
          getStatement.exNetPosition = exNetPosition;
          this.data.addRootStatementID(statementID);

          // Detach from old parent — could be connector or scaffold
          const oldParentConnector = this.data.getConnector(statementOldParent);
          if (oldParentConnector) {
            if (oldParentConnector.leftID === statementID) {
              oldParentConnector.deleteLeftChild();
            } else if (oldParentConnector.rightID === statementID) {
              oldParentConnector.deleteRightChild();
            }
          } else {
            const oldParentScaffold = this.data.getScaffold(statementOldParent);
            if (oldParentScaffold) {
              const idx = oldParentScaffold.indexOfChild(statementID);
              if (idx !== -1) oldParentScaffold.clearChild(idx);
            }
          }
        }
        this.data.allAnswerContent[statementID] = transContent;
      } else if (type === 'scaffold') {
        console.log('AnswerArea:onDrop scaffold');
        // A scaffold dragged to the root answer area
        const scaffoldID = data.scaffoldID;
        const scaffold = this.data.getScaffold(scaffoldID);
        if (scaffold) {
          const oldParent = scaffold.parent;
          scaffold.deleteParent();
          scaffold.position = 'absolute';
          scaffold.exNetPosition = exNetPosition;

          this.data.addRootScaffoldID(scaffoldID);

          // Detach from old parent if it had one
          if (Element_T.validParentId(oldParent)) {
            const oldParentConnector = this.data.getConnector(oldParent);
            if (oldParentConnector) {
              if (oldParentConnector.leftID === scaffoldID) {
                oldParentConnector.deleteLeftChild();
              } else if (oldParentConnector.rightID === scaffoldID) {
                oldParentConnector.deleteRightChild();
              }
            } else {
              const oldParentScaffold = this.data.getScaffold(oldParent);
              if (oldParentScaffold) {
                const idx = oldParentScaffold.indexOfChild(scaffoldID);
                if (idx !== -1) oldParentScaffold.clearChild(idx);
              }
            }
          }
          this.data.allAnswerContent[scaffoldID] = transContent;
        }
      }

      this.data.unignoreStateChanges();
      this.notifyStateChange();
    },

    // ── Connector content / click count / orientation ────────────────

    handleConnectContentChange(info: ConnectorEmittedInfo_T) {
      const currConnectID = info['connectorID'];
      this.data.allAnswerContent[currConnectID] = info['content'];
    },

    handleUpdateChildStat(info: ConnectorEmittedInfo_T) {
      const connector = this.data.getConnector(info['connectorID']);
      const dir = info['direction'];
      if (!validDirection(dir)) return;
      connector[`${dir}Content`] = info['content'];
    },

    handleUpdateChildConnector(info: ConnectorEmittedInfo_T) {
      const connector = this.data.getConnector(info['connectorID']);
      const dir = info['direction'];
      if (!validDirection(dir)) return;
      connector[`${dir}Content`] = info['content'];
    },

    handleUpdateStatementContent(info: ConnectorEmittedInfo_T) {
      const statementID = info['statementID'];
      this.data.allAnswerContent[statementID] = info['content'];
      this.data.getStatement(statementID).content.userInput =
        info['statement'].content.userInput;
      this.notifyStateChange();
    },

    emitUpdateContent(newAnswerContentObject: AnswerContent_T) {
      this.$emit('update-answer-area-content', [
        this.data.rootConnectorIDs,
        this.data.rootStatementIDs,
        newAnswerContentObject,
      ]);
    },

    handleUpdateClickCount(transID: ConnectorID_T) {
      this.data.getConnector(transID).incrementClickCount();
    },

    handleToggleOrientation(params: { id: ConnectorID_T }) {
      const { id } = params;
      this.data.getConnector(id).toggleOrientation();
    },

    // ── Load / clear ─────────────────────────────────────────────────

    clearWorkspace() {
      this.initialiseWithStatementElements();
    },

    async loadPreviousAnswer(parameter: string | object) {
      const snapshot =
        typeof parameter === 'string'
          ? JSON.parse(parameter)
          : JSON.parse(JSON.stringify(parameter));

      this.data.loadFromPreviousAnswer(AnswerAreaData_T.fromJSON(snapshot));

      // ── DEV ONLY: inject hard-coded test scaffolds ──────────────────
      // Remove this block once the instructor editor can author scaffolds.
      if (
        //import.meta.env.DEV &&
        Object.keys(this.data.scaffolds).length === 0
      ) {
        for (const def of this.makeExampleScaffolds()) {
          const scaffold = this.buildScaffoldFromDefinition(def);
          this.data.addScaffold(scaffold);
          this.data.addRootScaffoldID(scaffold.Id);
          this.data.allAnswerContent[scaffold.Id] = scaffold.title;
        }
      }
      // ───────────────────────────────────────────────────────────────

      await this.$nextTick();
    },

    // ── Connector deletion ───────────────────────────────────────────

    deleteChildConnector(params: {
      id: ConnectorID_T;
      parentId: ConnectorID_T | undefined;
      position: Direction_T;
    }) {
      const { id, position } = params;
      if (position) {
        const parentId = this.data.getConnector(id).parent;
        // parentId could be a connector or a scaffold
        const parentConnector = this.data.getConnector(parentId);
        if (parentConnector) {
          parentConnector.deleteChild(position as Direction_T);
        } else {
          const parentScaffold = this.data.getScaffold(parentId);
          if (parentScaffold) {
            const idx = parentScaffold.indexOfChild(id);
            if (idx !== -1) parentScaffold.clearChild(idx);
          }
        }
      }
      this.deleteConnector({ id });
    },

    deleteConnector(params: { id: ConnectorID_T }) {
      const { id } = params;
      const { leftType, leftID, rightType, rightID } =
        this.data.getConnector(id);
      if (leftType === 'connector') {
        this.deleteConnector({ id: leftID! });
      }
      if (rightType === 'connector') {
        this.deleteConnector({ id: rightID! });
      }
      if (leftType === 'scaffold') {
        this.deleteScaffold({ id: leftID! });
      }
      if (rightType === 'scaffold') {
        this.deleteScaffold({ id: rightID! });
      }
      if (leftType === 'statement') {
        this.$emit('statement-removed', leftID, true);
      }
      if (rightType === 'statement') {
        this.$emit('statement-removed', rightID, true);
      }
      this.data.deleteConnector(id);
      this.data.deleteRootConnectorID(id);

      if (
        Object.prototype.hasOwnProperty.call(this.data.allAnswerContent, id)
      ) {
        delete this.data.allAnswerContent[id];
      }
      this.$emit('connector-deleted', id);
      this.notifyStateChange();
    },

    // ── Scaffold deletion ────────────────────────────────────────────

    /**
     * Recursively deletes a scaffold and all its descendants.
     * Called when the scaffold's own delete button is pressed
     * (i.e. it is already detached from its parent by the caller).
     */
    deleteScaffold(params: { id: ScaffoldID_T }) {
      const { id } = params;
      const scaffold = this.data.getScaffold(id);
      if (!scaffold) return;

      // Recursively delete all children
      for (const child of scaffold.children) {
        if (child.childID === undefined) continue;
        if (child.childType === 'connector') {
          this.deleteConnector({ id: child.childID });
        } else if (child.childType === 'scaffold') {
          this.deleteScaffold({ id: child.childID });
        } else if (child.childType === 'statement') {
          this.$emit('statement-removed', child.childID, true);
        }
      }

      this.data.deleteScaffold(id);
      this.data.deleteRootScaffoldID(id);

      if (
        Object.prototype.hasOwnProperty.call(this.data.allAnswerContent, id)
      ) {
        delete this.data.allAnswerContent[id];
      }
      this.notifyStateChange();
    },

    /**
     * Called when a child scaffold emits delete-child-scaffold,
     * i.e. the parent needs to detach the child before deleting it.
     */
    deleteChildScaffold(params: {
      id: ScaffoldID_T;
      parentId?: string;
      position?: Direction_T | number;
    }) {
      const { id } = params;
      const scaffold = this.data.getScaffold(id);
      if (!scaffold) return;

      const parentId = scaffold.parent;

      if (Element_T.validParentId(parentId)) {
        const parentConnector = this.data.getConnector(parentId);
        if (parentConnector) {
          if (parentConnector.leftID === id) parentConnector.deleteLeftChild();
          else if (parentConnector.rightID === id)
            parentConnector.deleteRightChild();
        } else {
          const parentScaffold = this.data.getScaffold(parentId);
          if (parentScaffold) {
            const idx = parentScaffold.indexOfChild(id);
            if (idx !== -1) parentScaffold.clearChild(idx);
          }
        }
      }

      this.deleteScaffold({ id });
    },

    // ── Statement deletion / duplication ────────────────────────────

    deleteStatement(id: StatementID_T) {
      const theStatement = this.data.getStatement(id);
      const oldParentID = theStatement['parent'];

      if (!theStatement.hasParent()) {
        this.data.deleteRootStatementID(id);
      } else {
        const oldParentConnector = this.data.getConnector(oldParentID);
        if (oldParentConnector) {
          if (
            oldParentConnector.leftID !== undefined &&
            oldParentConnector.leftID === id
          ) {
            oldParentConnector.deleteLeftChild();
          } else {
            oldParentConnector.deleteRightChild();
          }
        } else {
          const oldParentScaffold = this.data.getScaffold(oldParentID);
          if (oldParentScaffold) {
            const idx = oldParentScaffold.indexOfChild(id);
            if (idx !== -1) oldParentScaffold.clearChild(idx);
          }
        }
      }
      this.data.deleteStatement(id);
      this.notifyStateChange();
    },

    duplicateStatement(payload: {
      id: StatementID_T;
      posX: number;
      posY: number;
    }) {
      const theStatement = this.data.getStatement(payload.id);
      const duplicatedStatement = Statement_T.fromJSON(theStatement);
      duplicatedStatement.id = newElementId();
      duplicatedStatement.visible = true;
      duplicatedStatement.deleteParent();
      duplicatedStatement.position = 'absolute';
      duplicatedStatement.showPopup = theStatement.showPopup;
      duplicatedStatement.collapsed = theStatement.collapsed;
      duplicatedStatement.zIndex = 6;

      const box = (
        this.$refs.answer_area_ref as HTMLElement
      ).getBoundingClientRect();
      duplicatedStatement['top'] = payload.posY - box.top;
      duplicatedStatement['left'] = payload.posX - box.left;

      this.data.addStatement(duplicatedStatement);
      this.data.addRootStatementID(duplicatedStatement.Id);
      this.notifyStateChange();
    },

    // ── Connector duplication ────────────────────────────────────────

    cloneConnector(oldConnectorID: ConnectorID_T): Connector_T {
      const oldConn = this.data.getConnector(oldConnectorID);
      const newConn = Connector_T.fromJSON(oldConn);
      const newConnectorID = newElementId();
      newConn['connectorID'] = newConnectorID;
      this.data.addConnector(newConn);

      if (oldConn['leftType'] == 'statement') {
        const newLeftStatement = Statement_T.fromJSON(
          this.data.getStatement(oldConn.leftID!),
        );
        newLeftStatement.Id = newElementId();
        this.data.addStatement(newLeftStatement);
        newLeftStatement['parent'] = newConn.connectorID;
        newConn['leftID'] = newLeftStatement.Id;
      } else if (oldConn['leftType'] == 'connector') {
        const newLeftConn = this.cloneConnector(oldConn['leftID']!);
        newConn['leftID'] = newLeftConn.Id;
        newLeftConn['parent'] = newConn.Id;
      } else if (oldConn['leftType'] == 'scaffold') {
        const newLeftScaffold = this.cloneScaffold(oldConn['leftID']!);
        newConn['leftID'] = newLeftScaffold.Id;
        newConn['leftType'] = 'scaffold';
        newLeftScaffold.parent = newConn.Id;
      }

      if (oldConn['rightType'] == 'statement') {
        const newRightStatement = Statement_T.fromJSON(
          this.data.getStatement(oldConn.rightID!),
        );
        newRightStatement.Id = newElementId();
        this.data.addStatement(newRightStatement);
        newRightStatement.parent = newConn.Id;
        newConn['rightID'] = newRightStatement.Id;
      } else if (oldConn['rightType'] == 'connector') {
        const newRightConn = this.cloneConnector(oldConn['rightID']!);
        newConn['rightID'] = newRightConn.Id;
        newRightConn['parent'] = newConn.Id;
      } else if (oldConn['rightType'] == 'scaffold') {
        const newRightScaffold = this.cloneScaffold(oldConn['rightID']!);
        newConn['rightID'] = newRightScaffold.Id;
        newConn['rightType'] = 'scaffold';
        newRightScaffold.parent = newConn.Id;
      }

      return newConn;
    },

    duplicateConnector(payload: {
      id: ConnectorID_T;
      posX: number;
      posY: number;
    }) {
      const newConn = this.cloneConnector(payload.id);
      const box = (
        this.$refs.answer_area_ref as HTMLElement
      ).getBoundingClientRect();
      newConn.exNetPosition = [payload.posX - box.left, payload.posY - box.top];
      this.data.addRootConnectorID(newConn.Id);
    },

    // ── Scaffold duplication ─────────────────────────────────────────

    cloneScaffold(oldScaffoldID: ScaffoldID_T): Scaffold_T {
      const oldScaffold = this.data.getScaffold(oldScaffoldID);
      const newScaffold = Scaffold_T.fromJSON(oldScaffold);
      newScaffold.scaffoldID = newElementId();
      this.data.addScaffold(newScaffold);

      // Deep-clone each child slot
      for (let i = 0; i < oldScaffold.children.length; i++) {
        const oldChild = oldScaffold.children[i];
        if (oldChild.childID === undefined) continue;

        if (oldChild.childType === 'statement') {
          const newSt = Statement_T.fromJSON(
            this.data.getStatement(oldChild.childID),
          );
          newSt.Id = newElementId();
          newSt.parent = newScaffold.scaffoldID;
          this.data.addStatement(newSt);
          newScaffold.setChild(i, newSt.Id, 'statement', oldChild.childContent);
        } else if (oldChild.childType === 'connector') {
          const newConn = this.cloneConnector(oldChild.childID);
          newConn.parent = newScaffold.scaffoldID;
          newScaffold.setChild(
            i,
            newConn.Id,
            'connector',
            oldChild.childContent,
          );
        } else if (oldChild.childType === 'scaffold') {
          const newChild = this.cloneScaffold(oldChild.childID);
          newChild.parent = newScaffold.scaffoldID;
          newScaffold.setChild(
            i,
            newChild.Id,
            'scaffold',
            oldChild.childContent,
          );
        }
      }

      return newScaffold;
    },

    duplicateScaffold(payload: {
      id: ScaffoldID_T;
      posX: number;
      posY: number;
    }) {
      const newScaffold = this.cloneScaffold(payload.id);
      newScaffold.deleteParent();
      const box = (
        this.$refs.answer_area_ref as HTMLElement
      ).getBoundingClientRect();
      newScaffold.exNetPosition = [
        payload.posX - box.left,
        payload.posY - box.top,
      ];
      this.data.addRootScaffoldID(newScaffold.Id);
      this.notifyStateChange();
    },

    // ── Collapse / popup toggles ─────────────────────────────────────

    toggleCollapsedRenderStatement(id: StatementID_T) {
      this.data.getStatement(id).toggleCollapsed();
      this.notifyStateChange();
    },

    toggleCollapsedRenderStatementFromConnector(id: StatementID_T) {
      this.data.getStatement(id).toggleCollapsed();
      this.notifyStateChange();
    },

    toggleCollapsedScaffold(id: ScaffoldID_T) {
      this.data.getScaffold(id).toggleCollapsed();
      this.notifyStateChange();
    },

    toggleShowPopupFromRenderStatement(id: StatementID_T) {
      this.data.getStatement(id).toggleShowPopup();
      this.notifyStateChange();
    },

    toggleShowPopupFromConnector(id: StatementID_T) {
      this.data.getStatement(id).toggleShowPopup();
      this.notifyStateChange();
    },

    // ── Initialise / sync ────────────────────────────────────────────

    /**
     * Builds a Scaffold_T from a plain definition object.
     * Used for hard-coded examples and eventually for instructor-authored data.
     */
    buildScaffoldFromDefinition(def: {
      title: string;
      slots: { label: string }[];
      top?: number;
      left?: number;
    }): Scaffold_T {
      const children = def.slots.map((s) => {
        const child = new ScaffoldChild_T(s.label);
        return child;
      });
      const scaffold = new Scaffold_T(-1, def.title, children);
      scaffold.deleteParent();
      scaffold.position = 'absolute';
      scaffold.top = def.top ?? 20;
      scaffold.left = def.left ?? 20;
      return scaffold;
    },

    /**
     * Returns a set of hard-coded example scaffolds for testing.
     * Replace or extend these as needed during development.
     */
    makeExampleScaffolds(): Array<{
      title: string;
      slots: { label: string }[];
      top?: number;
      left?: number;
    }> {
      return [
        {
          title: 'Recipe for a cup of tea',
          slots: [
            { label: 'How can you get hot water?' },
            { label: 'What do we dangle in the water?' },
            { label: 'How can we make it sweet?' },
          ],
          top: 20,
          left: 20,
        },
        {
          title: 'Explain why the sky is blue',
          slots: [
            { label: 'What is light made of?' },
            { label: 'What property of light matters here?' },
            { label: 'What happens to blue light specifically?' },
            { label: 'What do we therefore observe?' },
          ],
          top: 20,
          left: 320,
        },
      ];
    },

    initialiseWithStatementElements(
      parentStatementElements: Array<Statement_T> = [],
      initialScaffolds: Array<{
        title: string;
        slots: { label: string }[];
        top?: number;
        left?: number;
      }> = [],
    ) {
      this.data = new AnswerAreaData_T();

      // ── Statements ──────────────────────────────────────────────────
      if (
        parentStatementElements &&
        parentStatementElements.length > 0 &&
        parentStatementElements.length <= 50
      ) {
        let i = 0;
        while (i < parentStatementElements.length) {
          const item = Statement_T.fromJSON(parentStatementElements[i]);
          item.id = newElementId();
          item.content.userInput = [];
          item.deleteParent();
          item.position = 'absolute';
          item.top = i * 100;
          item.left = 20;
          item.side = undefined;
          this.data.allAnswerContent[item.id] = 'dummy' + i;
          this.data.addStatement(item);
          this.data.addRootStatementID(item.id);
          i++;
        }

        // Reposition statements based on rendered heights
        this.$nextTick(() => {
          const boxes = (
            this.$refs.answer_area_ref as HTMLElement
          ).querySelectorAll('.statement-box');
          const heights: Array<number> = [];
          boxes.forEach((box, i) => {
            heights[i] = box.getBoundingClientRect().height;
          });
          let lastTop = 20;
          let j = 0;
          for (const key in this.data.statements) {
            this.data.getStatement(key).top = lastTop;
            lastTop += heights[j];
            j++;
          }
        });
      }

      // ── Scaffolds ────────────────────────────────────────────────────
      for (const def of initialScaffolds) {
        const scaffold = this.buildScaffoldFromDefinition(def);
        this.data.addScaffold(scaffold);
        this.data.addRootScaffoldID(scaffold.Id);
        this.data.allAnswerContent[scaffold.Id] = scaffold.title;
      }
    },

    syncWithStatementElements(parentStatementElements: Array<Statement_T>) {
      const stArr = Object.values(this.data.statements);
      for (const st of stArr) {
        const match = parentStatementElements.find(
          (s) => s.statementIdentifier === st.statementIdentifier,
        );
        if (match) {
          st.content.originalFacts = match.content.originalFacts;
          st.statementType = match.statementType;
        }
      }
    },
  },

  watch: {
    answerContent: {
      handler(newAnswerContentObject) {
        this.emitUpdateContent(newAnswerContentObject);
      },
      deep: true,
    },
  },
};
</script>

<style>
/* All styles are identical to the original — reproduced in full. */

.v-spacer {
  flex: 1 1 auto;
}

.v-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}

.v-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.answer-area-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.answer-area-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background-color: var(--biologic-grey-color);
  border: 1px solid var(--biologic-blue-color);
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 5;
  justify-content: flex-end;
}

.answer-area-toolbar-buttons {
  display: flex;
  gap: 8px;
}

.answer-area-toolbar-connectors {
  flex: 1;
  width: fit-content;
}

.answer-area-workspace {
  flex: 1;
  overflow: auto;
  position: relative;
  background: #ffffff;
}

.answer_area_class {
  position: relative;
  min-height: 100%;
  height: 2000px;
  width: 2000px;
  display: flex;
  border: 1px solid var(--biologic-blue-color);
  border-top: none;
  flex-grow: 1;
  flex-direction: column;
}

.answer_area_class > .connectorContainer {
  position: absolute;
}

.answer_area_class .connectorText {
  max-width: 200px;
}

#submitBtn {
  margin-left: 10px;
}

.pre {
  font-size: xx-small;
  white-space: pre-wrap;
  font-family: monospace;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
}

.data-structure-window {
  position: fixed;
  font-weight: bold;
  font-size: x-small;
  top: 150px;
  left: 100px;
  width: 500px;
  height: 300px;
  background: rgb(242, 252, 238);
  border: 1px solid #ccc;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  padding: 10px;
  overflow: auto;
}

.displayWorkspace {
  background: #ffffff;
  padding-left: 1px;
  padding-top: 5px;
  padding-bottom: 0px;
  height: 90%;
  overflow-y: scroll;
  position: relative;
}

.drag-handle {
  background-color: var(--biologic-grey-color);
  max-height: 10px;
  border: 1px solid var(--biologic-midblue-color);
}

:root {
  --biologic-green-color: rgb(20, 120, 0);
  --biologic-blue-color: rgb(21, 8, 107);
  --biologic-hover-border-color: rgb(34, 0, 255);
  --biologic-midblue-color: rgb(178, 173, 214);
  --biologic-grey-color: rgb(238, 238, 238);
  --biologic-focus-color: rgb(181, 179, 214);
  --biologic-statement-font-size: 12px;
}

.dropdown-shadow {
  width: 100%;
  padding: 1px 1px;
  font-size: var(--biologic-statement-font-size);
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4);
  appearance: none;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.dropdown-shadow:hover {
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.8);
}

.dropdown-shadow:focus {
  outline: none;
  box-shadow: 0px 0px 4px 2px var(--biologic-focus-color);
}

* {
  box-sizing: border-box;
}

.entireBody {
  max-height: 100vh;
  max-width: 100vw;
}

body {
  font-family: Arial, serif;
  background: #ffffff;
}

.main_workspace:after {
  content: '';
  display: table;
  clear: both;
}

@media screen and (max-width: 1024px) {
  .centre_column,
  .left_column,
  .right_column {
    width: 100%;
    padding: 0;
  }
}
</style>
