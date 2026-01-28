<template>
  <!-- record the statement position-->
  <div class="StatementFreeText">
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

        <button v-if="showToggle" @click="duplicateMe($event,id)" class="statementButton">
          <img
            class="duplicate-statement-button"
            src="../assets/duplicate_icon.png"
            alt="DuplicateStatement"
            width="20"
          />
        </button>

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
      </div>

      <Tooltip
        text="White statements are FREE statements. Type in your own statement."
      >
        <div class="main-content">
          <div
            v-if="this.statementData.collapsed"
            class="concatenated-statement"
          >
            {{ concatenatedStatement }}
          </div>
          <div v-else>
            <textarea
              v-model="userInputText"
              id="input"
              class="textarea"
            ></textarea>
          </div>
        </div>
      </Tooltip>
    </div>
  </div>
</template>

<script>
import Tooltip from '../Tooltip.vue';
import { globalConsoleLog } from '../util';

export default {
  name: 'StatementFreeText',
  components: {
    Tooltip,
  },
  emits: [
    'user-input-changed',
    'duplicate-statement',
    'delete-statement',
    'toggle-collapsed-statement-freetext',
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
      statementType: this.statementData.statementType,
      id: this.statementData.id,
      originalFacts: this.statementData.content.originalFacts,
      previousUserInput: this.statementData.content.userInput,
      userInputText: '',

      answeredData: null,
    };
  },
  computed: {
    concatenatedStatement() {
      return this.userInputText;
    },
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
    duplicateMe(event, theID) {
      globalConsoleLog('conn', 'StatementFreeText:duplicateMe ', theID, event.clientX, event.clientY);
      this.$emit('duplicate-statement', {
        id: theID,
        posX: event.clientX,
        posY: event.clientY
      });
    },

    deleteStatement() {
      // Emit an event to the parent component indicating that this statement should be deleted
      this.$emit('delete-statement', this.id);
    },
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log('StatementFreeText:toggleCollapsedStatement');
      this.$emit('toggle-collapsed-statement-freetext', this.id);
    },
  },
  watch: {
    // Pass the new input to other component
    userInputText(newUserInput) {
      this.answeredData.content.userInput = newUserInput;
      this.$emit('user-input-changed', [newUserInput, this.answeredData]);
    },
    data() {
      this.initContent();
    },
  },
  created() {
    this.initContent();
  },
  mounted() {
    //console.log("StatementFreeText mounted");
  },
};
</script>

<style scoped>
@import '../assets/tooltips.css';

.StatementFreeText {
  background-color: var(--biologic-freetext-statement-color);
  font-size: var(--biologic-statement-font-size);
  padding: 2px;
  margin: 2px;
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

.text {
  margin-top: 10px;
  margin-bottom: 10px;
}

.StatementFreeText:hover .iconContainer {
  opacity: 1;
}

.iconContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px;
  opacity: 0.05;
  transition: opacity 0.3s ease;
}

.statementButton {
  cursor: pointer;
  width: 24px;
  height: 24px;
  margin: 2px;
  padding: 1px;
  align-items: center;
}

.concatenated-statement {
  white-space: pre-wrap;
  max-width: 100px;
}

.textarea {
  height: 6vw;
}
</style>
