<template>
  <div>
    <div v-if="!authorised">
      <button @click="logIn" v-if="!authorised" style="font-size: 30px">
        Log in
      </button>
      <br />
      <!-- TODO: Remove this! Development purposes only! -->
      <button @click="authorised = true" v-if="!authorised" style="font-size: 30px">
        Bypass login
      </button>
    </div>

    <splitpanes v-if="authorised" class="mainContainer" horizontal>
      <pane max-size="10" style="height: 50px;" min-size="5">
        <div style="display:flex;flex-direction: row; ">
          <div>
            <file-reader :title="'Browse ExNet File:'" @read-file="onExNetReadFile"></file-reader>
          </div>
          <div>
            <div style="display:flex; flex-direction:row; align-items: center;">
              <h3 style="padding-right: 10px;"><label for="save-file">Save ExNet File: </label></h3>
              Under constructionn
              <!-- <button id="save-file" type=" button" @click="onDownloadExNet">Save ExNet</button> -->

            </div>
          </div>
        </div>
      </pane>
      <pane min-size="5">
        <Splitpanes>
          <pane max-size="14" class="statementContainer" min-size="5" >
            <!-- Displays Statements -->
            <h2 class="areaHeading">Statement Area</h2>
            <div class="tooltips">
              Please see the instruction here.
              <span class="tooltip_info">
                This is statement section, you can drag any statement to the
                answerarea.
              </span>
            </div>

            <StatementArea :statements="this.statementElements" @onDragStart="onDragStart" />
          </pane>
          <pane min-size="5">
            <splitpanes horizontal>
              <pane min-size="5">
                <!-- Displays the question -->
                <div class="displayQuery">
                  <h2 class="areaHeading">
                    Question:
                    {{ this.exNetName }}
                    <!-- <select @change="getLastWorkingAnswer" v-model="selectedQuestion">
                      <option v-for="item in questions" :value="item" :key="item">
                        {{ item.slice(0, -".data".length) }}
                      </option>
                    </select> -->

                    <div class="button-container">
                      <router-link to="/feedback" class="button-link">link to feedback</router-link>
                    </div>
                  </h2>

                  <div class="tooltips">
                    Please see the instruction here.
                    <span class="tooltip_info">
                      This is question section, you can view questions here.
                    </span>
                  </div>
                  <QuestionArea :prompttext="this.promptText" />
                </div>
              </pane>
              <pane min-size="5">
                <!-- Displays workspace -->
                <div class="displayWorkspace" @drop="onDropWorkspace($event)" @dragover.prevent @dragenter.prevent>
                  <div id="answerArea" class="sectionTitle">
                    <h2 class="areaHeading">Answer</h2>
                    <div class="tooltips">
                      Please see the instruction here.
                      <span class="tooltip_info">
                        This is answer section, you can drag any statement or
                        connector to answer the question.
                      </span>
                    </div>
                  </div>

                  <AnswerArea ref="workspace" 
                    :droppedItems="droppedItems" 
                    :draggedItem="draggedItem" 
                    :offsetX="offsetX"
                    :offsetY="offsetY" 
                    :statements="statementElements" 
                    
                    @answer-data="updateJsonOutput"
                    @setDraggedItem="onDragStart" 
                    @addDroppedItems="addDroppedItems" 
                    @delDroppedItem="delDroppedItem"
                    @update-answer-area-content="handleUpdateAnswerContent" 
                    @statement-used="handleStatementUsed"
                    @enable-area="(n) => toggleAnswerArea(n)" 
                    @String_feedback="click_feedback" 
                  />
                </div>
              </pane>
              <pane min-size="5">
                <!-- Displays worded answer, automatically formed -->
                <div class="displayWordedOutput">
                  <h4>Check your answer here</h4>
                  <!-- Get texts from AnswerArea -->
                  <AnswerTextGeneratorArea :answerText="this.answerText" />
                </div>
              </pane>
            </splitpanes>
          </pane>
          <pane max-size="14" class="connectorContainer" min-size="5">
            <!-- Displays the connectors -->
            <div class="displayConnectors">
              <h2 class="areaHeading">Connector Area</h2>
              <ConnectorArea />
            </div>
          </pane>
        </Splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>
  
