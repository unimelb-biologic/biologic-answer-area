<template>
  <div
    class="connectorContainer"
    :style="{ transform: `translate(${connleft}px, ${conntop}px)` }"
    ref="mmConnBox"
    draggable="true"
    @dragstart="startDragConnector($event)"
  >
    <div v-if="this.parent !== undefined" class="container">
      <button v-if="this.clickCount % 2 === 0" @click="displayFormChanged" class="connectorButton">
      <img 
        class="collapse-expand-button"
        src="../assets/collapse_icon.png"
        alt="Rotate"
        width="20"
        style="margin-bottom: 5px;"
        
      />
    </button>
    <button v-if="this.clickCount % 2 === 1"  @click="displayFormChanged" class="connectorButton">
      <img 
        class="collapse-expand-button"
        src="../assets/expand_icon.png"
        alt="Rotate"
        width="20"
        style="margin-bottom: 5px;"
        
      />
    </button>
    <button  v-if="this.clickCount % 2 === 0" @click="rotateConnector({ id: connectorID })" class="connectorButton">
      <img 
        class="rotate-button"
        src="../assets/rotate_icon.png"
        alt="Rotate"
        width="20"
        style="margin-bottom: 5px;"
        
      />
    </button>
    <button @click="deleteConnector({ id: connectorID })" class="connectorButton">
      <img
        class="delete-button"
        src="../assets/recycle_bin.png"
        alt="Delete"
        
      />
    </button>
    </div>
    <div class="onlyText" v-if="clickCount % 2 === 1">
      <!-- TODO: The drag function need polish(or just drop this function) -->
      {{ this.contentTextAll }}
    </div>
    <div
      class="connectorBox"
      v-if="clickCount % 2 === 0 || clickCount === undefined"
      :style="{ flexDirection: connectorFlexDirection }"
    >
      <div style="font-weight: bold" v-if="connectorContent[selectedPhrase][0]">
        <ConnectorContextMenu
          :choice="selectedPhrase"
          :options="connectorContent"
          :connector-i-d="connectorID"
          :parent-i-d="parent"
          :index="0"
          @change-link-word="handleLinkWordChange"
        />
      </div>

      <!-- the left section -->
      <!-- in the order of empty, statement, connector -->
      <!-- TODO: implement connector -->
      <div class="tooltip">
        <!-- TODO: implement delete -->
        <div
          class="connector-sections"
          v-if="this.leftType === undefined"
          @drop="onDrop($event, 'a')"
          @dragover.prevent
          @dragenter.prevent
          @dropped-aconn="handleAConnectorDrop"
          @dropped-bconn="handleBConnectorDrop"
          @dropped-astat="handleAStatementDrop"
          @dropped-bstat="handleBStatementDrop"
        ></div>

        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.leftType === 'statement'">
          <RenderStatement
            @delete-statement="
              deleteStatement({ id: this.leftID, position: 'left' })
            "
            :data="this.allStatements[this.leftID]"
            @update-statement-content="handleUpdateStatContentA"
            @mousedown="onMousedown('leftType')"
          />
        </div>
        <!--                    <span class="tooltiptext" v-if="this.leftID !== undefined">Drag to recycle bin to remove</span>-->

        <div class="connector-sections" v-if="this.leftType === 'connector'">
          <Connector
            :connector-i-d="this.leftID"
            :connector-content-i-d="
              allConnectors[this.leftID].connectorContentID
            "
            :connector-content="allConnectors[this.leftID].connectorContent"
            :all-statements="this.allStatements"
            :all-connectors="this.allConnectors"
            :rootConnectorID="rootConnectorID"
            :parent="allConnectors[this.leftID].parent"
            :left-i-d="allConnectors[this.leftID].leftID"
            :left-type="allConnectors[this.leftID].leftType"
            :left-content="allConnectors[this.leftID].leftContent"
            :right-i-d="allConnectors[this.leftID].rightID"
            :right-type="allConnectors[this.leftID].rightType"
            :right-content="allConnectors[this.leftID].rightContent"
            :click-count="allConnectors[this.leftID].clickCount"
            :selected-phrase="allConnectors[this.leftID].selectedPhrase"
            @delete-connector="
              deleteChildConnector({
                id: this.leftID,
                parentId: this.connectorID,
                position: 'left',
              })
            "
            @delete-child-connector="deleteChildConnector"
            @delete-statement="deleteStatement"
            @dropped-aconn="handleAConnectorDrop"
            @dropped-bconn="handleBConnectorDrop"
            @dropped-astat="handleAStatementDrop"
            @dropped-bstat="handleBStatementDrop"
            @link-word-changed="handleChildLinkWordChange"
            @update-connector-content="handleUpdateConnectorContentA"
            @update-click-count="handleUpdateChildClickCount"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
          />
        </div>
      </div>

      <div class="connectorMenu" v-if="connectorContent[selectedPhrase][1]">
        <ConnectorContextMenu
          :choice="selectedPhrase"
          :options="connectorContent"
          :connector-i-d="connectorID"
          :parent-i-d="parent"
          :index="1"
          @change-link-word="handleLinkWordChange"
        />
      </div>

      <!-- the right section -->
      <!-- in the order of empty, statement, connector -->
      <!-- TODO: implement connector -->
      <div class="tooltip">
        <!-- TODO: implement delete -->
        <div
          class="connector-sections"
          v-if="this.rightType === undefined"
          @drop="onDrop($event, 'b')"
          @dragover.prevent
          @dragenter.prevent
          @dropped-aconn="handleAConnectorDrop"
          @dropped-bconn="handleBConnectorDrop"
          @dropped-astat="handleAStatementDrop"
          @dropped-bstat="handleBStatementDrop"
        ></div>

        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.rightType === 'statement'">
          <RenderStatement
            @delete-statement="
              deleteStatement({ id: this.rightID, position: 'right' })
            "
            :data="this.allStatements[this.rightID]"
            @update-statement-content="handleUpdateStatContentB"
            @mousedown="onMousedown('rightType')"
          />
        </div>

        <!-- <span class="tooltiptext" v-if="this.b !== null">Drag to recycle bin to remove</span> -->
        <div class="connector-sections" v-if="this.rightType === 'connector'">
          <Connector
            :connector-i-d="this.rightID"
            :connector-content-i-d="
              allConnectors[this.rightID].connectorContentID
            "
            :connector-content="allConnectors[this.rightID].connectorContent"
            :all-statements="this.allStatements"
            :all-connectors="this.allConnectors"
            :parent="allConnectors[this.rightID].parent"
            :left-i-d="allConnectors[this.rightID].leftID"
            :left-type="allConnectors[this.rightID].leftType"
            :left-content="allConnectors[this.rightID].leftContent"
            :right-i-d="allConnectors[this.rightID].rightID"
            :right-type="allConnectors[this.rightID].rightType"
            :right-content="allConnectors[this.rightID].rightContent"
            :click-count="allConnectors[this.rightID].clickCount"
            :selected-phrase="allConnectors[this.rightID].selectedPhrase"
            :rootConnectorID="rootConnectorID"
            @delete-connector="
              deleteChildConnector({
                id: this.rightID,
                parentId: this.connectorID,
                position: 'right',
              })
            "
            @delete-child-connector="deleteChildConnector"
            @delete-statement="deleteStatement"
            @dropped-aconn="handleAConnectorDrop"
            @dropped-bconn="handleBConnectorDrop"
            @dropped-astat="handleAStatementDrop"
            @dropped-bstat="handleBStatementDrop"
            @link-word-changed="handleChildLinkWordChange"
            @update-connector-content="handleUpdateConnectorContentB"
            @update-click-count="handleUpdateChildClickCount"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
          />
        </div>
      </div>

      <div style="font-weight: bold" v-if="connectorContent[selectedPhrase][2]">
        <ConnectorContextMenu
          :choice="selectedPhrase"
          :options="connectorContent"
          :connector-i-d="connectorID"
          :parent-i-d="parent"
          :index="2"
          @change-link-word="handleLinkWordChange"
        />
      </div>
      <!-- 
      <button @click="showInfo">Info</button> -->
    </div>
  </div>
