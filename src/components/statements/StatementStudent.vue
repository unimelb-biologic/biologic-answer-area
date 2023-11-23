<template>
  <div class="StatementStudent">
    <div class="content-wrapper">
      <div class="iconContainer">
      <button v-if="showToggle && this.data.collapsed" @click="toggleCollapsedStatement" class="statementButton">
          <img 
          class="toggle-expand-collapse"
          src="../../assets/expand_icon.png"
          alt="ToggleExpandCollapse"
          width="20"
          />
      </button>
      <button v-if="showToggle && !this.data.collapsed" @click="toggleCollapsedStatement" class="statementButton">
          <img 
          class="toggle-expand-collapse"
          src="../../assets/collapse_icon.png"
          alt="ToggleExpandCollapse"
          width="20"
          />
      </button>
      <button v-if="showToggle && !this.data.collapsed" @click="toggleShowPopup" class="statementButton">
        <img
        class="radio-popup-toggle-button"
        src="../../assets/popup_radio_icon.png"
        alt="RadioPopupToggle"
        width="20"
        />
      </button>
      <button v-if="showToggle" @click="duplicateMe" class="statementButton">
        <img
        class="duplicate-statement-button"
        src="../../assets/duplicate_icon.png"
        alt="DuplicateStatement"
        width="20"
        />
      </button>
      </div>
      <div class="main-content">
        <div v-if="this.data.collapsed" class="concatenated-statement">
          {{ concatenatedStatement }}
        </div>
        
        <div v-else-if="!this.data.showPopup" class="radio-statement">
          <!-- radio button format -->
          <div v-for="(segment, index) in this.data.content.originalFacts"
           :key="index" >
            <div v-if="typeof segment === 'string'" >

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

        <div v-else class="dropdown-statement">
          <!-- dropdown format -->
          <div v-for="(segment, index) in this.data.content.originalFacts"
            :key="index" >
            <!-- render the text from selection -->
            <div v-if="typeof segment === 'string'" >



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
        <span v-if="data.visible" class="StatementStudent_tooltip">
          You can use this statement to answer the question.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatementStudent",
  emits: ["user-choice-changed","duplicate-statement","toggle-showPopup-fromstatementstudent","toggle-collapsed-statement-student"],
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
      hide_collapsed : false,
      hide_showPopup : true,
    };
  },
  computed: {
    concatenatedStatement() {
      return this.data.content.originalFacts.map((segment, index) => 
        typeof segment === 'string' ? (this.isImage(segment)?"":segment) : this.userSelected[index] || segment[0]
      ).join(" ");
    },
    getCollapseExpandIcon(){
      return this.collapsed ? "src/assets/expand_icon.png" : "src/assets/collapse_icon.png";
    }
  },
  methods: {
    isImage(fact) {
      const isImg = fact.endsWith(".jpg") || fact.endsWith(".png") || fact.endsWith(".jpeg");
      //console.log("testing if fact<",fact," is an image - result is ",isImg);
      return ( isImg );
    },
    toggleCollapsedStatement() {
      //this.collapsed = !this.collapsed;
      console.log("StatementStudent:toggleCollapsedStatement")
      this.$emit("toggle-collapsed-statement-student", this.id );
    },
    toggleShowPopup(){
      //this.showPopup = !this.showPopup;
      console.log("StatementStudent:toggleShowPopup emitting toggle-showPopup-fromstatementstudent")
      this.$emit("toggle-showPopup-fromstatementstudent", [ this.id ]);
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
  background-color: rgb(254, 250, 211);
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: left;
  padding: 2px;
  margin: 2px;
  position: relative;
  display: inline-block;
}
.segmentString {
  min-height: inherit; 
  padding-top: 40%; 
  padding:  30% 10px 15%;
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
  width: 24px;
  height: 24px;
  margin: 2px;
  padding: 1px;
  align-items: center;
}

.biologicImage {
  max-width: 100%;
  width: 100px;
}



</style>

