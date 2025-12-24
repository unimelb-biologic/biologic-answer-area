<template>
  <div class="StatementStudent">
    <FeedbackRubric :isVisible="showFeedback" :exnetID="id" />

    <div class="content-wrapper">
      <div class="iconContainer">
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

        <Tooltip text="switch between menus and radio-buttons">
          <v-btn
            size="x-small"
            v-if="showToggle && !this.statementData.collapsed"
            @click="toggleShowPopup"
            class="statementButton"
          >
            <img
              class="statementButtonImage"
              src="../assets/popup_radio_icon.png"
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
            <!--img class="statementButtonImage" src="../assets/duplicate_icon.png" alt="DuplicateStatement" /-->
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
            src="../assets/feedback-rubric.png"
            alt="FeedbackStatement"
            width="20"
          />
        </button>
      </div>

      <Tooltip
        text="Yellow statements are called STUDENT statements. Choose the menu/radiobutton options to modify the statement."
      >
        <div class="main-content">
          <div
            v-if="this.statementData.collapsed"
            class="concatenated-statement"
          >
            {{ concatenatedStatement }}
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
            >
              <div v-if="typeof segment === 'string'">
                <div v-if="isImage(segment)">
                  <img :src="segment" class="biologicImage" />
                </div>
                <div v-else class="segmentString">
                  {{ segment }}
                </div>
              </div>
              <div v-else class="statementRadioButtons">
                <div v-for="item in segment">
                  <div v-if="item.indexOf('--')">
                    <input
                      :disabled="displayOnly"
                      type="radio"
                      :id="item"
                      :value="item"
                      v-model="userSelected[index]"
                    />
                    <label :for="item in segment">{{ item }}</label
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
import FeedbackRubric from '../FeedbackRubric.vue';
import Tooltip from '../Tooltip.vue';
import { globalConsoleLog } from '../util';

export default {
  name: 'StatementStudent',
  components: {
    FeedbackRubric,
    Tooltip,
  },
  emits: [
    'user-choice-changed',
    'duplicate-statement',
    'delete-statement',
    'toggle-showPopup-fromstatementstudent',
    'toggle-collapsed-statement-student',
  ],
  props: {
    statementData: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: false,
    },
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
      showFeedback: false,
    };
  },
  computed: {
    concatenatedStatement() {
      return this.statementData.content.originalFacts
        .map((segment, index) =>
          typeof segment === 'string'
            ? this.isImage(segment)
              ? ''
              : segment
            : this.userSelected[index] || segment[0]
        )
        .join(' ');
    },
    getCollapseExpandIcon() {
      return this.collapsed
        ? '../assets/expand_icon.png'
        : '../assets/collapse_icon.png';
    },
  },
  methods: {
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
      console.log('StatementStudent:toggleCollapsedStatement');
      this.$emit('toggle-collapsed-statement-student', this.id);
    },
    toggleShowPopup() {
      //this.showPopup = !this.showPopup;
      console.log(
        'StatementStudent:toggleShowPopup emitting toggle-showPopup-fromstatementstudent'
      );
      this.$emit('toggle-showPopup-fromstatementstudent', [this.id]);
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

      let newUserInput = [];
      for (let i = 0; i < this.userSelected.length; i++) {
        if (this.userSelected[i] != '') {
          newUserInput.push(this.userSelected[i]);
        }
      }
      this.answeredData.content.userInput = newUserInput;

      this.$emit('user-choice-changed', [
        studentContentText,
        this.answeredData,
      ]);
    },
    duplicateMe(event, theID) {
      globalConsoleLog(
        'conn',
        'StatementStudent:duplicateMe ',
        theID,
        event.clientX,
        event.clientY
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

      let userInputID = 0;
      this.userSelected = [];
      for (let i = 0; i < this.originalFacts.length; i++) {
        if (typeof this.originalFacts[i] === 'string') {
          this.userSelected.push('');
        } else {
          this.userSelected.push(this.previousUserInput[userInputID]);
          userInputID += 1;
        }
      }

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
  },
  created() {
    this.initContent();
  },
  mounted() {
    //console.log("StatementStudent mounted");
  },
};
</script>

<style scoped>
@import '../assets/tooltips.css';

.StatementStudent {
  background-color: var(--biologic-student-statement-color);
  font-size: var(--biologic-statement-font-size);
  padding: 2px;
  margin: 2px;
  position: relative;
}

.StatementStudent:hover .iconContainer {
  opacity: 1;
}

.segmentString {
  min-height: inherit;
  padding-top: 40%;
  padding: 30% 10px 15%;
}

.content-wrapper {
  display: flex;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  padding-left: 2px;
}

button {
  margin-right: 2px;
}

.iconContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px;
  opacity: 0.05;
  transition: opacity 0.3s ease;
}

.radio-statement {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.statementRadioButtons {
  border: 1px solid rgb(138, 138, 138);
  align-items: middle;
}

.concatenated-statement {
  white-space: pre-wrap;
  max-width: 100px;
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

.biologicImage {
  max-width: 100%;
  width: 100px;
}
</style>
