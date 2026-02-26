<template>
  <div :class="['Statement', statementClass]">
    <FeedbackRubric :isVisible="showFeedback" :exnetID="id" />
    <div :class="freeAnswer ? 'free-content-wrapper' : 'content-wrapper'">
      <div
        v-show="showButtons && !dragInProgress"
        class="iconContainer"
        :class="statementClass"
      >
        <Tooltip
          :text="
            statementData.collapsed
              ? 'expand this statement'
              : 'collapse this statement'
          "
        >
          <v-btn
            size="x-small"
            v-show="showToggle"
            @click="toggleCollapsedStatement"
            class="statementButton"
            :aria-label="statementData.collapsed ? 'Expand' : 'Collapse'"
          >
            <v-icon>{{
              statementData.collapsed
                ? 'mdi-arrow-expand'
                : 'mdi-arrow-collapse'
            }}</v-icon>
          </v-btn>
        </Tooltip>

        <Tooltip
          text="switch between menus and radio-buttons"
          v-if="allowSwitch"
        >
          <v-btn
            size="x-small"
            v-if="showToggle && !this.statementData.collapsed"
            @click="toggleShowPopup"
            class="statementButton"
          >
            <img
              class="statementButtonImage"
              src="./assets/popup_radio_icon.png"
              alt="RadioPopupToggle"
            />
          </v-btn>
        </Tooltip>

        <Tooltip text="duplicate this statement">
          <v-btn
            size="x-small"
            v-if="showToggle && !displayOnly"
            @click="duplicateMe($event, id)"
            class="statementButton"
          >
            <v-icon>mdi-content-duplicate</v-icon>
          </v-btn>
        </Tooltip>

        <Tooltip text="Delete statement">
          <v-btn
            size="x-small"
            v-if="!displayOnly"
            @click="deleteStatement"
            class="statementButton"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </Tooltip>

        <button
          v-if="showToggle && isFeedbackAvailable"
          @click="showFeedback = !showFeedback"
          class="statementButton"
        >
          <img
            src="./assets/feedback-rubric.png"
            alt="FeedbackStatement"
            width="20"
          />
        </button>
      </div>
      <Tooltip :text="tooltipText">
        <div class="main-content">
          <div
            v-if="this.statementData.collapsed"
            class="concatenated-statement"
          >
            {{ concatenatedStatement }}
          </div>
          <div v-else-if="freeAnswer">
            <textarea
              v-model="freeInputText"
              id="input"
              class="textarea"
            ></textarea>
          </div>
          <div
            v-else-if="!this.statementData.showPopup"
            class="radio-statement"
          >
            <!-- radio button format -->

            <div
              v-for="(segment, index) in this.statementData.content
                .originalFacts"
              :key="index"
              style="float: left"
            >
              <div v-if="typeof segment === 'string'">
                <div v-if="isImage(segment)">
                  <img
                    :src="segment"
                    class="biologicImage"
                    v-hover-preview="500"
                  />
                </div>
                <div v-else>
                  {{ segment }}
                </div>
              </div>
              <div v-else class="statementRadioButtons">
                <div v-for="item in segment">
                  <div v-if="!isPlaceHolderOption(item)">
                    <input
                      :disabled="displayOnly"
                      type="radio"
                      :id="item"
                      :value="item"
                      v-model="userSelected[index]"
                    />
                    <label>{{ item }}</label
                    ><br />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <!-- dropdown format -->

            <div
              v-for="(segment, index) in this.statementData.content
                .originalFacts"
              :key="index"
            >
              <!-- render the text from selection -->
              <div v-if="typeof segment === 'string'">
                <div v-if="isImage(segment)">
                  <img
                    :src="segment"
                    class="biologicImage"
                    v-hover-preview="500"
                  />
                </div>
                <div v-else>
                  {{ segment }}
                </div>
              </div>
              <!-- render the options -->
              <div v-else>
                <select
                  :disabled="displayOnly"
                  v-model="userSelected[index]"
                  class="dropdown-shadow"
                >
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
import FeedbackRubric from './FeedbackRubric.vue';
import Tooltip from './shared/Tooltip.vue';
import { globalConsoleLog } from './util';

