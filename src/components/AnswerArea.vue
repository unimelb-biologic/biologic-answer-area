<template>
  <div id="submitBtn">
    <button @click="convertToJson">Submit</button>
  </div>
  <div id="showDataStructuresButton" v-if="isDev">
    <button @click="toggleShowDataStructures">show data structures</button>
  </div>
  <div v-if="showDataStructures" class="statement-dump"> <pre>
    {{ prettifiedAnswerContentDump }}
    {{ prettifiedStatementsDump }}
    {{ prettifiedAllStatementsDump }}
    {{ prettifiedAllConnectorsDump }}
    {{ prettifiedRootConnectorID_List_Dump }}
    {{ prettifiedRootStatementIDs_Dump }}
        </pre>
        </div>
  <div
    class="answer_area"
    @dragover.prevent
    @dragenter.prevent
    ref="answer_area"
  >
    <RenderStatement
      v-for="item in rootStatementID_set"
      :key="item"
      :statement-data="allStatements[item]"
      :showToggle="true"
      :sharedData="sharedData"
      @duplicate-statement="duplicateStatement"
      @connector-dropped-on-statement="handleNewConnectorDroppedOnSomething"
      @statement-dropped-on-statement="handleStatementDroppedOnStatement"
      @toggle-collapsed-renderstatement="toggleCollapsedRenderStatement"
      @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement"
      @update-shared-data="updateSharedData"
    />

    <Connector
      v-for="rootConnectorID in rootConnectorID_set"
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
      :orientation="allConnectors[rootConnectorID].orientation"
      :selected-phrase="allConnectors[rootConnectorID].selectedPhrase"
      :conntop="allConnectors[rootConnectorID].top"
      :connleft="allConnectors[rootConnectorID].left"
      :moveItem="moveItem"
      :rootConnectorID="rootConnectorID"
      :sharedData="sharedData"
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
      @toggle-orientation="handleToggleOrientation"
      @update-child-connector-content="handleUpdateChildConnector"
      @update-child-stat="handleUpdateChildStat"
      @new-connector-dropped-on-connector="handleNewConnectorDroppedOnSomething"
      @connector-dropped-on-statement="handleNewConnectorDroppedOnSomething"
      @duplicate-statement="duplicateStatement"
      @toggle-collapsed-renderstatement-from-connector="toggleCollapsedRenderStatementFromConnector"
      @toggle-showPopup-fromconnector="toggleShowPopupFromConnector"
      @update-shared-data="updateSharedData"
    />
  </div>
</template>

