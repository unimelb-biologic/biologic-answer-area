<template>
  <div id="submitBtn">
    <button @click="convertToJson">Submit</button>
  </div>

  <div
    class="answer_area"
    @dragover.prevent
    @dragenter.prevent
    ref="answer_area"
  >
    <RenderStatement
      v-for="item in rootStatementIDs"
      :key="item"
      :data="allStatements[item]"
    />

    <Connector
      v-for="rootConnectorID in rootConnectorID_list"
      :key="rootConnectorID"
      :connector-i-d="allConnectors[rootConnectorID].connectorID"
      :connector-content-i-d="allConnectors[rootConnectorID].connectorContentID"
      :connector-content="allConnectors[rootConnectorID].connectorContent"
      :all-statements="this.allStatements"
      :all-connectors="this.allConnectors"
      :parent="allConnectors[rootConnectorID].parent"
      :left-i-d="allConnectors[rootConnectorID].leftID"
      :left-type="allConnectors[rootConnectorID].leftType"
      :left-content="allConnectors[rootConnectorID].leftContent"
      :right-i-d="allConnectors[rootConnectorID].rightID"
      :right-type="allConnectors[rootConnectorID].rightType"
      :right-content="allConnectors[rootConnectorID].rightContent"
      :click-count="allConnectors[rootConnectorID].clickCount"
      :selected-phrase="allConnectors[rootConnectorID].selectedPhrase"
      :conntop="allConnectors[rootConnectorID].top"
      :connleft="allConnectors[rootConnectorID].left"
      :moveItem="moveItem"
      :rootConnectorID="rootConnectorID"
      @delete-child-connector="deleteChildConnector"
      @delete-connector="deleteConnector"
      @delete-statement="deleteStatement"
      @setDraggedItem="setDraggedItem"
      @dropped-astat="handleAStatementDrop"
      @dropped-bstat="handleBStatementDrop"
      @dropped-aconn="handleAConnectorDrop"
      @dropped-bconn="handleBConnectorDrop"
      @link-word-changed="handleLinkWordChange"
      @update-connector-content="handleConnectContentChange"
      @update-click-count="handleUpdateClickCount"
      @update-child-connector-content="handleUpdateChildConnector"
      @update-child-stat="handleUpdateChildStat"
    />
  </div>
</template>

<script>
import Connector from "@/components/Connector.vue";
import RenderStatement from "../components/RenderStatement.vue";

