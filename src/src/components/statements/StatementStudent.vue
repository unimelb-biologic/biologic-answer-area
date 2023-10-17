<template>
  <div class="StatementStudent">
    <div class="content-wrapper">
      <button v-if="showToggle" @click="toggleView">T</button>
      
      <div class="main-content">
        <div v-if="showConcatenated">
          {{ concatenatedStatement }}
        </div>

        <div v-else>
          <!-- radio button format -->
          <div v-for="(segment, index) in this.data.content.originalFacts"
           :key="index" style="float: left; ">
            <div v-if="typeof segment === 'string'" class="segmentString">
              {{ segment }}
            </div>
            <div v-else>
              <div v-for="item in segment" >
                <div v-if="item.indexOf('--')"> 
                <input type="radio" :id="item" :value="item" v-model="userSelected[index]">
                <label :for="item in segment">{{item}}</label><br>
                </div>
              </div>
            </div>
          </div>

          <!-- dropdown format -->
          <div v-for="(segment, index) in this.data.content.originalFacts"
            :key="index" >
            <!-- render the text from selection -->
            <div v-if="typeof segment === 'string'" >
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
.StatementStudent {
  background-color: Khaki;
  border: 1px solid black;
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: left;
  padding: 10px;
  margin: 10px;
  position: relative;
  display: inline-block;
}
.segmentString {
  min-height: inherit; 
  padding-top: 40%; 
  padding:  40% 10px;
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