export default {
  name: 'Statement',
  components: {
    FeedbackRubric,
    Tooltip,
  },
  emits: [
    'user-choice-changed',
    'duplicate-statement',
    'delete-statement',
    'toggle-showPopup-fromstatement',
    'toggle-collapsed-statement',
  ],
  inject: [
    'displayOnly', // this means no editing of popups or dragging etc. Like it's readonly. But we do allow collapsing/uncollapsing
    'isFeedbackAvailable',
    'showAllFeedback',
    'displayOnly',
    'activeHover',
    'setActiveHover',
    'clearActiveHover',
  ],
  props: {
    statementData: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: true,
    },
    statementClass: String,
    tooltipText: String,
    allowSwitch: {
      type: Boolean,
      default: false,
    },
    freeAnswer: {
      type: Boolean,
      default: false,
    },
    dragInProgress: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      statementType: this.statementData.statementType,
      id: this.statementData.id,
      originalFacts: this.statementData.content.originalFacts,
      /**
       * Given originalFacts ['a', ['c1','c2'], 'b', ['c3','c4']]:
       * userSelected (used for radio/menu selection) format is ['', 'c1', '', 'c3']
       * userInput (used for data storage/exFlow) format is ['c1', 'c2']
       * That is, userSelected should be the same length as originalFacts,
       * whereas userInput should have a length equal to the number of arrays in originalFacts.
       */
      userSelected: [],
      previousUserInput: this.statementData.content.userInput,
      answeredData: null,
      hide_collapsed: false,
      hide_showPopup: true,
      showFeedback: false,
      freeInputText: '',
      showButtons: false,
    };
  },
  computed: {
    concatenatedStatement() {
      if (this.freeAnswer) return this.freeInputText;
      return this.statementData.content.originalFacts
        .map((segment, index) =>
          typeof segment === 'string'
            ? this.isImage(segment)
              ? ''
              : segment
            : this.userSelected[index] || segment[0],
        )
        .join(' ');
    },
    showButtons() {
      return this.activeHover.id === this.statementData.id;
    },
  },
  methods: {
    isPlaceHolderOption(option) {
      return option.startsWith('--');
    },
    isImage(fact) {
      const isImg =
        fact.endsWith('.jpg') ||
        fact.endsWith('.png') ||
        fact.endsWith('.jpeg');
      //console.log("testing if fact<",fact," is an image - result is ",isImg);
      return isImg;
    },
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log('Statement:toggleCollapsedStatement');
      this.$emit('toggle-collapsed-statement', this.id);
    },
    toggleShowPopup() {
      //this.showPopup = !this.showPopup;
      console.log(
        'Statement:toggleShowPopup emitting toggle-showPopup-fromstatement',
      );
      this.$emit('toggle-showPopup-fromstatement', [this.id]);
    },
    handleSelectChange() {
      let studentContentText = '';
      // Concat all the texts
      for (let i = 0; i < this.originalFacts.length; i++) {
        if (typeof this.originalFacts[i] === 'string') {
          studentContentText += this.originalFacts[i];
          studentContentText += ' ';
        } else {
          studentContentText += this.userSelected[i];
          studentContentText += ' ';
        }
      }
      this.answeredData.content.userInput = this.userSelected.filter(
        (s) => s !== '',
      );
      this.$emit('user-choice-changed', [
        studentContentText,
        this.answeredData,
      ]);
    },
    duplicateMe(event, theID) {
      globalConsoleLog(
        'conn',
        'Statement:duplicateMe ',
        theID,
        event.clientX,
        event.clientY,
      );
      this.$emit('duplicate-statement', {
        id: theID,
        posX: event.clientX,
        posY: event.clientY,
      });
    },

    deleteStatement() {
      // Emit an event to the parent component indicating that this statement should be deleted
      this.$emit('delete-statement', this.id);
    },

    initContent() {
      this.statementType = this.statementData.statementType;
      this.id = this.statementData.id;
      this.originalFacts = this.statementData.content.originalFacts;
      this.previousUserInput = this.statementData.content.userInput;
      this.freeInputText = this.freeAnswer ? this.previousUserInput : '';
      this.answeredData = this.freeAnswer ? this.statementData : null;
      console.log('init');
      let userInputID = 0;
      this.userSelected = this.originalFacts.map((fact) => {
        if (typeof fact === 'string') {
          return '';
        }
        // If a choice hasn't been selected, select the first "real" choice by default
        const prev = this.previousUserInput[userInputID];
        if (!prev) {
          if (fact.length > 1 && this.isPlaceHolderOption(fact[0])) {
            return fact[1];
          } else {
            return fact[0];
          }
        } else {
          userInputID++;
          return prev;
        }
      });
      this.answeredData = this.statementData;
    },
  },

  watch: {
    statementData() {
      this.initContent();
    },
    userSelected: {
      handler: 'handleSelectChange',
      deep: true,
    },
    data() {
      this.initContent();
    },
    showAllFeedback() {
      this.showFeedback = this.showAllFeedback;
    },
    freeInputText(newUserInput) {
      this.answeredData.content.userInput = newUserInput;
      this.$emit('user-input-changed', [newUserInput, this.answeredData]);
    },
  },
  created() {
    this.initContent();
  },
};
</script>

<style scoped>
@import 'assets/tooltips.css';

.Statement {
  border-radius: 5px;
  min-width: 70px;
  min-height: 70px;
  padding: 2px;
  font-size: var(--biologic-statement-font-size);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.StatementRoot {
  background-color: var(--biologic-root-statement-color);
  background-image: var(--biologic-root-statement-gradient);
}

.StatementFreeText {
  background-color: var(--biologic-free-statement-color);
  background-image: var(--biologic-free-statement-gradient);
  width: fit-content;
  height: fit-content;
  text-align: center;
  display: inline-block;
}

.StatementStudent {
  background-color: var(--biologic-student-statement-color);
  background-image: var(--biologic-student-statement-gradient);
}

.StatementTruth {
  background-color: var(--biologic-truth-statement-color);
  background-image: var(--biologic-truth-statement-gradient);
  white-space: pre-wrap;
  max-width: 150px;
}

.iconContainer.StatementFreeText {
  background-color: var(--biologic-free-statement-color);
  opacity: 25%;
}

.iconContainer.StatementStudent {
  background-color: var(--biologic-student-statement-color);
  opacity: 25%;
}

.iconContainer.StatementTruth {
  background-color: var(--biologic-truth-statement-color);
  opacity: 25%;
}
.iconContainer.StatementRoot {
  background-color: var(--biologic-root-statement-color);
  opacity: 25%;
}

.content-wrapper {
  display: flex;
  height: 100%;
}
.free-content-wrapper {
  display: flex;
  align-items: flex-start;
}

.main-content {
  padding-left: 2px;
  height: 100%;
  font-size: var(--biologic-statement-font-size);
}

button {
  margin-right: 2px;
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
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-100%);
  z-index: 10;
  pointer-events: auto;
}

.Statement:hover .iconContainer {
  opacity: 1;
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

.free-text {
  margin-top: 10px;
  margin-bottom: 10px;
}

.textarea {
  height: 6vw;
}
</style>