export default {
  name: "AnswerArea",
  components: { Connector, RenderStatement },
  emits: [
    "update-answer-area-content",
    "statementUsed",
    "setStatementElements",
    "setDraggedItem",
    "setDroppedItems",
    "connector-deleted",
    "answer-data",
    "get-last-working-answer",
  ],
  props: {
    statements: Object,
    data: Object,
    droppedItems: Array, // record the dropped statements
    draggedItem: Object, // record the dragged statements
    offsetX: Number, // record the coordinate of x
    offsetY: Number, // record the coordinate of y
    dataObject: Object,
  },
  data() {
    return {
      connectorCount: 0,
      rootConnectorID_list: new Set(),
      rootStatementIDs: new Set(),
      rootConnectorID: null,

      allConnectors: {},
      allStatements: {}, // Record all user input
      left: 0,
      top: 0,
      // record move item
      moveItem: null,
      moveX: 0,
      moveY: 0,
      data_Object: {},
      answerContent: {}, // {ID: Content} record the element ID and its content
    };
  },
  methods: {
    convertToJson() {
      console.log("button pressed");
      this.data_Object = {
        connectorCount: String(this.connectorCount),
        rootConnectorID_list: Array.from(this.rootConnectorID_list),
        rootConnectorID: this.rootConnectorID,
        rootStatementIDs: Array.from(this.rootStatementIDs),
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
      // Emit the dataObject and saveJson() result
      this.$emit("answer-data", this.data_Object);
      console.log(this.data_Object);
    },
    handleLinkWordChange(info) {
      const connectorID = info[0];
      this.allConnectors[connectorID]["selectedPhrase"] = info[1];
    },

    handleAStatementDrop(info) {
      const connectorID = info[0];
      const statementID = info[1];
      const statementContent = info[2];

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
          "A statement was dragged directly onto connector left side."
        );
        this.$emit("statementUsed", statementID);
      } else if (statementOldParent === -1) {
        console.log(
          "A statement was dragged from ans area onto connector left side."
        );
        this.rootStatementIDs.delete(statementID);
      } else {
        console.log(
          "A statement was dragged from a connector to a connector left side."
        );
        if (statementOldSide === "left") {
          this.allConnectors[statementOldParent]["leftID"] = undefined;
          this.allConnectors[statementOldParent]["leftType"] = undefined;
          this.allConnectors[statementOldParent]["leftContent"] = undefined;
        } else if (statementOldSide === "right") {
          this.allConnectors[statementOldParent]["rightID"] = undefined;
          this.allConnectors[statementOldParent]["rightType"] = undefined;
          this.allConnectors[statementOldParent]["rightContent"] = undefined;
        } else {
          console.error();
        }
      }

      this.allConnectors[connectorID]["leftID"] = statementID;
      this.allConnectors[connectorID]["leftType"] = "statement";
      this.allConnectors[connectorID]["leftContent"] = statementContent;
    },

    // If a statement is dropped on the right side of a
    handleBStatementDrop(info) {
      const connectorID = info[0];
      const statementID = info[1];
      const statementContent = info[2];

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
        this.$emit("statementUsed", statementID);
      } else if (statementOldParent === -1) {
        console.log(
          "A statement was dragged from ans area onto connector right side."
        );
        this.rootStatementIDs.delete(statementID);
      } else {
        console.log(
          "A statement was dragged from a connector to a connector right side."
        );
        if (statementOldSide === "left") {
          this.allConnectors[statementOldParent]["leftID"] = undefined;
          this.allConnectors[statementOldParent]["leftType"] = undefined;
          this.allConnectors[statementOldParent]["leftContent"] = undefined;
        } else if (statementOldSide === "right") {
          this.allConnectors[statementOldParent]["rightID"] = undefined;
          this.allConnectors[statementOldParent]["rightType"] = undefined;
          this.allConnectors[statementOldParent]["rightContent"] = undefined;
        } else {
          console.error();
        }
      }

      this.allConnectors[connectorID]["rightID"] = statementID;
      this.allConnectors[connectorID]["rightType"] = "statement";
      this.allConnectors[connectorID]["rightContent"] = statementContent;
    },

    setDraggedItem(value) {
      this.$emit("setDraggedItem", value);
    },

    // If a connector is dropped onto the left side of a connector
    handleAConnectorDrop(info) {
      // info: [this.connectorID, data, transContent]
      const connectorID = info[0];

      const data = info[1];
      console.log(
        "old connector id",
        connectorID,
        "new connector ID",
        data.connectorID
      );

      if (connectorID === data.connectorID) {
        return;
      }

      let droppedConnectorID = data.connectorID;

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
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
      } else if (data.parentID === -1) {
        // Dragged from answerArea to a
        if (this.rootConnectorID_list.has(droppedConnectorID)) {
          this.rootConnectorID_list.delete(droppedConnectorID);
        }

        console.log("Assigning ConnectorID", droppedConnectorID);

        this.allConnectors[droppedConnectorID]["parent"] = connectorID;
      } else {
        // Dragged from a connector to a
        if (
          this.allConnectors[data.parentID]["leftID"] === droppedConnectorID
        ) {
          this.allConnectors[data.parentID]["leftID"] = undefined;
          this.allConnectors[data.parentID]["leftType"] = undefined;
          this.allConnectors[data.parentID]["leftContent"] = undefined;
        } else if (
          this.allConnectors[data.parentID]["rightID"] === droppedConnectorID
        ) {
          this.allConnectors[data.parentID]["rightID"] = undefined;
          this.allConnectors[data.parentID]["rightType"] = undefined;
          this.allConnectors[data.parentID]["rightContent"] = undefined;
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
      const connectorID = info[0];
      const data = info[1];
      console.log("a connector was just dropped onto B side. Details:", info);
      console.log(
        "old connector id",
        connectorID,
        "new connector ID",
        data.connectorID
      );

      if (connectorID === data.connectorID) {
        return;
      }

      console.log(data);
      console.log(data.connectorID);
      let droppedConnectorID = data.connectorID;

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
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
      } else if (data.parentID === -1) {
        if (this.rootConnectorID_list.has(droppedConnectorID)) {
          this.rootConnectorID_list.delete(droppedConnectorID);
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
        } else if (
          this.allConnectors[data.parentID]["rightID"] === droppedConnectorID
        ) {
          this.allConnectors[data.parentID]["rightID"] = undefined;
          this.allConnectors[data.parentID]["rightType"] = undefined;
          this.allConnectors[data.parentID]["rightContent"] = undefined;
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

    onDrop(e) {
      e.preventDefault();

      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(e.dataTransfer.getData("grabOffsetLeft"));
      const grabOffsetTop = parseInt(e.dataTransfer.getData("grabOffsetTop"));
      console.log(
        "OnDrop in answer area, grabOffset: ",
        grabOffsetLeft,
        grabOffsetTop
      );

      let thisLeft = this.left;
      let thisTop = this.top;

      const areaEl = this.$refs.answer_area;

      console.log(
        "onDrop e.client global position=(",
        e.clientX,
        e.clientY,
        ") e.currentTarget.offset positionedParentLocation= (",
        e.currentTarget.offsetLeft,
        e.currentTarget.offsetTop,
        ") answerArea offset left,top = (",
        areaEl.offsetLeft,
        areaEl.offsetTop,
        ") areaEL.offset X,Y ",
        areaEl.offsetX,
        areaEl.offsetY
      );

      if (areaEl && areaEl.offsetTop) {
        thisTop = e.clientY - e.currentTarget.offsetTop - grabOffsetTop;
        console.log(
          "SOOOO thisTop = e.clientY - e.currentTarget.offsetTop -grabOffsetTop gives",
          thisTop
        );
      }
      if (areaEl && areaEl.offsetLeft) {
        thisLeft = e.clientX - e.currentTarget.offsetLeft - grabOffsetLeft;
      }

      e.stopImmediatePropagation();

      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));

      // Receive the content of dropped object
      const transContent = e.dataTransfer.getData("content");

      // Deal with the dropped type is 'Connector' and with no child
      if (type === "connector") {
        // A new connector from the right (undefined) is dropped onto answer area.
        if (data.connectorID === undefined) {
          this.allConnectors[this.connectorCount] = data;

          console.log("answer area dropped occurred");

          this.allConnectors[this.connectorCount]["connectorID"] = this.connectorCount;
          this.allConnectors[this.connectorCount]["parent"] = -1;
          this.allConnectors[this.connectorCount]["leftID"] = undefined;
          this.allConnectors[this.connectorCount]["leftType"] = undefined;
          this.allConnectors[this.connectorCount]["leftContent"] = undefined;
          this.allConnectors[this.connectorCount]["rightID"] = undefined;
          this.allConnectors[this.connectorCount]["rightType"] = undefined;
          this.allConnectors[this.connectorCount]["rightContent"] = undefined;
          this.allConnectors[this.connectorCount]["clickCount"] = 0;

          //version1: Let the connector can drop to any position
          console.log("setting a NEW connector left, top=", thisLeft, thisTop);
          const answerAreaHeight =
            document.getElementById("answerArea").offsetHeight;
          const submitBtnHeight =
            document.getElementById("submitBtn").offsetHeight;
          const topOffset = answerAreaHeight + submitBtnHeight;

          this.allConnectors[this.connectorCount]["top"] = thisTop - topOffset;
          this.allConnectors[this.connectorCount]["left"] = thisLeft;

          //version2: Allow connector in a proper position
          //this.allConnectors[this.connectorCount]["top"] = 266; //this.top
          //this.allConnectors[this.connectorCount]["left"] = 166; //this.left

          // console.log("all connectors", this.allConnectors)

          this.rootConnectorID_list.add(this.connectorCount);
          // this.rootConnectorID =
          // Record root ID
          //this.rootID.add(this.connectorCount)
          // console.log("all connectors", this.allConnectors)

          // Record content
          this.answerContent[this.connectorCount] = transContent;

          this.connectorCount++;
        } else {
          // A connector is already in answerArea.
          console.log("Hello there!");
          this.allConnectors[data.connectorID]["parent"] = -1;

          console.log(
            "moving an EXISTING connector left, top=",
            thisLeft,
            thisTop
          );

          this.rootConnectorID_list.add(data.connectorID);
          this.answerContent[data.connectorID] = transContent;

          const oldParentID = data.parentID;
          console.log("OLD PARENT:", this.allConnectors[oldParentID]);

          // If it is being moved out of a connector, remove parent's memory of child.
          if (this.allConnectors[oldParentID] !== undefined) {
            if (
              this.allConnectors[oldParentID]["leftID"] !== undefined &&
              this.allConnectors[oldParentID]["leftID"] === data.connectorID
            ) {
              this.allConnectors[oldParentID]["leftID"] = undefined;
              this.allConnectors[oldParentID]["leftType"] = undefined;
              this.allConnectors[oldParentID]["leftContent"] = undefined;
            } else {
              this.allConnectors[oldParentID]["rightID"] = undefined;
              this.allConnectors[oldParentID]["rightType"] = undefined;
              this.allConnectors[oldParentID]["rightContent"] = undefined;
            }
          }
        }
      } else if (type === "statement") {
        const statementID = data.id;
        const statementOldParent = this.allStatements[statementID]["parent"];

        console.log(
          "FINAL POSITION =========>",
          thisLeft,
          thisTop,
          "<================"
        );
        if (statementOldParent === undefined) {
          this.allStatements[statementID]["parent"] = -1;
          this.allStatements[statementID]["position"] = "absolute";
          this.allStatements[statementID]["top"] = thisTop;
          this.allStatements[statementID]["left"] = thisLeft;
          this.rootStatementIDs.add(statementID);

          // TODO: emit statement used.
          this.$emit("statementUsed", statementID);

          // TODO: Render text???
        } else if (statementOldParent === -1) {
          this.allStatements[statementID]["position"] = "absolute";
          this.allStatements[statementID]["top"] = thisTop;
          this.allStatements[statementID]["left"] = thisLeft;
          console.log(this);
        } else {
          this.allStatements[statementID]["parent"] = -1;
          this.allStatements[statementID]["position"] = "absolute";
          this.allStatements[statementID]["top"] = thisTop;
          this.allStatements[statementID]["left"] = thisLeft;
          this.rootStatementIDs.add(statementID);

          // Remove connector's memory of this item.
          if (
            this.allConnectors[statementOldParent]["leftID"] === statementID
          ) {
            this.allConnectors[statementOldParent]["leftID"] = undefined;
            this.allConnectors[statementOldParent]["leftType"] = undefined;
            this.allConnectors[statementOldParent]["leftContent"] = undefined;
          } else if (
            this.allConnectors[statementOldParent]["rightID"] === statementID
          ) {
            this.allConnectors[statementOldParent]["rightID"] = undefined;
            this.allConnectors[statementOldParent]["rightType"] = undefined;
            this.allConnectors[statementOldParent]["rightContent"] = undefined;
          } else {
            console.error("The dropped statement has a wrong parent ID.");
          }
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

    emitUpdateContent(newAnswerContentObject) {
      this.$emit("update-answer-area-content", [
        this.rootConnectorID_list,
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

    clearWorkspace() {
      this.connectorCount = 0;
      this.rootConnectorID_list = new Set();
      this.rootStatementIDs = new Set();
      this.rootConnectorID = null;

      this.allConnectors = {};
      this.allStatements = {}; // Record all user input

      this.left = 0;
      this.top = 0;

      this.answerContent = {}; // {ID: Content} record the element ID and its content
    },

    loadPreviousAnswer(parameter) {
      this.connectorCount = parseInt(parameter["connectorCount"]);
      this.rootConnectorID_list = new Set(parameter.rootConnectorID_list);
      this.rootStatementIDs = new Set(parameter.rootStatementIDs);
      this.rootConnectorID = parameter["rootConnectorID"];
      this.allConnectors = parameter["allConnectors"];
      this.allStatements = parameter["allStatements"];
      this.left = parseInt(parameter["left"]);
      this.top = parseInt(parameter["top"]);

      this.answerContent = parameter["answerContent"];
      console.log(parameter);
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
        this.$emit("statementUsed", leftID, true);
      }
      if (rightType === "statement") {
        this.$emit("statementUsed", rightID, true);
      }
      delete this.allConnectors[id];
      this.rootConnectorID_list.delete(id);
      this.$emit("connector-deleted", id);
    },

    deleteStatement(params) {
      // Remove the connector from allConnectors object
      const { id, parentId, position } = params;
      if (position) {
        this.$emit("statementUsed", id, true);
        delete this.allConnectors[parentId][`${position}ID`];
        delete this.allConnectors[parentId][`${position}Type`];
      }
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
        this.allStatements[item.id]["parent"] = undefined;
        this.allStatements[item.id]["top"] = undefined;
        this.allStatements[item.id]["left"] = undefined;
        this.allStatements[item.id]["position"] = undefined;
        this.allStatements[item.id]["side"] = undefined;
      }
    },
  },
};
</script>

<style>
/* version1 */
.answer_area > .connectorContainer {
  position: absolute;
}

.answer_area .connectorText {
  max-width: 200px;
}

#submitBtn {
  margin-left: 10px;
}
</style>
