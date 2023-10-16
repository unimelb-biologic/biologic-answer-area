<template>
  <div class="StatementRoot">
    <div class="content-wrapper">
      <button v-if="showToggle" @click="toggleView">T</button>
      
      <div class="main-content">
        <div v-if="showConcatenated">
          {{ concatenatedStatement }}
        </div>

        <div v-else>
          <!-- record the statement position-->
          <div v-for="(segment, index) in data.content.originalFacts" :key="index">
            <!-- render the text from selection -->
            <div v-if="typeof segment === 'string'">
              {{ segment }}
            </div>

            <!-- render the options -->
            <div v-else>
              <select v-model="userSelected[index]">
                <option v-for="item in segment" :value="item" :key="item">
                  {{ item }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <!-- Display tooltips for this statement-->
        <span v-if="data.visible" class="StatementRoot_tooltip">
          This statement must be used.<br /><br />
          It is a starting point for the rest of the problem.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatementRoot",
  emits: ["user-choice-changed"],
  props: {
    data: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statementType: this.data.statementType,
      id: this.data.id,
      originalFacts: this.data.content.originalFacts,
      previousUserInput: this.data.content.userInput,
      userSelected: [],
      answeredData: null,
      showConcatenated: false,
    };
  },
  computed: {
    concatenatedStatement() {
      return this.data.content.originalFacts.map((segment, index) => 
        typeof segment === 'string' ? segment : this.userSelected[index] || segment[0]
      ).join(" ");
    }
  },
  methods: {
    toggleView() {
      this.showConcatenated = !this.showConcatenated;
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
.StatementRoot {
  background-color: LightSkyBlue;
  border: 1px solid black;
  padding: 10px;
  margin: 10px;
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: center;
  position: relative;
  display: inline-block;
}

.content-wrapper {
  display: flex;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  padding-left: 10px;
}

button {
  margin-right: 10px;
}
</style>
