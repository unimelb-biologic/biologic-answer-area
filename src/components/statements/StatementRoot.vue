<template>
  <div class="StatementRoot">
    <FeedbackRubric :isVisible=showFeedback :exnetID=id />

    <div class="content-wrapper">

      <div class="iconContainer">

        <Tooltip text=" expand this statement ">
          <v-btn size="x-small" v-if="showToggle && this.statementData.collapsed" @click="toggleCollapsedStatement"
            class="statementButton">
            <v-icon>mdi-arrow-expand</v-icon>
          </v-btn>
        </Tooltip>
        <Tooltip text=" collapse this statement ">
          <v-btn size="x-small" v-if="showToggle && !this.statementData.collapsed" @click="toggleCollapsedStatement"
            class="statementButton">
            <v-icon>mdi-arrow-collapse</v-icon>
          </v-btn>
        </Tooltip>

        <Tooltip text="switch between menus and radio-buttons">
          <v-btn size="x-small" v-if="showToggle && !this.statementData.collapsed" @click="toggleShowPopup"
            class="statementButton">
            <img class="statementButtonImage" src="../../assets/popup_radio_icon.png" alt="RadioPopupToggle" />
          </v-btn>
        </Tooltip>

        <Tooltip text="duplicate this statement">
          <v-btn size="x-small" v-if="showToggle && !displayOnly" @click="duplicateMe" class="statementButton">
            <!--img class="statementButtonImage" src="../../assets/duplicate_icon.png" alt="DuplicateStatement" /-->
            <v-icon>mdi-content-duplicate</v-icon>
          </v-btn>
        </Tooltip>

        <!--Tooltip :text="deleteButtonTooltipText">
        <v-btn v-if="!displayOnly" icon size="xx-small" @click="deleteStatement" class="statementButton">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </Tooltip-->

        <button v-if="showToggle && isFeedbackAvailable" @click="showFeedback = !showFeedback" class="statementButton">
          <img src="../../assets/feedback-rubric.png" alt="FeedbackStatement" width="20" />
        </button>

      </div>

      <Tooltip
        text="Blue statements are called ROOT statements. They will usually form the first or last statement of your answer.">
        <div class="main-content">

          <div v-if="this.statementData.collapsed" class="concatenated-statement">
            {{ concatenatedStatement }}
          </div>

          <div v-else-if="!this.statementData.showPopup" class="radio-statement">
            <!-- radio button format -->
            
              <div v-for="(segment, index) in this.statementData.content.originalFacts" :key="index"
                style="float: left; ">
                <div v-if="typeof segment === 'string'" class="segmentString">


                  <div v-if="isImage(segment)">
                    <img :src="segment" class="biologicImage">
                  </div>
                  <div v-else class="segmentString">
                    {{ segment }}
                  </div>

                </div>
                <div v-else class="statementRadioButtons">
                  <div v-for="item in segment">
                    <div v-if="item.indexOf('--')">
                      <input :disabled="displayOnly" type="radio" :id="item" :value="item"
                        v-model="userSelected[index]">
                      <label :for="item in segment">{{ item }}</label><br>
                    </div>
                  </div>
                </div>
              </div>
            
          </div>
          <div v-else>
            <!-- dropdown format -->
            
              <div v-for="(segment, index) in this.statementData.content.originalFacts" :key="index">
                <!-- render the text from selection -->
                <div v-if="typeof segment === 'string'">

                  <div v-if="isImage(segment)">
                    <img :src="segment" class="biologicImage">
                  </div>
                  <div v-else>
                    {{ segment }}
                  </div>

                </div>
                <!-- render the options -->
                <div v-else>
                  <select :disabled="displayOnly" v-model="userSelected[index]" class="dropdown-shadow">
                    <option v-for="item in segment" :value="item" :key="item">
                      {{ item }}
                    </option>
                  </select>
                </div>
              </div>
            
          </div>
        </div>
      </Tooltip>
    </div>
  </div>
</template>

<script>
import FeedbackRubric from '../FeedbackRubric.vue';
import Tooltip from '../Tooltip.vue';
import "@/assets/biologic.css";

