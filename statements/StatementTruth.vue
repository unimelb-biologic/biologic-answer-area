<template>
  <!-- record the statement position-->
  <div class="StatementTruth">
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
            v-if="!displayOnly"
            size="x-small"
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
        text="Green statements are TRUTHs. i.e. a provided fact that you can use in your answer"
      >
        <div class="main-content">
          <div
            v-if="this.statementData.collapsed"
            class="concatenated-statement"
          >
            {{ concatenatedStatement }}
          </div>
          <div v-else>
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
      </Tooltip>
    </div>
  </div>
</template>

<script>
import FeedbackRubric from '../FeedbackRubric.vue';
import Tooltip from '../Tooltip.vue';
import { globalConsoleLog } from '../util';

export default {
  name: 'StatementTruth',
  components: {
    FeedbackRubric,
    Tooltip,
  },
  inject: [
    'displayOnly', // this means no editing of popups or dragging etc. Like it's readonly. But we do allow collapsing/uncollapsing
    'isFeedbackAvailable',
    'showAllFeedback',
    'displayOnly',
  ],
  emits: [
    'user-choice-changed',
    'duplicate-statement',
    'delete-statement',
    'toggle-collapsed-statement-truth',
  ],
  props: {
    statementData: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: true,
    },
  },
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

  watch: {
    userSelected: {
      handler: 'handleSelectChange',
      deep: true,
    },
    statementData: {
      handler() {
        this.initContent();
      },
      deep: false,
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
        fact.endsWith('.jpg') ||
        fact.endsWith('.png') ||
        fact.endsWith('.jpeg');
      //console.log("testing if fact<",fact," is an image - result is ",isImg);
      return isImg;
    },
    duplicateMe(event, theID) {
      globalConsoleLog(
        'conn',
        'StatementTruth:duplicateMe ',
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
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log('StatementTruth:toggleCollapsedStatement');
      this.$emit('toggle-collapsed-statement-truth', this.id);
    },

    handleSelectChange() {
      let studentContentText = '';
      // Concat all the texts
      for (let i = 0; i < this.originalFacts.length; i++) {
        if (typeof this.originalFacts[i] === 'string') {
          // formatting original fact to remove https links and images
          const formattedFact = this.originalFacts[i].replace(
            /(https?:\/\/[^\s]+)|(\.png$)|(\.jpg$)|(\.jpeg$)/gi,
            ''
          );
          studentContentText += formattedFact;
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

  mounted() {
    //console.log("StatementTruth mounted");
  },
};
</script>

<style scoped>
@import '../assets/tooltips.css';

.StatementTruth {
  background-color: var(--biologic-truth-statement-color);
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
