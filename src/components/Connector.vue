<template>
  <div
    class="connectorContainer"
    :style="{ left: connleft + 'px', top: conntop + 'px' }"
    ref="connectorContainerRef"
    draggable="true"
    @dragstart="startDragConnector($event)"
    @drop="onDrop($event, 'x')"

    >
    <FeedbackRubric :isVisible=showFeedback :exnetID=connectorID :isConnector=true />
    <div v-if="this.parent !== undefined" class="buttons-container">
      <!--button @click="call_connectorString">call connector String</button-->
      <button v-if="this.clickCount % 2 === 0" @click="displayFormChanged" class="connectorButton">
      <img 
        class="collapse-expand-button"
        src="../assets/collapse_icon.png"
        alt="Rotate"
        width="20"
        
      />
    </button>
    <button v-if="this.clickCount % 2 === 1"  @click="displayFormChanged" class="connectorButton">
      <img 
        class="collapse-expand-button"
        src="../assets/expand_icon.png"
        alt="Rotate"
        width="20"
        
      />
    </button>

    <button v-if="isFeedbackAvailable" @click="showFeedback = !showFeedback" class="connectorButton">
      <img 
        src="../assets/feedback-rubric.png"
        alt="Feedback"
        width="20"
        
      />
    </button>

    <button @click="deleteConnector({ id: connectorID })" class="connectorButton">
      <img
        class="delete-button"
        src="../assets/recycle_bin.png"
        alt="Delete"
        width="20"
        
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
      :style="{ flexDirection: orientation }"
    >
      <div class="connectorText" v-if="connectorContent[selectedPhrase][0]">
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
          @dropped-aconn="handleAConnectorDrop"
          @dropped-bconn="handleBConnectorDrop"
          @dropped-astat="handleAStatementDrop"
          @dropped-bstat="handleBStatementDrop"
        >
          <div v-if="this.connectorContentID==2" class="connector-a-picture-parent" ref="targetBoxRefLeft"
            @dragover.prevent
            @dragleave.prevent="handleDragLeaveTargetBoxLeft($event)"
            @dragenter.prevent="handleDragEnterTargetBoxLeft($event)"
          >
            <img 
              class="connector-a-picture"
              src="../assets/connector_A_picture.png"
              alt="Image"
            />
          </div>
          <div v-else class="connector-target-box" ref="targetBoxRefLeft"
            @dragover.prevent
            @dragleave.prevent="handleDragLeaveTargetBoxLeft($event)"
            @dragenter.prevent="handleDragEnterTargetBoxLeft($event)"
          >
             <!-- just to provide the inner box -->
             
          </div>
        </div>

        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.leftType === 'statement'">
          <RenderStatement
            @delete-statement="
              deleteStatement({ id: this.leftID, position: 'left' })
            "
            :statement-data="this.allStatements[this.leftID]"
            :showToggle="true"
            @update-statement-content="handleUpdateStatContentA"
            @mousedown="onMousedown('leftType')"
            @duplicate-statement="duplicateStatement"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
            @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement"
            
          />
        </div>
        <!--                    <span class="tooltiptext" v-if="this.leftID !== undefined">Drag to recycle bin to remove</span>-->

        <div class="connector-sections" v-if="this.leftType === 'connector'">
          <Connector ref="leftChildConnector"
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
            :orientation="allConnectors[this.leftID].orientation"
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
            @toggle-orientation="handleToggleOrientation"
            @update-click-count="handleUpdateChildClickCount"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
            @new-connector-dropped-on-connector="handleNewConnectorDroppedOnConnector"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @duplicate-statement="duplicateStatement"
            @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
            @toggle-collapsed-renderstatement-from-connector="toggleCollapsedRenderStatementFromConnector"
            
          />
          
        </div>
      </div>

      <div class="connectorTextContainerNew">
        <button  v-if="this.clickCount % 2 === 0" @click="handleToggleOrientation({ id: connectorID })" class="connectorButton">
        <img 
          class="rotate-button"
          src="../assets/rotate_icon.png"
          alt="Rotate"
          width="20"
          
        />
        </button>

        <p class="connectorText">{{ connectorContent[selectedPhrase][1] }}</p>

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
        >
          <div class="connector-target-box" ref="targetBoxRefRight"
            @dragover.prevent
            @dragleave.prevent="handleDragLeaveTargetBoxRight($event)"
            @dragenter.prevent="handleDragEnterTargetBoxRight($event)"
          >
             <!-- just to provide the inner box -->
          </div>

        </div>

        <!-- TODO: implement delete -->
        <div class="connector-sections" v-if="this.rightType === 'statement'">
          <RenderStatement
            @delete-statement="
              deleteStatement({ id: this.rightID, position: 'right' })
            "
            :statement-data="this.allStatements[this.rightID]"
            :showToggle="true"
            
            @update-statement-content="handleUpdateStatContentB"
            @mousedown="onMousedown('rightType')"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @duplicate-statement="duplicateStatement"
            @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
            @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement"
            
          />
        </div>

        <!-- <span class="tooltiptext" v-if="this.b !== null">Drag to recycle bin to remove</span> -->
        <div class="connector-sections" v-if="this.rightType === 'connector'">
          <Connector  ref="rightChildConnector"
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
            :orientation="allConnectors[this.rightID].orientation"
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
            @toggle-orientation="handleToggleOrientation"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
            @new-connector-dropped-on-connector="handleNewConnectorDroppedOnConnector"
            @connector-dropped-on-statement="connectorDroppedOnStatement"
            @duplicate-statement="duplicateStatement"
            @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
            @toggle-collapsed-renderstatement-from-connector="toggleCollapsedRenderStatementFromConnector"
            
          />
        </div>
      </div>

      <div class="connectorText" v-if="connectorContent[selectedPhrase][2]">
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
import FeedbackRubric from "@/components/FeedbackRubric.vue";

