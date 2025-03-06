<template>
  <div id="top-level" style="display:flex; flex: 1 1 auto; flex-direction: row;">
    <div v-if="!authorised" style="width: 100%;">
      <div style="display: flex; flex-direction: row; align-items: center">
        <img src="src/assets/BioLogic_BlueGreen_Icon.jpg" width="100" />
        <h1><span style="color: var(--biologic-blue-color);">&nbsp;Bio</span><span style="color: var(--biologic-green-color);">Logic</span></h1>
        <h2 class="biologic-component">&nbsp;EDITOR</h2>
      </div>
      <div style="height: 100vh; width: 100%;">
        <v-container class="text-center" fluid>
          <v-row justify="center">
            <v-col cols="12" md="6">
              <v-card class="mx-auto pa-12 pb-8" elevation="10" max-width="448">
                <v-text-field label="USERID" v-model="clientIdInput" prepend-inner-icon="mdi-account" outlined
                  @keyup.enter="handleConnectToServer"></v-text-field>
                <v-btn color="primary" class="mb-4" style="width: 100%;" @click="handleConnectToServer">
                  Login
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

      </div>
      <br />
    </div>
    <div v-if="authorised" style="display:flex; flex: 1 1 auto;width: 100%;">
      <v-container fluid class="mainContainer">
        <v-row class="content-row" style="">
          <!--MenuBar :userID="userID" :clientType="clientType" @setExNetAnswer="setExNetAnswer"
            @onDownloadExNet="onDownloadExNet" @logout="handleLogout" /               DECIDED TO BRING THIS CODE UP TO THE TOP LEVEL (MM)-->


          <div style="
              position: relative;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              width:100%;
            ">

            <div style="display: flex; flex-direction: row; align-items: center">
              <img src="src/assets/BioLogic_BlueGreen_Icon.jpg" height="50" />
              <!--img src="src/assets/BioLogic_Word.jpg" height="50px;" /-->
              <h1><span style="color: var(--biologic-blue-color);">&nbsp;Bio</span><span style="color: var(--biologic-green-color);">Logic</span></h1>

              <h2 class="biologic-component">&nbsp;EDITOR</h2>
            </div>
            <div class="biologic-medium-text" style="display: flex; flex-direction: row; align-items: center">
            <p>&nbsp;&nbsp;&nbsp;&nbsp;Question:</p>
            <select @change="getLastWorkingAnswer()" v-model="selectedQuestion" class="dropdown-shadow">
              <option v-for="item in questions" :value="item" :key="item">
                {{ item.endsWith(".data") ? item.slice(0, -5) : item }}
              </option>
            </select>
          </div>

            <div class="biologic-medium-text" v-if="showFileButtons"
              style="display: flex; flex-direction: row; align-items: center; ">

              <div>
                <file-reader :title="'Open:'" @read-file="onExNetReadFile"></file-reader>
              </div>


                <div style="display: flex; flex-direction: row; align-items: center ">
                  <div class="biologic-medium-text">
                    <label for="save-file">&nbsp;</label>
                  </div>
                  <v-btn style="color: var(--biologic-green-color); background-color: transparent;" id="save-file"
                    @click="onDownloadExNet">
                    Save
                  </v-btn>
                </div>



            </div>

            <div class="right_menu">

              <Tooltip text="current user">
                <h3 style="color:var(--biologic-green-color)">{{ clientType }}: {{ userID }}</h3>
              </Tooltip>

              <Tooltip text="Show buttons to allow read and write to local disk">
                <v-btn style="color:var(--biologic-green-color)" @click="showFileButtons = !showFileButtons">
                  <v-icon>mdi-file-arrow-up-down-outline</v-icon>
                </v-btn>
              </Tooltip>

              <Tooltip text="logout">
                <v-btn class="biologic_logout_button" @click="handleLogout">
                  <v-icon>mdi-logout</v-icon>
                </v-btn>
              </Tooltip>

            </div>
          </div>




        </v-row>

        <v-row class="pa-3 grow-row" no-gutters>
          <div id="displayIDForFullScreen">
            <v-row class="content-row" no-gutters> <!-- header bar with icons -->

              <div class="answer-area-header">
                <span v-if="showQuestion">
                  <Tooltip text="Hide Question">
                    <v-btn @click="toggleEditor" color="var(--biologic-grey-color)">
                      <v-icon>mdi-chevron-left</v-icon>&nbsp;QUESTION
                    </v-btn>
                  </Tooltip>
                </span>
                <span v-if="!showQuestion">
                  <!-- IF QUESTION IS HIDDEN JUST SHOW ICON TO GET IT BACK -->
                  <Tooltip text="Show Question">
                    <v-btn v-if="!showQuestion" @click="toggleEditor">
                      <v-icon>mdi-chevron-right</v-icon>QUESTION
                    </v-btn>
                  </Tooltip>
                </span>

                <v-spacer></v-spacer>
                <span class="answer-area-title">ANSWER</span>

                <v-spacer></v-spacer>

                <div class="answer-area-buttons">

                  <Tooltip text="Show Data Structures">
                    <v-btn class="answer-area-button" size="small" id="showDataStructuresBtn" @click="toggleShowDataStructures">
                      <v-icon class="answer-area-icon" size="24">mdi-code-braces</v-icon>
                    </v-btn>
                  </Tooltip>
                  <Tooltip text="Save Answer">
                    <v-btn class="answer-area-button" size="small" id="submitBtn" @click="submitAnswer">
                      <v-icon class="answer-area-icon" size="24">mdi-content-save-outline</v-icon>
                    </v-btn>
                  </Tooltip>
                  <v-snackbar class="snackbar-message" v-model="snackbar" timeout="2000" 
                              location="top right"
                              contained color=var(--biologic-green-color)>
                    {{ snackbarText }}
                  </v-snackbar>

                  <Tooltip text="Reset Answer">
                    <v-btn class="answer-area-button" size="small" id="resetBtn" @click="getResetAnswerArea">
                      <v-icon class="answer-area-icon" size="24">mdi-restart</v-icon>
                    </v-btn>
                  </Tooltip>

                  <Tooltip text="Full Screen">
                    <v-btn class="answer-area-button" size="small" v-if="!fullScreen" id="fullScreenBtn"
                      @click="goFullScreen()">
                      <v-icon class="answer-area-icon" size="24">mdi-fullscreen</v-icon>
                    </v-btn>
                  </Tooltip>

                  <Tooltip text="Exit Full Screen">
                    <v-btn class="answer-area-button" size="small" v-if="fullScreen" id="exitFullScreenBtn"
                      @click="exitFullScreen()">
                      <v-icon class="answer-area-icon" size="24">mdi-fullscreen-exit</v-icon>
                    </v-btn>
                  </Tooltip>

                  <Tooltip text="Undo">
                    <v-btn class="answer-area-button" size="small" id="undoBtn" @click="handleUndo()">
                      <v-icon class="answer-area-icon" size="24">mdi-undo</v-icon>
                    </v-btn>
                  </Tooltip>

                  <Tooltip text="Redo">
                    <v-btn class="answer-area-button" size="small" id="redoBtn" @click="handleRedo()">
                      <v-icon class="answer-area-icon" size="24">mdi-redo</v-icon>
                    </v-btn>
                  </Tooltip>

                  <v-btn size="small" v-if="isFeedbackAvailable" @click="toggleAllFeedback">
                    {{ showAllFeedback ? "Close Feedback" : "Show Feedback" }}
                  </v-btn>

                  <Tooltip :text="showMyAnswer?'Hide My Answer' : 'Show My Answer'">
                    <v-btn class="answer-area-button" 
                      :color="showMyAnswerButtonColor" 
                      size="small"
                      @click="toggleShowMyAnswer">
                      <v-icon class="answer-area-icon" size="24">mdi-eye-outline</v-icon>
                    </v-btn>
                  </Tooltip>

                  <Tooltip :text="showCorrectAnswer?'Hide Correct Answer' : 'Show Correct Answer'">
                    <v-btn class="answer-area-button" 
                      :color="showCorrectAnswerButtonColor" 
                      size="small"
                      v-if="isCorrectAnswerAllowed" 
                      :disabled="!okToShowCorrectAnswer" 
                      @click="toggleShowCorrectAnswer">
                      <v-icon class="answer-area-icon" size="24">mdi-eye-check-outline</v-icon>
                    </v-btn>
                  </Tooltip>

                </div>


              </div>

            </v-row>

            <v-row class="grow-row" no-gutters>

              <v-col v-if="showQuestion" :cols="colsForQuestion" class="flex-col"> <!-- QUESTION AREA -->
                <v-row class="content-row">
                </v-row>

                <v-row class="grow-row">
                  <v-col class="pa-5 rounded-lg">
                    <div class="displayQuery">
                      <QuestionArea :prompttext="this.promptText" />
                    </div>
                  </v-col>
                </v-row>

              </v-col>

              <v-col v-if="showMyAnswer" cols="colsForStudentAnswer" class="flex-col"> <!-- STUDENT ANSWER AREA -->

                <div id="displayWorkspaceID_HIDE" class="displayWorkspace grow-row">
                  <AnswerArea ref="answerAreaRef" :parentStatementElements="statementElements" :displayOnly="false" :testProp="testProp"
                    @answer-data="updateJsonOutput" @update-answer-area-content="handleUpdateAnswerContent"
                    @enable-area="(n) => toggleAnswerArea(n)" @answerarea-state-change="handleAnswerAreaStateChange" />
                </div>

                <div class="readout-area content-row" style="height:20%;">
                  <!-- Get texts from AnswerArea -->
                  <AnswerTextGeneratorArea :answerText="this.answerText" />
                </div>


              </v-col>

              <v-col v-if="showCorrectAnswer" cols="colsForCorrectAnswer"> <!-- CORRECT ANSWER AREA -->
                <div id="correctDisplayWorkspaceID" class="displayWorkspace">
                  <AnswerArea ref="correctAnswerAreaRef" :parentStatementElements="statementElementsEmpty"
                    :displayOnly="true" @update-answer-area-content="handleUpdateCorrectAnswerContent" />
                </div>
                <div class="readout-area">
                  <h4>CORRECT ANSWER READOUT</h4>
                  <AnswerTextGeneratorArea :answerText="this.correctAnswerText" />
                </div>
              </v-col>


            </v-row>

            

          </div>

        </v-row>

      </v-container>
    </div>
  </div>
