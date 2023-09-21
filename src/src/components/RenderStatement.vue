<template>
  <div
      class="statement-box"
      :draggable="true"
      @dragstart.stop="startDrag($event, data)"
      @dragover.prevent
      @dragenter.prevent
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
        @double-clicked="handleDoubleClick"
    />
    <StatementTruth
        v-bind="$attrs"
        v-if="this.data.statementType === 1"
        :data="this.data"
    />
    <StatementStudent
        v-bind="$attrs"
        v-if="this.data.statementType === 2"
        :data="this.data"
        @user-choice-changed="handleUserChoiceChanged"
    />
    <StatementFreeText
        v-bind="$attrs"
        v-if="this.data.statementType === 3"
        :data="this.data"
        @user-input-changed="handleUserInputChanged"
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
  emits: ["update-statement-content", "onDragStart", "delete-statement"],
  inheritAttrs: false,
  props: {
    data: Object,
  },
  data() {
    return {
      contentText: "",
      answeredStat: null,
    };
  },
  methods: {
    handleDoubleClick(combinedText) {
      this.renderedText = combinedText;
    },

    startDrag(e, data) {
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

    initContent() {
      if (this.data.statementType === 0 || this.data.statementType === 1) {
        // TODO: process the "xxx.jpg" in TRUTH statement
        this.contentText = this.data.content.originalFacts
            .filter((fact) => !fact.includes(".jpg"))
            .join(" ");
      }
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
  border: 1px solid rgb(74, 85, 240); /* Optional: Add border for visualization */
  position: relative;
}
</style>
