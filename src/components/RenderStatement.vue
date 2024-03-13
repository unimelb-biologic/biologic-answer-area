<template>
  <div
      class="statement-box"
      id="renderStatementElement"
      :draggable="true"
      @dragstart.stop="startDrag($event, data)"
      @dragover.prevent
      @dragenter.prevent="handleDragEnteringRenderStatement"
      @dragleave.prevent="handleDragLeavingRenderStatement"
      @drop="onDrop($event)"
      ref="mmStatementBox"
      :style="{
      position: this.statementData.position,
      left: this.statementData.left + 'px',
      top: this.statementData.top + 'px',
    }"
  >
    <StatementRoot
        v-bind="$attrs"
        v-if="this.statementData.statementType === 0"
        :statement-data="this.statementData"
        @user-choice-changed="handleUserChoiceChanged"
        @duplicate-statement="duplicateStatement"
        @toggle-collapsed-statement-root="toggleCollapsedStatementRoot"
        @toggle-showPopup-fromstatementroot="toggleShowPopupStatementRoot"
    />
    <StatementTruth
        v-bind="$attrs"
        v-if="this.statementData.statementType === 1"
        :statement-data="this.statementData"
        @duplicate-statement="duplicateStatement"
        @toggle-collapsed-statement-truth="toggleCollapsedStatementTruth"
    />
    <StatementStudent
        v-bind="$attrs"
        v-if="this.statementData.statementType === 2"
        :statement-data="this.statementData"
        @user-choice-changed="handleUserChoiceChanged"
        @duplicate-statement="duplicateStatement"
        @toggle-collapsed-statement-student="toggleCollapsedStatementStudent"
        @toggle-showPopup-fromstatementstudent="toggleShowPopupStatementStudent"
    />
    <StatementFreeText
        v-bind="$attrs"
        v-if="this.statementData.statementType === 3"
        :statement-statementData="this.statementData"
        @user-input-changed="handleUserInputChanged"
        @duplicate-statement="duplicateStatement"
    />
    <div v-if="renderedText">{{ renderedText }}</div>
  </div>
</template>

<script>
import StatementRoot from "@/components/statements/StatementRoot.vue";
import StatementTruth from "@/components/statements/StatementTruth.vue";
import StatementStudent from "@/components/statements/StatementStudent.vue";
import StatementFreeText from "@/components/statements/StatementFreeText.vue";