</template>
<script>
import QuestionArea from "@/components/QuestionArea.vue";
import StatementArea from "@/components/StatementArea.vue";
import AnswerArea from "@/components/AnswerArea.vue";
import AnswerTextGeneratorArea from "@/components/AnswerTextGeneratorArea.vue";
import FileReader from "@/components/FileReader.vue";
import MenuBar from "@/components/MenuBar.vue";
import Tooltip from "@/components/Tooltip.vue";

import download from "downloadjs";
import {
  BASE_URL,
  API_ENDPOINTS,
  API_BODY_PARAMS,
  DEFAULT_USER_ID,
  CLIENT_TYPE,
} from "../config/constants";
import { buildFeedbackRubricMap } from "@/utils/common";
import { computed, ref } from "vue";
import "@/assets/biologic.css";
import isEqual from "lodash/isEqual";



export default {
  name: "App",

  data() {
    return {
      questions: null,
      showQuestionList: false,
      selectedQuestion: null,

      promptText: null,
      exNetRelativePath: null,
      exNetName: "",
      statementElements: [],
      statementElementsEmpty: [],

      answerAreaEnabled: true,
      clientID: null,
      clientIdInput: '',  // Bound to the USERNAME input field
      authorised: false, // TODO: automatically bypass login - for prototyping purpose
      secret_key: null,
      userID: null,
      clientType: "Student", // Setting client Type to lowest type as default
      answerText: [], // Receive all content texts from AnswerArea
      correctAnswerText: [], // Receive all content texts from CorrectAnswerArea
      jsonOutput: {},
      jsonData: [],
      dataObject: {},
      isFeedbackAllowed: false, // flag used to restrict from backend, link to this flag from api response
      isFeedbackAvailable: false, // flag used to check whether client_feedback is there
      isCorrectAnswerAllowed: false, // flag used to check whether student can see the correct answer
      feedback: null,
      showMyAnswer: true,
      okToShowCorrectAnswer: true, // student needs to submit an answer before we let them see.
      showCorrectAnswer: false,   // toggle whether correct answer is visible
      showQuestion: true,
      showDataStructures: false, // just for debugging purposes
      activeTab: "1",
      feedbackRubricMap: ref({}),

      globalTooltipState: {showTooltips:true, animal:"dog"},  

      undoStack: [], // record history of state-data for the answerArea.
      currentState: undefined,
      redoStack: [],
      ignoreStateChanges: { // wrap it in an object so it is reactive for the provide/inject mechanism
        value: false,// this is turned on when programmatic changes to the answerarea are happening.
      },
      fullScreen: false,
      correctAnswer: undefined,
      correctAnswerData: undefined,

      showFileButtons: false,
      snackbar: false,
      snackbarText: " ",

      testProp: 0,
    };
  },
 
  provide() {
    //console.log("\n\n*******************\n\n Home::provide() being called OK\n\n\n\n\n")
    return {
      feedbackRubricMap: computed(() => {
        return this.feedbackRubricMap.value;
      }),
      isFeedbackAvailable: computed(
        () => this.isFeedbackAvailable && this.isFeedbackAllowed
      ),
      globalTooltipState: this.globalTooltipState,
      showDataStructures: computed(
        () => this.showDataStructures
      ),
      ignoreStateChanges: this.ignoreStateChanges,
    };
  },

  components: {
    AnswerArea,
    QuestionArea,
    StatementArea,
    AnswerTextGeneratorArea,
    FileReader,
    MenuBar,
    Tooltip,
  },

  created() {
    // TODO: put this to the statements added later.
    for (let statement of this.statementElements) {
      statement["visible"] = true;
      statement["showPopup"] = true;
      statement["collapsed"] = false;
    }
  },
  computed: {
    colsForQuestion() {
      if (!this.showQuestion)
        return 0;
      else {
        if (this.showMyAnswer && this.showCorrectAnswer)
          return 4; // split three ways
        else if (this.showMyAnswer || this.showCorrectAnswer)
          return 6; // split two ways
        else
          return 12; // just the question
      }
      return 4; // shouldn't happen
    },
    colsForStudentAnswer() {
      if (!this.showMyAnswer)
        return 0;
      else {
        if (this.showQuestion && this.showCorrectAnswer)
          return 4; // split three ways
        else if (this.showQuestion || this.showCorrectAnswer)
          return 6; // split two ways
        else
          return 12; // just the question
      }
      return 4; // shouldn't happen    
    },
    colsForCorrectAnswer() {
      if (!this.showCorrectAnswer)
        return 0;
      else {
        if (this.showQuestion && this.showMyAnswer)
          return 4; // split three ways
        else if (this.showQuestion || this.showMyAnswer)
          return 6; // split two ways
        else
          return 12; // just the question
      }
      return 4; // shouldn't happen    
    },
    showCorrectAnswerButtonColor() {
      return this.showCorrectAnswer ? "white" : "#f4d4d4";
    },
    showMyAnswerButtonColor() {
      return this.showMyAnswer ? "white" : "#f4d4d4";
    },

  },
  methods: {
    // Sends login request and processes returned promise.

        // Function to toggle the editor display
    toggleEditor() {
      this.showQuestion = !this.showQuestion;
    },
    toggleShowDataStructures() { 
      this.showDataStructures = !this.showDataStructures;
    },

    // Function to toggle the correct answer visibility
    async toggleShowCorrectAnswer() {
      if (this.showCorrectAnswer) {
        if (this.showMyAnswer || this.showQuestion)  // i.e. we will only hide correctAnswer if one of the other panes is visible.
          this.showCorrectAnswer = false;
      } else {
        this.showCorrectAnswer = true;
        await this.$nextTick(); // make sure DOM updates are done
        if (this.$refs.correctAnswerAreaRef && this.correctAnswerData) 
          await this.$refs.correctAnswerAreaRef.loadPreviousAnswer(this.correctAnswerData);
      }
    },

    // Function to toggle the correct answer visibility
    toggleShowMyAnswer() {
      if (this.showMyAnswer) {
        if (this.showCorrectAnswer || this.showQuestion)  // i.e. we will only hide myAnswer if one of the other panes is visible. 
          this.showMyAnswer = false;
      } else
        this.showMyAnswer = true;
    },

    async handleConnectToServer(){
      const userId = this.clientIdInput.trim();
      if (!userId){
        alert("Please enter a valid Client ID.");
        return;
      }
      this.logIn(userId);
    },
    
    async logIn(userId) {

      let response = await this.sendLoginRequest(userId);

      if (response && response["success"] === true) {
        this.secret_key = response["persistent_secret_key"];
        this.authorised = true;

        if (response["client_type"]) {
          this.clientType = CLIENT_TYPE[response["client_type"]];
        }

        // Store authorization status to session storage
        sessionStorage.setItem("authStatus", "authorized");
        sessionStorage.setItem("secretKey", this.secret_key);
        sessionStorage.setItem("clientType", this.clientType);
        sessionStorage.setItem("clientID", this.clientID);
        sessionStorage.setItem("userID", this.userID);

        const urlParams = this.$route.query;

        await this.getQuestions();

        if (!this.questions !== null) {
          this.selectedQuestion = urlParams.exnetName
            ? urlParams.exnetName
            : this.questions[0];
          await this.getExnet(this.selectedQuestion, true);
          await this.getLastWorkingAnswer();
        }
        //window.alert("Successfully authorised!");
      } else {
        window.alert("Login failed!");
      }
    },

    // Sends the login HTTP request to the server.
    async sendLoginRequest(userID) {
      this.userID = userID;
      await this.digestMessage(userID).then((digestHex) => {
        userID = digestHex;
        // this.userID = userID//save userID
      });

      this.clientID = userID;
      try {
        let login_url = BASE_URL + API_ENDPOINTS.LOGIN_ENDPOINT;
        let response = await fetch(login_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: `{"client_id":"${userID}"}`,
        });
        return await response.json();
      } catch (error) {
       globalConsoleLog("net",error);
      }
    },

    // handling log out functionality
    handleLogout() {
      sessionStorage.clear();
      this.authorised = false;
      //this.showSurveyPrompt();
    },

    async updateJsonOutput(dataObject) {
      this.dataObject = dataObject;
      this.dataObject["statementElements"] = this.statementElements;
      this.jsonOutput = this.dataObject;

      let response = await this.StoreLastWorkingAnswer(this.selectedQuestion);

      if (response["success"] === true) {
        await this.sendGetFeedback(this.selectedQuestion);
        //window.alert("Submission successful!");
      }
    },

    // // Selects a specific question from the list.
    // questionSelected() {
    //     //globalConsoleLog("net","Displaying question", this.selectedQuestion)
    //     this.getExnet(this.selectedQuestion,true)
    // },

    // When a statement is dropped onto a connector, this fires.
    // Set the corresponding statement's "visible" property to false.
    // THIS IS OUT OF DATE AND NEEDS TO BE REMOVED MM 1 Mar 2025
    handleStatementUsed(statementID, state = false) {
      for (let statement of this.statementElements) {
        if (statement["id"] === statementID) {
          statement["visible"] = state;
          return;
        }
      }
    },



    toggleAnswerArea(e) {
      this.answerAreaEnabled = e;
    },

    // Receive all content texts from AnswerArea
    handleUpdateAnswerContent(info) {
      //console.log("*******\n*******\n*******\n handleUpdateAnswerContent ",info, "*******\n*******\n*******\n")
      const rootIDs = Array.from(info[0]);
      const statementIDs = Array.from(info[1]);
      const newAnswerContentObject = info[2];

      this.answerText = [];
      for (let i = 0; i < rootIDs.length; i++) {
        this.answerText.push(
          Object.values(newAnswerContentObject[rootIDs[i]]).join("")
        );
      }
      for (let i = 0; i < statementIDs.length; i++) {
        this.answerText.push(
          Object.values(newAnswerContentObject[statementIDs[i]]).join("")
        );
      }
      //this.handleAnswerAreaStateChange(); not sure if this is needed. MM.
    },

    // Receive all content texts from CorrectAnswerArea
    handleUpdateCorrectAnswerContent(info) {
     globalConsoleLog("undo","*******\n*******\n*******\n handleUpdateCorrectAnswerContent ",info, "*******\n*******\n*******\n")
      const rootIDs = Array.from(info[0]);
      const statementIDs = Array.from(info[1]);
      const newAnswerContentObject = info[2];

      this.correctAnswerText = [];
      for (let i = 0; i < rootIDs.length; i++) {
        this.correctAnswerText.push(
          Object.values(newAnswerContentObject[rootIDs[i]]).join("")
        );
      }
      for (let i = 0; i < statementIDs.length; i++) {
        this.correctAnswerText.push(
          Object.values(newAnswerContentObject[statementIDs[i]]).join("")
        );
      }
      //this.handleAnswerAreaStateChange(); not sure if this is needed. MM.
    },

    getResetAnswerArea() {
     globalConsoleLog("net","getResetAnswerArea");
      this.getExnet(this.selectedQuestion, true);
    },

    // Download ExNetJson
    onDownloadExNet() {
      let processedData = this.$refs.answerAreaRef.getCurrentState();

      this.dataObject = processedData;
      this.dataObject["statementElements"] = this.statementElements;
      this.jsonOutput = this.dataObject;

      const exNetTemplate = {
        activeExNetQuestionPack: {
          promptText: [this.promptText, this.dataObject],
          exNetRelativePath: "Explanation Networks/" + this.exNetName,
          questionName: this.selectedQuestion, // MM. don't think we need this. It is just the exNetName.
          exNetName: this.exNetName,
          statementElements: this.statementElements,
        },
        statementElements: [],
        connectorElements: [],
      };
     globalConsoleLog("net","onDownloadExNet ",exNetTemplate);
      download(
        JSON.stringify(exNetTemplate),
        this.exNetName + "_exnet_question.json",
        "application/json"
      );
    },

    /**
     * Sets the Exnet question and answer area data after opening a offline ExNet File.
     * @param {object} exNetData - The parsed ExNet data from a json file
     * @returns {void}
     */
    async setExNetAnswer(exNetData) {
     globalConsoleLog("net","\n\n.................setExNetAnswer exNetData=",exNetData);
      //const questionName = exNetData.activeExNetQuestionPack.questionName; MM. don't think we need questionName. it is just the same as exNetName.
      if (typeof exNetData.activeExNetQuestionPack.promptText === "object") {
        // then the actual prompt is the first element of the array.
        this.promptText = exNetData.activeExNetQuestionPack.promptText[0];
      } else {
        this.promptText = exNetData.activeExNetQuestionPack.promptText;
      }
      this.exNetRelativePath =
        exNetData.activeExNetQuestionPack.exNetRelativePath;
      this.exNetName = exNetData.activeExNetQuestionPack.exNetName;
      this.statementElements =
        exNetData.activeExNetQuestionPack.statementElements;
      //this.selectedQuestion = questionName;   MM. don't think we need questionName. it is just the same as exNetName.
      this.selectedQuestion = this.exNetName;
      for (let statement of this.statementElements) {
        statement["visible"] = true;
        statement["collapsed"] = false;
        statement["showPopup"] = true;

        // if the userInput object is empty we need to initialise it with the first option of each popup
        for (let i = 0; i < statement.content.originalFacts.length; i++) {
          if (typeof statement.content.originalFacts[i] !== "string") {
            // if not a string then it is an array of popup options
            // we assume it has at least one element and take the first as default.
            statement.content.userInput.push(
              statement.content.originalFacts[i][0]
            );
          }
        }
      }
 
      if (typeof exNetData.activeExNetQuestionPack.promptText === "object") {
        let data = exNetData.activeExNetQuestionPack.promptText[1];
       globalConsoleLog("net","prompt[1] answer available")
        this.statementElements = data["statementElements"];
        this.testProp = this.testProp+1;
        await this.$nextTick(); // make sure DOM updates are done
        if (this.$refs.answerAreaRef){
          await this.$refs.answerAreaRef.loadPreviousAnswer(data, this.testProp+10);
        } else {
         globalConsoleLog("net"," ERROR ERROR ref not set yet ")
        }
        
      }
      else {
        // we need to clear the answer area and initialise it with the statements layed out down the left hand side.
       globalConsoleLog("net","No prompt[1] answer available so just clear Workspace")
        this.$refs.answerAreaRef.clearWorkspace();
      }
      this.resetStateChangeHistory();
    },

  /* MM. not being used
    setCurrentExNet(exNetData, clear = false) {
     globalConsoleLog("net","setCurrentExNet",exNetData," clear = ",clear);
      this.promptText = exNetData.activeExNetQuestionPack.promptText;

      this.exNetRelativePath =
        exNetData.activeExNetQuestionPack.exNetRelativePath;
      this.exNetName = exNetData.activeExNetQuestionPack.exNetName;
      this.statementElements =
        exNetData.activeExNetQuestionPack.statementElements;
      for (let statement of this.statementElements) {
        statement["visible"] = true;
        statement["collapsed"] = false;
        statement["showPopup"] = true;
        // this.statements.push(statement);

        // if the userInput object is empty we need to initialise it with the first option of each popup
        //console.log("statement original=",statement)
        for (let i = 0; i < statement.content.originalFacts.length; i++) {
          if (typeof statement.content.originalFacts[i] !== "string") {
            // if not a string then it is an array of popup options
            // we assume it has at least one element and take the first as default.
            statement.content.userInput.push(
              statement.content.originalFacts[i][0]
            );
          }
        }
        //console.log("statement after initialising userInput=",statement)
      }

      this.showQuestionList = false;
      if (clear) {
        this.$refs.answerAreaRef.clearWorkspace();
      }
    },
    */

    // TODO: Remove this once hashing is not required.
    async digestMessage(msg) {
      const message = "pre_salt_jkBVJcT9h8" + msg + "EirlCrW8P6_post_salt";

      const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
      // convert bytes to hex string
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    },

    async sendGetQuestionsListRequest() {
      try {
        // FIXME: HTTP request here.
        let questionsListUrl = BASE_URL + API_ENDPOINTS.GET_QUESTIONS_LIST;
        let body = {
          [API_BODY_PARAMS.CLIENT_ID_BODY_PARAM]: this.clientID,
          [API_BODY_PARAMS.SECRET_KEY_BODY_PARAM]: this.secret_key,
        };

        let response = await fetch(questionsListUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        return await response.json();
      } catch (error) {
       globalConsoleLog("net",error);
      }
    },

    async getQuestions() {
      let response = await this.sendGetQuestionsListRequest();

      if (response && response["success"] === true) {
        this.questions = response.available_exnets;
      } else {
        console.error("Failed to fetch available questions");
      }
    },

    async sendGetExnetRequest(exnetName) {
     globalConsoleLog("net","     sendGetExnetRequest ",exnetName);
      try {
        // FIXME: HTTP request here.
        // Is this GET or POST?
        let getQuestionsUrl = BASE_URL + API_ENDPOINTS.GET_EXNET;
        let body = {
          [API_BODY_PARAMS.CLIENT_ID_BODY_PARAM]: this.clientID,
          [API_BODY_PARAMS.SECRET_KEY_BODY_PARAM]: this.secret_key,
          [API_BODY_PARAMS.EXNET_NAME]: exnetName,
        };

        let response = await fetch(getQuestionsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        return await response.json();
      } catch (error) {
       globalConsoleLog("net",error);
      }
    },

    async  getExnet(exnetName, clear = false) {
     globalConsoleLog("net","\n\n ------->  getExnet ",exnetName,"clear=",clear);
      // TODO: reenable this
      let response = await this.sendGetExnetRequest(exnetName);

      // TODO: Remove sample server response.
      // let response = {"success": true, "exnet_name": "sky_question.data", "exnet_working_answer_json": "{\"activeExNetQuestionPack\": {\"promptText\": \"<table style=\\\"border-collapse: collapse; width: 50.0213%; margin:10px;\\\" border=\\\"1\\\"> <tbody> <tr> <td style=\\\"width: 49.949%;\\\"> <h4><span style=\\\"color: #ba372a;\\\"><em><strong>When you look up at the sky,</strong></em></span></h4> <p>the sun is yellow, while the sky is blue.</p> <h4><span style=\\\"text-decoration: underline;\\\"><span style=\\\"color: #169179; text-decoration: underline;\\\"><strong>Explain why the sky is blue.</strong>.</span></span></h4> </td> <td><img src=\\\"blue_sky.jpg\\\" alt=\\\"blue_sky.jpg\\\" width=\\\"100\\\" height=\\\"158\\\" data-api-endpoint=\\\"https://canvas.lms.unimelb.edu.au/api/v1/courses/63494/files/13454251\\\" data-api-returntype=\\\"File\\\" /></td> </tr> </tbody> </table>\", \"exNetRelativePath\": \"Explanation Networks/sky\", \"exNetName\": \"sky\", \"statementElements\": [{\"statementType\": 0, \"id\": 140255704346928, \"content\": {\"originalFacts\": [\"The sky is blue\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 20, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348560, \"content\": {\"originalFacts\": [\"light is comprised of multiple wavelengths\", \"light_has_multiple_wavelengths.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 59, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348608, \"content\": {\"originalFacts\": [\"blue light has a short wavelength\", \"blue_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 221, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348704, \"content\": {\"originalFacts\": [\"yellow light has a long wavelength\", \"yellow_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 338, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348800, \"content\": {\"originalFacts\": [\"the\", [\"--choose--\", \"smaller\", \"longer\"], \"the wavelength the more it is scattered\"], \"userInput\": [\"--choose--\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 455, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348896, \"content\": {\"originalFacts\": [[\"blue light\", \"yellow light\"], \"is scattered more than\", [\"yellow light\", \"blue light\"]], \"userInput\": [\"blue light\", \"yellow light\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 568, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348992, \"content\": {\"originalFacts\": [\"the light we see when we arent looking at the sun\", \"direct_indirect_light.jpg\", \"is scattered light\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 683, \"fontSizeStr\": \"12px\"}}]}, \"statementElements\": [{\"statementType\": 0, \"id\": 140255704346928, \"content\": {\"originalFacts\": [\"The sky is blue\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 20, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348560, \"content\": {\"originalFacts\": [\"light is comprised of multiple wavelengths\", \"light_has_multiple_wavelengths.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 59, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348608, \"content\": {\"originalFacts\": [\"blue light has a short wavelength\", \"blue_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 221, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348704, \"content\": {\"originalFacts\": [\"yellow light has a long wavelength\", \"yellow_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 338, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348800, \"content\": {\"originalFacts\": [\"the\", [\"--choose--\", \"smaller\", \"longer\"], \"the wavelength the more it is scattered\"], \"userInput\": [\"--choose--\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 455, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348896, \"content\": {\"originalFacts\": [[\"blue light\", \"yellow light\"], \"is scattered more than\", [\"yellow light\", \"blue light\"]], \"userInput\": [\"blue light\", \"yellow light\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 568, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348992, \"content\": {\"originalFacts\": [\"the light we see when we arent looking at the sun\", \"direct_indirect_light.jpg\", \"is scattered light\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 683, \"fontSizeStr\": \"12px\"}}], \"connectorElements\": []}"}

      if (response["success"] === true) {
       globalConsoleLog("net"," got question OK");
        if (clear) {
          const exnetWorkingAnswerJson = JSON.parse(
            response.exnet_working_answer_json
          );

          this.isFeedbackAllowed = response.is_feedback_allowed;
          this.isCorrectAnswerAllowed = response.is_correct_answer_allowed;

          //this.setCurrentExNet(exnetWorkingAnswerJson, clear);
         globalConsoleLog("net","calling setExNetAnswer");
          this.snackbarText = "Loading ExNet Starting Answer";
          this.snackbar = true;
          this.setExNetAnswer(exnetWorkingAnswerJson);     

          // now if there is a correctAnswer then grab that too.
          
          if (response["exnet_correct_answer_json"] != null &&
              response["exnet_correct_answer_json"] != "") {
           globalConsoleLog("net","there is a correct answer available");
            this.snackbarText = "Sample Correct Answer Available";
            this.snackbar = true;
            // we just want to get the prompt[1] and pass it to the AnswerArea that is for showing the correct answer.
            this.correctAnswer = await JSON.parse(  response["exnet_correct_answer_json"]  );
            let activeExNetQuestionPack =  this.correctAnswer["activeExNetQuestionPack"];
            let promptText = activeExNetQuestionPack["promptText"];
            if (typeof promptText === "object") {
             globalConsoleLog("net","correct answer prompText[1] is available");
              this.correctAnswerData = promptText[1];
              this.okToShowCorrectAnswer = true; // make sure the html object is there
              await this.$nextTick(); // make sure DOM updates are done
              if (this.$refs.correctAnswerAreaRef) {
               globalConsoleLog("net","loading Correct Answer");
                await this.$refs.correctAnswerAreaRef.loadPreviousAnswer(this.correctAnswerData);
              }
            }
          } else {
            if (this.$refs.correctAnswerAreaRef) {
               globalConsoleLog("net","Clearing Correct Answer");
                this.$refs.correctAnswerAreaRef.clearWorkspace();
            }
          }
        }
      } else {
        // What to do if failed?
      }

      return response;
    },

    async StoreLastWorkingAnswer(exnetName) {
     globalConsoleLog("net","StoreLastWorkingAnswer ",exnetName);
      try {
        let response = await this.getExnet(exnetName, false);

        //globalConsoleLog("net","Get exnet response\n", response);
        let exnetQuestionPack = response["exnet_working_answer_json"];
        //globalConsoleLog("net",JSON.parse(exnetQuestionPack))
        exnetQuestionPack = JSON.parse(exnetQuestionPack);

        let activeExNetQuestionPack =
          exnetQuestionPack["activeExNetQuestionPack"];
        let promptText = activeExNetQuestionPack["promptText"];
        let actualPromptText = "";
        
        // since ExNet questions can now have a partial answer which is stored in promptText[1] and here,
        // we just want the actual prompt, we need to check.
        if (typeof promptText === "object") {
          actualPromptText = promptText[0];
        } else {
          actualPromptText = promptText;
        }
        promptText = [actualPromptText, this.dataObject];

        activeExNetQuestionPack["promptText"] = promptText;
        exnetQuestionPack["activeExNetQuestionPack"] = activeExNetQuestionPack;
        exnetQuestionPack["questionName"] = this.selectedQuestion;
        exnetQuestionPack = JSON.stringify(exnetQuestionPack);
        //globalConsoleLog("net","working answer data")
        //globalConsoleLog("net",exnetQuestionPack)

        let msgBody = {
          [API_BODY_PARAMS.CLIENT_ID_BODY_PARAM]: this.clientID,
          [API_BODY_PARAMS.SECRET_KEY_BODY_PARAM]: this.secret_key,
          [API_BODY_PARAMS.EXNET_NAME]: exnetName,
          working_answer_data: exnetQuestionPack,
        };

        //globalConsoleLog("net","msgBody", msgBody);
        msgBody = JSON.stringify(msgBody);

        let storeWorkingAnswerUrl =
          BASE_URL + API_ENDPOINTS.STORE_WORKING_ANSWER;
        let postResponse = await fetch(storeWorkingAnswerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: msgBody,
        });

        if (!postResponse.ok) {
          throw new Error(`HTTP error! status: ${postResponse.status}`);
        }

        return await postResponse.json();
      } catch (error) {
       globalConsoleLog("net",error);
      }
    },

    async sendGetExnetLastWorkingAnswerRequest(exnetName) {
     globalConsoleLog("net","sendGetExnetLastWorkingAnswerRequest ",exnetName);
      try {
        // FIXME: HTTP request here.
        // Is this GET or POST?

        let getLastWorkingAnswerUrl =
          BASE_URL + API_ENDPOINTS.GET_LAST_WORKING_ANSWER;
        let bodyParams = {
          [API_BODY_PARAMS.CLIENT_ID_BODY_PARAM]: this.clientID,
          [API_BODY_PARAMS.SECRET_KEY_BODY_PARAM]: this.secret_key,
          [API_BODY_PARAMS.EXNET_NAME]: exnetName,
        };

        let response = await fetch(getLastWorkingAnswerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyParams),
        });
        return await response.json();
      } catch (error) {
       globalConsoleLog("net",error);
      }
    },

    async sendGetFeedback(exnetName) {
      //globalConsoleLog("net",this.jsonOutput, this.jsonOutput, 'this.jsonOutput)')
      const params = {
        activeExNetQuestionPack: {
          promptText: [this.promptText, this.dataObject],
          //...this.dataObject,
          exNetRelativePath: this.exNetRelativePath,
          exNetName: exnetName,
          statementElements: this.dataObject.statementElements,
        },
        statementElements: this.dataObject.statementElements,
      };

      try {
        // FIXME: Endpoint URL here
        let getFeedbackUrl = BASE_URL + API_ENDPOINTS.GET_FEEDBACK;
        let body = {
          [API_BODY_PARAMS.CLIENT_ID_BODY_PARAM]: this.clientID,
          [API_BODY_PARAMS.SECRET_KEY_BODY_PARAM]: this.secret_key,
          [API_BODY_PARAMS.EXNET_NAME]: exnetName,
          // "ex_net": JSON.stringify({activeExNetQuestionPack: this.promptText, ...this.dataObject}) }
          working_answer_data: params,
          // "ex_flow":JSON.stringify(params)
        };

        let response = await fetch(getFeedbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        this.updateFeedback(data.client_feedback);
      } catch (error) {
       globalConsoleLog("net",`Failed to fetch ${exnetName}!`);
      }

      //console.log(JSON.stringify(params))
    },

    async getCorrectWorkingAnswer() {
     globalConsoleLog("net","getCorrectWorkingAnswer");
      this.updateFeedback(null);

      // TODO: check if this call is required, as we all already getting exnet on changing question
      let response = await this.sendGetExnetRequest(this.selectedQuestion);

      if (
        response["success"] &&
        response["exnet_correct_answer_json"] != null &&
        response["exnet_correct_answer_json"] != ""
      ) {
        // we just want to get the prompt[1] and pass it to the AnswerArea that is for showing the correct answer.
        let lastWorkingAnswerData = await JSON.parse(
          response["exnet_correct_answer_json"]
        );
        let activeExNetQuestionPack =
          lastWorkingAnswerData["activeExNetQuestionPack"];

        let promptText = activeExNetQuestionPack["promptText"];

        if (typeof promptText === "object") {
          let data = promptText[1];
          this.showCorrectAnswer = true;
          await this.$nextTick(); // make sure DOM updates are done
          await this.$refs.correctAnswerAreaRef.loadPreviousAnswer(data, this.testProp+10);
        }
      } else {
        // If fetching the correct working answer fails, log an error
        console.error("Failed to fetch correct working answer.");
      }
    },

    async getLastWorkingAnswer() { 
     globalConsoleLog("net","\n\n************ getLastWorkingAnswer\n\n")
      this.updateFeedback(null);

      // TODO: check if this call is required, as we all already getting exnet on changing question
      let response = await this.sendGetExnetLastWorkingAnswerRequest(this.selectedQuestion);

      // disabling the show correct answer and show my answer buttons
      // whenever there is a change in the exnet question from dropdown

      // FIX ME: Success spell is wrong!
      if (response["success"]) {
       globalConsoleLog("net"," GOT IT! ");
        this.snackbarText = "Loading previously saved answer"
        this.snackbar = true;
        let lastWorkingAnswerData = await JSON.parse(
          response["last_working_answer_data"]
        );
        let activeExNetQuestionPack =
          lastWorkingAnswerData["activeExNetQuestionPack"];

        // 4. get the query entry via activeExNetQuestionPack > promptText
        let tmpPromptText = activeExNetQuestionPack["promptText"];
       globalConsoleLog("net","the prompt =",tmpPromptText);

        // 5. Check promptText is a LIST and not just a string. If it is a string - there is no information
        // that has been stored. Display the question similar to the getExnet above.
        //await this.getExnet(this.selectedQuestion, true);

        if (typeof tmpPromptText === "string") {
         globalConsoleLog("net","orgindary prompt =",tmpPromptText);
          this.promptText = tmpPromptText;
        }

        // 6. If promptText is a LIST, LIST[0] is the query itself - display directly.
        // 7. LIST[1] contains all the parameters passed when saving. Extract entries and replace those in App.vue.

        else if (typeof tmpPromptText === "object") {
         globalConsoleLog("net","composite prompt.",tmpPromptText);
          this.promptText=tmpPromptText[0];
          let data = tmpPromptText[1];
          this.statementElements = data["statementElements"];
          // 8. Pass LIST[1] into AnswerArea.vue using $refs, and have AnswerArea modify the corresponding entries.
         globalConsoleLog("net"," LOADING ANSWER ");
          this.testProp = this.testProp + 1;
          await this.$nextTick(); // make sure DOM updates are done
          if (this.$refs.answerAreaRef) {
            await this.$refs.answerAreaRef.loadPreviousAnswer(data, this.testProp+10);
          } else {
           globalConsoleLog("net","ERROR ERRROR ref not set yet")
          }
        }
      } else {
        // no answer saved so just get the starting ExNet question
       globalConsoleLog("net","student has no previous answer so just load question");
        await this.getExnet(this.selectedQuestion, true);
      }
      await this.resetStateChangeHistory(); // Since we've just loaded a question we don't want an undo/redo history
    },

    // check if student has access to the particular Exnet
    // currently used for offline features
    doesQuestionExist(questionName) {
      return this.questions.includes(questionName);
    },

    updateFeedback(feedback) {
      this.feedbackRubricMap.value = buildFeedbackRubricMap(feedback);
      this.feedback = feedback;
      this.isFeedbackAvailable = feedback ? true : false;
    },

    showSurveyPrompt() {
      // Show confirmation dialog
      var response =
        confirm(`Hi students, We would love to use your answers for our BioLogic research project. All responses will be DE-IDENTIFIED so nobody teaching in this subject will know which answers were yours.
      Clicking OK will take you to a site where you can find out more, BEFORE giving your consent. We'd also love any feedback you might have so there is a survey you can do. If you'd like to do this later use the link in Lisa's email. And if you don't want to participate, no worries. Just click Cancel.`);

      // Check user response
      if (response == true) {
        // If user clicks OK, redirect to the survey URL in a new window
        window.open(
          "https://melbourneuni.au1.qualtrics.com/jfe/form/SV_4Jig2LkO92qQjt4",
          "_blank"
        );
      } else {
        // If user clicks No thanks or cancels the dialog, do nothing
      }
    },
    displayUndoState(str){
     globalConsoleLog("undo","--------",str,"---------");
      //console.log("undoStack length = ",this.undoStack.length);
      for (let i = 0; i < this.undoStack.length; i++) {
       globalConsoleLog("undo","undo", i, this.undoStack[i]);
      }
     globalConsoleLog("undo","currentState = ",this.currentState);
      //console.log("redoStack length = ",this.redoStack.length);
      for (let i = this.redoStack.length-1; i >= 0 ; i--) {
       globalConsoleLog("undo","redo", i, this.redoStack[i]);
      }
     globalConsoleLog("undo"," ");
    },
    getDeepCopyOfAnswerAreaCurrentState() {
      // need to make a deep copy to put on the undo stack.
      const stateAsJsonString = JSON.stringify(this.$refs.answerAreaRef.getCurrentState());
      //console.log("current state string length = ",stateAsJsonString.length);
      return JSON.parse(stateAsJsonString);
    },
    async resetStateChangeHistory() {
      //this.displayUndoState("resetStateChangeHistory START");
      this.undoStack.length = 0;
      this.redoStack.length = 0;
      this.currentState = this.getDeepCopyOfAnswerAreaCurrentState();
      this.displayUndoState("resetStateChangeHistory FINISH");
    },
    async handleAnswerAreaStateChange() {
      //this.displayUndoState("handleAnswerAreaStateChange START");
      if (this.ignoreStateChanges.value) {
       globalConsoleLog("undo"," ignoring state chagnes ");
        return;
      }
      let theNewCurrentState = this.getDeepCopyOfAnswerAreaCurrentState();
      if (this.currentState) {
        if (!isEqual(this.currentState,theNewCurrentState)) {
         globalConsoleLog("undo","undo: -----------------a real state change has occurred");
          this.undoStack.push(this.currentState);
        }
        else {
         globalConsoleLog("undo","undo: -----------------no real change so just return");
          return;
        }
      }
      this.currentState = theNewCurrentState;
      this.redoStack.length = 0;
      this.displayUndoState("handleAnswerAreaStateChange FINISH");
    },
    async handleUndo() {
      //this.displayUndoState("handleUndo START");
      if (this.undoStack.length === 0) return;
      this.redoStack.push(this.currentState);
      this.currentState = this.undoStack.pop();
      await this.$nextTick(); // make sure DOM updates are done
      await this.$refs.answerAreaRef.loadPreviousAnswer(this.currentState);
      this.displayUndoState("handleUndo FINISH");
    },
    async handleRedo() {
      //this.displayUndoState("handleRedo START");
      if (this.redoStack.length === 0) return;
      this.undoStack.push(this.currentState);
      this.currentState = this.redoStack.pop();
      await this.$nextTick(); // make sure DOM updates are done
      await this.$refs.answerAreaRef.loadPreviousAnswer(this.currentState);
      this.displayUndoState("handleRedo FINISH");
    },
    async submitAnswer() {
      this.dataObject = this.$refs.answerAreaRef.getCurrentState();
      this.dataObject["statementElements"] = this.statementElements;
      this.jsonOutput = this.dataObject;
      let response = await this.StoreLastWorkingAnswer(this.selectedQuestion);
      if (response["success"] === true) {
        await this.sendGetFeedback(this.selectedQuestion);
        //window.alert("Submission successful!");
        this.okToShowCorrectAnswer = true;
        this.snackbarText = "ExNet Saved"
        this.snackbar = true;
      } else {
        window.alert("Error: Submission unsuccessful.");
      }

      },
    goFullScreen() {
      var elem = document.getElementById("displayIDForFullScreen")
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
        this.fullScreen = true;
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
        this.fullScreen = true;
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        elem.webkitRequestFullscreen();
        this.fullScreen = true;
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
        this.fullScreen = true;
      }
    },
    exitFullScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.fullScreen = false;
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
        this.fullScreen = false;
      } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
        document.webkitExitFullscreen();
        this.fullScreen = false;
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
        this.fullScreen = false;
      }
    },
    onExNetReadFile(exNetRawData) {
      const exnetWorkingAnswerJson = JSON.parse(exNetRawData);
      this.setExNetAnswer(exnetWorkingAnswerJson);
    },

  },

  async mounted() {
    const urlParams = this.$route.query;
    if (urlParams.userId) {
      await this.logIn(urlParams.userId);
    } else {
      const storedAuthStatus = sessionStorage.getItem("authStatus");

      if (storedAuthStatus === "authorized") {
        // If there is an authorized state in the session storage, login is no longer required.
        this.authorised = true;
        this.secret_key = sessionStorage.getItem("secretKey");
        this.clientType = sessionStorage.getItem("clientType");
        this.clientID = sessionStorage.getItem("clientID");
        this.userID = sessionStorage.getItem("userID");
      }
    }

    if (this.authorised) {
      await this.getQuestions();

      if (!this.questions !== null) {
        this.selectedQuestion = urlParams.exnetName
          ? urlParams.exnetName
          : this.questions[0];
        await this.getExnet(this.selectedQuestion, true);
        await this.getLastWorkingAnswer();
        await this.resetStateChangeHistory();
      }
    }
  },
};
</script>