<script>
import Connector from "@/components/Connector.vue";
import RenderStatement from "../components/RenderStatement.vue";
import uniqueId from "lodash.uniqueid";

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
    "update-shared-data"
  ],
  props: {
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
      rootStatementID_set: new Set(),     //not sure if these are used MM
      rootConnectorID: null,      //not sure if these are used MM

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
    };
  },
  computed: {
    prettifiedAnswerContentDump(){
      return "-----------this.answerContent--------------\n"+JSON.stringify(this.answerContent,null,4);
    },
    prettifiedStatementsDump(){
      return "-----------this.statements--------------\n"+JSON.stringify(this.statements,null,4);
    },
    prettifiedAllStatementsDump(){
      return "-----------this.allstatements--------------\n"+JSON.stringify(this.allStatements,null,4);
    },
    prettifiedAllConnectorsDump(){
      return "-----------this.allConnectors--------------\n"+JSON.stringify(this.allConnectors,null,4);
    },
    prettifiedRootConnectorID_List_Dump(){
      return "-----------this.rootConnectorID_set--------------\n"+JSON.stringify(Array.from(this.rootConnectorID_set),null,4);
    },
    prettifiedRootStatementIDs_Dump(){
      return "-----------this.rootStatementID_set--------------\n"+JSON.stringify(Array.from(this.rootStatementID_set),null,4);
    },
    isDev() {
      return this.$route.query.isDev;
    }
  },

  methods: {
    updateSharedData(newValue) {
      this.$emit("update-shared-data",newValue);
    },
    toggleShowDataStructures(){
      this.showDataStructures = !this.showDataStructures;
    },
    convertToJson() {
      //console.log("button pressed");
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

      const connectorID = info[0];  // this is the connectorID of the connector that was dropped on.
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
        console.log("AnswerArea:handAStatementDrop: A statement was dragged directly onto connector left side."        );
        this.$emit("statementUsed", statementID);
      } else if (statementOldParent === -1) {
        console.log("AnswerArea:handAStatementDrop: A statement was dragged from ans area onto connector left side."        );
        this.rootStatementID_set.delete(statementID);
      } else {
       console.log("AnswerArea:handAStatementDrop: A statement was dragged from a connector to a connector left side."        );
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
      console.log("AnswerArea:handleBStatementDrop");
      const connectorID = info[0];  // this is the connectorID of the connector that was dropped on.
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
        console.log(          "A statement was dragged directly onto connector right side."        );
        this.$emit("statementUsed", statementID);
      } else if (statementOldParent === -1) {
        console.log(          "A statement was dragged from ans area onto connector right side."        );
        this.rootStatementID_set.delete(statementID);
      } else {
        console.log(          "A statement was dragged from a connector to a connector right side."        );
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
        const inTree = this.connector1IsInTreeOfconnector2(connectorBeingDroppedOn,connectorBeingDropped);
        console.log("inTree = ",inTree);
        return ! inTree;
      }
    },

    // If a connector is dropped onto the left side of a connector
    handleAConnectorDrop(info) {
      // info: [connectorID, data, transContent]
      const connectorID = info[0];  // this is the connectorID of the connector that was dropped on.

      const data = info[1];
      let droppedConnectorID = data.connectorID;

      console.log("AnswerArea::handleAConnectorDrop     old connector id",        connectorID,        "droppedConnectorID ",        droppedConnectorID      );

      // if it is a connector from the palette it won't have an ID yet.
      // so dropping those is obviously fine.
      if ((droppedConnectorID!==undefined) && (!this.dropIsPermissible(connectorID,droppedConnectorID)))
      {
        console.log("ERROR CIRCULAR REFERENCE");
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
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
        this.allConnectors[droppedConnectorID]["orientation"] = 'row';
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
      const connectorID = info[0];  // this is the connectorID of the connector that was dropped on.
      const data = info[1];

      let droppedConnectorID = data.connectorID;

      console.log("AnswerArea::handleBConnectorDrop     old connector id",        connectorID,        "droppedConnectorID ",        droppedConnectorID      );

      if ((droppedConnectorID!==undefined) &&(!this.dropIsPermissible(connectorID,data.connectorID))) {
        console.log("ERROR CIRCULAR REFERENCE");
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
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
        this.allConnectors[droppedConnectorID]["orientation"] = 'row';
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
      console.log("AnswerArea::handleStatementDroppedOnStatement  statement",droppedStatementID," dropped on ",droppedOnStatementID);

      // this method is to deal with a topLevel statement being moved.
      // so it's parent would be -1 (i.e. the AnswerArea)
      if (this.allStatements[droppedStatementID]["parent"]!= -1) {
        console.log("parent wasn't answer area so do nothing");
        return;
      }
      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(e.dataTransfer.getData("grabOffsetLeft"));
      const grabOffsetTop = parseInt(e.dataTransfer.getData("grabOffsetTop"));
      console.log("\n--------------ANSWER AREA onDrop-------------------")
      console.log(" grabOffset: ",  grabOffsetLeft.toFixed(2), grabOffsetTop.toFixed(2)      );

      
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
      const scrollableDisplayWorkspace = e.currentTarget.closest('.displayWorkspace');
      const scrollLeft = scrollableDisplayWorkspace.scrollLeft;
      const scrollTop = scrollableDisplayWorkspace.scrollTop;
      console.log('parent scroll=',scrollLeft,',',scrollTop,')')

      const sRect = scrollableDisplayWorkspace.getBoundingClientRect();
      console.log('parent pos=',sRect.left,',',sRect.top,')')
      const posWithinWorkspaceLeft = e.clientX - sRect.left;
      const posWithinWorkspaceTop = e.clientY - sRect.top;

      leftWithinAnswerArea = posWithinWorkspaceLeft - grabOffsetLeft + scrollLeft;
      topWithinAnswerArea = posWithinWorkspaceTop - grabOffsetTop + scrollTop;

      console.log("SOOOO (left,top) Within AnswerArea = ", leftWithinAnswerArea, topWithinAnswerArea );
    
      this.allStatements[droppedStatementID]["position"] = "absolute";
      this.allStatements[droppedStatementID]["top"] = topWithinAnswerArea;
      this.allStatements[droppedStatementID]["left"] = leftWithinAnswerArea;
    },

    handleNewConnectorDroppedOnSomething(info) {
      //
      // info: [statementID, connectorID, evt]
      //
      // called when a new connector is dropped on something (either connector or statement).
      // the info will either have "undefined" for the statementID or the connectorID
      //
      // the logic is the same for both:
      // 
      // a new connector has been dropped on something which may be part of a tree.
      // the connector needs to be a new connector - i.e. undefined parent and no children.
        // we need to insert it into the tree. So the "something" becomes the dropped connectors childA
        // and the parent of the something becomes the parent of the new connector.
        //
        //   if newConn was dropped on conn1 then this is what needs to happen
        //
        // eg.1
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
        
      const droppedOnStatementID = info[0];
      const droppedOnConnectorID = info[1];
      const e = info[2];
      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));
      const transContent = e.dataTransfer.getData("content");

      let droppedConnectorID = data.connectorID;
      let wasStatement = undefined;
      if (droppedOnConnectorID==undefined){
        wasStatement = true;
        console.log("AnswerArea::handleNewConnectorDroppedOnSomething     old statement id",
              droppedOnStatementID,        "new connector ID",        droppedConnectorID      );

      } else {
        wasStatement = false;
        console.log("AnswerArea::handleNewConnectorDroppedOnSomething     old connector id",
              droppedOnConnectorID,        "new connector ID",        droppedConnectorID      );
      }
 
      // A new connector from the right is dropped onto something

      if (droppedConnectorID === undefined) {
        // give the connector the next ID
        droppedConnectorID = this.connectorCount;
        this.connectorCount++;
        let parentID = undefined;
        if (wasStatement) {
          parentID = this.allStatements[droppedOnStatementID]["parent"];
        } else {
          parentID = this.allConnectors[droppedOnConnectorID]["parent"];
        }

        // set the new Connector up to have the droppedOn Connector/Statement as its left child
        this.allConnectors[droppedConnectorID] = data;
        this.allConnectors[droppedConnectorID]["connectorID"] = droppedConnectorID;
        this.allConnectors[droppedConnectorID]["parent"] = parentID;
        this.allConnectors[droppedConnectorID]["leftID"] = wasStatement?droppedOnStatementID:droppedOnConnectorID;
        this.allConnectors[droppedConnectorID]["leftType"] = wasStatement?"statement":"connector";
        this.allConnectors[droppedConnectorID]["leftContent"] = undefined;
        this.allConnectors[droppedConnectorID]["rightID"] = undefined;
        this.allConnectors[droppedConnectorID]["rightType"] = undefined;
        this.allConnectors[droppedConnectorID]["rightContent"] = undefined;
        this.allConnectors[droppedConnectorID]["clickCount"] = 0;
        this.allConnectors[droppedConnectorID]["orientation"] = 'row';

        // and change the parent of the droppedOn Something to the dropped Connector
        // and the dropped Connector becomes the child of whatever connector had the Something as its child
        let parentConnID = undefined;
        if (wasStatement) {
          console.log("wasStatement");
          parentConnID = this.allStatements[droppedOnStatementID]["parent"];
          this.allStatements[droppedOnStatementID]["parent"] = droppedConnectorID;
          if (parentConnID === -1) {
            console.log("parentConnID === -1");
            // the statement was at the top level
            // so the new connector replaces it in the root ID list
            if (this.rootStatementID_set.has(droppedOnStatementID)) {
              this.rootStatementID_set.delete(droppedOnStatementID);
              // and make position relative now that it is a child of a connector.
              // not sure why this is necessary. 21/11/23 MM.
              this.allStatements[droppedOnStatementID]["position"] = "relative";
            }
            this.rootConnectorID_set.add(droppedConnectorID);
            this.allConnectors[droppedConnectorID]["top"] = this.allStatements[droppedOnStatementID]["top"];
            this.allConnectors[droppedConnectorID]["left"] = this.allStatements[droppedOnStatementID]["left"];
            this.allStatements[droppedOnStatementID]["top"] = undefined;
            this.allStatements[droppedOnStatementID]["left"] = undefined;
            this.allStatements[droppedOnStatementID]["side"] = "left";
          } else {
            console.log("parentConnID isn't -1 it is: ",parentConnID);
            // we need to make the parent of the droppedOnStatement replace
            // its left or right child with the droppedConnector
            if (this.allConnectors[parentConnID]["leftID"]==droppedOnStatementID){
              console.log("this.allConnectors[parentConnID][leftID]==droppedOnStatementID");
              this.allConnectors[parentConnID]["leftID"]=droppedConnectorID;
              this.allConnectors[parentConnID]["leftType"]="connector";
            } else {
              console.log("this.allConnectors[parentConnID][rightID]==droppedOnStatementID");
              // must be the right side.
              this.allConnectors[parentConnID]["rightID"]=droppedConnectorID;
              this.allConnectors[parentConnID]["rightType"]="connector";
            }
            console.log("all done");
          } 
        } else {
          parentConnID = this.allConnectors[droppedOnConnectorID]["parent"];
          this.allConnectors[droppedOnConnectorID]["parent"] = droppedConnectorID;
          if (parentConnID === -1) {
            // the connector was at the top level
            // so the new connector replaces it in the root ID list
            if (this.rootConnectorID_set.has(droppedOnConnectorID))
              this.rootConnectorID_set.delete(droppedOnConnectorID);
            this.rootConnectorID_set.add(droppedConnectorID);
            this.allConnectors[droppedConnectorID]["top"] = this.allConnectors[droppedOnConnectorID]["top"];
            this.allConnectors[droppedConnectorID]["left"] = this.allConnectors[droppedOnConnectorID]["left"];
            this.allConnectors[droppedOnConnectorID]["top"] = undefined;
            this.allConnectors[droppedOnConnectorID]["left"] = undefined;
          } else {
            // we need to make the parent of the droppedOnConnector replace
            // its left or right child with the droppedConnector
            if (this.allConnectors[parentConnID]["leftID"]==droppedOnConnectorID){
              console.log("parent's left side = ")
              this.allConnectors[parentConnID]["leftID"]=droppedConnectorID;
            } else {
              // must be the right side.
              this.allConnectors[parentConnID]["rightID"]=droppedConnectorID;
            }
          } 
        }
      }
    },

    onDrop(e) {
      e.preventDefault();

      //retrieve the internal grab offsets that were recorded at the start of the drag
      const grabOffsetLeft = parseInt(e.dataTransfer.getData("grabOffsetLeft"));
      const grabOffsetTop = parseInt(e.dataTransfer.getData("grabOffsetTop"));
      console.log("\n--------------ANSWER AREA onDrop-------------------")
      console.log(" grabOffset: ",  grabOffsetLeft.toFixed(2), grabOffsetTop.toFixed(2)      );
      
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
      const scrollableDisplayWorkspace = e.currentTarget.closest('.displayWorkspace');
      const scrollLeft = scrollableDisplayWorkspace.scrollLeft;
      const scrollTop = scrollableDisplayWorkspace.scrollTop;
      console.log('parent scroll=',scrollLeft,',',scrollTop,')')

      leftWithinAnswerArea = e.clientX - e.currentTarget.offsetLeft - grabOffsetLeft + scrollLeft;
      topWithinAnswerArea = e.clientY - e.currentTarget.offsetTop - grabOffsetTop + scrollTop;
      console.log("SOOOO (left,top) Within AnswerArea = ", leftWithinAnswerArea, topWithinAnswerArea );


      e.stopImmediatePropagation();

      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));

      // Receive the content of dropped object
      const transContent = e.dataTransfer.getData("content");

      // Deal with the dropped type is 'Connector' and with no child
      if (type === "connector") {
        console.log(" A new connector from the right (undefined) is dropped onto answer area.");
        if (data.connectorID === undefined) {
          this.allConnectors[this.connectorCount] = data;

          //console.log("answer area dropped occurred");

          this.allConnectors[this.connectorCount]["connectorID"] = this.connectorCount;
          this.allConnectors[this.connectorCount]["parent"] = -1;
          this.allConnectors[this.connectorCount]["leftID"] = undefined;
          this.allConnectors[this.connectorCount]["leftType"] = undefined;
          this.allConnectors[this.connectorCount]["leftContent"] = undefined;
          this.allConnectors[this.connectorCount]["rightID"] = undefined;
          this.allConnectors[this.connectorCount]["rightType"] = undefined;
          this.allConnectors[this.connectorCount]["rightContent"] = undefined;
          this.allConnectors[this.connectorCount]["clickCount"] = 0;
          this.allConnectors[this.connectorCount]["orientation"] = 'row';

          const answerAreaHeight =
            document.getElementById("answerArea").offsetHeight;
          const submitBtnHeight =
            document.getElementById("submitBtn").offsetHeight;
          const topOffset = answerAreaHeight + submitBtnHeight;

          //this.allConnectors[this.connectorCount]["top"] = topWithinAnswerArea - topOffset;
          this.allConnectors[this.connectorCount]["top"] = topWithinAnswerArea;
          this.allConnectors[this.connectorCount]["left"] = leftWithinAnswerArea;

          this.rootConnectorID_set.add(this.connectorCount);

          // Record content
          this.answerContent[this.connectorCount] = transContent;

          this.connectorCount++;
        } else {
          console.log(" A new connector is already in answer area.");
          // A connector is already in answerArea.
          //console.log("Hello there!");
          this.allConnectors[data.connectorID]["parent"] = -1;

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
            } else {
              this.allConnectors[oldParentID]["rightID"] = undefined;
              this.allConnectors[oldParentID]["rightType"] = undefined;
              this.allConnectors[oldParentID]["rightContent"] = undefined;
            }
          }
        }
      } else if (type === "statement") {

        const statementID = data.id;
        const getStatement = this.allStatements[statementID]
        let statementOldParent = undefined
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
          this.$emit("statementUsed", statementID);

          // TODO: Render text???
        } else if (statementOldParent === -1) {
          this.allStatements[statementID]["position"] = "absolute";
          this.allStatements[statementID]["top"] = topWithinAnswerArea;
          this.allStatements[statementID]["left"] = leftWithinAnswerArea;
          //console.log(this);
        } else { // must have a parent, which means it's part of a connector tree
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

    connectorDroppedOnStatement(statementID, e)
    {
      const type = e.dataTransfer.getData("type");
      const data = JSON.parse(e.dataTransfer.getData("data"));
      const transContent = e.dataTransfer.getData("content");
      console.log("AnswerArea:connectorDroppedOnStatement  type=",type," data=",data," transContent=",transContent);

      if (data.connectorID === undefined) { // connector is new so need to add it to the list
        const oldStatementParent = thi.allStatements[statementID]["parent"];
        this.allConnectors[this.connectorCount] = data;
        this.allConnectors[this.connectorCount]["connectorID"] = this.connectorCount;
        this.allConnectors[this.connectorCount]["parent"] = oldStatementParent;
        this.allConnectors[this.connectorCount]["leftID"] = undefined;
        this.allConnectors[this.connectorCount]["leftType"] = undefined;
        this.allConnectors[this.connectorCount]["leftContent"] = undefined;
        this.allConnectors[this.connectorCount]["rightID"] = undefined;
        this.allConnectors[this.connectorCount]["rightType"] = undefined;
        this.allConnectors[this.connectorCount]["rightContent"] = undefined;
        this.allConnectors[this.connectorCount]["clickCount"] = 0;
        this.allConnectors[this.connectorCount]["orientation"] = 'row';
        this.allConnectors[this.connectorCount]["top"] = this.allStatements[statementID]["top"]
        this.allConnectors[this.connectorCount]["left"] = this.allStatements[statementID]["left"]
        this.rootConnectorID_set.add(this.connectorCount);
        this.answerContent[this.connectorCount] = transContent;
        this.connectorCount++;
        console.log(" A new connector from the right (undefined) is dropped onto statement.");
        this.handleAStatementDrop([this.connectorCount-1,statementID,transContent]);
        if (oldStatementParent!= -1) {
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

    emitUpdateContent(newAnswerContentObject) {
      this.$emit("update-answer-area-content", [
        this.rootConnectorID_set,
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
      const current = this.allConnectors[id]['orientation'];
      this.allConnectors[id]['orientation'] = current === 'row' ? 'column' : 'row';
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
        this.$emit("statementUsed", leftID, true);
      }
      if (rightType === "statement") {
        this.$emit("statementUsed", rightID, true);
      }
      delete this.allConnectors[id];
      this.rootConnectorID_set.delete(id);
      this.$emit("connector-deleted", id);
    },

    duplicateStatement(id)
    {
        console.log("AnswerArea:duplicateStatement")
        const theStatement = this.allStatements[id];
        const duplicatedStatement = JSON.parse(JSON.stringify(theStatement)); // Create a copy of the last element
        duplicatedStatement.id = uniqueId(); //just need a new unique number
        duplicatedStatement["visible"] = true;
        duplicatedStatement["parent"] = -1;
        duplicatedStatement["position"]="absolute";
        duplicatedStatement["showPopup"]=theStatement["showPopup"];
        duplicatedStatement["collapsed"]=theStatement["collapsed"];
        this.statements.push(duplicatedStatement); // Push the duplicated element to the parent array
        this.allStatements[duplicatedStatement.id] = duplicatedStatement; // now add to the keyed list
        let baseTop = 100;
        let baseLeft = 100;
        if (theStatement["parent"]==-1) {
          baseTop = theStatement["top"];
          baseLeft = theStatement["left"];
        }
        this.allStatements[duplicatedStatement.id]["top"] = baseTop+25;
        this.allStatements[duplicatedStatement.id]["left"] = baseLeft+25;
        this.rootStatementID_set.add(duplicatedStatement.id);
        this.$emit("statementUsed", duplicatedStatement.id);
    },

    toggleCollapsedRenderStatement(id)
    {
        console.log("AnswerArea:toggleCollapsedRenderStatement ID:",id);
        this.allStatements[id]["collapsed"] = !this.allStatements[id]["collapsed"];
    },

    toggleCollapsedRenderStatementFromConnector(id)
    {
        console.log("AnswerArea:toggleCollapsedRenderStatementFromConnector ID:",id);
        this.allStatements[id]["collapsed"] = !this.allStatements[id]["collapsed"];
    },
    toggleShowPopupFromRenderStatement(id)
    {
        console.log("AnswerArea:toggleShowPopupFromRenderStatement");
        this.allStatements[id]["showPopup"] = !this.allStatements[id]["showPopup"];
        console.log("AnswerArea:toggleShowPopupFromRenderStatement is now",this.allStatements[id]["showPopup"])
    },

    toggleShowPopupFromConnector(id)
    {
        console.log("AnswerArea:toggleShowPopupFromConnector");
        this.allStatements[id]["showPopup"] = !this.allStatements[id]["showPopup"];
        console.log("AnswerArea:toggleShowPopupFromConnector is now",this.allStatements[id]["showPopup"])
    },


    duplicateLastStatement()
    {
      if (this.statements.length > 0) {
        const lastStatement = this.statements[this.statements.length - 1];
        const duplicatedStatement = JSON.parse(JSON.stringify(lastStatement)); // Create a copy of the last element
        duplicatedStatement.id = duplicatedStatement.id + 1; //just need a new unique number
        duplicatedStatement.statementIdentifier = duplicatedStatement.statementIdentifier;
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

.pre {
  font-size:xx-small;
  white-space: pre-wrap; /* Preserve white-space and wrap lines */
  font-family: monospace; /* Use a monospaced font for better alignment */
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
}


</style>