export default {
  name: "RenderStatement",
  components: {
    StatementFreeText,
    StatementStudent,
    StatementTruth,
    StatementRoot,
  },
  emits: [
    "update-statement-content", 
    "onDragStart", 
    "delete-statement",
    "connector-dropped-on-statement",
    "statement-dropped-on-statement",
    "duplicate-statement",
    "toggle-collapsed-renderstatement",
    "toggle-showPopup-fromrenderstatement",
    "update-shared-data"
  ],
  inheritAttrs: false,
  props: {
    statementData: Object,
    sharedData: Object,
  },
  data() {
    return {
      contentText: "",
      answeredStat: null,
      hide_renderCollapsed: false,
      hide_renderShowPopups: true,
      remove_formats: [".png", ".jpg", ".jpeg"],  // array of formats to exclude from the answer string
    };
  },
  methods: {
    handleDoubleClick(combinedText) {
      this.renderedText = combinedText;
    },
    handleDragOveringRenderStatement(e){
      console.log("render over event");
    },
    handleDragEnteringRenderStatement(e){
            console.log("render enter event");
    },
    handleDragLeavingRenderStatement(e){
      console.log("render leave event");
    },
    
    startDrag(e, data) {
      // e.target.className = 'dragEffect';
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("data", JSON.stringify(this.statementData));
      e.dataTransfer.setData("type", "statement");
      // Pass the statement content through drag event
      e.dataTransfer.setData("content", this.contentText);

      // Pass the click offset
      const mmBox = this.$refs.mmStatementBox;
      var rect = mmBox.getBoundingClientRect();
      const grabOffsetLeft = e.clientX - rect.left;
      const grabOffsetTop = e.clientY - rect.top;

      console.log("---START DRAG e.client (X,Y)---", e.clientX, e.clientY );
      console.log("---START DRAG rect position=---", rect.left, rect.top);
      console.log("---START DRAG grabOffset is diff---", grabOffsetLeft, grabOffsetTop);
      e.dataTransfer.setData("grabOffsetLeft", grabOffsetLeft.toString());
      e.dataTransfer.setData("grabOffsetTop", grabOffsetTop.toString());

      this.$emit("onDragStart", data);

      // set the global sharedData (YUK!)
      // only because dragEnter can't see insides of the dataTransfer object
      const draggedWidth = e.currentTarget.offsetWidth;
      const draggedHeight = e.currentTarget.offsetHeight;
      const dragInformation = JSON.stringify({
        draggedWidth: draggedWidth,
        draggedHeight: draggedHeight,
        drageeType : "render_statement",
        drageeConnectorID : undefined,
        })
      console.log("SETTING DRAG INFORMATION = ",dragInformation);
      this.$emit("update-shared-data",dragInformation);

    },

    onDrop(e) 
    {
      e.stopImmediatePropagation();
      const type = e.dataTransfer.getData("type");
      console.log("RenderStatement:onDrop type=",type);
      if (type=="connector") { // ignore if it was statement droopped on statement
        console.log(" emitting connector-dropped-on-statement");
        this.$emit("connector-dropped-on-statement", [this.statementData.id, undefined, e] ); // let the Parent deal with it
      } else if (type=="statement"){
        console.log(" emitting statement-dropped-on-statement");
        this.$emit("statement-dropped-on-statement", [this.statementData.id, e] ); // let the Parent deal with it
      }
    },

    handleUserChoiceChanged(info) {
      this.contentText = info[0];
      this.answeredStat = info[1];
      this.$emit("update-statement-content", [
        this.contentText,
        this.answeredStat,
      ]);
    },

    handleUserInputChanged(info) {
      this.contentText = info[0];
      this.answeredStat = info[1];
      this.$emit("update-statement-content", [
        this.contentText,
        this.answeredStat,
      ]);
    },

    duplicateStatement(id) {
      console.log('RenderStatement:duplicateStatement - calling emit duplicate-statement')
      this.$emit("duplicate-statement",id); // pass it on up the chain
    },

    toggleCollapsedStatementStudent(id) {
      console.log('RenderStatement:toggleCollapsedStatementStudent - calling emit toggle-collapsed-renderstatement')
      this.$emit("toggle-collapsed-renderstatement",id); // pass it on up the chain
    },
    toggleCollapsedStatementTruth(id) {
      console.log('RenderStatement:toggleCollapsedStatementTruth - calling emit toggle-collapsed-renderstatement')
      this.$emit("toggle-collapsed-renderstatement",id); // pass it on up the chain
    },
    toggleCollapsedStatementRoot(id) {
      console.log('RenderStatement:toggleCollapsedStatementRoot - calling emit toggle-collapsed-renderstatement')
      this.$emit("toggle-collapsed-renderstatement",id); // pass it on up the chain
    },

    toggleShowPopupStatementStudent(id) {
      console.log('RenderStatement:toggleShowPopupStatementStudent - calling emit toggle-showPopup-fromrenderstatement')
      this.$emit("toggle-showPopup-fromrenderstatement",id); // pass it on up the chain
    },

    toggleShowPopupStatementRoot(id) {
      console.log('RenderStatement:toggleShowPopupStatementRoot - calling emit toggle-showPopup-fromrenderstatement')
      this.$emit("toggle-showPopup-fromrenderstatement",id); // pass it on up the chain
    },

    initContent() {
      if (
        this.statementData.statementType === 0 ||
        this.statementData.statementType === 1
      ) {
        // TODO: process the "xxx.jpg" in TRUTH statement
        this.contentText = this.statementData.content.originalFacts
          .filter(
            (fact) => !this.remove_formats.some((format) => fact.includes(format))
          )
          .join(" ");
      }
      this.answeredStat = this.statementData;
    },

    deleteStatement() {
      // Emit an event to the parent component indicating that this connector should be deleted
      this.$emit("delete-statement");
    },
  },
  watch: {
    data() {
      this.initContent();
    },
    // Pass the changed statement content
    // contentText(newStatementContent) {
    //     this.$emit('update-statement-content', newStatementContent);
    //     // console.log(this.contentText);
    // }
  },

  created() {
    // this.answeredStat = this.statementData;
    this.initContent();
  },
};
</script>

<style scoped>
.delete-button {
  margin-left: 10px;
  padding: 5px;
  background-color: #ff0000;
  color: #ffffff;
  border: none;
  cursor: pointer;
  border-radius: 20%;
}
.statement-box {
  background-color: #ffffff;
  display: inline-block; /* Display as inline block */
  border: 1px solid rgb(210, 158, 199); /* Optional: Add border for visualization */
  position: relative;
}
.statement-box:hover {
  background-color: #dbbaba;
  display: inline-block; /* Display as inline block */
  border: 2px solid rgb(190, 37, 157); /* Optional: Add border for visualization */
  transform: translate(-1px, -1px);
  position: relative;
}

.statement-box:hover  .iconContainer {
  border: 5px solid rgb(12, 0, 246);
}


</style>
