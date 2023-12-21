<template>
  <!-- record the statement position-->
  <div class="StatementTruth">
    <div class = "content-wrapper">
    <div class="iconContainer">
      <button v-if="showToggle && this.statementData.collapsed" @click="toggleCollapsedStatement" class="statementButton">
          <img 
          class="toggle-expand-collapse"
          src="../../assets/expand_icon.png"
          alt="ToggleExpandCollapse"
          width="20"
          />
      </button>
      <button v-if="showToggle && !this.statementData.collapsed" @click="toggleCollapsedStatement" class="statementButton">
          <img 
          class="toggle-expand-collapse"
          src="../../assets/collapse_icon.png"
          alt="ToggleExpandCollapse"
          width="20"
          />
      </button>

      <button @click="duplicateMe" class="statementButton">
        <img
        class="duplicate-statement-button"
        src="../../assets/duplicate_icon.png"
        alt="DuplicateStatement"
        width="20"
        />
      </button>
    </div>
    <div class="main-content">
      <div v-if="this.statementData.collapsed" class="concatenated-statement">
          {{ concatenatedStatement }}
      </div>
      <div v-else>
        <div
          v-for="(segment, index) in this.statementData.content.originalFacts"
          :key="index"
        >
          <!-- render the text from selection -->
          <div v-if="typeof segment === 'string'">
            <div v-if="isImage(segment)">
              <img :src="segment" class="biologicImage">
            </div>
            <div v-else>
              {{ segment }}
            </div>
          </div>
          <div v-else>
            <select v-model="userSelected[index]">
              <option v-for="item in segment" :value="item" :key="item">
                {{ item }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
    <!-- Display tooltips for this statement-->
    <span v-if="statementData.visible" class="StatementTruth_tooltip">
      The content in this statement is a fact. It is always correct.
    </span>
  </div>
</template>

<script>
export default {
  name: "StatementTruth",
  emits: ["duplicate-statement","toggle-collapsed-statement-truth"],
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
      //TODO: confirm that the first entry is text, 2nd entry is image.
      userInput: this.statementData.content.userInput,
      id: this.statementData.id,
    };
  },
  computed: {
    concatenatedStatement() {
      return this.statementData.content.originalFacts.map((segment, index) => 
        typeof segment === 'string' ? (this.isImage(segment)?"":segment) : this.userSelected[index] || segment[0]
      ).join(" ");
    },
    getCollapseExpandIcon(){
      return this.collapsed ? "src/assets/expand_icon.png" : "src/assets/collapse_icon.png";
    }
  },
  methods: {
    // Verify the image format to display
    isImage(fact) {
      const isImg = fact.endsWith(".jpg") || fact.endsWith(".png") || fact.endsWith(".jpeg");
      //console.log("testing if fact<",fact," is an image - result is ",isImg);
      return ( isImg );
    },
    duplicateMe(){
      this.$emit("duplicate-statement", [ this.id ]);
    },
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log("StatementTruth:toggleCollapsedStatement")
      this.$emit("toggle-collapsed-statement-truth", this.id );
    },

    initContent() {
      this.statementType = this.statementData.statementType;
      this.id = this.statementData.id;
      this.originalFacts = this.statementData.content.originalFacts;
      this.previousUserInput = this.statementData.content.userInput;
      this.userInputText = this.previousUserInput;
      this.answeredData = this.statementData;
    },
  },
};
</script>

<style scoped>
@import "@/assets/tooltips.css";
.StatementTruth {
  background-color: rgb(233, 255, 212);
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: left;
  padding: 2px;
  margin: 2px;
  position: relative;
  display: inline-block;
  white-space: pre-wrap;
  max-width: 150px;
}

.StatementTruth:hover .iconContainer {
  opacity:1;
}
.statementButton {
  width: 24px;
  height: 24px;
  margin: 2px;
  padding: 1px;
  align-items: center;
}

.content-wrapper {
  display: flex;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  padding-left: 2px;
}

.iconContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px;
  opacity: 0.05;
  transition: opacity 0.3s ease;
}

.biologicImage {
  max-width: 100%;
  width: 100px;
}

.statementRadioButtons {
  border: 1px solid rgb(138, 138, 138);
  align-items: middle;
}


.concatenated-statement {
  white-space: pre-wrap;
  max-width: 100px;
}

</style>
