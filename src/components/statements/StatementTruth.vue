<template>
  <!-- record the statement position-->
  <div class="StatementTruth">
    <FeedbackRubric :isVisible="showFeedback" :exnetID="id" />
     
    <div class="content-wrapper">

      <div class="iconContainer">

        <Tooltip text=" expand this statement ">
          <v-btn  size="x-small" v-if="showToggle && this.statementData.collapsed" @click="toggleCollapsedStatement"
            class="statementButton">
            <v-icon>mdi-arrow-expand</v-icon>
        </v-btn>
        </Tooltip>
        <Tooltip text=" collapse this statement ">
        <v-btn  size="x-small" v-if="showToggle && !this.statementData.collapsed" @click="toggleCollapsedStatement"
          class="statementButton">
          <v-icon>mdi-arrow-collapse</v-icon>
        </v-btn>
      </Tooltip>


        <Tooltip text="duplicate this statement">
        <v-btn size="x-small" v-if="showToggle && !displayOnly" @click="duplicateMe" class="statementButton">
          <!--img class="statementButtonImage" src="../../assets/duplicate_icon.png" alt="DuplicateStatement" /-->
          <v-icon>mdi-content-duplicate</v-icon>
        </v-btn>
      </Tooltip>

        <button v-if="showToggle && isFeedbackAvailable" @click="showFeedback = !showFeedback" class="statementButton">
          <img src="../../assets/feedback-rubric.png" alt="FeedbackStatement" width="20" />
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
                <img :src="segment" class="biologicImage" />
              </div>
              <div v-else>
                {{ segment }}
              </div>
            </div>
            <div v-else>
              <select v-model="userSelected[index]" class="dropdown-shadow">
                <option v-for="item in segment" :value="item" :key="item">
                  {{ item }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FeedbackRubric from "../FeedbackRubric.vue";
import Tooltip from '../Tooltip.vue';

export default {
  name: "StatementTruth",
  components: {
    FeedbackRubric,
    Tooltip,
  },
  inject: [
    "displayOnly" // this means no editing of popups or dragging etc. Like it's readonly. But we do allow collapsing/uncollapsing
  ],
    emits: [
    "user-choice-changed",
    "duplicate-statement",
    "toggle-collapsed-statement-truth",
  ],
  props: {
    statementData: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: true,
    },
  },
  inject: ["isFeedbackAvailable", "showAllFeedback","displayOnly"],
  data() {
    return {
      //TODO: confirm that the first entry is text, 2nd entry is image.
      id: this.statementData.id,
      statementType: this.statementData.statementType,
      originalFacts: this.statementData.content.originalFacts,
      previousUserInput: this.statementData.content.userInput,

      userSelected: [],
      answeredData: null,
      showFeedback: false,
    };
  },
  computed: {
    concatenatedStatement() {
      return this.statementData.content.originalFacts
        .map((segment, index) =>
          typeof segment === "string"
            ? this.isImage(segment)
              ? ""
              : segment
            : this.userSelected[index] || segment[0]
        )
        .join(" ");
    },
    getCollapseExpandIcon() {
      return this.collapsed
        ? "src/assets/expand_icon.png"
        : "src/assets/collapse_icon.png";
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
    showAllFeedback() {
      this.showFeedback = this.showAllFeedback;
    },
  },
  created() {
    this.initContent();
  },

  methods: {
    // Verify the image format to display
    isImage(fact) {
      const isImg =
        fact.endsWith(".jpg") ||
        fact.endsWith(".png") ||
        fact.endsWith(".jpeg");
      //console.log("testing if fact<",fact," is an image - result is ",isImg);
      return isImg;
    },
    duplicateMe() {
      this.$emit("duplicate-statement", [this.id]);
    },
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log("StatementTruth:toggleCollapsedStatement");
      this.$emit("toggle-collapsed-statement-truth", this.id);
    },

    handleSelectChange() {
      let studentContentText = "";
      // Concat all the texts
      for (let i = 0; i < this.originalFacts.length; i++) {
        if (typeof this.originalFacts[i] === "string") {
          // formatting original fact to remove https links and images
          const formattedFact = this.originalFacts[i].replace(
            /(https?:\/\/[^\s]+)|(\.png$)|(\.jpg$)|(\.jpeg$)/gi,
            ""
          );
          studentContentText += formattedFact;
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
      this.statementType = this.statementData.statementType;
      this.id = this.statementData.id;
      this.originalFacts = this.statementData.content.originalFacts;
      this.previousUserInput = this.statementData.content.userInput;

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

      this.answeredData = this.statementData;
    },
  },

  mounted() {
    //console.log("StatementTruth mounted");
  },

};
</script>

<style scoped>
@import "@/assets/tooltips.css";
.StatementTruth {
  background-color: rgb(233, 255, 212);
  font-size: var(--biologic-statement-font-size);
  padding: 2px;
  margin: 2px;
  position: relative;
  white-space: pre-wrap;
  max-width: 150px;
}

.StatementTruth:hover .iconContainer {
  opacity: 1;
}
.statementButton {
  cursor: pointer;
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