<script>
import QuestionArea from "@/components/QuestionArea.vue";
import StatementArea from "@/components/StatementArea.vue";
import ConnectorArea from "@/components/ConnectorArea.vue";
import AnswerArea from "@/components/AnswerArea.vue";
import AnswerTextGeneratorArea from "@/components/AnswerTextGeneratorArea.vue";
import FileReader from "@/components/FileReader.vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import download from 'downloadjs'

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

      statements: [],
      connectors: [],
      droppedItems: [],
      draggedItem: null,
      offsetX: 0,
      offsetY: 0,
      answerAreaEnabled: true,

      clientID: null,
      authorised: true, // TODO: automatically bypass login - for prototyping purpose
      secret_key: null,
      userID: null,
      answerText: [], // Receive all content texts from AnswerArea
      jsonOutput: {},
      jsonData: [],
      dataObject: {},
      feedback: null
    };
  },

  components: {
    AnswerArea,
    ConnectorArea,
    QuestionArea,
    StatementArea,
    AnswerTextGeneratorArea,
    Splitpanes,
    Pane,
    FileReader
  },

  created() {
    // TODO: put this to the statements added later.
    for (let statement of this.statementElements) {
      statement["visible"] = true;
      statement["showPopup"] = true;
      statement["collapsed"] = false;
    }
  },

  methods: {
    async updateJsonOutput(dataObject) {
      this.dataObject = dataObject;
      this.dataObject["offsetX"] = String(this.offsetX);
      this.dataObject["offsetY"] = String(this.offsetY);
      this.dataObject["statementElements"] = this.statementElements;
      this.jsonOutput = this.dataObject;

      let response = await this.StoreLastWorkingAnswer(this.selectedQuestion);
      if (response["success"] === true) {
        window.alert("Submission successful!");
      }
      console.log("Submission response:", response);
      this.sendGetStudentGrades(this.selectedQuestion).then(response => {
        if (response["success"] === true) {
          this.feedback = response.client_feedback
        }
      })
    },
    click_feedback() {
      const { gradingStatus, gradingInfo, overallScore } = JSON.parse(this.feedback);

      const gradingInfoStr = gradingInfo.map(info => {
        return `
        <div>
          <strong>Score:</strong> ${info.rubricScore},
          <strong>Feedback:</strong> ${info.feedback},
          <strong>Academic Note:</strong> ${info.academicNote},
          <strong>Rubric Key:</strong> ${info.rubricKey},
          <strong>Rubric Status:</strong> ${info.rubricStatus},
          <strong>ExnetID:</strong> ${info.exnetID},
          <strong>Statement Identifier:</strong> ${info.statementIdentifier},
        </div>
    `;
      }).join('\n');
      const str = `
    <div>
      <strong>gradingStatus:</strong> ${gradingStatus},
    </div>
    <div>  
      <strong>gradingInfo:</strong> ${gradingInfoStr},
    </div>
    <br> 
    <div style="font-weight: bold; color: red; font-size: 16px;">
      <strong>overallScore:</strong> ${overallScore}
    </div>
  `;
      const popup = window.open('', 'Custom Popup', 'width=600,height=400');
      if (popup) {
        popup.document.write(`
      <html>
      <head>
        <style>
          h7{
            font-family: Arial, sans-serif;
            font-size: 14px;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
          }
          div {
            margin: 5px 0;
          }
        </style>
      </head>
      <strong><h7>GradingStatus: Represents the overall grading status.<br>
          C : indicates that the marking has been completed. <br>
          IC : indicates that the marking has not been completed.</h7><strong>
      <br><br>
      <strong><h7>rubricStatus: Represents the status of the grading for this rubric item. Possible values:<br>
          GC : Indicates that the Auto-grader marked this as correct.<br>
          GIC : Indicates that the Auto-grader marked this as incorrect.<br>
          GPC : Indicates that the Auto-grader marked this as partially correct.<br>
          GNC : Indicates that the Auto-grader could not mark this.<br>
          MG : Indicates that this has been manually graded by an educator. </h7><strong>
      <br><br>
      <body>${str}</body>
      </html>
    `);
      } else {
        alert('Error');
      }
    },
    // // Selects a specific question from the list.
    // questionSelected() {
    //     // console.log("Displaying question", this.selectedQuestion)
    //     this.getExnet(this.selectedQuestion,true)
    // },

    // When a statement is dropped onto a connector, this fires.
    // Set the corresponding statement's "visible" property to false.
    handleStatementUsed(statementID, state = false) {
      for (let statement of this.statementElements) {
        if (statement["id"] === statementID) {
          statement["visible"] = state;
          return;
        }
      }
    },

    // add the statement to the droppedItem array
    addDroppedItems(data) {
      this.droppedItems.push(data);
    },

    // remove the dropped statement on the answerArea
    delDroppedItem(data) {
      this.droppedItems = this.droppedItems.filter(
        (item) => item.id !== data.id
      );
    },

    //sets the dragged statement to the item that has started to be dragged
    onDragStart(item) {
      this.draggedItem = item;
    },






    //Record the coordinate of X,Y when it clicked
    onMousedown(e) {
      this.offsetX = e.offsetX;
      this.offsetY = e.offsetY;
    },

    onDropWorkspace(e) {
      if (this.answerAreaEnabled === false) {
        return;
      }
      this.$refs.workspace.onDrop(e);
    },

    toggleAnswerArea(e) {
      this.answerAreaEnabled = e;
    },

    // Receive all content texts from AnswerArea
    handleUpdateAnswerContent(info) {
      const rootID = Array.from(info[0]);
      const newAnswerContentObject = info[1];
      this.answerText = [];
      for (let i = 0; i < rootID.length; i++) {
        this.answerText.push(
          Object.values(newAnswerContentObject[rootID[i]]).join("")
        );
      }
    },
    // Handle ExNetJson from FileREader
    onExNetReadFile(exNetRawData) {
      const exnetWorkingAnswerJson = JSON.parse(exNetRawData);
      this.setCurrentExNet(exnetWorkingAnswerJson, true);
    },

    

    // Download ExNetJson
    onDownloadExNet() {
      console.log(this.dataObject)

      const exNetTemplate = {
        activeExNetQuestionPack: {
          promptText: this.promptText,
          exNetRelativePath: "Explanation Networks/" + this.exNetName,
          exNetName: this.exNetName,
          statementElements: this.statementElements
        },
        statementElements: [],
        connectorElements: []
      }
      console.log(exNetTemplate)
      // download(JSON.stringify(exNetTemplate), this.exNetName + "_exnet_question.json", "application/json");

    },
    setCurrentExNet(exNetData, clear = false) {
      this.promptText =
        exNetData.activeExNetQuestionPack.promptText;
      console.log("FIXED PROMPT TEXT", this.promptText);
      this.exNetRelativePath =
        exNetData.activeExNetQuestionPack.exNetRelativePath;
      this.exNetName =
        exNetData.activeExNetQuestionPack.exNetName;
      this.statementElements =
        exNetData.activeExNetQuestionPack.statementElements;
      for (let statement of this.statementElements) {
        statement["visible"] = true;
        statement["collapsed"] = false;
        statement["showPopup"] = true;
        // this.statements.push(statement);
      }

      this.showQuestionList = false;
      if (clear) {
        this.$refs.workspace.clearWorkspace();
        this.droppedItems = [];
      }
    },

    // TODO: Remove this once hashing is not required.
    async digestMessage(msg) {
      const message = "pre_salt_jkBVJcT9h8" + msg + "EirlCrW8P6_post_salt";

      const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
      // convert bytes to hex string
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    },

    // Sends the login HTTP request to the server.
    async sendLoginRequest() {
      let userID = window.prompt("Enter your user ID.", "dummy_1");

      //FIXME: will the client ID be hashed or plaintext???
      this.clientID = userID;
      console.log(this.clientID, '  this.clientID')
      // FIXME: remove this to stop hashing client ID.
      await this.digestMessage(userID).then((digestHex) => {
        userID = digestHex;
        this.userID = userID//save userID
      });


      try {
        // FIXME: Server URL here
        let response = await fetch("http://localhost:5000/verify-client", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: `{"client_id":"${userID}"}`,
        });
        return await response.json();
      } catch (error) {
        console.log(error);
      }
    },

    // Sends login request and processes returned promise.
    async logIn() {
      let response = await this.sendLoginRequest()
      if (response && response["success"] === true) {
        this.secret_key = response["persistent_secret_key"]
        this.authorised = true
        console.log('userlogin', response)
        // Store authorization status to session storage
        sessionStorage.setItem('authStatus', 'authorized');
        sessionStorage.setItem('secretKey', this.secret_key);

        window.alert("Successfully authorised!")
      } else {
        window.alert("Login failed!")
      }
    },

    async sendGetQuestionsListRequest() {
      try {
        // FIXME: HTTP request here.
        let response = await fetch(
          "http://localhost:5000/list-available-exnet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: `{
                                "client_id": "${this.clientID}",
                                "persistent_secret_key": "${this.secret_key}"
                             }`,
          }
        );
        return await response.json();
      } catch (error) {
        console.log(error);
      }
    },

    async getQuestions() {
      // TODO: re-enable this
      let response = await this.sendGetQuestionsListRequest();
      console.log(response);

      // TODO: Remove sample server response.
      // let response = {
      //     "success": true,
      //     "available_exnets": [
      //         "CAL_Q1_question.data",
      //         "CAL_Q2_question.data",
      //         "CAL_Q3_question.data",
      //         "fur_question.data",
      //         "hemophilia_question.data",
      //         "leucine_question.data",
      //         "oocyte_question.data",
      //         "pcr_Q1_question.data",
      //         "pcr_Q2_question.data",
      //         "pcr_Q3_question.data",
      //         "promoter_question.data",
      //         "sky_question.data"
      //     ]
      // }

      if (response && response["success"] === true) {
        // Successful response code here.
        this.questions = response.available_exnets;
      } else {
        console.error("Failed to fetch available questions");
      }
    },

    async sendGetExnetRequest(exnetName) {
      try {
        // FIXME: HTTP request here.
        // Is this GET or POST?
        let response = await fetch("http://localhost:5000/get-exnet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: `{
                                "client_id": "${this.clientID}",
                                "persistent_secret_key": "${this.secret_key}",
                                "exnet_name": "${exnetName}"
                             }`,
        });
        return await response.json();
      } catch (error) {
        console.log(error);
      }
    },

    async getExnet(exnetName, clear = false) {
      // TODO: reenable this
      let response = await this.sendGetExnetRequest(exnetName);
      console.log(response);

      // TODO: Remove sample server response.
      // let response = {"success": true, "exnet_name": "sky_question.data", "exnet_working_answer_json": "{\"activeExNetQuestionPack\": {\"promptText\": \"<table style=\\\"border-collapse: collapse; width: 50.0213%; margin:10px;\\\" border=\\\"1\\\"> <tbody> <tr> <td style=\\\"width: 49.949%;\\\"> <h4><span style=\\\"color: #ba372a;\\\"><em><strong>When you look up at the sky,</strong></em></span></h4> <p>the sun is yellow, while the sky is blue.</p> <h4><span style=\\\"text-decoration: underline;\\\"><span style=\\\"color: #169179; text-decoration: underline;\\\"><strong>Explain why the sky is blue.</strong>.</span></span></h4> </td> <td><img src=\\\"blue_sky.jpg\\\" alt=\\\"blue_sky.jpg\\\" width=\\\"100\\\" height=\\\"158\\\" data-api-endpoint=\\\"https://canvas.lms.unimelb.edu.au/api/v1/courses/63494/files/13454251\\\" data-api-returntype=\\\"File\\\" /></td> </tr> </tbody> </table>\", \"exNetRelativePath\": \"Explanation Networks/sky\", \"exNetName\": \"sky\", \"statementElements\": [{\"statementType\": 0, \"id\": 140255704346928, \"content\": {\"originalFacts\": [\"The sky is blue\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 20, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348560, \"content\": {\"originalFacts\": [\"light is comprised of multiple wavelengths\", \"light_has_multiple_wavelengths.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 59, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348608, \"content\": {\"originalFacts\": [\"blue light has a short wavelength\", \"blue_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 221, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348704, \"content\": {\"originalFacts\": [\"yellow light has a long wavelength\", \"yellow_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 338, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348800, \"content\": {\"originalFacts\": [\"the\", [\"--choose--\", \"smaller\", \"longer\"], \"the wavelength the more it is scattered\"], \"userInput\": [\"--choose--\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 455, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348896, \"content\": {\"originalFacts\": [[\"blue light\", \"yellow light\"], \"is scattered more than\", [\"yellow light\", \"blue light\"]], \"userInput\": [\"blue light\", \"yellow light\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 568, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348992, \"content\": {\"originalFacts\": [\"the light we see when we arent looking at the sun\", \"direct_indirect_light.jpg\", \"is scattered light\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 683, \"fontSizeStr\": \"12px\"}}]}, \"statementElements\": [{\"statementType\": 0, \"id\": 140255704346928, \"content\": {\"originalFacts\": [\"The sky is blue\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 20, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348560, \"content\": {\"originalFacts\": [\"light is comprised of multiple wavelengths\", \"light_has_multiple_wavelengths.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 59, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348608, \"content\": {\"originalFacts\": [\"blue light has a short wavelength\", \"blue_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 221, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348704, \"content\": {\"originalFacts\": [\"yellow light has a long wavelength\", \"yellow_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 338, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348800, \"content\": {\"originalFacts\": [\"the\", [\"--choose--\", \"smaller\", \"longer\"], \"the wavelength the more it is scattered\"], \"userInput\": [\"--choose--\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 455, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348896, \"content\": {\"originalFacts\": [[\"blue light\", \"yellow light\"], \"is scattered more than\", [\"yellow light\", \"blue light\"]], \"userInput\": [\"blue light\", \"yellow light\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 568, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348992, \"content\": {\"originalFacts\": [\"the light we see when we arent looking at the sun\", \"direct_indirect_light.jpg\", \"is scattered light\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 683, \"fontSizeStr\": \"12px\"}}], \"connectorElements\": []}"}

      if (response["success"] === true) {
        if (clear) {
          const exnetWorkingAnswerJson = JSON.parse(
            response.exnet_working_answer_json
          );
          // Successful response code here.
          this.setCurrentExNet(exnetWorkingAnswerJson, clear)
        }
      } else {
        // What to do if failed?
      }
      return response;
    },
    async StoreLastWorkingAnswer(exnetName) {
      try {
        let response = await this.getExnet(exnetName, false);
        console.log("Get exnet response\n", response);
        let exnetQuestionPack = response["exnet_working_answer_json"];
        // console.log(JSON.parse(exnetQuestionPack))
        exnetQuestionPack = JSON.parse(exnetQuestionPack);

        let activeExNetQuestionPack =
          exnetQuestionPack["activeExNetQuestionPack"];

        let promptText = activeExNetQuestionPack["promptText"];

        console.log(typeof promptText);

        promptText = [promptText, this.dataObject];

        activeExNetQuestionPack["promptText"] = promptText;

        exnetQuestionPack["activeExNetQuestionPack"] = activeExNetQuestionPack;

        exnetQuestionPack = JSON.stringify(exnetQuestionPack);
        console.log("working answer data")
        console.log(exnetQuestionPack)

        let msgBody = {
          client_id: this.clientID,
          persistent_secret_key: this.secret_key,
          exnet_name: exnetName,
          working_answer_data: exnetQuestionPack,
        };

        console.log("msgBody", msgBody);
        msgBody = JSON.stringify(msgBody);
        // console.log(msgBody)

        // let postResponse = await fetch(
        //   "http://localhost:5000/store-working-answer",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: msgBody,
        //   }
        // );

        // if (!postResponse.ok) {
        //   throw new Error(`HTTP error! status: ${postResponse.status}`);
        // }

        // return await postResponse.json();
      } catch (error) {
        console.log(error);
      }
    },
    async sendGetExnetAnswer(exnetName) {
      try {
        // FIXME: HTTP request here.
        // Is this GET or POST?
        let response = await fetch(
          "http://localhost:5000/get-last-working-answer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: `{
                        "client_id": "${this.clientID}",
                        "persistent_secret_key": "${this.secret_key}",
                        "exnet_name": "${exnetName}"
                      }`,
          }
        );
        return await response.json();
      } catch (error) {
        console.log(error);
      }
    },
    async sendGetStudentGrades(exnetName) {
      console.log(this.jsonOutput, this.jsonOutput, 'this.jsonOutput)')
      console.log(localStorage.getItem('userID'))
      const params = {
        activeExNetQuestionPack: {
          promptText: [this.promptText, this.dataObject],
          ...this.dataObject,
          "exNetRelativePath": this.exNetRelativePath,
          "exNetName": exnetName,
          statementElements: this.dataObject.statementElements
        },
        statementElements: this.dataObject.statementElements

      };
      try {
        // FIXME: Endpoint URL here
        let response = await fetch("http://localhost:5000/get-student-grades", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body:
            JSON.stringify({
              "student_id": this.userID,
              "client_id": this.userID,
              "persistent_secret_key": this.secret_key,
              "exnet_name": exnetName,
              // "ex_net": JSON.stringify({activeExNetQuestionPack: this.promptText, ...this.dataObject}) }
              "ex_net": JSON.stringify(params),
              // "ex_flow":JSON.stringify(params)
            },

            )

        })
        return await response.json()

      } catch (error) {
        console.log(`Failed to fetch ${exnetName}!`)
      }
      print(JSON.stringify(params))
    },
    async getLastWorkingAnswer() {
      // 1. Send HTTP Request. Body needs client_id, persistent_secret_key, exnet_name using fetch
      let response = await this.sendGetExnetAnswer(this.selectedQuestion);
      console.log(response);
      console.log(response["succcess"]);
      // 2. confirm server responds with "success" : true
      // FIX ME: Success spell is wrong!
      if (response["succcess"] === true) {
        console.log("ddas");
        let last_working_answer_data = await JSON.parse(
          response["last_working_answer_data"]
        );
        // 3. activeExNetQuestionPack is from "last_working_answer_data" entry.
        let activeExNetQuestionPack =
          last_working_answer_data["activeExNetQuestionPack"];
        console.log("questionpack", activeExNetQuestionPack);
        // 4. get the query entry via activeExNetQuestionPack > promptText
        let promptText = activeExNetQuestionPack["promptText"];
        console.log("promptText", promptText);
        console.log(typeof promptText);
        // 5. Check promptText is a LIST and not just a string. If it is a string - there is no information
        // that has been stored. Display the question similar to the getExnet above.
        await this.getExnet(this.selectedQuestion, true);
        if (typeof promptText === "string") {
          console.log(promptText);
        }
        // 6. If promptText is a LIST, LIST[0] is the query itself - display directly.
        // 7. LIST[1] contains all the parameters passed when saving. Extract entries and replace those in App.vue.
        // let data = LIST[1];
        // this.offSetX = data["offSetX"]
        else if (typeof promptText === "object") {
          let data = promptText[1];
          console.log("data", typeof data);
          this.offsetX = parseInt(data["offsetX"]);
          this.offsetY = parseInt(data["offsetY"]);
          this.statementElements = data["statementElements"];
          this.$refs.workspace.loadPreviousAnswer(data);

          console.log(data);
        }
      } else {
        await this.getExnet(this.selectedQuestion, true);
      }

      // 8. Pass LIST[1] into AnswerArea.vue using $refs, and have AnswerArea modify the corresponding entries.
    },
  },

  async mounted() {

    // TODO remove following login bypass when backend communication is re-eatablished
    sessionStorage.setItem('authStatus', 'authorized');
    sessionStorage.setItem('secretKey', 'dummySecretKey');

    // Check if there is login status in session storage
    const storedAuthStatus = sessionStorage.getItem('authStatus');

    if (storedAuthStatus === 'authorized') {
      // If there is an authorized state in the session storage, login is no longer required.
      this.authorised = true;
      this.secret_key = sessionStorage.getItem('secretKey');
    } else {
      await this.logIn()
    }

    // TODO uncomment question fetching when backend communication is re-established
    // if (this.authorised) {
    //   await this.getQuestions();

    //   if (!this.questions !== null) {
    //     this.selectedQuestion = this.questions[0]
    //     await this.getExnet(this.selectedQuestion, true)
    //   }
    // }
  },

};
</script>
  
<style>
body {
  margin: 0px;
  padding: 0px;
}

.displayWorkspace {
  position: relative;
}

.sectionTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.sectionTitle h2 {
  width: 220px;
  margin: 0px 0px 0px 10px;
}

.splitpanes--vertical>.splitpanes__splitter {
  min-width: 8px;
  background: rgb(198, 155, 155);
}

.splitpanes--horizontal>.splitpanes__splitter {
  min-height: 8px;
  background: rgb(198, 155, 155);
}

.mainContainer {
  height: 100vh;
}

.statementContainer {
  overflow-y: scroll;
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
</style>
  