<style>



body {
  margin: 0px;
  padding: 0px;
}

.biologic_login_button {
  font-size: 25px;
  color: rgb(162, 38, 38);
  background-color: #fff;
  margin: 2px;
  padding: 10px;
  align-items: center;
  border-top: 1px solid #8b8b8b;
  /* Darker green for bevel effect */
  border-left: 1px solid #848484;
  /* Darker green for bevel effect */
  border-bottom: 2px solid #4b4b4b;
  /* Darker green for bevel effect */
  border-right: 2px solid #444444;
  /* Darker green for bevel effect */
}

.biologic_login_button:hover {
  background-color: #e1e1e1;
  /* Change color on hover */
  border-bottom: 2px solid #2d1010;
  /* Darker green for bevel effect on hover */
  border-right: 2px solid #2d1010;
  /* Darker green for bevel effect on hover */
}

.biologic_login_button:active {
  background-color: #ffffff;
  /* Darker green when button is pressed */
  border-top: 3px solid #8b8b8b;
  /* Darker green for bevel effect */
  border-left: 3px solid #848484;
  /* Darker green for bevel effect */
  border-bottom: 1px solid #2d1010;
  /* Remove bottom border when button is pressed */
  border-right: 1px solid #2d1010;
  /* Remove right border when button is pressed */
  transform: translate(1px,
      1px);
  /* Move button down by 2 pixels when pressed */
}