export default {
  name: "StatementRoot",
  components: {
    FeedbackRubric,
    Tooltip,
  },
  emits: ["user-choice-changed", "duplicate-statement",     "delete-statement",
"toggle-showPopup-fromstatementroot", "toggle-collapsed-statement-root"],
  inject: [
    "displayOnly" // this means no editing of popups or dragging etc. Like it's readonly. But we do allow collapsing/uncollapsing
  ],
  props: {
    statementData: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: true
    }
  },
  inject: ['isFeedbackAvailable', 'showAllFeedback', 'displayOnly'],
  data() {
    return {
      statementType: this.statementData.statementType,
      id: this.statementData.id,
      originalFacts: this.statementData.content.originalFacts,
      previousUserInput: this.statementData.content.userInput,
      userSelected: [],
      answeredData: null,
      hide_collapsed: false,
      hide_showPopup: true,
      showFeedback: false
    };
  },
  computed: {
    concatenatedStatement() {
      return this.statementData.content.originalFacts.map((segment, index) =>
        typeof segment === 'string' ? (this.isImage(segment) ? "" : segment) : this.userSelected[index] || segment[0]
      ).join(" ");
    },
    getCollapseExpandIcon() {
      return this.collapsed ? "src/assets/expand_icon.png" : "src/assets/collapse_icon.png";
    }

  },
  methods: {
    handleDragEnteringStatementRoot(e) {
      console.log("statementRoot enter event");
      //      e.preventDefault();
      // Prevent child events from reaching the parent
      e.stopPropagation();
    },
    handleDragLeavingStatementRoot(e) {
      console.log("statementRoot leave event");
      //      e.preventDefault();
    },
    isImage(fact) {
      const isImg = fact.endsWith(".jpg") || fact.endsWith(".png") || fact.endsWith(".jpeg");
      //console.log("testing if fact<",fact," is an image - result is ",isImg);
      return (isImg);
    },
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log("StatementRoot:toggleCollapsedStatement")
      this.$emit("toggle-collapsed-statement-root", this.id);
    },
    toggleShowPopup() {
      //this.showPopup = !this.showPopup;
      console.log("StatementRoot:toggleShowPopup emitting toggle-showPopup-fromstatementroot")
      this.$emit("toggle-showPopup-fromstatementroot", [this.id]);
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
      //console.log("StatementRoot::emitting user-choice-changed ",studentContentText,this.answeredData);
      this.$emit("user-choice-changed", [
        studentContentText,
        this.answeredData,
      ]);
    },
    duplicateMe() {
      this.$emit("duplicate-statement", [this.id]);
    },
    deleteStatement() {
      // Emit an event to the parent component indicating that this statement should be deleted
      this.$emit("delete-statement", [this.id]);
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
    //console.log("StatementRoot mounted",this);
  },

  watch: {
    statementData(newValue,oldValue) {
      this.initContent();
    },
    userSelected: {
      handler: "handleSelectChange",
      deep: true,
    },
    data() {
      this.initContent();
    },
    showAllFeedback() {
      this.showFeedback = this.showAllFeedback
    }
  },
  created() {
    this.initContent();
  },
};
</script>

<style scoped>
@import "@/assets/tooltips.css";

.StatementRoot {
  background-color: rgb(213, 239, 255);
  padding: 2px;
  margin: 2px;
  font-size: var(--biologic-statement-font-size);
  position: relative;
}

.StatementRoot:hover .iconContainer {
  opacity: 1;
}

.content-wrapper {
  display: flex;
  height: 100%;
}

.main-content {
  padding-left: 2px;
  height: 100%;
  font-size: var(--biologic-statement-font-size);
}

button {
  margin-right: 2px;
}

.segmentString {
  min-height: inherit;
  padding: 10% 2px;
}

.concatenated-statement {
  white-space: pre-wrap;
  max-width: 100px;
}

.iconContainer {
  display: flex;
  flex-direction: column;
  align-items: top;
  padding: 2px;
  opacity: 0.05;
  transition: opacity 0.3s ease;
}

.statementButton {
  cursor: pointer;
  width: 24px;
  height: 24px;
  margin: 1px;
  padding: 1px;
  align-items: center;
}

.statementButtonImage {
  width: 20px;
}

.radio-statement {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.statementRadioButtons {
  border: 1px solid rgb(138, 138, 138);
  align-items: middle;
  font-size: var(--biologic-statement-font-size);
}


.biologicImage {
  max-width: 100%;
  width: 100px;
}
</style>
