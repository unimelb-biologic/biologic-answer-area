<template>
  <!-- record the statement position-->
  <div class="StatementFreeText">
    <div class="iconContainer">
      <button v-if="showToggle" @click="duplicateMe" class="statementButton">
        <img
        class="duplicate-statement-button"
        src="../../assets/duplicate_icon.png"
        alt="DuplicateStatement"
        width="20"
        />
      </button>
    </div>

    <div class="text">Free text entry...</div>
    <textarea v-model="userInputText" id="input" class="textarea"></textarea>
    <!-- Display tooltips for this statement-->
    <span v-if="statementData.visible" class="StatementFreeText_tooltip">
      You can use this statement to answer the question.
    </span>
  </div>
</template>

<script>
export default {
  name: "StatementFreeText",
  emits: ["user-input-changed","duplicate-statement"],
  props: {
    statementData: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      statementType: this.statementData.statementType,
      id: this.statementData.id,
      originalFacts: this.statementData.content.originalFacts,
      previousUserInput: this.statementData.content.userInput,
      userInputText: "",

      answeredData: null,
    };
  },
  methods: {
    initContent() {
      this.statementType = this.statementData.statementType;
      this.id = this.statementData.id;
      this.originalFacts = this.statementData.content.originalFacts;
      this.previousUserInput = this.statementData.content.userInput;
      this.userInputText = this.previousUserInput;
      this.answeredData = this.statementData;
    },
    duplicateMe(){
      this.$emit("duplicate-statement", [ this.id ]);
    },

  },
  watch: {
    // Pass the new input to other component
    userInputText(newUserInput) {
      this.answeredData.content.userInput = newUserInput;
      this.$emit("user-input-changed", [newUserInput, this.answeredData]);
    },
    data() {
      this.initContent();
    },
  },
  created() {
    this.initContent();
  },
};
</script>

<style scoped>
@import "@/assets/tooltips.css";
.StatementFreeText {
  background-color: White;
  border: 1px solid black;
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: center;
  margin: 10px;
  position: relative;
  display: inline-block;
}
.text {
  margin-top: 10px;
  margin-bottom: 10px;
}

.textarea {
  height: 6vw;
}
</style>
