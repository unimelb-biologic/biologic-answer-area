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
        <RenderStatement
          v-for="item in data.rootStatementIDs"
          :key="item"
          :statement-data="data.getStatement(item)"
          :showToggle="true"
          :depth="0"
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
          @delete-child-connector="deleteChildConnector"
          @delete-connector="deleteConnector"
          @dropped-astat="(info) => handleStatementDrop(info, 'left')"
          @dropped-bstat="(info) => handleStatementDrop(info, 'right')"
          @dropped-aconn="(info) => handleConnectorDrop(info, 'left')"
          @dropped-bconn="(info) => handleConnectorDrop(info, 'right')"
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
        />
      </div>
      <div>
        <!--pre>
        {{ prettifiedAnswerContentDump }}
        {{ prettifiedStatementsDump }}
        {{ prettifiedAllStatementsDump }}
    {{ prettifiedAllConnectorsDump }}
    {{ prettifiedRootConnectorID_List_Dump }}
    {{ prettifiedRootStatementIDs_Dump }} 
        </pre-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Connector from './Connector.vue';
import RenderStatement from './RenderStatement.vue';
import ConnectorArea from './ConnectorArea.vue';
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
} from './AnswerAreaTypes.js';

export default {
  name: 'AnswerArea',
  components: {
    Connector,
    RenderStatement,
    ConnectorArea,
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
    //parentStatementElements: Object, // this is a reference to the statementElements in Home.vue
    // July 2025 - realised we can do without this coupling with the parent by just passing the list in when calling initialise.
    // So commented it out throughout. Remove all these commented bits out later if no issues found.
    displayOnly: Boolean,
    testProp: Number,
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
      // globalTooltipState: this.globalTooltipState,

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
    prettifiedAnswerContentDump() {
      return (
        '-----------this.answerContent--------------\n' +
        stringify(this.data.allAnswerContent)
      );
    },
    /*
    prettifiedStatementsDump() {
      return (
        "-----------this.parentStatementElements--------------\n" +
        stringify(this.parentStatementElements)
      );
    },
    */
    prettifiedAllStatementsDump() {
      return (
        '-----------this.allstatements--------------\n' +
        stringify(this.data.statements)
      );
    },
    prettifiedAllConnectorsDump() {
      return (
        '-----------this.allConnectors--------------\n' +
        stringify(this.data.connectors)
      );
    },
    prettifiedRootConnectorID_List_Dump() {
      return (
        '-----------this.rootConnectorID_set--------------\n' +
        stringify(Array.from(this.data.rootConnectorIDs))
      );
    },
    prettifiedRootStatementIDs_Dump() {
      return (
        '-----------this.rootStatementID_set--------------\n' +
        stringify(Array.from(this.data.rootStatementIDs))
      );
    },
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
    setActiveHover(id: ElementID_T | null, depth: number) {
      this.data.hoverInfo = { id: id, depth: depth };
    },
    clearActiveHover(id: ElementID_T) {
      // only clear if you're the current active target
      if (this.data.activeHoverID === id) {
        this.data.clearActiveHover();
      }
    },
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
      if (this.data.ignoringStateChanges) {
        return;
      }
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
    // handleFullscreenChange() {
    //   const element = this.$refs.answerAreaContainer;
    //   this.isFullscreen = document.fullscreenElement === element;
    // },
    async toggleFullscreen() {
      const element = this.$refs.answerAreaContainer as HTMLElement;
      if (!element) return;
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    },

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
      const connectorID = info['connectorID']!; // this is the connectorID of the connector that was dropped on.
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
        this.data
          .getConnector(statementOldParent)
          .deleteChild(statementOldSide!);
      }
      const newParent = this.data.getConnector(connectorID);

      newParent[`${direction}ID`] = statementID;
      newParent[`${direction}Type`] = 'statement';
      newParent[`${direction}Content`] = statementContent;
      // this.allConnectors[connectorID][`${directionStatementIdentifier}`] = statementIdentifier;

      this.notifyStateChange();
    },

    thingIsInTreeOfconnector(
      objTypeStr: ElementTypes_T,
      thingID: ElementID_T,
      connID: ConnectorID_T,
    ): boolean {
      // if left OR right side is a connector call recursively
      let inLeftTree = false;
      let inRightTree = false;
      const con = this.data.getConnector(connID);
      const leftID = con['leftID'];
      const rightID = con['rightID'];
      const leftType = con['leftType'];
      const rightType = con['rightType'];

      if (leftID !== undefined) {
        // can't be in left tree if we've hit the target
        if (leftType == 'connector') {
          // if conns match then we're done. Otherwise call recursively
          inLeftTree =
            thingID === leftID ||
            this.thingIsInTreeOfconnector(objTypeStr, thingID, leftID);
        } else if (leftType == 'statement') {
          // end of branch. Just see if thing being dropped on is actually this statement
          inLeftTree = objTypeStr == 'statement' && thingID == leftID;
        }
      }
      if (rightID !== undefined) {
        // can't be in right tree if we've hit the target
        if (rightType == 'connector') {
          // if conns match then we're done. Otherwise call recursively
          inRightTree =
            thingID === rightID ||
            this.thingIsInTreeOfconnector(objTypeStr, thingID, rightID);
        } else if (rightType == 'statement') {
          // end of branch. Just see if thing being dropped on is actually this statement
          inRightTree = objTypeStr == 'statement' && thingID == rightID;
        }
      }
      const finalResult = inLeftTree || inRightTree;
      return finalResult;
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
      } else {
        const inTree = this.thingIsInTreeOfconnector(
          objectTypeString,
          thingBeingDroppedOnID,
          connectorBeingDroppedID,
        );
        return !inTree;
      }
    },

    calculateNewPositionWithinAnswerArea(e: DragEvent) {
      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(
        e.dataTransfer!.getData('grabOffsetLeft'),
      );
      const grabOffsetTop = parseInt(e.dataTransfer!.getData('grabOffsetTop'));

      let leftWithinAnswerArea = 0;
      let topWithinAnswerArea = 0;

      // account for scrolling
      // get access to the enclosing "div" which is the element with the overflow-y:scroll set
      const scrollableDisplayWorkspace = this.getScrollableWorkspace(
        e.currentTarget as HTMLElement,
      );
      const scrollLeft = scrollableDisplayWorkspace?.scrollLeft ?? 0;
      const scrollTop = scrollableDisplayWorkspace?.scrollTop ?? 0;

      const workspaceRect = (
        scrollableDisplayWorkspace || e.currentTarget
      ).getBoundingClientRect();
      leftWithinAnswerArea =
        e.clientX - workspaceRect.left - grabOffsetLeft + scrollLeft;
      topWithinAnswerArea =
        e.clientY - workspaceRect.top - grabOffsetTop + scrollTop;

      return [leftWithinAnswerArea, topWithinAnswerArea];
    },

    // If a connector is dropped onto the left side of a connector
    handleConnectorDrop(info: ConnectorEmittedInfo_T, dir: Direction_T) {
      // info: [connectorID, data, transContent,evt]
      const connectorID = info['connectorID']; // this is the connectorID of the connector that was dropped on.
      const con = Connector_T.fromJSON(info['data']);
      const evt = info['event'];
      const connectorIsNew = !info['data'].connectorID; // Connector is new if it doesn't have an id
      const droppedConnectorID = connectorIsNew ? newElementId() : con.Id;
      // if it is a connector from the palette it won't have an ID yet.
      // so dropping those is obviously fine.
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

      // A new connector from the right is dropped onto a connector
      if (connectorIsNew) {
        con.deleteLeftChild();
        con.deleteRightChild();
        con.Id = droppedConnectorID;
        con.parent = connectorID;
        con.resetClickCount();
        con.resetOrientation();
        this.data.addConnector(con);
      } else if (!con.hasParent()) {
        // Dragged from answerArea to a
        if (this.data.hasRootConnectorID(droppedConnectorID)) {
          this.data.deleteRootConnectorID(droppedConnectorID);
        }
        this.data.getConnector(droppedConnectorID).parent = connectorID;
      } else {
        // Dragged from a connector to a
        const parent = this.data.getConnector(con.parent);
        if (parent['leftID'] === droppedConnectorID) {
          parent.deleteLeftChild();
        } else if (parent['rightID'] === droppedConnectorID) {
          parent.deleteRightChild();
        }
        this.data.getConnector(droppedConnectorID).parent = connectorID;
      }

      // Add this new connector's information to where it's dropped.
      this.data
        .getConnector(connectorID)
        .addChild(dir, droppedConnectorID, 'connector', info['content']);

      // Record content
      this.data.allAnswerContent[droppedConnectorID] = info['content'];

      this.notifyStateChange();
    },

    handleStatementDroppedOnStatement(info: ConnectorEmittedInfo_T) {
      //
      // info: [statementID, evt]
      // if the dropped statement has no parent - i.e. is a root statement
      // then we just want to move it.
      //
      // const droppedOnStatementID = info[0]; // doesn't really get used
      const e = info['event'];
      const statementData = JSON.parse(e.dataTransfer!.getData('data'));

      let droppedStatementID = statementData.id;

      // this method is to deal with a topLevel statement being moved.
      // so it's parent would be -1 (i.e. the AnswerArea)
      const statement = this.data.getStatement(droppedStatementID);
      if (!statement.hasParent()) {
        return;
      }
      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(
        e.dataTransfer!.getData('grabOffsetLeft'),
      );
      const grabOffsetTop = parseInt(e.dataTransfer!.getData('grabOffsetTop'));

      statement.position = 'absolute';
      statement.exNetPosition = this.calculateNewPositionWithinAnswerArea(e);

      this.notifyStateChange();
    },

    handleNewConnectorDroppedOnSomething(info: ConnectorEmittedInfo_T) {
      //
      // info: [statementID, connectorID, evt]
      //
      // called when a connector is dropped on something (either connector or statement).
      // the info will either have "undefined" for the statementID or the connectorID
      //
      // the logic is the same for both:
      //
      // a new connector has been dropped on something which may be part of a tree.
      // the connector needs to have at least one spare target. i.e. [targetA] or [targetB] is empty.
      // we need to insert it into the tree. So the "something" becomes the dropped connectors child (childA if targetA was empty, otherwise childB)
      // and the parent of the something becomes the parent of the new connector.
      // if the connector that was dropped had a parent then we need to set that parent to have no child (i.e. forget that it used to have the connector as it's child)
      //
      //   if newConn was dropped on conn1 then this is what needs to happen
      //
      // eg.1      newConn was dropped on conn1, both targets empty
      //       newConn
      //        /    \
      //      [A]    [B]
      //                        =>>
      //         conn2                            conn2
      //         /   \                           /    \
      //     conn1    [B]                  newConn    [B]
      //     /   \                         /     \
      //  stat1   stat2                 conn1    [B]
      //                               /    \
      //                            stat1   stat2
      //
      // eg.1b - newConn was dropped on conn1, only targetB empty
      //       newConn
      //        /    \
      //  something    [B]
      //                        =>>
      //         conn2                            conn2
      //         /   \                           /    \
      //     conn1    [B]                  newConn    [B]
      //     /   \                         /     \
      //  stat1   stat2                something conn1
      //                                         /    \
      //                                      stat1   stat2
      // eg.2
      //       newConn
      //        /    \
      //      [A]    [B]
      //                        =>>
      //         conn2                            conn2
      //         /   \                           /    \
      //       [A]    conn1                     [A]   newConn
      //            /   \                             /     \
      //        stat1   stat2                       conn1    [B]
      //                                           /    \
      //                                        stat1   stat2
      //
      // eg.3 - or if it was dropped on, say, stat2
      //
      //       newConn
      //        /    \
      //      [A]    [B]
      //
      //                        =>>
      //         conn2
      //         /   \
      //     conn1    [B]                  conn2
      //     /   \                         /     \
      //  stat1   stat2                 conn1    [B]
      //                               /    \
      //                            stat1   newConn
      //                                    /     \
      //                                 stat2     [B]
      //
      // eg.3b - same but lets say newConn was part of a tree
      //             parent
      //             /    \
      //       newConn    anotherTree
      //        /    \
      //      [A]    [B]
      //
      //                        =>>                        parent
      //         conn2                                      /   \
      //         /   \                                    [A]  anotherTree
      //     conn1    [B]                  conn2
      //     /   \                         /     \
      //  stat1   stat2                 conn1    [B]
      //                               /    \
      //                            stat1   newConn
      //                                    /     \
      //                                 stat2     [B]

      const droppedOnStatementID = info['statementID'];
      const droppedOnConnectorID = info['connectorID'];
      const droppedOn_is_Statement = droppedOnConnectorID == undefined; // if this is undefined then the droppedOnStatementID will be defined

      const e = info['event'];
      const data = JSON.parse(e.dataTransfer!.getData('data'));

      let droppedConnectorID = data.connectorID;
      const connector = this.data.getConnector(droppedConnectorID);
      // Check for circular references
      // if it is a connector from the palette it won't have an ID yet so dropping those is obviously fine.
      // otherwise we need to make sure that the thing being dropped on isn't already part of the connector's tree
      if (
        droppedConnectorID !== undefined &&
        !this.dropIsPermissible(
          droppedOn_is_Statement ? 'statement' : 'connector',
          droppedOn_is_Statement ? droppedOnStatementID : droppedOnConnectorID,
          droppedConnectorID,
        )
      ) {
        // if droppedConnectorID is at the top level, i.e. parent == -1 then we should just move it
        e.preventDefault();
        connector.exNetPosition = this.calculateNewPositionWithinAnswerArea(e);
        e.stopImmediatePropagation();

        this.notifyStateChange();

        return;
      }

      // determine that it has a free target and choose which one
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
        // i.e. it isn't brand new so it should have a parent
        //  if the connector has a parent then we need to break the connection.
        // If it is being moved out of a connector, remove parent's memory of child.
        if (connector.hasParent()) {
          // i.e. if -1 then it's at the top level, so no parent
          const oldParentID = connector.parent;
          const parent = this.data.getConnector(oldParentID);
          if (parent['leftID'] === droppedConnectorID) {
            parent.deleteLeftChild();
          } else {
            // must be the right side
            parent.deleteRightChild();
          }
        } else {
          // it should be in the root connector set so need to remove it.
          if (this.data.hasRootConnectorID(droppedConnectorID)) {
            this.data.deleteRootConnectorID(droppedConnectorID);
          }
        }
      }
      let parentID = undefined; // record the OLD parent of whatever was dropped on
      if (droppedOn_is_Statement) {
        parentID = this.data.getStatement(droppedOnStatementID)['parent'];
      } else {
        parentID = this.data.getConnector(droppedOnConnectorID)['parent'];
      }

      if (droppedConnectorID === undefined) {
        // brand new connector so need to create it and initialise to undefined
        // give the connector the next ID
        droppedConnectorID = newElementId();
        const con: Connector_T = Connector_T.fromJSON(data);
        con.Id = droppedConnectorID;
        con.deleteLeftChild();
        con.deleteRightChild();
        con.resetClickCount();
        con.resetOrientation();
        this.data.addConnector(con);
      }
      // now the rest of the code is the same, regardless of whether it was a brand new connector.
      const droppedCon = this.data.getConnector(droppedConnectorID);
      droppedCon.parent = parentID;

      // set the new Connector up to have the droppedOn Connector/Statement as its left child
      droppedCon[`${targetStr}ID`] = droppedOn_is_Statement
        ? droppedOnStatementID
        : droppedOnConnectorID;
      droppedCon[`${targetStr}Type`] = droppedOn_is_Statement
        ? 'statement'
        : 'connector';
      droppedCon[`${targetStr}Content`] = undefined;
      // this.allConnectors[droppedConnectorID][
      //   targetStr + 'StatementIdentifier'
      // ] = undefined;

      // and change the parent of the droppedOn Something to the dropped Connector
      // and the dropped Connector becomes the child of whatever connector had the Something as its child
      let parentConnID = undefined;
      if (droppedOn_is_Statement) {
        // we dropped the connector onto a statement
        const statement = this.data.getStatement(droppedOnStatementID);
        parentConnID = statement.parent;
        statement.parent = droppedConnectorID;
        statement.side = targetStr;
        if (!this.data.getStatement(droppedOnStatementID).hasParent()) {
          // the statement was at the top level
          // remove the statement from the root statementID set
          if (this.data.hasRootStatementID(droppedOnStatementID)) {
            this.data.deleteRootStatementID(droppedOnStatementID);
            // and make position relative now that it is a child of a connector.
            // not sure why this is necessary. 21/11/23 MM.
            statement.position = 'relative';
          }
          // now add the connector to the root connector set. and initialise its position.
          this.data.addRootConnectorID(droppedConnectorID);
          droppedCon['top'] = statement['top'];
          droppedCon['left'] = statement['left'];
          statement.resetExNetPosition(); //since it's now part of a tree
        } else {
          // we need to make the parent of the droppedOnStatement
          // replace its left or right child with the droppedConnector
          const parent = this.data.getConnector(parentConnID);
          if (parent.leftID == droppedOnStatementID) {
            parent.leftID = droppedConnectorID;
            parent.leftType = 'connector';
          } else {
            // must be the right side.
            parent.rightID = droppedConnectorID;
            parent.rightType = 'connector';
          }
          droppedCon.parent = parentConnID; // finally the droppedConnector needs to know its new parent.
        }
      } else {
        // we dropped the connector onto a connector
        const droppedOnCon = this.data.getConnector(droppedOnConnectorID);
        parentConnID = droppedOnCon.parent;
        droppedOnCon.parent = droppedConnectorID;
        if (!droppedOnCon.hasParent()) {
          // the connector was at the top level so the new connector replaces it in the root ID list
          if (this.data.hasRootConnectorID(droppedOnConnectorID))
            this.data.deleteRootConnectorID(droppedOnConnectorID);
          this.data.addRootConnectorID(droppedConnectorID);
          droppedCon.top = droppedOnCon.top; // put it where the droppedOnConnector was
          droppedCon.left = droppedOnCon.left;
          droppedOnCon.resetExNetPosition();
        } else {
          // we need to make the parent of the droppedOnConnector replace its left or right child with the droppedConnector
          const parent = this.data.getConnector(parentConnID);
          if (parent.leftID == droppedOnConnectorID) {
            parent.leftID = droppedConnectorID;
          } else {
            // must be the right side.
            parent.rightID = droppedConnectorID;
          }
        }
      }
      this.notifyStateChange();
    },

    onDrop(e: DragEvent) {
      if (this.displayOnly) {
        return;
      }

      e.preventDefault();

      //retrieve the internal grab offsets that were recorded at the start of the drag
      // const grabOffsetLeft = parseInt(e.dataTransfer.getData("grabOffsetLeft"));
      // const grabOffsetTop = parseInt(e.dataTransfer.getData("grabOffsetTop"));

      const exNetPosition = this.calculateNewPositionWithinAnswerArea(e);

      e.stopImmediatePropagation();

      const type = e.dataTransfer!.getData('type');
      const data = JSON.parse(e.dataTransfer!.getData('data'));

      // Receive the content of dropped object
      const transContent = e.dataTransfer!.getData('content');

      this.data.ignoreStateChanges();

      // Deal with the dropped type is 'Connector' and with no child
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
          // Record content
          this.data.allAnswerContent[newConnectorID] = transContent;
          /*
                    const answerAreaHeight =
                      document.getElementById("answerArea").offsetHeight;
                    const submitBtnHeight =
                      document.getElementById("submitBtn").offsetHeight;
                    const topOffset = answerAreaHeight + submitBtnHeight;
          */
          //this.allConnectors[this.connectorCount]["top"] = topWithinAnswerArea - topOffset;
        } else {
          // A connector is already in answerArea.
          const con = this.data.getConnector(data.connectorID);

          con.deleteParent();
          this.data.addRootConnectorID(data.connectorID);
          this.data.allAnswerContent[data.connectorID] = transContent;

          const oldParentID = data.parentID;
          con.exNetPosition = exNetPosition;

          // If it is being moved out of a connector, remove parent's memory of child.
          const oldParent = this.data.getConnector(oldParentID);
          if (oldParent !== undefined) {
            if (
              oldParent.leftID !== undefined &&
              oldParent.leftID === data.connectorID
            ) {
              oldParent.deleteLeftChild();
            } else {
              oldParent.deleteRightChild();
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

          // TODO: emit statement used.
          this.$emit('statement-used', statementID);

          // TODO: Render text???
        } else if (!getStatement.hasParent()) {
          getStatement.position = 'absolute';
          getStatement.exNetPosition = exNetPosition;
        } else {
          // must have a parent, which means it's part of a connector tree
          getStatement.deleteParent();
          getStatement.position = 'absolute';
          getStatement.exNetPosition = exNetPosition;
          this.data.addRootStatementID(statementID);
          const oldParent = this.data.getConnector(statementOldParent);
          // Remove connector's memory of this item.
          if (oldParent.leftID === statementID) {
            oldParent.deleteLeftChild();
          } else if (oldParent.rightID === statementID) {
            oldParent.deleteRightChild();
          } else {
            console.error('The dropped statement has a wrong parent ID.');
          }
        }
        this.data.allAnswerContent[statementID] = transContent;
      }
      this.data.unignoreStateChanges();

      this.notifyStateChange();
    },

    connectorDroppedOnStatement(statementID: string, e: DragEvent) {
      const type = e.dataTransfer!.getData('type');
      const data = JSON.parse(e.dataTransfer!.getData('data'));
      const transContent = e.dataTransfer!.getData('content');
      const statement = this.data.getStatement(statementID);
      if (data.connectorID === undefined) {
        // connector is new so need to add it to the list
        const oldStatementParent = statement.parent;
        const newConnectorID = newElementId();
        const newCon = Connector_T.fromJSON(data);
        newCon.Id = newConnectorID;
        newCon.parent = oldStatementParent;
        newCon.deleteLeftChild();
        newCon.deleteRightChild();
        newCon.resetClickCount();
        newCon.resetOrientation();
        newCon.top = statement.top;
        newCon.left = statement.left;
        this.data.addRootConnectorID(newConnectorID);
        this.data.addConnector(newCon);
        this.data.allAnswerContent[newConnectorID] = transContent;
        this.handleStatementDrop(
          {
            // connectorID: this.connectorCount - 1,
            connectorID: newElementId(),
            statementID: statementID,
            content: transContent,
          },
          'left',
        );
        // if (validParentID(oldStatementParent)) {
        //   // if
        // }
      }

      this.notifyStateChange();
    },

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

    // invoked when student statement choice is changed to
    // update the answer string area
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

    clearWorkspace() {
      this.initialiseWithStatementElements();
    },

    async loadPreviousAnswer(parameter: string | object, newPropValue = -1) {
      // create a deep copy so that undo/redo stack entries are never mutated in place
      const snapshot =
        typeof parameter === 'string'
          ? JSON.parse(parameter)
          : JSON.parse(JSON.stringify(parameter));
      this.data.loadFromPreviousAnswer(AnswerAreaData_T.fromJSON(snapshot));

      await this.$nextTick();
    },

    deleteChildConnector(params: {
      id: ConnectorID_T;
      parentId: ConnectorID_T | undefined;
      position: Direction_T;
    }) {
      // Remove the connector from allConnectors object
      const { id, parentId, position } = params;
      if (position && parentId !== undefined) {
        // Why is parentId getting passed in if it is immediately written over?
        const parentId = this.data.getConnector(id).parent;
        this.data.getConnector(parentId).deleteChild(position);
      }
      this.deleteConnector({ id });
    },

    deleteConnector(params: { id: ConnectorID_T }) {
      // Remove the connector from allConnectors object
      const { id } = params;
      const { leftType, leftID, rightType, rightID } =
        this.data.getConnector(id);
      if (leftType === 'connector') {
        this.deleteConnector({ id: leftID! });
      }
      if (rightType === 'connector') {
        this.deleteConnector({ id: rightID! });
      }
      if (leftType === 'statement') {
        this.$emit('statement-removed', leftID, true);
      }
      if (rightType === 'statement') {
        this.$emit('statement-removed', rightID, true);
      }
      this.data.deleteConnector(id);
      this.data.deleteRootConnectorID(id);

      // deleting the connector text from string area upon deletion
      if (
        Object.prototype.hasOwnProperty.call(this.data.allAnswerContent, id)
      ) {
        delete this.data.allAnswerContent[id];
      }
      this.$emit('connector-deleted', id);
      this.notifyStateChange();
    },

    duplicateStatement(payload: {
      id: StatementID_T;
      posX: number;
      posY: number;
    }) {
      const theStatement = this.data.getStatement(payload.id);
      const duplicatedStatement = Statement_T.fromJSON(theStatement); // Create a copy of the last element
      duplicatedStatement.id = newElementId();
      duplicatedStatement.visible = true;
      duplicatedStatement.deleteParent();
      duplicatedStatement.position = 'absolute';
      duplicatedStatement.showPopup = theStatement.showPopup;
      duplicatedStatement.collapsed = theStatement.collapsed;
      duplicatedStatement.zIndex = 6;

      // place it at the mouseclick
      const box = (
        this.$refs.answer_area_ref as HTMLElement
      ).getBoundingClientRect();
      duplicatedStatement['top'] = payload.posY - box.top;
      duplicatedStatement['left'] = payload.posX - box.left;

      // Save to relevant data structures
      this.data.addStatement(duplicatedStatement);
      this.data.addRootStatementID(duplicatedStatement.Id);
      this.notifyStateChange();
    },

    cloneConnector(oldConnectorID: ConnectorID_T): Connector_T {
      const oldConn = this.data.getConnector(oldConnectorID);
      const newConn: Connector_T = Connector_T.fromJSON(oldConn); // make a deep copy
      const newConnectorID = newElementId();
      newConn['connectorID'] = newConnectorID;
      this.data.addConnector(newConn);

      // now recursively create new connectors and statements in the tree

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

      const relativeX = payload.posX - box.left;
      const relativeY = payload.posY - box.top;
      newConn.exNetPosition = [relativeX, relativeY];
      this.data.addRootConnectorID(newConn.Id);
    },

    deleteStatement(id: StatementID_T) {
      const theStatement = this.data.getStatement(id);
      const oldParentID = theStatement['parent'];
      const oldParent = this.data.getConnector(oldParentID);
      if (!theStatement.hasParent()) {
        // so it is a top level statement and needs to be removed from the root statements
        this.data.deleteRootStatementID(id);
      } else {
        // need to tell its parent to forget it
        if (oldParent.leftID !== undefined && oldParent.leftID === id) {
          // it's the left child
          oldParent.deleteLeftChild();
        } else {
          // must be the right child
          oldParent.deleteRightChild();
        }
      }
      this.data.deleteStatement(id);
      this.notifyStateChange();
    },

    toggleCollapsedRenderStatement(id: StatementID_T) {
      this.data.getStatement(id).toggleCollapsed();
      this.notifyStateChange();
    },

    toggleCollapsedRenderStatementFromConnector(id: StatementID_T) {
      this.data.getStatement(id).toggleCollapsed();
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

    toggleAllFeedback() {
      this.showAllFeedback = !this.showAllFeedback;
    },

    /**
     * Takes the list of statementElements in the parent and creates statements in the answerArea.
     * Makes a deep copy of the statementElements rather than referring back to the parent.
     * This was a change so that we can dispense with the StatementArea.
     */
    initialiseWithStatementElements(
      parentStatementElements: Array<Statement_T> = [],
    ) {
      this.data = new AnswerAreaData_T();
      if (parentStatementElements === undefined) {
        return;
      } else if (parentStatementElements.length === 0) {
        return;
      }
      const statementCount = parentStatementElements.length;
      if (statementCount > 50) {
        return;
      }
      let i = 0;
      while (i < statementCount) {
        // initialise to the generic information for this archetypal statement
        // Needs to use lodash's cloneDeep, because multiple choice statements
        // contain nested proxy objects
        const item = Statement_T.fromJSON(parentStatementElements[i]);
        // now add fields specific to an instance of that statement in the answerarea
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
      //now we need to wait for the DOM to be rendered and then reposition things based on size.
      this.$nextTick(() => {
        const boxes = (
          this.$refs.answer_area_ref as HTMLElement
        ).querySelectorAll('.statement-box');
        let heights: Array<number> = [];
        boxes.forEach((box, i) => {
          const rect = box.getBoundingClientRect();
          // For example, set positions dynamically:
          heights[i] = rect.height;
        });
        let lastTop = 20;
        let i = 0;
        for (const key in this.data.statements) {
          this.data.getStatement(key).top = lastTop;
          lastTop += heights[i];
          i++;
        }
      });
    },
    /**
     * Takes the list of statementElements in the parent and updates the contents of statements in the answerArea that have the same statementIdentifier
     */
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

  // mounted() {
  //   document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  // },
  // beforeUnmount() {
  //   document.removeEventListener(
  //     'fullscreenchange',
  //     this.handleFullscreenChange,
  //   );
  // },

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
  height: 2000px; /* these hard-coded sizes are a rough fix for now to make sure there is enough workspace - since the auto scaling was problematic */
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
  /* Preserve white-space and wrap lines */
  font-family: monospace;
  /* Use a monospaced font for better alignment */
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
  /*border: 1px solid rgb(0, 250, 0);*/
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
  /* Rounded corners */
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4);
  /* Drop shadow */
  appearance: none;
  /* Hides default arrow styling in some browsers */
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  /* Smooth hover effect */
}

.dropdown-shadow:hover {
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.8);
  /* More shadow on hover */
}

.dropdown-shadow:focus {
  outline: none;
  /* Removes blue border */
  box-shadow: 0px 0px 4px 2px var(--biologic-focus-color);
  /* Adds focus effect */
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

/* Clear floats after the columns */
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