.displayQuery{
  background: rgb(255, 255, 255);
  padding:5px;
  height: 100%;
  overflow-y: scroll;
}

.displayWorkspace{
  background: #ffffff;
  padding-left: 1px;
  padding-top: 5px;
  padding-bottom: 0px;
  height: 80%;
  overflow-y: scroll;
  position: relative;
}

.displayWordedOutput{
  background: #ffffff;
  padding-left: 10px;
  padding-top: 5px;
  height: 100%;
  overflow-y: scroll;
}



.mainContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow:auto;
  flex: 1 0 auto;
}

.grow-row {
 /* border: 1px solid rgb(150, 98, 0);*/
flex: 1 0 auto !important;
display: flex;
width: 100%; /* Force it to respect parent width */
  max-width: 100%; /* Prevent overshooting */
  /*  overflow: hidden;Stops unintended expansion */
}

.content-row {
 /* border: 1px solid rgb(150, 98, 0);*/
flex: 0 0 auto !important;
display: flex;
flex-direction: column;
}
.flex-col {
  display: flex;
  flex-direction: column; /* Stack rows vertically */
  height: 100%; /* Ensure the column fills its container */
}

.statementContainer {
  overflow-y: scroll;
}

#displayIDForFullScreen {
  display:flex;
  flex-direction:column; 
  background-color: white;
  width: 100%;
  max-width: 100%;
}

