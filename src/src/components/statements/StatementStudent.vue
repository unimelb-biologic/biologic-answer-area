<template>
  <div @dblclick="handleDoubleClick">
    <!-- if clickCount is odd，display the render text -->
    <div v-if="clickCount % 2 !== 0">
      {{ renderedText }}
    </div>

    <!-- if clickCount is even，display the text and the options -->
    <div v-else>
      <!-- record the statement position-->
      <div class="StatementStudent" v-for="(segment, index) in this.data.content.originalFacts"
           :key="index">
        <!-- render the text from selection -->
        <div v-if="typeof segment === 'string'">
          {{ segment }}
        </div>

        <!-- render the options -->
        <div v-else>
          <div v-for="item in segment.slice(2)">
            <input type="radio" :id="item" :value="item" v-model="userSelected[index]">
            <label :for="item in segment.slice(2)">{{item}}</label><br>
          </div>
        </div>
      </div>
      <!-- Display tooltips for this statement-->
      <span v-if="data.visible" class="StatementRoot_tooltip">
      You can use this statement to answer the question.
    </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatementStudent",
  emits: ["user-choice-changed"],
  props: {
    data: Object,
    position: String,
  },
  data() {
    return {
      statementType: this.data.statementType,
      id: this.data.id,
      originalFacts: this.data.content.originalFacts,
      previousUserInput: this.data.content.userInput,
      userSelected: [],
      answeredData: null,
      renderedText: "",
      clickCount: 0,
    };
  },
  methods: {
    handleDoubleClick() {
      this.clickCount++;

      if (this.clickCount % 2 !== 0) {
        let constructedSentence = "";
        for (let i = 0; i < this.data.content.originalFacts.length; i++) {
          if (typeof this.data.content.originalFacts[i] === "string") {
            constructedSentence += this.data.content.originalFacts[i] + " ";
          } else {
            constructedSentence += this.userSelected[i] + " ";
          }
        }
        this.renderedText = constructedSentence.trim();
      }
    },

    handleSelectChange() {
      let studentContentText = "";
      // Concat all the texts
      for (let i = 0; i < this.originalFacts.length; i++) {
        if (typeof this.originalFacts[i] === "string") {
          studentContentText += this.originalFacts[i];
          studentContentText += " ";
        } else {
          studentContentText += this.userSelected[i];
          studentContentText += " ";
        }
      }

      let newUserInput = [];
      for (let i = 0; i < this.userSelected.length; i++) {
        if (this.userSelected[i] != "") {
          newUserInput.push(this.userSelected[i]);
        }
      }
      this.answeredData.content.userInput = newUserInput;

      this.$emit("user-choice-changed", [
        studentContentText,
        this.answeredData,
      ]);
    },

    initContent() {
      this.statementType = this.data.statementType;
      this.id = this.data.id;
      this.originalFacts = this.data.content.originalFacts;
      this.previousUserInput = this.data.content.userInput;

      let userInputID = 0;
      this.userSelected = [];
      for (let i = 0; i < this.originalFacts.length; i++) {
        if (typeof this.originalFacts[i] === "string") {
          this.userSelected.push("");
        } else {
          this.userSelected.push(this.previousUserInput[userInputID]);
          userInputID += 1;
        }
      }

      this.answeredData = this.data;
    },
  },
  watch: {
    userSelected: {
      handler: "handleSelectChange",
      deep: true,
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
.StatementStudent {
  background-color: Khaki;
  border: 1px solid black;
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: left;
  padding: 10px;
  margin: 10px;
  position: relative;
  display: inline-block;
}
</style>
