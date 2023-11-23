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
      position: this.data.position,
      left: this.data.left + 'px',
      top: this.data.top + 'px',
    }"
  >
    <!-- <button v-if="!data.visible" class="delete-button" @click="deleteStatement(connectorID)">Delete</button> -->
    <StatementRoot
        v-bind="$attrs"
        v-if="this.data.statementType === 0"
        :data="this.data"
        @user-choice-changed="handleUserChoiceChanged"
        @duplicate-statement="duplicateStatement"
        @toggle-collapsed-statement-root="toggleCollapsedStatementRoot"
        @toggle-showPopup-fromstatementroot="toggleShowPopupStatementRoot"
    />
    <StatementTruth
        v-bind="$attrs"
        v-if="this.data.statementType === 1"
        :data="this.data"
        @duplicate-statement="duplicateStatement"
        @toggle-collapsed-statement-truth="toggleCollapsedStatementTruth"
    />
    <StatementStudent
        v-bind="$attrs"
        v-if="this.data.statementType === 2"
        :data="this.data"
        @user-choice-changed="handleUserChoiceChanged"
        @duplicate-statement="duplicateStatement"
        @toggle-collapsed-statement-student="toggleCollapsedStatementStudent"
        @toggle-showPopup-fromstatementstudent="toggleShowPopupStatementStudent"
    />
    <StatementFreeText
        v-bind="$attrs"
        v-if="this.data.statementType === 3"
        :data="this.data"
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
  emits: ["update-statement-content", "onDragStart", "delete-statement","connector-dropped-on-statement","duplicate-statement","toggle-collapsed-renderstatement","toggle-showPopup-fromrenderstatement"],
  inheritAttrs: false,
  props: {
    data: Object,
  },
  data() {
    return {
      contentText: "",
      answeredStat: null,
      hide_renderCollapsed: false,
      hide_renderShowPopups: true,
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
      /*
      e.preventDefault();
      const statementRoot = this.$el.querySelector('.StatementRoot');
      if (statementRoot) {
        // some issues with these approaches so comment out for now MM.
//        console.log("adding no-pointer-events class to StatementRoot");
//        statementRoot.classList.add('no-pointer-events');
//        statementRoot.style.pointerEvents = 'none';
      }
      //const classArray = Array.from(statementRoot.classList);
      // Log the array of classes
      //console.log('CLASSES=',classArray);
      */
    },
    handleDragLeavingRenderStatement(e){
      console.log("render leave event");
      /*
      const statementRoot = this.$el.querySelector('.StatementRoot');
//      console.log("statementRoot = ",statementRoot);
      if (statementRoot) {
        //console.log("removing no-pointer-events class to StatementRoot")
        //statementRoot.classList.remove('no-pointer-events');
//        statementRoot.style.pointerEvents = 'auto';
      }
      //const classArray = Array.from(statementRoot.classList);
      // Log the array of classes
      //console.log('CLASSES=',classArray);
      */
    },
    
    startDrag(e, data) {
      // e.target.className = 'dragEffect';
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("data", JSON.stringify(this.data));
      e.dataTransfer.setData("type", "statement");
      // Pass the statement content through drag event
      e.dataTransfer.setData("content", this.contentText);

      // Pass the click offset
      const mmBox = this.$refs.mmStatementBox;
      var rect = mmBox.getBoundingClientRect();
      const grabOffsetLeft = e.clientX - rect.left;
      const grabOffsetTop = e.clientY - rect.top;

      console.log("---START DRAG grabOffset---", grabOffsetLeft, grabOffsetTop);
      e.dataTransfer.setData("grabOffsetLeft", grabOffsetLeft.toString());
      e.dataTransfer.setData("grabOffsetTop", grabOffsetTop.toString());

      this.$emit("onDragStart", data);
    },

    onDrop(e) 
    {
      e.stopImmediatePropagation();
      const type = e.dataTransfer.getData("type");
      console.log("RenderStatement:onDrop type=",type);
      if (type=="connector") { // ignore if it was statement droopped on statement
        console.log(" emitting connector-dropped-on-statement");
        this.$emit("connector-dropped-on-statement", [this.data.id, undefined, e] ); // let the Parent deal with it
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
      if (this.data.statementType === 0 || this.data.statementType === 1) {
        // TODO: process the "xxx.jpg" in TRUTH statement
        this.contentText = this.data.content.originalFacts
            .filter((fact) => !fact.includes(".jpg"))
            .join(" ");
    }

    /*
      const renderStatementElement =
            document.getElementById("renderStatementElement");
      alert(renderStatementElement)
      renderStatementElement.addEventListener("dragover", function (e) {
          e.preventDefault(); // Allow drop
          renderStatementElement.classList.add("drag-over"); // Add a CSS class to change appearance
        });

        renderStatementElement.addEventListener("dragleave", function () {
          renderStatementElement.classList.remove("drag-over"); // Remove the CSS class when leaving
        });
      */
      // if (this.data.statementType === 2) {
      //     this.contentText = ""
      //     for (let i = 0; i < this.data.content.originalFacts.length; i++) {
      //         if (typeof(this.data.content.originalFacts[i]) === 'string') {
      //             this.contentText += this.data.content.originalFacts[i]
      //             this.contentText += ' '
      //         }
      //         else {
      //             this.contentText += "Unselected"
      //             this.contentText += ' '
      //         }
      //     }
      //     // console.log(this.contentText);
      // }
      // if (this.data.statementType === 3) {
      //     this.contentText = ""
      // }

      this.answeredStat = this.data;
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
    // this.answeredStat = this.data;
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