export default {
  name: "Connector",
  components: { ConnectorContextMenu, RenderStatement, FeedbackRubric },
  inject : ['isFeedbackAvailable', 'showAllFeedback'],
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
    getCollapseExpandIcon(){
      return (this.clickCount % 2 === 0) ? 'src/assets/collapse_icon.png' : 'src/assets/expand_icon.png';
    }
  },
  methods: {

    duplicateStatement(id)
    {
        // emission from either a child RenderStatement or a Connector.
        // just pass this on up the tree for the AnswerArea to deal with
        console.log("Connector:duplicateStatement")
        this.$emit("duplicate-statement", id);
    },
    toggleCollapsedRenderStatement(id){
        // emission from  a child RenderStatement.
        // just pass this on up the tree for the AnswerArea to deal with
        console.log("Connector:toggleCollapsedRenderStatementFromRenderStatement")
        this.$emit("toggle-collapsed-renderstatement-from-connector", id);
    },
    toggleCollapsedRenderStatementFromConnector(id){
        // emission from  a child Connector.
        // just pass this on up the tree for the AnswerArea to deal with
        console.log("Connector:toggleCollapsedRenderStatementFromConnector")
        this.$emit("toggle-collapsed-renderstatement-from-connector", id);
    },
    toggleShowPopupFromRenderStatement(id){
        // emission from  a child RenderStatement .
        // just pass this on up the tree for the parent Connector OR AnswerArea to deal with
        console.log("Connector:toggleShowPopupFromRenderStatement emitting toggle-showPopup-fromconnector")
        this.$emit("toggle-showPopup-fromconnector", id);
    },
    toggleShowPopupFromConnector(id){
        // emission from  a child Connector .
        // just pass this on up the tree for the parent Connector OR AnswerArea to deal with
        console.log("Connector:toggleShowPopupFromConnector emitting toggle-showPopup-fromconnector")
        this.$emit("toggle-showPopup-fromconnector", id);
    },
    connector1IsInTreeOfconnector2( conn1, conn2 ){
      // if left OR right side is a connector call recursively
      let inLeftTree = false;
      console.log("connector1IsInTreeOfconnector2: is conn1=",conn1,"  in the tree of conn2=",conn2);
      if (this.allConnectors[conn2]["leftType"]=="connector") {
        const leftConnID = this.allConnectors[conn2]["leftID"];
        console.log("leftside type=",this.allConnectors[conn2]["leftType"]," connID=",leftConnID);
        inLeftTree = (
            (leftConnID!==undefined) && 
            ((conn1===leftConnID) || this.connector1IsInTreeOfconnector2(conn1,leftConnID))
            );
      }
      let inRightTree = false;
      if (this.allConnectors[conn2]["rightType"]=="connector") {
        const rightConnID = this.allConnectors[conn2]["rightID"];
        console.log("rightside type=",this.allConnectors[conn2]["rightType"]," connID=",rightConnID);
        inRightTree = (
          (rightConnID!==undefined) && 
          ((conn1===rightConnID) ||this.connector1IsInTreeOfconnector2(conn1,rightConnID))
        );
      }
      const finalResult = inLeftTree || inRightTree;
      console.log(" FINAL result = inLeftTree=",inLeftTree," || inRightTree=",inRightTree," =>",finalResult);
      return finalResult;
    },
    dropIsPermissible(connectorBeingDroppedOn,connectorBeingDropped) {
      console.log("checking if ",connectorBeingDropped," can be dropped on ",connectorBeingDroppedOn);
      if (connectorBeingDroppedOn === connectorBeingDropped) {
        console.log("theyre the same, so NO");
        return false;
      } else {
        console.log("check inTree");
        const inTree = this.connectorBeingDropped !== undefined &&
                       this.connector1IsInTreeOfconnector2(connectorBeingDroppedOn,connectorBeingDropped);
        console.log("inTree = ",inTree);
        return ! inTree;
      }
    },
    connectorDroppedOnStatement( info )
    {
      console.log("Connector:connectorDroppedOnStatement");
      // pass it up the chain and let the AnswerArea deal with it
      this.$emit("connector-dropped-on-statement", info ); 
    },
    decodeDragInformation(event)
    { 
      //  the DnD spec says that during a drag, the drag data store mode is protected mode.
      // this means you can see the types but not the values. So the workaround is to encode the values into the type names.
      const types = Array.from(event.dataTransfer.types);
      console.log("TYPES = ",types);
      const widthType = types.find((type) => type.startsWith("draggedwidth"));
      const heightType = types.find((type) => type.startsWith("draggedheight"));
      const typeType = types.find((type) => type.startsWith("draggedtype"));
      const connectorIDType = types.find((type) => type.startsWith("draggedconnectorid"));
      const dragWidthStr = widthType ? widthType.split("/")[1] : null;
      const dragHeightStr = heightType ? heightType.split("/")[1] : null;
      const dragTypeStr = typeType ? typeType.split("/")[1] : null;
      const dragConnectorIDStr = connectorIDType ? connectorIDType.split("/")[1] : null;

      console.log("DRAG DATA = ",dragWidthStr,dragHeightStr,dragTypeStr,dragConnectorIDStr);

      const dragInformation = {draggedWidth:dragWidthStr,
        draggedHeight:dragHeightStr,
        drageeType:dragTypeStr,
        drageeConnectorID:dragConnectorIDStr};

      return dragInformation;
    },
    handleDragEnterTargetBoxLeft(event){
      console.log("Connector:handleDragEnterTargetBoxLeft----------event=",event);
      const dragInformation = this.decodeDragInformation(event);
      if (dragInformation.drageeType==="connector") 
      {
        if (this.dropIsPermissible(this.connectorID,dragInformation.drageeConnectorID)) {
          console.log("DROP IS PERMISSIBLE");
        } else {
          console.log("DROP IS NOT PERMISSIBLE");
          return;
        }
      }
//      console.log("EVENT=",event);
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
      console.log("Connector:handleDragLeaveTargetBoxLeft***********");
      event.preventDefault();
      const targetRef = this.$refs.targetBoxRefLeft;
      targetRef.style.width = 20 + 'px';
      targetRef.style.height = 20 + 'px';
      targetRef.style.border = '';
    }, 
    handleDragEnterTargetBoxRight(event)
    {
      console.log("Connector:handleDragEnterTargetBoxRight----------event=",event);
      
      const dragInformation = this.decodeDragInformation(event);

      console.log('Draginformation:', dragInformation);

      if (dragInformation.drageeType==="connector") {
        if (this.dropIsPermissible(this.connectorID,dragInformation.drageeConnectorID)) {
          console.log("DROP IS PERMISSIBLE");
        } else {
          console.log("DROP IS NOT PERMISSIBLE");
          return;
        }
      }

//      console.log("EVENT=",event);
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
      console.log("Connector:handleDragLeaveTargetBoxRight***********");
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

        console.log(" SET UP DATA TRANSFER:",widthTypeStr,heightTypeStr,typeTypeStr,connectorIDTypeStr);
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
      console.log("Connector:onDrop  side:",side,"  dropped data: ", data);
      // Receive the content text from the dropped object
      const transContent = e.dataTransfer.getData("content");

      var elementWidthStr = e.dataTransfer.getData("fredWidth");
      var elementHeightStr = e.dataTransfer.getData("fredWidth");
      console.log('Element Size Str:', elementWidthStr, 'x', elementHeightStr);

      this.$el.classList.remove('drag-over-happening');


      if (side === "a" && type === "statement") {
        const statementID = data.id;
        // Update content
        this.acontent = transContent;
        // this.leftContent = transContent
        this.updateContentTextAll()
        console.log("Connector:onDrop  emitting SIGNAL droppedAstat");

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
        console.log("emit new-connector-dropped-on-connector");
        this.$emit("new-connector-dropped-on-connector", [undefined, this.connectorID, e]);
      }
    },
    handleAStatementDrop(info) {
      console.log("Connector:handleAStatementDrop:  emitting signal droppedAstat")
      this.$emit("droppedAstat", info);
    },
    handleBStatementDrop(info) {
      console.log("Connector:handleBStatementDrop:  passing data up")
      this.$emit("droppedBstat", info);
    },
    handleAConnectorDrop(info) {
      console.log("Connector:handleAConnectorDrop:  passing data up")
      this.$emit("droppedAconn", info);
    },
    handleNewConnectorDroppedOnConnector(info) {
      console.log("Connector:handleAConnectorDrop:  passing data up")
      this.$emit("new-connector-dropped-on-connector", info);
    },
    handleBConnectorDrop(info) {
      console.log("Connector:handleBConnectorDrop:  passing data up")
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
    deleteStatement({ id, parentId = this.connectorID, position = "" }) {
      // Emit an event to the parent component indicating that this connector should be deleted
      this.$emit("delete-statement", { id, parentId, position });
    },
  },
  watch: {
    // Pass new content texts once there are changes
    contentTextAll(newConnectorContent) {
      //console.log("Content changed");
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
      //console.log("connectorID changed!", oldValue, "to", newValue);
      this.initContent();
    },

    leftContent(newValue, oldValue) {
      //console.log("leftContent changed!", oldValue, "to", newValue);

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
      //console.log("rightContent changed!", oldValue, "to", newValue);
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
  border: 1px solid rgb(230, 230, 255);
  background-color: #ffffff;
  padding: 0px 5px;
  overflow:visible;
}

.connectorContainer:hover .buttons-container {
      opacity: 1; /* Show childA when hovering over the parent */
}

.connectorContainer:hover .connectorButton {
      opacity: 1; /* Show childA when hovering over the parent */
}

.connectorContainer:hover {
  border: 2px solid rgb(255, 0, 0);
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
  max-width: 250px;
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
  border: 2px solid rgb(255, 0, 170);
}

.connectorMenu {
  font-weight: bold;
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  border: 0px solid rgb(188, 176, 123);
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
.buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}
.connectorButton {
  cursor: pointer;
  width: 24px;
  height: 24px;
  margin: 2px;
  padding: 1px;
  align-items: center;
  opacity: 0.05;
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
  font-size: 12px;
  font-weight: bold;
  max-width: 80px;
  margin: 0px 5px 0px 5px;
}

</style>
