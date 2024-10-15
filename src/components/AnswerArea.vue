<template>
  <div>
    <button id="submitBtn" @click="convertToJson(false)" :disabled="showMyAnswer && !showCorrectAnswer">
      Submit
    </button>
    <button id="resetBtn" @click="resetAnswerArea(selectedExnet)" :disabled="showMyAnswer && !showCorrectAnswer">
      Reset
    </button>
    <button id="fullScreenBtn" @click="goFullScreen()">
      FullScreen
    </button>
    <button id="exitFullScreenBtn" @click="exitFullScreen()">
      Exit FullScreen
    </button>
  </div>
  <div v-if="isFeedbackAvailable">
    <button @click="toggleAllFeedback">
      {{ showAllFeedback ? "Close Feedback" : "Show Feedback" }}
    </button>
  </div>
  <div v-if="isCorrectAnswerAllowed">
    <button v-if="showCorrectAnswer" @click="getCorrectAnswer">
      Show Correct Answer
    </button>
    <button v-if="showMyAnswer" @click="showUserAnswer">Show My Answer</button>
  </div>
  <div id="showDataStructuresButton" v-if="isDev">
    <button @click="toggleShowDataStructures">show data structures</button>
  </div>
  <div v-if="showDataStructures" class="statement-dump">
    <pre>
    {{ prettifiedAnswerContentDump }}
    {{ prettifiedStatementsDump }}
    {{ prettifiedAllStatementsDump }}
    {{ prettifiedAllConnectorsDump }}
    {{ prettifiedRootConnectorID_List_Dump }}
    {{ prettifiedRootStatementIDs_Dump }}
        </pre>
  </div>
  <div class="answer_area" @dragover.prevent @dragenter.prevent ref="answer_area">
    <RenderStatement v-for="item in rootStatementID_set" :key="item" :statement-data="allStatements[item]"
      :showToggle="true" :sharedData="sharedData" @duplicate-statement="duplicateStatement"
      @update-statement-content="handleUpdateStatementContent"
      @connector-dropped-on-statement="handleNewConnectorDroppedOnSomething"
      @statement-dropped-on-statement="handleStatementDroppedOnStatement"
      @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
      @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement"
      @update-shared-data="updateSharedData" />

    <Connector v-for="rootConnectorID in rootConnectorID_set" :key="rootConnectorID"
      :connector-i-d="allConnectors[rootConnectorID].connectorID"
      :connector-content-i-d="allConnectors[rootConnectorID].connectorContentID"
      :connector-content="allConnectors[rootConnectorID].connectorContent" :all-statements="this.allStatements"
      :all-connectors="this.allConnectors" :parent="allConnectors[rootConnectorID].parent"
      :left-i-d="allConnectors[rootConnectorID].leftID" :left-type="allConnectors[rootConnectorID].leftType"
      :left-content="allConnectors[rootConnectorID].leftContent" :right-i-d="allConnectors[rootConnectorID].rightID"
      :right-type="allConnectors[rootConnectorID].rightType"
      :right-content="allConnectors[rootConnectorID].rightContent"
      :click-count="allConnectors[rootConnectorID].clickCount" :orientation="allConnectors[rootConnectorID].orientation"
      :selected-phrase="allConnectors[rootConnectorID].selectedPhrase" :conntop="allConnectors[rootConnectorID].top"
      :connleft="allConnectors[rootConnectorID].left" :moveItem="moveItem" :rootConnectorID="rootConnectorID"
      :sharedData="sharedData" @delete-child-connector="deleteChildConnector" @delete-connector="deleteConnector"
      @delete-statement="deleteStatement" @setDraggedItem="setDraggedItem" @dropped-astat="handleAStatementDrop"
      @dropped-bstat="handleBStatementDrop" @dropped-aconn="handleAConnectorDrop" @dropped-bconn="handleBConnectorDrop"
      @link-word-changed="handleLinkWordChange" @update-connector-content="handleConnectContentChange"
      @update-click-count="handleUpdateClickCount" @toggle-orientation="handleToggleOrientation"
      @update-child-connector-content="handleUpdateChildConnector" @update-child-stat="handleUpdateChildStat"
      @new-connector-dropped-on-connector="handleNewConnectorDroppedOnSomething"
      @connector-dropped-on-statement="handleNewConnectorDroppedOnSomething" @duplicate-statement="duplicateStatement"
      @toggle-collapsed-renderstatement-from-connector="toggleCollapsedRenderStatementFromConnector
        " @toggle-showPopup-fromconnector="toggleShowPopupFromConnector" @update-shared-data="updateSharedData" />
  </div>
</template>

<script>
import Connector from "@/components/Connector.vue";
import RenderStatement from "../components/RenderStatement.vue";
import uniqueId from "lodash.uniqueid";
import { computed } from "vue";

import { STATEMENT_PROPORTION_REQUIRED } from '../config/constants';

