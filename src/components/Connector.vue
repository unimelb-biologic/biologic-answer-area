<template>

  <div class="connectorContainer" :style="{ left: connleft + 'px', top: conntop + 'px' }" ref="connectorContainerRef"
    draggable="true" @dragstart="startDragConnector" @drop="onDrop($event, 'x')" @dragend="endDragConnector">

    <FeedbackRubric :isVisible=showFeedback :exnetID=connectorID :isConnector=true />
    <div v-if="this.parent !== undefined" class="buttons-container">

      <Tooltip text="Collapse">
        <v-btn icon size="xx-small" v-if="this.clickCount % 2 === 0" @click="displayFormChanged" class="connectorButton">
          <v-icon>mdi-arrow-collapse</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip text="Expand">
        <v-btn icon size="xx-small" v-if="this.clickCount % 2 === 1" @click="displayFormChanged" class="connectorButton">
          <v-icon>mdi-arrow-expand</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip text="Show Feedback">
        <v-btn  icon size="xx-small" v-if="isFeedbackAvailable" @click="showFeedback = !showFeedback" class="connectorButton">
          <v-icon>mdi-comment-quote</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip :text="deleteButtonTooltipText">
        <v-btn v-if="!displayOnly" :disabled="!hasNoChildren" icon size="xx-small" @click="deleteConnector({ id: connectorID })" class="connectorButton">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </Tooltip>
    </div>

    <div class="onlyText" v-if="clickCount % 2 === 1">
      <!-- TODO: The drag function need polish(or just drop this function) -->
      {{ this.contentTextAll }}
    </div>
    <div class="connectorBox" v-if="clickCount % 2 === 0 || clickCount === undefined"
      :style="{ flexDirection: orientation }">
      <div class="connectorText" v-if="connectorContent[selectedPhrase][0]">
        <ConnectorContextMenu v-if="!displayOnly" :choice="selectedPhrase" :options="connectorContent" :connector-i-d="connectorID"
          :parent-i-d="parent" :index="0" @change-link-word="handleLinkWordChange" />
      </div>

      <!-- the left section -->
      <!-- in the order of empty, statement, connector -->
      <!-- TODO: implement connector -->
      <div class="tooltip">
        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.leftType === undefined" @drop="onDrop($event, 'a')" 
          @dragover.prevent
          @dropped-aconn="handleAConnectorDrop" 
          @dropped-bconn="handleBConnectorDrop"
          @dropped-astat="handleAStatementDrop" 
          @dropped-bstat="handleBStatementDrop">

          <Tooltip text="This is a target box. Drop a Statement or Network here.">
            <div v-if="this.connectorContentID==2" class="connector-a-picture-parent" ref="targetBoxRefLeft"
              @dragover.prevent = "this.parent!==undefined ? handleDragOver : null"
              @dragleave.prevent="this.parent!==undefined ? handleDragLeaveTargetBoxLeft($event) : null"
              @dragenter.prevent="this.parent!==undefined ? handleDragEnterTargetBoxLeft($event) : null">
              
              <v-icon color="grey lighten-1" class="image-target-icon">mdi-image-outline</v-icon>
            
            </div>

            <div v-else class="connector-target-box" ref="targetBoxRefLeft" 
              @dragover.prevent = "this.parent!==undefined ? handleDragOver : null"
              @dragleave.prevent="this.parent!==undefined ? handleDragLeaveTargetBoxLeft($event) : null"
              @dragenter.prevent="this.parent!==undefined ? handleDragEnterTargetBoxLeft($event) : null">
              <!-- just to provide the inner box -->
              
              <!--v-icon color="grey lighten-1" size="small">mdi-crosshairs-question</v-icon-->
              
            
            </div>
          </Tooltip>
        </div>

        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.leftType === 'statement'">
          <RenderStatement ref="leftChildRenderStatement"  :statement-data="this.allStatements[this.leftID]" :showToggle="true"
            @update-statement-content="handleUpdateStatContentA" @mousedown="onMousedown('leftType')"
            @duplicate-statement="duplicateStatement" @connector-dropped-on-statement="connectorDroppedOnStatement"
            @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
            @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement" />
        </div>
        <!--                    <span class="tooltiptext" v-if="this.leftID !== undefined">Drag to recycle bin to remove</span>-->

        <div class="connector-sections" v-if="this.leftType === 'connector'">
          <Connector ref="leftChildConnector" :connector-i-d="this.leftID" :connector-content-i-d="
              allConnectors[this.leftID].connectorContentID
            " :connector-content="allConnectors[this.leftID].connectorContent" :all-statements="this.allStatements"
            :all-connectors="this.allConnectors" :rootConnectorID="rootConnectorID"
            :parent="allConnectors[this.leftID].parent" :left-i-d="allConnectors[this.leftID].leftID"
            :left-type="allConnectors[this.leftID].leftType" :left-content="allConnectors[this.leftID].leftContent"
            :right-i-d="allConnectors[this.leftID].rightID" :right-type="allConnectors[this.leftID].rightType"
            :right-content="allConnectors[this.leftID].rightContent"
            :click-count="allConnectors[this.leftID].clickCount" :orientation="allConnectors[this.leftID].orientation"
            :selected-phrase="allConnectors[this.leftID].selectedPhrase" @delete-connector="
              deleteChildConnector({
                id: this.leftID,
                parentId: this.connectorID,
                position: 'left',
              })
            " @delete-child-connector="deleteChildConnector" 
            @dropped-aconn="handleAConnectorDrop" @dropped-bconn="handleBConnectorDrop"
            @dropped-astat="handleAStatementDrop" @dropped-bstat="handleBStatementDrop"
            @link-word-changed="handleChildLinkWordChange" @update-connector-content="handleUpdateConnectorContentA"
            @toggle-orientation="handleToggleOrientation" @update-click-count="handleUpdateChildClickCount"
            @update-child-connector-content="handleUpdateChildConnector" @update-child-stat="handleUpdateChildStat"
            @new-connector-dropped-on-connector="handleNewConnectorDroppedOnConnector"
            @connector-dropped-on-statement="connectorDroppedOnStatement" @duplicate-statement="duplicateStatement"
            @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
            @toggle-collapsed-renderstatement-from-connector="toggleCollapsedRenderStatementFromConnector" />

        </div>
      </div>

      <div class="connectorTextContainerNew">
        <Tooltip text="change orientation to horizontal or vertical">
          <v-btn size="xx-small" v-if="this.clickCount % 2 === 0" @click="handleToggleOrientation({ id: connectorID })"
            class="connectorButton">
            <img class="rotate-button" src="../assets/rotate_icon.png" alt="Rotate" width="20" />
          </v-btn>
        </Tooltip>
        <p class="connectorText">{{ connectorContent[selectedPhrase][1] }}</p>
        <Tooltip :text=" `Change phrase used. CLICK TO SEE OPTION.`">
          <div class="connectorMenu" v-if="connectorContent[selectedPhrase][1]">
            <ConnectorContextMenu v-if="!displayOnly" :choice="selectedPhrase" :options="connectorContent" :connector-i-d="connectorID"
              :parent-i-d="parent" :index="1" @change-link-word="handleLinkWordChange" />
          </div>
        </Tooltip>
      </div>


      <!-- the right section -->
      <!-- in the order of empty, statement, connector -->
      <!-- TODO: implement connector -->
      <div class="tooltip">
        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.rightType === undefined" @drop="onDrop($event, 'b')"
          @dragover.prevent 
          @dragenter.prevent 
          @dropped-aconn="handleAConnectorDrop"
          @dropped-bconn="handleBConnectorDrop" 
          @dropped-astat="handleAStatementDrop"
          @dropped-bstat="handleBStatementDrop">
          <Tooltip text="This is a target box. Drop a Statement or Network on here.">
            <div class="connector-target-box" ref="targetBoxRefRight" 
              @dragover.prevent="this.parent!==undefined ? handleDragOver : null"
              @dragleave.prevent="this.parent!==undefined ? handleDragLeaveTargetBoxRight($event) : null"
              @dragenter.prevent="this.parent!==undefined ? handleDragEnterTargetBoxRight($event) : null">
              <!-- just to provide the inner box -->
              <!--v-icon color="grey lighten-1" size="small">mdi-crosshairs-question</v-icon-->
              
            </div>
          </Tooltip>

        </div>

        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.rightType === 'statement'">
          <RenderStatement ref="rightChildRenderStatement"  :statement-data="this.allStatements[this.rightID]" :showToggle="true"
            @update-statement-content="handleUpdateStatContentB" @mousedown="onMousedown('rightType')"
            @connector-dropped-on-statement="connectorDroppedOnStatement" @duplicate-statement="duplicateStatement"
            @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
            @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement" />
        </div>

        <!-- <span class="tooltiptext" v-if="this.b !== null">Drag to recycle bin to remove</span> -->
        <div class="connector-sections" v-if="this.rightType === 'connector'">
          <Connector ref="rightChildConnector" :connector-i-d="this.rightID" :connector-content-i-d="
              allConnectors[this.rightID].connectorContentID
            " :connector-content="allConnectors[this.rightID].connectorContent" :all-statements="this.allStatements"
            :all-connectors="this.allConnectors" :parent="allConnectors[this.rightID].parent"
            :left-i-d="allConnectors[this.rightID].leftID" :left-type="allConnectors[this.rightID].leftType"
            :left-content="allConnectors[this.rightID].leftContent" :right-i-d="allConnectors[this.rightID].rightID"
            :right-type="allConnectors[this.rightID].rightType"
            :right-content="allConnectors[this.rightID].rightContent"
            :click-count="allConnectors[this.rightID].clickCount" :orientation="allConnectors[this.rightID].orientation"
            :selected-phrase="allConnectors[this.rightID].selectedPhrase" :rootConnectorID="rootConnectorID"
            @delete-connector="
              deleteChildConnector({
                id: this.rightID,
                parentId: this.connectorID,
                position: 'right',
              })
            " @delete-child-connector="deleteChildConnector"
            @dropped-aconn="handleAConnectorDrop" @dropped-bconn="handleBConnectorDrop"
            @dropped-astat="handleAStatementDrop" @dropped-bstat="handleBStatementDrop"
            @link-word-changed="handleChildLinkWordChange" @update-connector-content="handleUpdateConnectorContentB"
            @update-click-count="handleUpdateChildClickCount" @toggle-orientation="handleToggleOrientation"
            @update-child-connector-content="handleUpdateChildConnector" @update-child-stat="handleUpdateChildStat"
            @new-connector-dropped-on-connector="handleNewConnectorDroppedOnConnector"
            @connector-dropped-on-statement="connectorDroppedOnStatement" @duplicate-statement="duplicateStatement"
            @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
            @toggle-collapsed-renderstatement-from-connector="toggleCollapsedRenderStatementFromConnector" />
        </div>
      </div>

      <div class="connectorText" v-if="connectorContent[selectedPhrase][2]">
        <ConnectorContextMenu v-if="!displayOnly" :choice="selectedPhrase" :options="connectorContent" :connector-i-d="connectorID"
          :parent-i-d="parent" :index="2" @change-link-word="handleLinkWordChange" />
      </div>
      <!-- 
      <button @click="showInfo">Info</button> -->
    </div>
  </div>