.connectorContainer {
  overflow-y: scroll;
}

.button-container {
  position: absolute;
  top: 20px;
  right: 20px;
}

.button-link {
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  text-decoration: none;
}

.button-link:hover {
  background-color: #0056b3;
}

.areaHeading {
  color: #9f0000;
}

.auto-col {
  flex-grow: 0 !important;
  flex-shrink: 0 !important;
  flex-basis: auto !important;
}

.biologic-component {
  color:var(--biologic-green-color);
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  font-size:xx-large;
}

.answer-area-header {
  width: 100%;
  display: flex;
  justify-content: space-between; /* Push title to the left and buttons to the right */
  align-items: center; /* Vertically center items */
  padding: 4px 8px; /* Add some padding */
  background-color: var(--biologic-grey-color); /* Light background for better visibility */
  color:var(--biologic-blue-color);
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.4); /* Drop shadow */
}

/* Title Styling */
.answer-area-title {
  font-size: 18px;
}

/* Button Group Styling */
.answer-area-buttons v-btn {
  margin-left: 8px; /* Add spacing between buttons */
}

.readout-area {
  /*border: 1px solid red;*/
}

.answer-area-button {

}

.answer-area-icon {
   color:var(--biologic-blue-color);
}

.right_menu {
  position: relative;
  top: 0;
  right: 16px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  /*height: 50px;*/
}
.biologic_logout_button {
  font-size: 20px;
  color: var(--biologic-green-color);
  background-color: #fff;
  margin: 2px;
  padding: 4px;
  align-items: top;
  border-bottom: 2px solid #595959; /* Darker green for bevel effect */
  border-right: 2px solid #595959; /* Darker green for bevel effect */
}

.biologic_logout_button:hover {
  background-color: #e1e1e1; /* Change color on hover */
  border-bottom: 2px solid #7a5a5a; /* Darker green for bevel effect on hover */
  border-right: 2px solid #7a5a5a; /* Darker green for bevel effect on hover */
}

.biologic_logout_button:active {
  background-color: #ffffff; /* Darker green when button is pressed */
  border-bottom: 0; /* Remove bottom border when button is pressed */
  border-right: 0; /* Remove right border when button is pressed */
  transform: translate(
    1px,
    1px
  ); /* Move button down by 2 pixels when pressed */
}

.snackbar-message {
  position:absolute;
  left:100px;
  top:100px;
  color: red;
}
</style>