</template>

<script>
import RenderStatement from "@/components/RenderStatement.vue";
import ConnectorContextMenu from "@/components/ConnectorContextMenu.vue";

export default {
  name: "Connector",
  components: { ConnectorContextMenu, RenderStatement },
  emits: [
    "droppedAstat",
    "droppedBstat",
    "delete-connector",
    "delete-child-connector",
    "delete-statement",
    "droppedAconn",
    "droppedBconn",
    "update-connector-content",
    "linkWordChanged",
    "update-stat-data",
    "setDraggedItem",
    "delDroppedItem",
    "update-child-connector-content",
    "update-child-stat",
  ],
  props: {
    connectorContentID: Number,
    connectorContent: Object,
    selectedPhrase: Number,

    rootConnectorID: Number,
    connectorID: Number,
    parent: Number,
    leftID: Number,
    leftType: String,
    leftContent: String,
    rightID: Number,
    rightType: String,
    rightContent: String,
    conntop: Number,
    connleft: Number,
    connectorRelationships: Object,
    allConnectors: Object,
    allStatements: Object,
    clickCount: Number,
  },
  data() {
    return {
      // Read the current link word and record left and right text
      currConnectorContent: {},
      acontent: null,
      aindex: -1,
      bcontent: null,
      bindex: -1,
      word: null,
      contentTextAll: null, // Record the contents in children and in itself
      // clickCountInConn: 0,
      connectorFlexDirection: 'row',
    };
  },
  computed: {
    getCollapseExpandIcon(){
      return (this.clickCount % 2 === 0) ? 'src/assets/collapse_icon.png' : 'src/assets/expand_icon.png';
    }
  },
  methods: {
    // Get the statement property inside the connector
    onMousedown(type) {
      let item = null;
      if (type === "rightType") {
        item = this.allStatements[this.rightID];
      } else if (type === "leftType") {
        item = this.allStatements[this.leftID];
      }
      let parent = this.$parent;
      while (parent.$options.name !== "AnswerArea") {
        parent = parent.$parent;
      }

      // this.$emit()
    },

    // delDroppedItem() {
    //     this.$emit('delDroppedItem', this.moveItem)
    // },

    handleLinkWordChange(info) {
      const newChoice = info[1];
      this.currConnectorContent = JSON.parse(
        JSON.stringify(this.connectorContent[newChoice])
      );

      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ""
          : this.currConnectorContent[0]) +
        (this.acontent === null ? "" : this.acontent) +
        (this.currConnectorContent[1] === null
          ? ""
          : this.currConnectorContent[1]) +
        (this.bcontent === null ? "" : this.bcontent) +
        (this.currConnectorContent[2] === null
          ? ""
          : this.currConnectorContent[2]);

      // DEBUG
      // console.log(this.contentTextAll)

      this.$emit("linkWordChanged", info);
    },

    handleChildLinkWordChange(info) {
      this.$emit("linkWordChanged", info);
    },

    startDragConnector(e) {
      e.stopImmediatePropagation();
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "data",
        JSON.stringify({
          connectorContentID: this.connectorContentID,
          connectorContent: this.connectorContent,
          selectedPhrase: this.selectedPhrase,
          connectorID: this.connectorID,
          parentID: this.parent,
        })
      );

      console.log("Connector started dragging! Data:", {
        connectorContentID: this.connectorContentID,
        connectorContent: this.connectorContent,
        selectedPhrase: this.selectedPhrase,
        connectorID: this.connectorID,
      });

      e.dataTransfer.setData("type", "connector");
      // Pass the contained content texts
      e.dataTransfer.setData("content", this.contentTextAll);

      // Pass the click offset
      const mmConnBox = this.$refs.mmConnBox;
      console.log("\n\n##########const mmConnBox = ", mmConnBox);
      var rect = mmConnBox.getBoundingClientRect();
      const grabOffsetLeft = e.clientX - rect.left;
      const grabOffsetTop = e.clientY - rect.top;
      console.log(
        "startDragConnector grab Offset =",
        grabOffsetLeft,
        grabOffsetTop
      );
      e.dataTransfer.setData("grabOffsetLeft", grabOffsetLeft.toString());
      e.dataTransfer.setData("grabOffsetTop", grabOffsetTop.toString());

      const currentX = e.clientX;
      const currentY = e.clientY;
      const currentConnectorX = e.target.offsetLeft;
      const currentConnectorY = e.target.offsetTop;

      const dragListener = (e) => {
        const newConnectorX = currentConnectorX + e.clientX - currentX;
        const newConnectorY = currentConnectorY + e.clientY - currentY;
        e.target.style.left = newConnectorX + "px";
        e.target.style.top = newConnectorY + "px";
      };
      document.addEventListener("drag", dragListener);
      const dragEndListener = () => {
        document.removeEventListener("drag", dragListener);
      };
      e.target.addEventListener("dragend", dragEndListener);
    },

    onDrop(e, side) {
      e.stopImmediatePropagation();

      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));
      console.log("dropped data: ", data);
      // Receive the content text from the dropped object
      const transContent = e.dataTransfer.getData("content");

      // // remove the dragged statements
      //  this.$emit('setDraggedItem', null)
      // //Store the dropped element's data to the sessionStorage
      // sessionStorage.setItem("users",  JSON.stringify(data.id) )
      // // console.log(this.moveItem)
      // if (this.moveItem) {
      //     this.$emit('delDroppedItem', this.moveItem)
      // }

      if (side === "a" && type === "statement") {
        const statementID = data.id;
        // this.$emit('droppedAstat', [this.connectorID, statementID])

        // Update content
        this.acontent = transContent;
        // this.leftContent = transContent
        this.contentTextAll =
          (this.currConnectorContent[0] === null
            ? ""
            : this.currConnectorContent[0]) +
          this.acontent +
          (this.currConnectorContent[1] === null
            ? ""
            : this.currConnectorContent[1]) +
          (this.bcontent === null ? "" : this.bcontent) +
          (this.currConnectorContent[2] === null
            ? ""
            : this.currConnectorContent[2]);
        // console.log(this.contentTextAll)

        this.$emit("droppedAstat", [
          this.connectorID,
          statementID,
          transContent,
        ]);
      } else if (side === "b" && type === "statement") {
        const statementID = data.id;
        this.$emit("droppedBstat", [
          this.connectorID,
          statementID,
          transContent,
        ]);

        // Update Connector content
        this.bcontent = transContent;
        this.contentTextAll =
          (this.currConnectorContent[0] === null
            ? ""
            : this.currConnectorContent[0]) +
          (this.acontent === null ? "" : this.acontent) +
          (this.currConnectorContent[1] === null
            ? ""
            : this.currConnectorContent[1]) +
          this.bcontent +
          (this.currConnectorContent[2] === null
            ? ""
            : this.currConnectorContent[2]);
      } else if (side === "a" && type === "connector") {
        this.acontent = transContent;
        this.contentTextAll =
          (this.currConnectorContent[0] === null
            ? ""
            : this.currConnectorContent[0]) +
          this.acontent +
          (this.currConnectorContent[1] === null
            ? ""
            : this.currConnectorContent[1]) +
          (this.bcontent === null ? "" : this.bcontent) +
          (this.currConnectorContent[2] === null
            ? ""
            : this.currConnectorContent[2]);

        this.$emit("droppedAconn", [this.connectorID, data, transContent]);
      } else if (side === "b" && type === "connector") {
        this.bcontent = transContent;
        this.contentTextAll =
          (this.currConnectorContent[0] === null
            ? ""
            : this.currConnectorContent[0]) +
          (this.acontent === null ? "" : this.acontent) +
          (this.currConnectorContent[1] === null
            ? ""
            : this.currConnectorContent[1]) +
          this.bcontent +
          (this.currConnectorContent[2] === null
            ? ""
            : this.currConnectorContent[2]);

        this.$emit("droppedBconn", [this.connectorID, data, transContent]);
      }
    },

    handleAStatementDrop(info) {
      // console.log("passing data up")
      this.$emit("droppedAstat", info);
    },

    handleBStatementDrop(info) {
      // console.log("passing data up")
      this.$emit("droppedBstat", info);
    },

    handleAConnectorDrop(info) {
      this.$emit("droppedAconn", info);
    },

    handleBConnectorDrop(info) {
      this.$emit("droppedBconn", info);
    },

    showInfo() {
      console.log("connectorID", this.connectorID);
      console.log("leftType", this.leftType);
      console.log("leftID", this.leftID);
      console.log("rightType", this.rightType);
      console.log("rightID", this.rightID);
      this.$forceUpdate();
    },

    handleUpdateStatContentA(info) {
      this.acontent = info[0];
      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ""
          : this.currConnectorContent[0]) +
        this.acontent +
        (this.currConnectorContent[1] === null
          ? ""
          : this.currConnectorContent[1]) +
        (this.bcontent === null ? "" : this.bcontent) +
        (this.currConnectorContent[2] === null
          ? ""
          : this.currConnectorContent[2]);

      const newStatData = info[1];
      this.$emit("update-stat-data", newStatData);
      this.$emit("update-child-stat", [
        this.connectorID,
        this.acontent,
        "left",
      ]);
    },

    handleUpdateStatContentB(info) {
      this.bcontent = info[0];
      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ""
          : this.currConnectorContent[0]) +
        (this.acontent === null ? "" : this.acontent) +
        (this.currConnectorContent[1] === null
          ? ""
          : this.currConnectorContent[1]) +
        this.bcontent +
        (this.currConnectorContent[2] === null
          ? ""
          : this.currConnectorContent[2]);

      const newStatData = info[1];
      this.$emit("update-stat-data", newStatData);
      this.$emit("update-child-stat", [
        this.connectorID,
        this.bcontent,
        "right",
      ]);
    },

    handleStatDataChange(info) {
      this.$emit("update-stat-data", info);
    },

    handleUpdateChildStat(info) {
      this.$emit("update-child-stat", info);
    },

    handleUpdateConnectorContentA(info) {
      const currConnectID = info[0];
      this.acontent = info[1];

      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ""
          : this.currConnectorContent[0]) +
        this.acontent +
        (this.currConnectorContent[1] === null
          ? ""
          : this.currConnectorContent[1]) +
        (this.bcontent === null ? "" : this.bcontent) +
        (this.currConnectorContent[2] === null
          ? ""
          : this.currConnectorContent[2]);

      this.$emit("update-child-connector-content", [
        currConnectID,
        this.acontent,
        this.connectorID,
        "left",
      ]);
    },

    handleUpdateConnectorContentB(info) {
      const currConnectID = info[0];
      this.bcontent = info[1];
      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ""
          : this.currConnectorContent[0]) +
        (this.acontent === null ? "" : this.acontent) +
        (this.currConnectorContent[1] === null
          ? ""
          : this.currConnectorContent[1]) +
        this.bcontent +
        (this.currConnectorContent[2] === null
          ? ""
          : this.currConnectorContent[2]);

      this.$emit("update-child-connector-content", [
        currConnectID,
        this.bcontent,
        this.connectorID,
        "right",
      ]);
    },

    handleUpdateChildClickCount(info) {
      this.$emit("update-click-count", info);
    },

    handleUpdateChildConnector(info) {
      this.$emit("update-child-connector-content", info);
    },

    displayFormChanged() {
      // this.clickCountInConn = this.clickCountInConn + 1
      this.$emit("update-click-count", this.connectorID);

      if (this.clickCount % 2 === 0) {
        this.acontent =
          this.allConnectors[this.connectorID].leftContent === undefined
            ? "[A]"
            : this.allConnectors[this.connectorID].leftContent;
        this.bcontent =
          this.allConnectors[this.connectorID].rightContent === undefined
            ? "[B]"
            : this.allConnectors[this.connectorID].rightContent;
        this.contentTextAll =
          (this.currConnectorContent[0] === null
            ? ""
            : this.currConnectorContent[0]) +
          this.acontent +
          (this.currConnectorContent[1] === null
            ? ""
            : this.currConnectorContent[1]) +
          this.bcontent +
          (this.currConnectorContent[2] === null
            ? ""
            : this.currConnectorContent[2]);
      }
    },
    initContent() {
      this.currConnectorContent = JSON.parse(
        JSON.stringify(this.connectorContent[this.selectedPhrase])
      );
      // this.acontent = this.allConnectors[this.connectorID].leftContent
      // this.acontent = (this.allConnectors[this.connectorID].leftContent === undefined ?
      //                 "" : this.allConnectors[this.connectorID].leftContent)
      // this.bcontent = this.allConnectors[this.connectorID].rightContent
      if (this.allConnectors !== undefined) {
        this.acontent =
          this.allConnectors[this.connectorID].leftContent === undefined
            ? "[A]"
            : this.allConnectors[this.connectorID].leftContent;
        this.bcontent =
          this.allConnectors[this.connectorID].rightContent === undefined
            ? "[B]"
            : this.allConnectors[this.connectorID].rightContent;
        this.contentTextAll =
          (this.currConnectorContent[0] === null
            ? ""
            : this.currConnectorContent[0]) +
          // + (this.acontent === null ? "" : this.acontent)
          this.acontent +
          (this.currConnectorContent[1] === null
            ? ""
            : this.currConnectorContent[1]) +
          // + (this.bcontent === null ? "" : this.bcontent)
          this.bcontent +
          (this.currConnectorContent[2] === null
            ? ""
            : this.currConnectorContent[2]);
        this.word = this.connectorContent[this.selectedPhrase].join("");
      }

      // this.clickCountInConn = this.clickCount === undefined ? 0 : this.clickCount
      // console.log(this.currConnectorContent.length)
    },
    deleteChildConnector({ id, parentId, position = "" }) {
      // Emit an event to the parent component indicating that this connector should be deleted
      this.$emit("delete-child-connector", { id, parentId, position });
    },

    deleteConnector({ id }) {
      // Emit an event to the parent component indicating that this connector should be deleted
      this.$emit("delete-connector", { id });
    },
    rotateConnector({ id }) {
      // Emit an event to the parent component indicating that this connector should be deleted
      //this.$el.querySelector('.connectorBox').style.flexDirection = 'column';
      this.connectorFlexDirection = this.connectorFlexDirection === 'row' ? 'column' : 'row';
      
    },
    deleteStatement({ id, parentId = this.connectorID, position = "" }) {
      // Emit an event to the parent component indicating that this connector should be deleted
      this.$emit("delete-statement", { id, parentId, position });
    },
  },
  watch: {
    // Pass new content texts once there are changes
    contentTextAll(newConnectorContent) {
      console.log("Content changed");
      this.$emit("update-connector-content", [
        this.connectorID,
        newConnectorContent,
      ]);
    },
    //
    // leftID(newID) {
    //     console.log("LHS has been updated! Connector ID: ", this.connectorID)
    //     console.log("New LHS data: ", newID)
    // },
    //
    // rightID(newID) {
    //     console.log("RHS has been updated! Connector ID: ", this.connectorID)
    //     console.log("New RHS data: ", newID)
    // },

    connectorID(newValue, oldValue) {
      console.log("connectorID changed!", oldValue, "to", newValue);
      this.initContent();
    },

    leftContent(newValue, oldValue) {
      console.log("leftContent changed!", oldValue, "to", newValue);

      this.acontent =
        this.allConnectors[this.connectorID].leftContent === undefined
          ? "[A]"
          : this.allConnectors[this.connectorID].leftContent;
      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ""
          : this.currConnectorContent[0]) +
        this.acontent +
        (this.currConnectorContent[1] === null
          ? ""
          : this.currConnectorContent[1]) +
        this.bcontent +
        (this.currConnectorContent[2] === null
          ? ""
          : this.currConnectorContent[2]);
    },

    rightContent(newValue, oldValue) {
      console.log("rightContent changed!", oldValue, "to", newValue);
      this.bcontent =
        this.allConnectors[this.connectorID].rightContent === undefined
          ? "[B]"
          : this.allConnectors[this.connectorID].rightContent;
      this.contentTextAll =
        (this.currConnectorContent[0] === null
          ? ""
          : this.currConnectorContent[0]) +
        (this.acontent === null ? "" : this.acontent) +
        (this.currConnectorContent[1] === null
          ? ""
          : this.currConnectorContent[1]) +
        this.bcontent +
        (this.currConnectorContent[2] === null
          ? ""
          : this.currConnectorContent[2]);
    },
  },
  created() {
    // this.currConnectorContent = JSON.parse(JSON.stringify(this.connectorContent[this.selectedPhrase]));
    // // console.log("test current connector content", this.connectorContent)
    // // this.acontent = this.allConnectors[this.connectorID].leftContent
    // // this.acontent = (this.allConnectors[this.connectorID].leftContent === undefined ?
    // //                 "" : this.allConnectors[this.connectorID].leftContent)
    // // this.bcontent = this.allConnectors[this.connectorID].rightContent
    if (this.allConnectors == undefined) {
      //     this.acontent = (this.allConnectors[this.connectorID].leftContent === undefined ?
      //                     "[A]" : this.allConnectors[this.connectorID].leftContent)
      //     this.bcontent = (this.allConnectors[this.connectorID].rightContent === undefined ?
      //                     "[B]" : this.allConnectors[this.connectorID].rightContent)
      //     this.contentTextAll =  (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
      //             // + (this.acontent === null ? "" : this.acontent)
      //             + this.acontent
      //             + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
      //             // + (this.bcontent === null ? "" : this.bcontent)
      //             + this.bcontent
      //             + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
      //     this.word = this.connectorContent[this.selectedPhrase].join("")
      this.contentTextAll =
        "[A]" + this.connectorContent[this.selectedPhrase].join("") + "[B]";
    }
    this.initContent();
  },
};
</script>

<style scoped>
/* CSS for each of the connector */


.connectorContainer {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  flex-basis: auto;
  /* TODO: These will need to be modified to have dynamic sizes */
  width: fit-content;
  min-width: 160px;
  min-height: 80px;
  margin-bottom: 10px;
  align-items: center;
  border-radius: 6px;
  border: 1px solid black;
  background-color: rgb(228, 228, 228);
  padding: 0px 5px;
}

.connectorBox {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  justify-content: space-around;
}
.onlyText {
  background-color: rgb(236, 236, 236);
  max-width: 250px;
  overflow-wrap: break-word;
}

.connector-sections {
  display: flex;
  padding: 10px;
  border: 2px black;
  height: 100%;
}

.connectorMenu {
  font-weight: bold;
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  border: 1px solid black;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

.tooltiptext {
  top: 105%;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}

.delete-button {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}
.connectorButton {
}
</style>