</template>

<script>
import RenderStatement from "@/components/RenderStatement.vue"; 
import ConnectorContextMenu from "@/components/ConnectorContextMenu.vue";
import FeedbackRubric from "@/components/FeedbackRubric.vue";
import Tooltip from "@/components/Tooltip.vue";
import "@/assets/biologic.css";
import { registerRuntimeCompiler } from "vue";

export default {
  name: "Connector",
  components: { ConnectorContextMenu, RenderStatement, FeedbackRubric, Tooltip },
  inject : ['isFeedbackAvailable', 'showAllFeedback', 'globalTooltipState','displayOnly'],
  emits: [
    "droppedAstat",
    "droppedBstat",
    "delete-connector",
    "delete-child-connector",
    "droppedAconn",
    "droppedBconn",
    "update-connector-content",
    "linkWordChanged",
    "update-stat-data",
    "delDroppedItem",
    "update-child-connector-content",
    "update-child-stat",
    "toggle-orientation",
    "new-connector-dropped-on-connector",
    "duplicate-statement",
    "toggle-collapsed-renderstatement-from-connector",
    "toggle-showPopup-fromconnector",
    "connector-dropped-on-statement",
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
    orientation: String,
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
      showFeedback: false
    };
  },
  computed: { 
    deleteButtonTooltipText(){
      if (this.leftID===undefined && this.rightID===undefined)
        return "Delete Connector";
      else
        return "Delete Connector. DISABLED. Remove child elements to enable."
    },
    hasNoChildren(){
      return this.leftID===undefined && this.rightID===undefined;
    },
    getCollapseExpandIcon(){
      return (this.clickCount % 2 === 0) ? 'src/assets/collapse_icon.png' : 'src/assets/expand_icon.png';
    },
    bulletPointList() {
      // Extract second elements and join them with newlines
      return this.connectorContent
        .map(item => item[1]) // Get the second element
        .filter(Boolean) // Filter out null or undefined
        .join('\n'); // Join with newline
    },
  },
  methods: {

    duplicateStatement(id)
    {
        // emission from either a child RenderStatement or a Connector.
        // just pass this on up the tree for the AnswerArea to deal with
        globalConsoleLog("conn","Connector:duplicateStatement")
        this.$emit("duplicate-statement", id);
    },
    toggleCollapsedRenderStatement(id){
        // emission from  a child RenderStatement.
        // just pass this on up the tree for the AnswerArea to deal with
        globalConsoleLog("conn","Connector:toggleCollapsedRenderStatementFromRenderStatement")
        this.$emit("toggle-collapsed-renderstatement-from-connector", id);
    },
    toggleCollapsedRenderStatementFromConnector(id){
        // emission from  a child Connector.
        // just pass this on up the tree for the AnswerArea to deal with
        globalConsoleLog("conn","Connector:toggleCollapsedRenderStatementFromConnector")
        this.$emit("toggle-collapsed-renderstatement-from-connector", id);
    },
    toggleShowPopupFromRenderStatement(id){
        // emission from  a child RenderStatement .
        // just pass this on up the tree for the parent Connector OR AnswerArea to deal with
        globalConsoleLog("conn","Connector:toggleShowPopupFromRenderStatement emitting toggle-showPopup-fromconnector")
        this.$emit("toggle-showPopup-fromconnector", id);
    },
    toggleShowPopupFromConnector(id){
        // emission from  a child Connector .
        // just pass this on up the tree for the parent Connector OR AnswerArea to deal with
        globalConsoleLog("conn","Connector:toggleShowPopupFromConnector emitting toggle-showPopup-fromconnector")
        this.$emit("toggle-showPopup-fromconnector", id);
    },
    connector1IsInTreeOfconnector2( conn1, conn2 ){
      // if left OR right side is a connector call recursively
      let inLeftTree = false;
      globalConsoleLog("conn","connector1IsInTreeOfconnector2: is conn1=",conn1,"  in the tree of conn2=",conn2);
      if (this.allConnectors[conn2]["leftType"]=="connector") {
        const leftConnID = this.allConnectors[conn2]["leftID"];
        globalConsoleLog("conn","leftside type=",this.allConnectors[conn2]["leftType"]," connID=",leftConnID);
        inLeftTree = (
            (leftConnID!==undefined) && 
            ((conn1===leftConnID) || this.connector1IsInTreeOfconnector2(conn1,leftConnID))
            );
      }
      let inRightTree = false;
      if (this.allConnectors[conn2]["rightType"]=="connector") {
        const rightConnID = this.allConnectors[conn2]["rightID"];
        globalConsoleLog("conn","rightside type=",this.allConnectors[conn2]["rightType"]," connID=",rightConnID);
        inRightTree = (
          (rightConnID!==undefined) && 
          ((conn1===rightConnID) ||this.connector1IsInTreeOfconnector2(conn1,rightConnID))
        );
      }
      const finalResult = inLeftTree || inRightTree;
      globalConsoleLog("conn"," FINAL result = inLeftTree=",inLeftTree," || inRightTree=",inRightTree," =>",finalResult);
      return finalResult;
    },
    dropIsPermissible(connectorBeingDroppedOn,connectorBeingDropped) {
      globalConsoleLog("conn","checking if ",connectorBeingDropped," can be dropped on ",connectorBeingDroppedOn);
      if (connectorBeingDroppedOn === connectorBeingDropped) {
        globalConsoleLog("conn","theyre the same, so NO");
        return false;
      } else {
        globalConsoleLog("conn","check inTree");
        const inTree = this.connectorBeingDropped !== undefined &&
                       this.connector1IsInTreeOfconnector2(connectorBeingDroppedOn,connectorBeingDropped);
        globalConsoleLog("conn","inTree = ",inTree);
        return ! inTree;
      }
    },
    connectorDroppedOnStatement( info )
    {
      globalConsoleLog("conn","Connector:connectorDroppedOnStatement");
      // pass it up the chain and let the AnswerArea deal with it
      this.$emit("connector-dropped-on-statement", info ); 
    },
    decodeDragInformation(event)
    { 
      //  the DnD spec says that during a drag, the drag data store mode is protected mode.
      // this means you can see the types but not the values. So the workaround is to encode the values into the type names.
      const types = Array.from(event.dataTransfer.types);
      globalConsoleLog("conn","TYPES = ",types);
      const widthType = types.find((type) => type.startsWith("draggedwidth"));
      const heightType = types.find((type) => type.startsWith("draggedheight"));
      const typeType = types.find((type) => type.startsWith("draggedtype"));
      const connectorIDType = types.find((type) => type.startsWith("draggedconnectorid"));
      const dragWidthStr = widthType ? widthType.split("/")[1] : null;
      const dragHeightStr = heightType ? heightType.split("/")[1] : null;
      const dragTypeStr = typeType ? typeType.split("/")[1] : null;
      const dragConnectorIDStr = connectorIDType ? connectorIDType.split("/")[1] : null;

      globalConsoleLog("conn","DRAG DATA = ",dragWidthStr,dragHeightStr,dragTypeStr,dragConnectorIDStr);

      const dragInformation = {draggedWidth:dragWidthStr,
        draggedHeight:dragHeightStr,
        drageeType:dragTypeStr,
        drageeConnectorID:dragConnectorIDStr};

      return dragInformation;
    },
    handleDragOver(event) {
      event.preventDefault(); // Allow drop
    },
    handleDragEnterTargetBoxLeft(event){
      globalConsoleLog("conn","Connector:handleDragEnterTargetBoxLeft----------event=",event);
      const dragInformation = this.decodeDragInformation(event);
      if (dragInformation.drageeType==="connector") 
      {
        if (this.dropIsPermissible(this.connectorID,dragInformation.drageeConnectorID)) {
          globalConsoleLog("conn","DROP IS PERMISSIBLE");
        } else {
          globalConsoleLog("conn","DROP IS NOT PERMISSIBLE");
          return;
        }
      }
//      globalConsoleLog("conn","EVENT=",event);
      event.preventDefault();
      var draggedElement = event.currentTarget;
      const targetRef = this.$refs.targetBoxRefLeft;
      // Set the size of the dragged element
      const widthStr = dragInformation.draggedWidth + 'px';
      const heightStr = dragInformation.draggedHeight + 'px';
      targetRef.style.width = widthStr;
      targetRef.style.height = heightStr;
      targetRef.style.border = '10px solid green';

//      const connectorContainer = this.$refs.connectorContainerRef;
//      connectorContainer.classList.add('drag-over');
    },
    handleDragLeaveTargetBoxLeft(event){
      globalConsoleLog("conn","Connector:handleDragLeaveTargetBoxLeft***********");
      event.preventDefault();
      const targetRef = this.$refs.targetBoxRefLeft;
      targetRef.style.width = 20 + 'px';
      targetRef.style.height = 20 + 'px';
      targetRef.style.border = '';
    }, 
    handleDragEnterTargetBoxRight(event)
    {
      globalConsoleLog("conn","Connector:handleDragEnterTargetBoxRight----------event=",event);
      
      const dragInformation = this.decodeDragInformation(event);

      globalConsoleLog("conn",'Draginformation:', dragInformation);

      if (dragInformation.drageeType==="connector") {
        if (this.dropIsPermissible(this.connectorID,dragInformation.drageeConnectorID)) {
          globalConsoleLog("conn","DROP IS PERMISSIBLE");
        } else {
          globalConsoleLog("conn","DROP IS NOT PERMISSIBLE");
          return;
        }
      }

//      globalConsoleLog("conn","EVENT=",event);
      event.preventDefault();
      var draggedElement = event.currentTarget;
  
      const targetRef = this.$refs.targetBoxRefRight;
      // Set the size of the dragged element
      const widthStr = dragInformation.draggedWidth + 'px';
      const heightStr = dragInformation.draggedHeight + 'px';
      targetRef.style.width = widthStr;
      targetRef.style.height = heightStr;
      targetRef.style.border = '10px solid green';
//      const connectorContainer = this.$refs.connectorContainerRef;
//      connectorContainer.classList.add('drag-over');
    },
    handleDragLeaveTargetBoxRight(event){
      globalConsoleLog("conn","Connector:handleDragLeaveTargetBoxRight***********");
      event.preventDefault();
      const targetRef = this.$refs.targetBoxRefRight;
      targetRef.style.width = 20 + 'px';
      targetRef.style.height = 20 + 'px';
      targetRef.style.border = '';
    },
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
    call_connectorString(){
      alert(this.connectorString())
    },
    connectorString() {
      let resultString = "connectorString";
      if (this.leftType === 'connector') {
        resultString = this.$refs.leftChildConnector.connectorString()+resultString;
      }
      if (this.rightType === 'connector') {
        resultString = resultString + this.$refs.rightChildConnector.connectorString();
      }
      return resultString;
    },
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
      // globalConsoleLog("conn",this.contentTextAll)

      this.$emit("linkWordChanged", info);
    },
    handleChildLinkWordChange(info) {
      this.$emit("linkWordChanged", info);
    },
    startDragConnector(e) {
      if (this.displayOnly) {
        globalConsoleLog("conn","can't drag connectors in a read only AnswerArea");
        return;
      }
      //globalConsoleLog("conn","globalTooltipState = ",this.globalTooltipState);
      this.globalTooltipState.showTooltips = false;
      this.globalTooltipState.animal="cat"

      //globalConsoleLog("conn","Connector:startDragConnector");
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

      e.dataTransfer.setData("type", "connector");
      // Pass the contained content texts
      e.dataTransfer.setData("content", this.contentTextAll);

      // Pass the click offset
      const connectorContainerRef = this.$refs.connectorContainerRef;
      var rectInViewport = connectorContainerRef.getBoundingClientRect();
      const grabOffsetLeft = e.clientX - rectInViewport.left;
      const grabOffsetTop = e.clientY - rectInViewport.top;
      e.dataTransfer.setData("grabOffsetLeft", grabOffsetLeft.toString());
      e.dataTransfer.setData("grabOffsetTop", grabOffsetTop.toString());

      // the following geometry information is used by the Target boxes in the connectors to change size dynamically.
      // However the DnD spec says that during the drag, the drag data store mode is protected mode.
      // this means you can see the types but not the values. So the workaround is to encode the values into the type names.
      const widthTypeStr = "draggedWidth/"+e.currentTarget.offsetWidth;
      e.dataTransfer.setData(widthTypeStr,0 /* i.e. the zero is a dummy value*/ );
      const heightTypeStr = "draggedHeight/"+e.currentTarget.offsetHeight;
      e.dataTransfer.setData(heightTypeStr,0 /* i.e. the zero is a dummy value*/ );
      const typeTypeStr = "draggedType/"+"connector";
      e.dataTransfer.setData(typeTypeStr,0 /* i.e. the zero is a dummy value*/ );
      const connectorIDTypeStr = "draggedConnectorID/"+this.connectorID;
      e.dataTransfer.setData(connectorIDTypeStr,0 /* i.e. the zero is a dummy value*/ );

      globalConsoleLog("conn"," SET UP DATA TRANSFER:", widthTypeStr, heightTypeStr, typeTypeStr, connectorIDTypeStr);

    },

    endDragConnector(){
      globalConsoleLog("conn","\n\n\n\n\n\nConnector::endDragConnector globalTooltipState = ",this.globalTooltipState,"\n\n\n\n\n\n\n\n\n");
      this.globalTooltipState.showTooltips=true;
      this.globalTooltipState.animal="mouse";
    },



    updateContentTextAll(){
      this.contentTextAll =
          (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0]) +
          (this.acontent === null ? "" : this.acontent) +
          (this.currConnectorContent[1] === null  ? "" : this.currConnectorContent[1]) +
          (this.bcontent === null ? "" : this.bcontent) +
          (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2]);
    },
    onDrop(e, side) {
      e.stopImmediatePropagation();

      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));
      globalConsoleLog("conn","Connector:onDrop  side:",side,"  dropped data: ", data);
      // Receive the content text from the dropped object
      const transContent = e.dataTransfer.getData("content");

      var elementWidthStr = e.dataTransfer.getData("fredWidth");
      var elementHeightStr = e.dataTransfer.getData("fredWidth");
      globalConsoleLog("conn",'Element Size Str:', elementWidthStr, 'x', elementHeightStr);

      this.$el.classList.remove('drag-over-happening');


      if (side === "a" && type === "statement") {
        const statementID = data.id;
        // Update content
        this.acontent = transContent;
        // this.leftContent = transContent
        this.updateContentTextAll()
        globalConsoleLog("conn","Connector:onDrop  emitting SIGNAL droppedAstat");

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
        this.updateContentTextAll()
      } else if (side === "a" && type === "connector") {
        this.acontent = transContent;
        this.updateContentTextAll()
        this.$emit("droppedAconn", [this.connectorID, data, transContent,e]);
      } else if (side === "b" && type === "connector") {
        this.bcontent = transContent;
        this.updateContentTextAll()
        this.$emit("droppedBconn", [this.connectorID, data, transContent,e]);
      } else if (side === "x" && type === "connector") {
        // a connector has been dropped on the body of a connector.
        //
        // we deal with two scenarios.
        // 1. if the connector is a new connector from the palette (i.e. undefined parent and no children.)
        // and it's been dropped  on a connector that is part of a tree. 
        // Then it needs to be inserted into the tree.
        //  So this connector becomes the dropped connectors childA
        // and whoever is the parent of this connector needs to become the parent of the new one.
        // since we don't know about our parent we need to send a signal upwards.
        //
        // 2. a top level connector (i.e. one with a parentID of -1, is being moved a bit and
        //    has been dropped within it's own area - i.e. onto itself or one of it's children.
        //    in this instance we just pass a signal up the tree.
        globalConsoleLog("conn","emit new-connector-dropped-on-connector");
        this.$emit("new-connector-dropped-on-connector", [undefined, this.connectorID, e]);
      }
    },
    handleAStatementDrop(info) {
      globalConsoleLog("conn","Connector:handleAStatementDrop:  emitting signal droppedAstat")
      this.$emit("droppedAstat", info);
    },
    handleBStatementDrop(info) {
      globalConsoleLog("conn","Connector:handleBStatementDrop:  passing data up")
      this.$emit("droppedBstat", info);
    },
    handleAConnectorDrop(info) {
      globalConsoleLog("conn","Connector:handleAConnectorDrop:  passing data up")
      this.$emit("droppedAconn", info);
    },
    handleNewConnectorDroppedOnConnector(info) {
      globalConsoleLog("conn","Connector:handleAConnectorDrop:  passing data up")
      this.$emit("new-connector-dropped-on-connector", info);
    },
    handleBConnectorDrop(info) {
      globalConsoleLog("conn","Connector:handleBConnectorDrop:  passing data up")
      this.$emit("droppedBconn", info);
    },
    showInfo() {
      globalConsoleLog("conn","connectorID", this.connectorID);
      globalConsoleLog("conn","leftType", this.leftType);
      globalConsoleLog("conn","leftID", this.leftID);
      globalConsoleLog("conn","rightType", this.rightType);
      globalConsoleLog("conn","rightID", this.rightID);
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
    handleToggleOrientation( {id} ) {
      // Emit an event to the parent component indicating that this connector should 
      //switch from row to column
      this.$emit("toggle-orientation", {id} );
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
            ? "..."
            : this.allConnectors[this.connectorID].leftContent;
        this.bcontent =
          this.allConnectors[this.connectorID].rightContent === undefined
            ? "..."
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
            ? "..."
            : this.allConnectors[this.connectorID].leftContent;
        this.bcontent =
          this.allConnectors[this.connectorID].rightContent === undefined
            ? "..."
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
      // globalConsoleLog("conn",this.currConnectorContent.length)
    },
    deleteChildConnector({ id, parentId, position = "" }) {
      // Emit an event to the parent component indicating that this connector should be deleted
      this.$emit("delete-child-connector", { id, parentId, position });
    },

    deleteConnector({ id }) {
      // Emit an event to the parent component indicating that this connector should be deleted
      this.$emit("delete-connector", { id });
    },

  },
  watch: {
    // Pass new content texts once there are changes
    contentTextAll(newConnectorContent) {
      //globalConsoleLog("conn","Content changed");
      this.$emit("update-connector-content", [
        this.connectorID,
        newConnectorContent,
      ]);
    },
    //
    // leftID(newID) {
    //     globalConsoleLog("conn","LHS has been updated! Connector ID: ", this.connectorID)
    //     globalConsoleLog("conn","New LHS data: ", newID)
    // },
    //
    // rightID(newID) {
    //     globalConsoleLog("conn","RHS has been updated! Connector ID: ", this.connectorID)
    //     globalConsoleLog("conn","New RHS data: ", newID)
    // },

    connectorID(newValue, oldValue) {
      //globalConsoleLog("conn","connectorID changed!", oldValue, "to", newValue);
      this.initContent();
    },

    leftContent(newValue, oldValue) {
      //globalConsoleLog("conn","leftContent changed!", oldValue, "to", newValue);

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
      //globalConsoleLog("conn","rightContent changed!", oldValue, "to", newValue);
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
    showAllFeedback() {
      this.showFeedback = this.showAllFeedback
    }
  },
  created() {
    // this.currConnectorContent = JSON.parse(JSON.stringify(this.connectorContent[this.selectedPhrase]));
    // // globalConsoleLog("conn","test current connector content", this.connectorContent)
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
  min-height: 40px;
  margin-bottom: 10px;
  align-items: center;
  border-radius: 6px;
  border: 1px solid rgb(230, 230, 255);
  background-color: #ffffff;
  padding: 0px 5px;
  overflow:visible;
}

.connectorContainer:hover .buttons-container {
      opacity: 1 !important; /* Show childA when hovering over the parent */
}

.connectorContainer:hover .connectorButton {
      opacity: 1  !important; /* Show childA when hovering over the parent */
}

.connectorContainer:hover {
  border: 2px solid var(--biologic-hover-border-color);
  transform: translate(-1px, -1px);
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
  background-color: rgb(236, 236, 236);
  max-width: 400px;
  overflow-wrap: break-word;
  aspect-ratio: 2/1;
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

/* Tooltip container */
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
  justify-items:flex-start;
  padding: 10px;
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

</style>
