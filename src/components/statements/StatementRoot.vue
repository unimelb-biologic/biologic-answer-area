<template>
  <div class="StatementRoot">
    <FeedbackRubric :isVisible=showFeedback :exnetID=id />

    <div class="content-wrapper">
      <div class="iconContainer">
        <button v-if="showToggle && this.statementData.collapsed" @click="toggleCollapsedStatement" class="statementButton">
          <img 
          class="statementButtonImage"
          src="../../assets/expand_icon.png"
          alt="ToggleExpandCollapse"
          
          />
      </button>
      <button v-if="showToggle && !this.statementData.collapsed" @click="toggleCollapsedStatement" class="statementButton">
          <img 
          class="statementButtonImage"
          src="../../assets/collapse_icon.png"
          alt="ToggleExpandCollapse"
    
          />
      </button>
      <button v-if="showToggle && !this.statementData.collapsed" @click="toggleShowPopup" class="statementButton">
        <img
        class="statementButtonImage"
        src="../../assets/popup_radio_icon.png"
        alt="RadioPopupToggle"
  
        />
      </button>
      <button v-if="showToggle" @click="duplicateMe" class="statementButton">
        <img
        class="statementButtonImage"
        src="../../assets/duplicate_icon.png"
        alt="DuplicateStatement"

        />
      </button>

      <button v-if="showToggle && isFeedbackAvailable" @click="showFeedback = !showFeedback" class="statementButton">
          <img
            src="../../assets/feedback-rubric.png"
            alt="FeedbackStatement"
            width="20"
          />
      </button>

    </div>
      
      <div class="main-content">
        <div v-if="this.statementData.collapsed"  class="concatenated-statement">
          {{ concatenatedStatement }}
        </div>

        <div v-else-if="!this.statementData.showPopup" class="radio-statement">
          <!-- radio button format -->
          <div v-for="(segment, index) in this.statementData.content.originalFacts"
           :key="index" style="float: left; ">
            <div v-if="typeof segment === 'string'" class="segmentString">


              <div v-if="isImage(segment)">
                <img :src="segment" class="biologicImage">
              </div>
              <div v-else class="segmentString">
                  {{ segment }}
              </div>

            </div>
            <div v-else class="statementRadioButtons">
              <div v-for="item in segment" >
                <div v-if="item.indexOf('--')"> 
                <input type="radio" :id="item" :value="item" v-model="userSelected[index]">
                <label :for="item in segment">{{item}}</label><br>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <!-- dropdown format -->
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
        <span v-if="statementData.visible" class="StatementRoot_tooltip">
          This statement must be used.<br /><br />
          It is a starting point for the rest of the problem.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import FeedbackRubric from '../FeedbackRubric.vue';

export default {  
  name: "StatementRoot",
  components: {
    FeedbackRubric
  },
  emits: ["user-choice-changed","duplicate-statement","toggle-showPopup-fromstatementroot","toggle-collapsed-statement-root"],
  props: {
    statementData: Object,
    position: String,
    showToggle: {
      type: Boolean,
      default: true
    }
  },
  inject: ['isFeedbackAvailable'],
  data() {
    return {
      statementType: this.statementData.statementType,
      id: this.statementData.id,
      originalFacts: this.statementData.content.originalFacts,
      previousUserInput: this.statementData.content.userInput,
      userSelected: [],
      answeredData: null,
      hide_collapsed : false,
      hide_showPopup : true,
      showFeedback: false
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
    handleDragEnteringStatementRoot(e){
      console.log("statementRoot enter event");
//      e.preventDefault();
            // Prevent child events from reaching the parent
      e.stopPropagation();
    },
    handleDragLeavingStatementRoot(e){
      console.log("statementRoot leave event");
//      e.preventDefault();
    },
    isImage(fact) {
      const isImg = fact.endsWith(".jpg") || fact.endsWith(".png") || fact.endsWith(".jpeg");
      //console.log("testing if fact<",fact," is an image - result is ",isImg);
      return ( isImg );
    },
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log("StatementRoot:toggleCollapsedStatement")
      this.$emit("toggle-collapsed-statement-root", this.id );
    },
    toggleShowPopup(){
      //this.showPopup = !this.showPopup;
      console.log("StatementRoot:toggleShowPopup emitting toggle-showPopup-fromstatementroot")
      this.$emit("toggle-showPopup-fromstatementroot", [ this.id ]);
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
    duplicateMe(){
      this.$emit("duplicate-statement", [ this.id ]);
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
  background-color: rgb(213, 239, 255);
  padding: 2px;
  margin: 2px;
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: center;
  position: relative;
  display: inline-block;
}

.StatementRoot:hover .iconContainer {
  opacity:1;
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
.segmentString {
  min-height: inherit; 
  padding:  10% 2px;
}
.concatenated-statement {
  white-space: pre-wrap;
  max-width: 100px;
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
}


.biologicImage {
  max-width: 100%;
  width: 100px;
}




</style>