export default {
  name: "AnswerArea",
  components: { Connector, RenderStatement },
  emits: [
    "update-answer-area-content",
    "statement-used",
    "statement-removed",
    "setStatementElements",
    "setDraggedItem",
    "setDroppedItems",
    "connector-deleted",
    "answer-data",
    "get-correct-answer",
    "get-reset-answer-area",
    "get-last-working-answer",
    "update-shared-data",
  ],
  props: {
    selectedExnet: String,
    statements: Object, // this is a reference to the statementElements in Home.vue MM
    data: Object, // I don't think this is used MM
    droppedItems: Array, // record the dropped statements
    draggedItem: Object, // record the dragged statements
    offsetX: Number, // record the coordinate of x
    offsetY: Number, // record the coordinate of y
    dataObject: Object, // I don't think this is used MM
    sharedData: Object,
  },
  data() {
    return {
      connectorCount: 0,
      rootConnectorID_set: new Set(), //not sure if these are used MM
      rootStatementID_set: new Set(), //not sure if these are used MM
      rootConnectorID: null, //not sure if these are used MM

      allConnectors: {},
      allStatements: {}, // this mirrors the statements, but is keyed on the ID
      left: 0,
      top: 0,
      // record move item
      moveItem: null,
      moveX: 0,
      moveY: 0,
      data_Object: {},
      answerContent: {}, // {ID: Content} record the element ID and its content
      showDataStructures: false,
      showAllFeedback: false, // flag used to toggle all the feedback elements at once
    };
  },
  provide() {
    return {
      showAllFeedback: computed(() => this.showAllFeedback),
    };
  },
  inject: [
    "isFeedbackAvailable",
    "isCorrectAnswerAllowed",
    "showCorrectAnswer",
    "showMyAnswer",
  ],
  computed: {
    prettifiedAnswerContentDump() {
      return (
        "-----------this.answerContent--------------\n" +
        JSON.stringify(this.answerContent, null, 4)
      );
    },
    prettifiedStatementsDump() {
      return (
        "-----------this.statements--------------\n" +
        JSON.stringify(this.statements, null, 4)
      );
    },
    prettifiedAllStatementsDump() {
      return (
        "-----------this.allstatements--------------\n" +
        JSON.stringify(this.allStatements, null, 4)
      );
    },
    prettifiedAllConnectorsDump() {
      return (
        "-----------this.allConnectors--------------\n" +
        JSON.stringify(this.allConnectors, null, 4)
      );
    },
    prettifiedRootConnectorID_List_Dump() {
      return (
        "-----------this.rootConnectorID_set--------------\n" +
        JSON.stringify(Array.from(this.rootConnectorID_set), null, 4)
      );
    },
    prettifiedRootStatementIDs_Dump() {
      return (
        "-----------this.rootStatementID_set--------------\n" +
        JSON.stringify(Array.from(this.rootStatementID_set), null, 4)
      );
    },
    isDev() {
      return this.$route.query.isDev;
    },
  },

  methods: {
    updateSharedData(newValue) {
      this.$emit("update-shared-data", newValue);
    },
    toggleShowDataStructures() {
      this.showDataStructures = !this.showDataStructures;
    },

    getCorrectAnswer() {

      if (this.checkSufficientAnswerSize()) {
        alert(STATEMENT_PROPORTION_REQUIRED + "% of statements must be used in the answer in order to show the correct answer");
        return false;
      }

      this.$emit("update-show-correct-answer", false);
      this.$emit("update-show-my-answer", true);

      this.$emit("get-correct-answer");
    },

    showUserAnswer() {
      this.$emit("update-show-correct-answer", true);
      this.$emit("update-show-my-answer", false);

      this.$emit("get-last-working-answer", false);
    },

    resetAnswerArea(selectedExnet) {
      this.$emit("get-reset-answer-area", selectedExnet);
    },

    goFullScreen() {
      var elem = document.getElementById("displayWorkspaceID")
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
    },
    exitFullScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
    },
    checkSufficientAnswerSize() {
      // check if more than N% of statements are used before showing feedback
      // N% defined in constants.js

      let currentAllStatements = Object.values(this.allStatements);
      let mimimumStatementsRequired = Math.floor(currentAllStatements.length * parseFloat(STATEMENT_PROPORTION_REQUIRED / 100));
      let usedStatements = currentAllStatements.filter((statement) => statement.visible === false)

      return (usedStatements.length < mimimumStatementsRequired);

    },

    convertToJson(isSavingLocally) {
      this.data_Object = {
        connectorCount: String(this.connectorCount),
        rootConnectorID_set: Array.from(this.rootConnectorID_set),
        rootConnectorID: this.rootConnectorID,
        rootStatementID_set: Array.from(this.rootStatementID_set),
        allConnectors: this.allConnectors,
        allStatements: this.allStatements,
        left: String(this.left),
        top: String(this.top),
        moveItem: this.moveItem,
        moveX: String(this.moveX),
        moveY: String(this.moveY),
        statementFlag: this.statementFlag,
        statementsType: this.statementsType,
        rootContent: this.rootContent,
        answerContent: this.answerContent,
        offsetX: undefined,
        offsetY: undefined,
      };

      // do not save if answer is still empty
      if (!this.data_Object.rootConnectorID_set.length && !this.data_Object.rootStatementID_set.length) {
        alert("Empty answer cannot be saved.")
        return this.data_Object;
      }

      // return object if data is being downloaded locally
      if (isSavingLocally) {
        return this.data_Object;
      }

      // enables the correct answer option
      this.$emit("update-show-correct-answer", true);
      this.$emit("update-show-my-answer", false);

      // Emit the dataObject and saveJson() result
      this.$emit("answer-data", this.data_Object);
      //console.log(this.data_Object);
    },

    handleLinkWordChange(info) {
      const connectorID = info[0];
      this.allConnectors[connectorID]["selectedPhrase"] = info[1];
    },

    handleAStatementDrop(info) {
      console.log("AnswerArea:handleAStatementDrop");

      const connectorID = info[0]; // this is the connectorID of the connector that was dropped on.
      const statementID = info[1];
      const statementContent = info[2];
      const statementIdentifier =
        this.allStatements[statementID]?.statementIdentifier;

      const statementDropped = this.allStatements[statementID];
      const statementOldParent = statementDropped["parent"];
      const statementOldSide = statementDropped["side"];

      this.allStatements[statementID]["parent"] = connectorID;
      this.allStatements[statementID]["position"] = undefined;
      this.allStatements[statementID]["top"] = undefined;
      this.allStatements[statementID]["left"] = undefined;
      this.allStatements[statementID]["side"] = "left";

      if (statementOldParent === undefined) {
        console.log(
          "AnswerArea:handAStatementDrop: A statement was dragged directly onto connector left side."
        );
        this.$emit("statement-used", statementID);
      } else if (statementOldParent === -1) {
        console.log(
          "AnswerArea:handAStatementDrop: A statement was dragged from ans area onto connector left side."
        );
        this.rootStatementID_set.delete(statementID);
      } else {
        console.log(
          "AnswerArea:handAStatementDrop: A statement was dragged from a connector to a connector left side."
        );
        if (statementOldSide === "left") {
          this.allConnectors[statementOldParent]["leftID"] = undefined;
          this.allConnectors[statementOldParent]["leftType"] = undefined;
          this.allConnectors[statementOldParent]["leftContent"] = undefined;
          this.allConnectors[statementOldParent]["leftStatementIdentifier"] =
            undefined;
        } else if (statementOldSide === "right") {
          this.allConnectors[statementOldParent]["rightID"] = undefined;
          this.allConnectors[statementOldParent]["rightType"] = undefined;
          this.allConnectors[statementOldParent]["rightContent"] = undefined;
          this.allConnectors[statementOldParent]["rightStatementIdentifier"] =
            undefined;
        } else {
          console.error();
        }
      }

      this.allConnectors[connectorID]["leftID"] = statementID;
      this.allConnectors[connectorID]["leftType"] = "statement";
      this.allConnectors[connectorID]["leftContent"] = statementContent;
      this.allConnectors[connectorID]["leftStatementIdentifier"] =
        statementIdentifier;
    },

    // If a statement is dropped on the right side of a
    handleBStatementDrop(info) {
      console.log("AnswerArea:handleBStatementDrop");
      const connectorID = info[0]; // this is the connectorID of the connector that was dropped on.
      const statementID = info[1];
      const statementContent = info[2];
      const statementIdentifier =
        this.allStatements[statementID]?.statementIdentifier;

      const statementDropped = this.allStatements[statementID];
      const statementOldParent = statementDropped["parent"];
      const statementOldSide = statementDropped["side"];

      this.allStatements[statementID]["parent"] = connectorID;
      this.allStatements[statementID]["position"] = undefined;
      this.allStatements[statementID]["top"] = undefined;
      this.allStatements[statementID]["left"] = undefined;
      this.allStatements[statementID]["side"] = "right";

      if (statementOldParent === undefined) {
        console.log(
          "A statement was dragged directly onto connector right side."
        );
        this.$emit("statement-used", statementID);
      } else if (statementOldParent === -1) {
        console.log(
          "A statement was dragged from ans area onto connector right side."
        );
        this.rootStatementID_set.delete(statementID);
      } else {
        console.log(
          "A statement was dragged from a connector to a connector right side."
        );
        if (statementOldSide === "left") {
          this.allConnectors[statementOldParent]["leftID"] = undefined;
          this.allConnectors[statementOldParent]["leftType"] = undefined;
          this.allConnectors[statementOldParent]["leftContent"] = undefined;
          this.allConnectors[statementOldParent]["leftStatementIdentifier"] =
            undefined;
        } else if (statementOldSide === "right") {
          this.allConnectors[statementOldParent]["rightID"] = undefined;
          this.allConnectors[statementOldParent]["rightType"] = undefined;
          this.allConnectors[statementOldParent]["rightContent"] = undefined;
          this.allConnectors[statementOldParent]["rightStatementIdentifier"] =
            undefined;
        } else {
          console.error();
        }
      }

      this.allConnectors[connectorID]["rightID"] = statementID;
      this.allConnectors[connectorID]["rightType"] = "statement";
      this.allConnectors[connectorID]["rightContent"] = statementContent;
      this.allConnectors[connectorID]["rightStatementIdentifier"] =
        statementIdentifier;
    },

    setDraggedItem(value) {
      this.$emit("setDraggedItem", value);
    },

    thingIsInTreeOfconnector(objTypeStr, thingID, connID) {
      console.log(
        "thingIsInTreeOfconnector: is ",
        objTypeStr,
        " ID=",
        thingID,
        "  in the tree of conn=",
        connID,
        "??"
      );

      // if left OR right side is a connector call recursively
      let inLeftTree = false;
      let inRightTree = false;
      const leftID = this.allConnectors[connID]["leftID"];
      const rightID = this.allConnectors[connID]["rightID"];
      const leftType = this.allConnectors[connID]["leftType"];
      const rightType = this.allConnectors[connID]["rightType"];
      console.log("leftside type=", leftType, " leftID=", leftID);
      console.log("rightside type=", rightType, " rightID=", rightID);

      if (leftID !== undefined) { // can't be in left tree if we've hit the target
        if (leftType == "connector") { // if conns match then we're done. Otherwise call recursively
          inLeftTree = (thingID === leftID || this.thingIsInTreeOfconnector(objTypeStr, thingID, leftID));
        } else if (leftType == "statement") { // end of branch. Just see if thing being dropped on is actually this statement
          inLeftTree = (objTypeStr == "statement") && (thingID == leftID);
        }
      }
      if (rightID !== undefined) { // can't be in right tree if we've hit the target
        if (rightType == "connector") { // if conns match then we're done. Otherwise call recursively
          inRightTree = (thingID === rightID || this.thingIsInTreeOfconnector(objTypeStr, thingID, rightID));
        } else if (rightType == "statement") { // end of branch. Just see if thing being dropped on is actually this statement
          inRightTree = (objTypeStr == "statement") && (thingID == rightID);
        }
      }
      const finalResult = inLeftTree || inRightTree;
      console.log(
        " FINAL result = inLeftTree=",
        inLeftTree,
        " || inRightTree=",
        inRightTree,
        " =>",
        finalResult
      );
      return finalResult;
    },

    dropIsPermissible(objectTypeString, thingBeingDroppedOnID, connectorBeingDroppedID) {
      console.log(
        "checking if ",
        connectorBeingDroppedID,
        " can be dropped on ",
        objectTypeString,
        "ID",
        thingBeingDroppedOnID
      );
      if (objectTypeString === "connector" && thingBeingDroppedOnID === connectorBeingDroppedID) {
        console.log("theyre the same connector, so NO");
        return false;
      } else {
        console.log("check inTree");
        const inTree = this.thingIsInTreeOfconnector(
          objectTypeString,
          thingBeingDroppedOnID,
          connectorBeingDroppedID
        );
        console.log("inTree = ", inTree);
        return !inTree;
      }
    },

    calculateNewPositionWithinAnswerArea(e) {
      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(e.dataTransfer.getData("grabOffsetLeft"));
      const grabOffsetTop = parseInt(e.dataTransfer.getData("grabOffsetTop"));
      console.log(
        " grabOffset: ",
        grabOffsetLeft.toFixed(2),
        grabOffsetTop.toFixed(2)
      );

      console.log(
        "onDrop evt(i.e. mouse) e.client i.e. global position=(",
        e.clientX,
        e.clientY,
        ") e.currentTarget.offset i.e. offset_within_thing_dropped_on = (",
        e.currentTarget.offsetLeft,
        e.currentTarget.offsetTop
      );

      let leftWithinAnswerArea = 0;
      let topWithinAnswerArea = 0;

      // account for scrolling
      // get access to the enclosing "div" which is the element with the overflow-y:scroll set
      const scrollableDisplayWorkspace =
        e.currentTarget.closest(".displayWorkspace");
      const scrollLeft = scrollableDisplayWorkspace.scrollLeft;
      const scrollTop = scrollableDisplayWorkspace.scrollTop;
      console.log("parent scroll=", scrollLeft, ",", scrollTop, ")");
      console.log("parent position=", scrollableDisplayWorkspace.offsetLeft, ",", scrollableDisplayWorkspace.offsetTop, ")");

      leftWithinAnswerArea =
        e.clientX - scrollableDisplayWorkspace.offsetLeft - grabOffsetLeft + scrollLeft;
      topWithinAnswerArea =
        e.clientY - scrollableDisplayWorkspace.offsetTop - grabOffsetTop + scrollTop;
      console.log(
        "SOOOO (left,top) Within AnswerArea = ",
        leftWithinAnswerArea,
        topWithinAnswerArea
      );
      return [leftWithinAnswerArea, topWithinAnswerArea];
    },

    // If a connector is dropped onto the left side of a connector
    handleAConnectorDrop(info) {
      // info: [connectorID, data, transContent,evt]
      const connectorID = info[0]; // this is the connectorID of the connector that was dropped on.

      const data = info[1];
      const evt = info[3];
      let droppedConnectorID = data.connectorID;

      console.log(
        "AnswerArea::handleAConnectorDrop     old connector id",
        connectorID,
        "droppedConnectorID ",
        droppedConnectorID,
        'evt = ',
        evt
      );

      // if it is a connector from the palette it won't have an ID yet.
      // so dropping those is obviously fine.
      if (
        droppedConnectorID !== undefined &&
        !this.dropIsPermissible("connector", connectorID, droppedConnectorID)
      ) {
        console.log("ERROR CIRCULAR REFERENCE");

        evt.preventDefault();
        [this.allConnectors[droppedConnectorID]["left"],
        this.allConnectors[droppedConnectorID]["top"]] = this.calculateNewPositionWithinAnswerArea(evt);
        evt.stopImmediatePropagation();

        return;
      }

      // A new connector from the right is dropped onto a connector
      if (droppedConnectorID === undefined) {
        droppedConnectorID = this.connectorCount;
        this.connectorCount++;

        this.allConnectors[droppedConnectorID] = info[1];
        this.allConnectors[droppedConnectorID]["connectorID"] =
          droppedConnectorID;
        this.allConnectors[droppedConnectorID]["parent"] = connectorID;
        this.allConnectors[droppedConnectorID]["leftID"] = undefined;
        this.allConnectors[droppedConnectorID]["leftType"] = undefined;
        this.allConnectors[droppedConnectorID]["leftContent"] = undefined;
        this.allConnectors[droppedConnectorID]["leftStatementIdentifier"] =
          undefined;
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["rightStatementIdentifier"] =
          undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
        this.allConnectors[droppedConnectorID]["orientation"] = "row";
      } else if (data.parentID === -1) {
        // Dragged from answerArea to a
        if (this.rootConnectorID_set.has(droppedConnectorID)) {
          this.rootConnectorID_set.delete(droppedConnectorID);
        }

        //        console.log("Assigning ConnectorID", droppedConnectorID);

        this.allConnectors[droppedConnectorID]["parent"] = connectorID;
      } else {
        // Dragged from a connector to a
        if (
          this.allConnectors[data.parentID]["leftID"] === droppedConnectorID
        ) {
          this.allConnectors[data.parentID]["leftID"] = undefined;
          this.allConnectors[data.parentID]["leftType"] = undefined;
          this.allConnectors[data.parentID]["leftContent"] = undefined;
          this.allConnectors[data.parentID]["leftStatementIdentifier"] =
            undefined;
        } else if (
          this.allConnectors[data.parentID]["rightID"] === droppedConnectorID
        ) {
          this.allConnectors[data.parentID]["rightID"] = undefined;
          this.allConnectors[data.parentID]["rightType"] = undefined;
          this.allConnectors[data.parentID]["rightContent"] = undefined;
          this.allConnectors[data.parentID]["rightStatementIdentifier"] =
            undefined;
        } else {
          console.error(
            "Something went wrong! The logic of connector to connector is wrong!!"
          );
        }
        this.allConnectors[droppedConnectorID]["parent"] = connectorID;
      }

      // Add this new connector's information to where it's dropped.
      this.allConnectors[connectorID].leftType = "connector";
      this.allConnectors[connectorID].leftID = droppedConnectorID;
      this.allConnectors[connectorID].leftContent = info[2];

      // Record content
      this.answerContent[droppedConnectorID] = info[2];
    },

    handleBConnectorDrop(info) {
      const connectorID = info[0]; // this is the connectorID of the connector that was dropped on.
      const data = info[1];
      const evt = info[3];

      let droppedConnectorID = data.connectorID;

      console.log(
        "AnswerArea::handleBConnectorDrop     old connector id",
        connectorID,
        "droppedConnectorID ",
        droppedConnectorID,
        "evt =",
        evt
      );

      if (
        droppedConnectorID !== undefined &&
        !this.dropIsPermissible("connector", connectorID, data.connectorID)
      ) {
        console.log("ERROR CIRCULAR REFERENCE");
        evt.preventDefault();
        [this.allConnectors[droppedConnectorID]["left"],
        this.allConnectors[droppedConnectorID]["top"]] = this.calculateNewPositionWithinAnswerArea(evt);
        evt.stopImmediatePropagation();
        return;
      }

      //      console.log(data);
      //      console.log(data.connectorID);

      // A new connector is dropped into here!
      if (droppedConnectorID === undefined) {
        droppedConnectorID = this.connectorCount;
        this.connectorCount++;

        this.allConnectors[droppedConnectorID] = info[1];
        this.allConnectors[droppedConnectorID]["connectorID"] =
          droppedConnectorID;
        this.allConnectors[droppedConnectorID]["parent"] = connectorID;
        this.allConnectors[droppedConnectorID]["leftID"] = undefined;
        this.allConnectors[droppedConnectorID]["leftType"] = undefined;
        this.allConnectors[droppedConnectorID]["leftContent"] = undefined;
        this.allConnectors[droppedConnectorID]["leftStatementIdentifier"] =
          undefined;
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["rightStatementIdentifier"] =
          undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
        this.allConnectors[droppedConnectorID]["orientation"] = "row";
      } else if (data.parentID === -1) {
        if (this.rootConnectorID_set.has(droppedConnectorID)) {
          this.rootConnectorID_set.delete(droppedConnectorID);
        }

        console.log("Assigning ConnectorID", droppedConnectorID);

        this.allConnectors[droppedConnectorID]["parent"] = connectorID;
      } else {
        if (
          this.allConnectors[data.parentID]["leftID"] === droppedConnectorID
        ) {
          this.allConnectors[data.parentID]["leftID"] = undefined;
          this.allConnectors[data.parentID]["leftType"] = undefined;
          this.allConnectors[data.parentID]["leftContent"] = undefined;
          this.allConnectors[data.parentID]["leftStatementIdentifier"] =
            undefined;
        } else if (
          this.allConnectors[data.parentID]["rightID"] === droppedConnectorID
        ) {
          this.allConnectors[data.parentID]["rightID"] = undefined;
          this.allConnectors[data.parentID]["rightType"] = undefined;
          this.allConnectors[data.parentID]["rightContent"] = undefined;
          this.allConnectors[data.parentID]["rightStatementIdentifier"] =
            undefined;
        } else {
          console.error(
            "Something went wrong! The logic of connector to connector is wrong!!"
          );
        }

        this.allConnectors[droppedConnectorID]["parent"] = connectorID;
      }

      this.allConnectors[connectorID].rightType = "connector";
      this.allConnectors[connectorID].rightID = droppedConnectorID;
      this.allConnectors[connectorID].rightContent = info[2];

      // Record content
      this.answerContent[droppedConnectorID] = info[2];
    },

    handleStatementDroppedOnStatement(info) {
      //
      // info: [statementID, evt]
      // if the dropped statement has no parent - i.e. is a root statement
      // then we just want to move it.
      //
      const droppedOnStatementID = info[0]; // doesn't really get used
      const e = info[1];
      const statementData = JSON.parse(e.dataTransfer.getData("data"));

      let droppedStatementID = statementData.id;
      console.log(
        "AnswerArea::handleStatementDroppedOnStatement  statement",
        droppedStatementID,
        " dropped on ",
        droppedOnStatementID
      );

      // this method is to deal with a topLevel statement being moved.
      // so it's parent would be -1 (i.e. the AnswerArea)
      if (this.allStatements[droppedStatementID]["parent"] != -1) {
        console.log("parent wasn't answer area so do nothing");
        return;
      }
      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(e.dataTransfer.getData("grabOffsetLeft"));
      const grabOffsetTop = parseInt(e.dataTransfer.getData("grabOffsetTop"));
      console.log("\n--------------ANSWER AREA onDrop-------------------");
      console.log(
        " grabOffset: ",
        grabOffsetLeft.toFixed(2),
        grabOffsetTop.toFixed(2)
      );

      console.log(
        "onDrop evt(i.e. mouse) global position=(",
        e.clientX,
        e.clientY,
        ") e.currentTarget.offset offset_within_thing_dropped_on = (",
        e.currentTarget.offsetLeft,
        e.currentTarget.offsetTop
      );
      let leftWithinAnswerArea = 0;
      let topWithinAnswerArea = 0;

      // account for scrolling
      // get access to the enclosing "div" which is the element with the overflow-y:scroll set
      const scrollableDisplayWorkspace =
        e.currentTarget.closest(".displayWorkspace");
      const scrollLeft = scrollableDisplayWorkspace.scrollLeft;
      const scrollTop = scrollableDisplayWorkspace.scrollTop;
      console.log("parent scroll=", scrollLeft, ",", scrollTop, ")");

      const sRect = scrollableDisplayWorkspace.getBoundingClientRect();
      console.log("parent pos=", sRect.left, ",", sRect.top, ")");
      const posWithinWorkspaceLeft = e.clientX - sRect.left;
      const posWithinWorkspaceTop = e.clientY - sRect.top;

      leftWithinAnswerArea =
        posWithinWorkspaceLeft - grabOffsetLeft + scrollLeft;
      topWithinAnswerArea = posWithinWorkspaceTop - grabOffsetTop + scrollTop;

      console.log(
        "SOOOO (left,top) Within AnswerArea = ",
        leftWithinAnswerArea,
        topWithinAnswerArea
      );

      this.allStatements[droppedStatementID]["position"] = "absolute";
      this.allStatements[droppedStatementID]["top"] = topWithinAnswerArea;
      this.allStatements[droppedStatementID]["left"] = leftWithinAnswerArea;
    },

    handleNewConnectorDroppedOnSomething(info) {
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

      const droppedOnStatementID = info[0];
      const droppedOnConnectorID = info[1];
      const droppedOn_is_Statement = (droppedOnConnectorID == undefined); // if this is undefined then the droppedOnStatementID will be defined

      const e = info[2];
      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));
      const transContent = e.dataTransfer.getData("content");

      let droppedConnectorID = data.connectorID;

      // Check for circular references
      // if it is a connector from the palette it won't have an ID yet so dropping those is obviously fine.
      // otherwise we need to make sure that the thing being dropped on isn't already part of the connector's tree
      if (
        droppedConnectorID !== undefined &&
        !this.dropIsPermissible(
          droppedOn_is_Statement ? "statement" : "connector",
          droppedOn_is_Statement ? droppedOnStatementID : droppedOnConnectorID,
          droppedConnectorID)
      ) {
        console.log("ERROR CIRCULAR REFERENCE");
        // if droppedConnectorID is at the top level, i.e. parent == -1 then we should just move it
        e.preventDefault();
        [this.allConnectors[droppedConnectorID]["left"],
        this.allConnectors[droppedConnectorID]["top"]] = this.calculateNewPositionWithinAnswerArea(e);
        e.stopImmediatePropagation();

        return;
      }


      // determine that it has a free target and choose which one
      let targetStr = undefined;
      if (droppedConnectorID == undefined) {
        console.log("BRAND NEW CONNECTOR - so use the left target");
        targetStr = "left";
      } else if (this.allConnectors[droppedConnectorID]["leftID"] == undefined) {
        console.log("left is free so use the left target");
        targetStr = "left";
      } else if (this.allConnectors[droppedConnectorID]["rightID"] == undefined) {
        console.log("left is busy so use the right target");
        targetStr = "right";
      } else {
        console.log("no free targets so return");
        return;
      }
      if (droppedConnectorID !== undefined) // i.e. it isn't brand new so it should have a parent
      {
        //  if the connector has a parent then we need to break the connection.
        let oldParentID = this.allConnectors[droppedConnectorID]["parent"];
        // If it is being moved out of a connector, remove parent's memory of child.
        if (oldParentID !== -1) // i.e. if -1 then it's at the top level, so no parent
        {
          if (
            this.allConnectors[oldParentID]["leftID"] === droppedConnectorID
          ) {
            this.allConnectors[oldParentID]["leftID"] = undefined;
            this.allConnectors[oldParentID]["leftType"] = undefined;
            this.allConnectors[oldParentID]["leftContent"] = undefined;
            this.allConnectors[oldParentID]["leftStatementIdentifier"] = undefined;
          } else { // must be the right side
            this.allConnectors[oldParentID]["rightID"] = undefined;
            this.allConnectors[oldParentID]["rightType"] = undefined;
            this.allConnectors[oldParentID]["rightContent"] = undefined;
            this.allConnectors[oldParentID]["rightStatementIdentifier"] = undefined;
          }
        } else {
          // it should be in the root connector set so need to remove it.
          if (this.rootConnectorID_set.has(droppedConnectorID)) {
            this.rootConnectorID_set.delete(droppedConnectorID);
          }
        }
      }
      let parentID = undefined;// record the OLD parent of whatever was dropped on
      if (droppedOn_is_Statement) {
        parentID = this.allStatements[droppedOnStatementID]["parent"];
      } else {
        parentID = this.allConnectors[droppedOnConnectorID]["parent"];
      }

      if (droppedConnectorID == undefined) // brand new connector so need to create it and initialise to undefined
      {
        // give the connector the next ID
        droppedConnectorID = this.connectorCount;
        this.connectorCount++;
        // initialise the new Connector to undefined
        this.allConnectors[droppedConnectorID] = data;
        this.allConnectors[droppedConnectorID]["connectorID"] = droppedConnectorID;
        this.allConnectors[droppedConnectorID]["leftID"] = undefined;
        this.allConnectors[droppedConnectorID]["leftType"] = undefined;
        this.allConnectors[droppedConnectorID]["leftContent"] = undefined;
        this.allConnectors[droppedConnectorID]["leftStatementIdentifier"] = undefined;
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["rightStatementIdentifier"] = undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
        this.allConnectors[droppedConnectorID]["orientation"] = "row";
      }
      // now the rest of the code is the same, regardless of whether it was a brand new connector.
      this.allConnectors[droppedConnectorID]["parent"] = parentID;

      // set the new Connector up to have the droppedOn Connector/Statement as its left child
      this.allConnectors[droppedConnectorID][targetStr + "ID"] = droppedOn_is_Statement ? droppedOnStatementID : droppedOnConnectorID;
      this.allConnectors[droppedConnectorID][targetStr + "Type"] = droppedOn_is_Statement ? "statement" : "connector";
      this.allConnectors[droppedConnectorID][targetStr + "Content"] = undefined;
      this.allConnectors[droppedConnectorID][targetStr + "StatementIdentifier"] = undefined;

      // and change the parent of the droppedOn Something to the dropped Connector
      // and the dropped Connector becomes the child of whatever connector had the Something as its child
      let parentConnID = undefined;
      if (droppedOn_is_Statement) // we dropped the connector onto a statement
      {
        console.log("droppedOn_is_Statement");
        parentConnID = this.allStatements[droppedOnStatementID]["parent"];
        this.allStatements[droppedOnStatementID]["parent"] = droppedConnectorID;
        if (parentConnID === -1) { // the statement was at the top level
          console.log("parentConnID === -1");
          // remove the statement from the root statementID set
          if (this.rootStatementID_set.has(droppedOnStatementID)) {
            this.rootStatementID_set.delete(droppedOnStatementID);
            // and make position relative now that it is a child of a connector.
            // not sure why this is necessary. 21/11/23 MM.
            this.allStatements[droppedOnStatementID]["position"] = "relative";
          }
          // now add the connector to the root connector set. and initialise its position.
          this.rootConnectorID_set.add(droppedConnectorID);
          this.allConnectors[droppedConnectorID]["top"] = this.allStatements[droppedOnStatementID]["top"];
          this.allConnectors[droppedConnectorID]["left"] = this.allStatements[droppedOnStatementID]["left"];
          this.allStatements[droppedOnStatementID]["top"] = undefined; //since it's now part of a tree
          this.allStatements[droppedOnStatementID]["left"] = undefined; //since it's now part of a tree
          this.allStatements[droppedOnStatementID]["side"] = "left";
        } else {// we need to make the parent of the droppedOnStatement replace its left or right child with the droppedConnector
          console.log("parentConnID isn't -1 it is: ", parentConnID);
          if (this.allConnectors[parentConnID]["leftID"] == droppedOnStatementID) {
            console.log("this.allConnectors[parentConnID][leftID]==droppedOnStatementID");
            this.allConnectors[parentConnID]["leftID"] = droppedConnectorID;
            this.allConnectors[parentConnID]["leftType"] = "connector";
          } else {
            console.log("this.allConnectors[parentConnID][rightID]==droppedOnStatementID");
            // must be the right side.
            this.allConnectors[parentConnID]["rightID"] = droppedConnectorID;
            this.allConnectors[parentConnID]["rightType"] = "connector";
          }
          this.allConnectors[droppedConnectorID]["parent"] = parentConnID; // finally the droppedConnector needs to know its new parent.
          console.log("all done");
        }
      } else { // we dropped the connector onto a connector
        parentConnID = this.allConnectors[droppedOnConnectorID]["parent"];
        this.allConnectors[droppedOnConnectorID]["parent"] = droppedConnectorID;
        if (parentConnID === -1) { // the connector was at the top level so the new connector replaces it in the root ID list
          if (this.rootConnectorID_set.has(droppedOnConnectorID))
            this.rootConnectorID_set.delete(droppedOnConnectorID);
          this.rootConnectorID_set.add(droppedConnectorID);
          this.allConnectors[droppedConnectorID]["top"] = this.allConnectors[droppedOnConnectorID]["top"]; // put it where the droppedOnConnector was
          this.allConnectors[droppedConnectorID]["left"] = this.allConnectors[droppedOnConnectorID]["left"];
          this.allConnectors[droppedOnConnectorID]["top"] = undefined;
          this.allConnectors[droppedOnConnectorID]["left"] = undefined;
        } else { // we need to make the parent of the droppedOnConnector replace its left or right child with the droppedConnector
          if (
            this.allConnectors[parentConnID]["leftID"] == droppedOnConnectorID
          ) {
            console.log("parent's left side = ");
            this.allConnectors[parentConnID]["leftID"] = droppedConnectorID;
          } else {
            // must be the right side.
            this.allConnectors[parentConnID]["rightID"] = droppedConnectorID;
          }
        }
      }

    },

    onDrop(e) {
      e.preventDefault();

      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(e.dataTransfer.getData("grabOffsetLeft"));
      const grabOffsetTop = parseInt(e.dataTransfer.getData("grabOffsetTop"));
      console.log("\n--------------ANSWER AREA onDrop-------------------");
      console.log(
        " grabOffset: ",
        grabOffsetLeft.toFixed(2),
        grabOffsetTop.toFixed(2)
      );

      console.log(
        "onDrop evt(i.e. mouse) e.client i.e. global position=(",
        e.clientX,
        e.clientY,
        ") e.currentTarget.offset i.e. offset_within_thing_dropped_on = (",
        e.currentTarget.offsetLeft,
        e.currentTarget.offsetTop
      );

      let leftWithinAnswerArea = 0;
      let topWithinAnswerArea = 0;

      // account for scrolling
      // get access to the enclosing "div" which is the element with the overflow-y:scroll set
      const scrollableDisplayWorkspace =
        e.currentTarget.closest(".displayWorkspace");
      const scrollLeft = scrollableDisplayWorkspace.scrollLeft;
      const scrollTop = scrollableDisplayWorkspace.scrollTop;
      console.log("parent scroll=", scrollLeft, ",", scrollTop, ")");

      leftWithinAnswerArea =
        e.clientX - e.currentTarget.offsetLeft - grabOffsetLeft + scrollLeft;
      topWithinAnswerArea =
        e.clientY - e.currentTarget.offsetTop - grabOffsetTop + scrollTop;
      console.log(
        "SOOOO (left,top) Within AnswerArea = ",
        leftWithinAnswerArea,
        topWithinAnswerArea
      );

      e.stopImmediatePropagation();

      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));

      // Receive the content of dropped object
      const transContent = e.dataTransfer.getData("content");

      // Deal with the dropped type is 'Connector' and with no child
      if (type === "connector") {
        console.log(
          " Connector Dropped   ID=", data.connectorID, ""
        );
        if (data.connectorID === undefined) {
          this.allConnectors[this.connectorCount] = data;

          //console.log("answer area dropped occurred");

          this.allConnectors[this.connectorCount]["connectorID"] =
            this.connectorCount;
          this.allConnectors[this.connectorCount]["parent"] = -1;
          this.allConnectors[this.connectorCount]["leftID"] = undefined;
          this.allConnectors[this.connectorCount]["leftType"] = undefined;
          this.allConnectors[this.connectorCount]["leftContent"] = undefined;
          this.allConnectors[this.connectorCount]["leftStatementIdentifier"] =
            undefined;
          this.allConnectors[this.connectorCount]["rightID"] = undefined;
          this.allConnectors[this.connectorCount]["rightType"] = undefined;
          this.allConnectors[this.connectorCount]["rightContent"] = undefined;
          this.allConnectors[this.connectorCount]["rightStatementIdentifier"] =
            undefined;
          this.allConnectors[this.connectorCount]["clickCount"] = 0;
          this.allConnectors[this.connectorCount]["orientation"] = "row";

          const answerAreaHeight =
            document.getElementById("answerArea").offsetHeight;
          const submitBtnHeight =
            document.getElementById("submitBtn").offsetHeight;
          const topOffset = answerAreaHeight + submitBtnHeight;

          //this.allConnectors[this.connectorCount]["top"] = topWithinAnswerArea - topOffset;
          this.allConnectors[this.connectorCount]["top"] = topWithinAnswerArea;
          this.allConnectors[this.connectorCount]["left"] =
            leftWithinAnswerArea;

          this.rootConnectorID_set.add(this.connectorCount);

          // Record content
          this.answerContent[this.connectorCount] = transContent;

          this.connectorCount++;
        } else {
          console.log(" connector is already in answer area and has ID ", data.connectorID, " and parent ", this.allConnectors[data.connectorID]["parent"]);
          // A connector is already in answerArea.
          this.allConnectors[data.connectorID]["parent"] = -1; // parent = -1 indicates it is not part of a tree, but is a direct child of the answer area

          //console.log(            "moving an EXISTING connector left, top=",            leftWithinAnswerArea,            topWithinAnswerArea          );

          this.rootConnectorID_set.add(data.connectorID);
          this.answerContent[data.connectorID] = transContent;

          const oldParentID = data.parentID;
          //console.log("OLD PARENT:", this.allConnectors[oldParentID]);

          this.allConnectors[data.connectorID]["top"] = topWithinAnswerArea;
          this.allConnectors[data.connectorID]["left"] = leftWithinAnswerArea;

          // If it is being moved out of a connector, remove parent's memory of child.
          if (this.allConnectors[oldParentID] !== undefined) {
            if (
              this.allConnectors[oldParentID]["leftID"] !== undefined &&
              this.allConnectors[oldParentID]["leftID"] === data.connectorID
            ) {
              this.allConnectors[oldParentID]["leftID"] = undefined;
              this.allConnectors[oldParentID]["leftType"] = undefined;
              this.allConnectors[oldParentID]["leftContent"] = undefined;
              this.allConnectors[oldParentID]["leftStatementIdentifier"] =
                undefined;
            } else {
              this.allConnectors[oldParentID]["rightID"] = undefined;
              this.allConnectors[oldParentID]["rightType"] = undefined;
              this.allConnectors[oldParentID]["rightContent"] = undefined;
              this.allConnectors[oldParentID]["rightStatementIdentifier"] =
                undefined;
            }
          }
        }
      } else if (type === "statement") {
        const statementID = data.id;
        console.log(
          " Statement Dropped   ID=", statementID
        );
        const getStatement = this.allStatements[statementID];
        let statementOldParent = undefined;
        if (getStatement) {
          statementOldParent = this.allStatements[statementID]["parent"];
        }
        //console.log(          "FINAL POSITION =========>",  leftWithinAnswerArea,  topWithinAnswerArea,  "<================");
        if (statementOldParent === undefined) {
          this.allStatements[statementID]["parent"] = -1;
          this.allStatements[statementID]["position"] = "absolute";
          this.allStatements[statementID]["top"] = topWithinAnswerArea;
          this.allStatements[statementID]["left"] = leftWithinAnswerArea;
          this.rootStatementID_set.add(statementID);

          // TODO: emit statement used.
          this.$emit("statement-used", statementID);

          // TODO: Render text???
        } else if (statementOldParent === -1) {
          this.allStatements[statementID]["position"] = "absolute";
          this.allStatements[statementID]["top"] = topWithinAnswerArea;
          this.allStatements[statementID]["left"] = leftWithinAnswerArea;
          //console.log(this);
        } else {
          // must have a parent, which means it's part of a connector tree
          this.allStatements[statementID]["parent"] = -1;
          this.allStatements[statementID]["position"] = "absolute";
          this.allStatements[statementID]["top"] = topWithinAnswerArea;
          this.allStatements[statementID]["left"] = leftWithinAnswerArea;
          this.rootStatementID_set.add(statementID);

          // Remove connector's memory of this item.
          if (
            this.allConnectors[statementOldParent]["leftID"] === statementID
          ) {
            this.allConnectors[statementOldParent]["leftID"] = undefined;
            this.allConnectors[statementOldParent]["leftType"] = undefined;
            this.allConnectors[statementOldParent]["leftContent"] = undefined;
            this.allConnectors[statementOldParent]["leftStatementIdentifier"] =
              undefined;
          } else if (
            this.allConnectors[statementOldParent]["rightID"] === statementID
          ) {
            this.allConnectors[statementOldParent]["rightID"] = undefined;
            this.allConnectors[statementOldParent]["rightType"] = undefined;
            this.allConnectors[statementOldParent]["rightContent"] = undefined;
            this.allConnectors[statementOldParent]["rightStatementIdentifier"] =
              undefined;
          } else {
            console.error("The dropped statement has a wrong parent ID.");
          }
        }
        this.answerContent[statementID] = transContent;
      }
    },

    connectorDroppedOnStatement(statementID, e) {
      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));
      const transContent = e.dataTransfer.getData("content");
      console.log(
        "AnswerArea:connectorDroppedOnStatement  type=",
        type,
        " data=",
        data,
        " transContent=",
        transContent
      );

      if (data.connectorID === undefined) {
        // connector is new so need to add it to the list
        const oldStatementParent = thi.allStatements[statementID]["parent"];
        this.allConnectors[this.connectorCount] = data;
        this.allConnectors[this.connectorCount]["connectorID"] =
          this.connectorCount;
        this.allConnectors[this.connectorCount]["parent"] = oldStatementParent;
        this.allConnectors[this.connectorCount]["leftID"] = undefined;
        this.allConnectors[this.connectorCount]["leftType"] = undefined;
        this.allConnectors[this.connectorCount]["leftContent"] = undefined;
        this.allConnectors[this.connectorCount]["leftStatementIdentifier"] =
          undefined;
        this.allConnectors[this.connectorCount]["rightID"] = undefined;
        this.allConnectors[this.connectorCount]["rightType"] = undefined;
        this.allConnectors[this.connectorCount]["rightContent"] = undefined;
        this.allConnectors[this.connectorCount]["rightStatementIdentifier"] =
          undefined;
        this.allConnectors[this.connectorCount]["clickCount"] = 0;
        this.allConnectors[this.connectorCount]["orientation"] = "row";
        this.allConnectors[this.connectorCount]["top"] =
          this.allStatements[statementID]["top"];
        this.allConnectors[this.connectorCount]["left"] =
          this.allStatements[statementID]["left"];
        this.rootConnectorID_set.add(this.connectorCount);
        this.answerContent[this.connectorCount] = transContent;
        this.connectorCount++;
        console.log(
          " A new connector from the right (undefined) is dropped onto statement."
        );
        this.handleAStatementDrop([
          this.connectorCount - 1,
          statementID,
          transContent,
        ]);
        if (oldStatementParent != -1) {
          // if
        }
      }
    },

    handleConnectContentChange(info) {
      const currConnectID = info[0];
      this.answerContent[currConnectID] = info[1];
    },

    handleUpdateChildStat(info) {
      const currConn = info[0];
      if (info[2] === "left") {
        this.allConnectors[currConn]["leftContent"] = info[1];
      } else if (info[2] === "right") {
        this.allConnectors[currConn]["rightContent"] = info[1];
      }
    },

    handleUpdateChildConnector(info) {
      const currParent = info[2];
      if (info[3] === "left") {
        this.allConnectors[currParent]["leftContent"] = info[1];
      } else if (info[3] === "right") {
        this.allConnectors[currParent]["rightContent"] = info[1];
      }
    },

    // invoked when student statement choice is changed to
    // update the answer string area
    handleUpdateStatementContent(contentText, statementID) {
      this.answerContent[statementID] = contentText[0];
    },

    emitUpdateContent(newAnswerContentObject) {
      this.$emit("update-answer-area-content", [
        this.rootConnectorID_set,
        this.rootStatementID_set,
        newAnswerContentObject,
      ]);
    },

    // This function will be invoked when option in student statement is changed.
    // TODO: fix this.
    handleStatDataChange(newStatData) {
      const statID = newStatData.id;
      this.allStatements[statID] = newStatData;
    },

    handleUpdateClickCount(transID) {
      this.allConnectors[transID]["clickCount"] += 1;
    },

    handleToggleOrientation(params) {
      const { id } = params;
      const current = this.allConnectors[id]["orientation"];
      this.allConnectors[id]["orientation"] =
        current === "row" ? "column" : "row";
    },

    clearWorkspace() {
      this.connectorCount = 0;
      this.rootConnectorID_set = new Set();
      this.rootStatementID_set = new Set();
      this.rootConnectorID = null;

      this.allConnectors = {};
      this.allStatements = {}; // Record all user input

      this.left = 0;
      this.top = 0;

      this.answerContent = {}; // {ID: Content} record the element ID and its content
    },

    loadPreviousAnswer(parameter) {
      this.connectorCount = parseInt(parameter["connectorCount"]);
      this.rootConnectorID_set = new Set(parameter.rootConnectorID_set);
      this.rootStatementID_set = new Set(parameter.rootStatementID_set);
      this.rootConnectorID = parameter["rootConnectorID"];
      this.allConnectors = parameter["allConnectors"];
      this.allStatements = parameter["allStatements"];
      this.left = parseInt(parameter["left"]);
      this.top = parseInt(parameter["top"]);

      this.answerContent = parameter["answerContent"];
      //console.log(parameter);
    },

    deleteChildConnector(params) {
      // Remove the connector from allConnectors object
      const { id, parentId, position } = params;
      if (position && parentId !== undefined) {
        const parentId = this.allConnectors[id].parent;
        delete this.allConnectors[parentId][`${position}ID`];
        delete this.allConnectors[parentId][`${position}Type`];
      }
      this.deleteConnector({ id });
    },

    deleteConnector(params) {
      // Remove the connector from allConnectors object
      const { id } = params;
      const { leftType, leftID, rightType, rightID } = this.allConnectors[id];
      if (leftType === "connector") {
        this.deleteConnector({ id: leftID });
      }
      if (rightType === "connector") {
        this.deleteConnector({ id: rightID });
      }
      if (leftType === "statement") {
        this.$emit("statement-removed", leftID, true);
      }
      if (rightType === "statement") {
        this.$emit("statement-removed", rightID, true);
      }
      delete this.allConnectors[id];
      this.rootConnectorID_set.delete(id);

      // deleting the connector text from string area upon deletion
      if (this.answerContent.hasOwnProperty(id)) {
        delete this.answerContent[id];
      }
      this.$emit("connector-deleted", id);
    },

    duplicateStatement(id) {
      console.log("AnswerArea:duplicateStatement");
      const theStatement = this.allStatements[id];
      const duplicatedStatement = JSON.parse(JSON.stringify(theStatement)); // Create a copy of the last element
      duplicatedStatement.id = uniqueId(); //just need a new unique number
      duplicatedStatement["visible"] = true;
      duplicatedStatement["parent"] = -1;
      duplicatedStatement["position"] = "absolute";
      duplicatedStatement["showPopup"] = theStatement["showPopup"];
      duplicatedStatement["collapsed"] = theStatement["collapsed"];
      this.statements.push(duplicatedStatement); // Push the duplicated element to the parent array
      this.allStatements[duplicatedStatement.id] = duplicatedStatement; // now add to the keyed list
      let baseTop = 100;
      let baseLeft = 100;
      if (theStatement["parent"] == -1) {
        baseTop = theStatement["top"];
        baseLeft = theStatement["left"];
      }
      this.allStatements[duplicatedStatement.id]["top"] = baseTop + 25;
      this.allStatements[duplicatedStatement.id]["left"] = baseLeft + 25;
      this.rootStatementID_set.add(duplicatedStatement.id);
      this.$emit("statement-used", duplicatedStatement.id);
    },

    toggleCollapsedRenderStatement(id) {
      console.log("AnswerArea:toggleCollapsedRenderStatement ID:", id);
      this.allStatements[id]["collapsed"] =
        !this.allStatements[id]["collapsed"];
    },

    toggleCollapsedRenderStatementFromConnector(id) {
      console.log(
        "AnswerArea:toggleCollapsedRenderStatementFromConnector ID:",
        id
      );
      this.allStatements[id]["collapsed"] =
        !this.allStatements[id]["collapsed"];
    },

    toggleShowPopupFromRenderStatement(id) {
      console.log("AnswerArea:toggleShowPopupFromRenderStatement");
      this.allStatements[id]["showPopup"] =
        !this.allStatements[id]["showPopup"];
      console.log(
        "AnswerArea:toggleShowPopupFromRenderStatement is now",
        this.allStatements[id]["showPopup"]
      );
    },

    toggleShowPopupFromConnector(id) {
      console.log("AnswerArea:toggleShowPopupFromConnector");
      this.allStatements[id]["showPopup"] =
        !this.allStatements[id]["showPopup"];
      console.log(
        "AnswerArea:toggleShowPopupFromConnector is now",
        this.allStatements[id]["showPopup"]
      );
    },

    duplicateLastStatement() {
      if (this.statements.length > 0) {
        const lastStatement = this.statements[this.statements.length - 1];
        const duplicatedStatement = JSON.parse(JSON.stringify(lastStatement)); // Create a copy of the last element
        duplicatedStatement.id = duplicatedStatement.id + 1; //just need a new unique number
        duplicatedStatement.statementIdentifier =
          duplicatedStatement.statementIdentifier;
        duplicatedStatement["parent"] = undefined;
        duplicatedStatement["visible"] = true;
        this.statements.push(duplicatedStatement); // Push the duplicated element to the parent array
        this.allStatements[duplicatedStatement.id] = duplicatedStatement; // now add to the keyed list
      }
    },

    deleteStatement(params) {
      // Remove the connector from allConnectors object
      const { id, parentId, position } = params;
      if (position) {
        this.$emit("statement-used", id, true);
        delete this.allConnectors[parentId][`${position}ID`];
        delete this.allConnectors[parentId][`${position}Type`];
      }
    },

    toggleAllFeedback() {


      if (this.checkSufficientAnswerSize()) {
        alert(STATEMENT_PROPORTION_REQUIRED + "% of statements must be used in the answer in order to show the feedback");
        return false;
      }

      this.showAllFeedback = !this.showAllFeedback;
    },
  },

  mounted() {
    const statementCount = this.statements.length;
    if (statementCount > 50) {
      console.log("statementCount error!");
      return;
    }
    let i = 0;

    while (i < statementCount) {
      const item = this.statements[i];

      this.allStatements[item.id] = item;
      i++;
    }
  },

  watch: {
    answerContent: {
      handler(newAnswerContentObject, oldAnswerContentObject) {
        this.emitUpdateContent(newAnswerContentObject);
      },
      deep: true,
    },

    statements(newStatements) {
      this.allStatements = {};
      for (let item in newStatements) {
        item = newStatements[item];
        this.allStatements[item.id] = item;
      }
    },
  }

};
</script>

<style>
/* version1 */
.answer_area>.connectorContainer {
  position: absolute;
}

.answer_area .connectorText {
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
</style>
