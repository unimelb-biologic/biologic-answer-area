<template>
  <div>
    <div v-if="!authorised">
      <button @click="logIn" v-if="!authorised" style="font-size: 30px">
        Log in
      </button>
      <br />
      <!-- TODO: Remove this! Development purposes only! -->
      <button
        @click="authorised = true"
        v-if="!authorised"
        style="font-size: 30px"
      >
        Bypass login
      </button>
    </div>

    <splitpanes v-if="authorised" class="mainContainer" horizontal>
      <pane max-size="10" style="height: 50px" min-size="5">
        <MenuBar
          :userID="userID"
          @onDownloadExNet="onDownloadExNet"
          @setCurrentExNet="setCurrentExNet"
        />
      </pane>
      <pane min-size="5">
        <Splitpanes>
          <pane max-size="14" class="statementContainer" min-size="5">
            <!-- Displays Statements -->
            <h2 class="areaHeading">Statement Area</h2>
            <div class="tooltips">
              Please see the instruction here.
              <span class="tooltip_info">
                This is statement section, you can drag any statement to the
                answerarea.
              </span>
            </div>

            <StatementArea
              :statements="this.statementElements"
              :sharedData="this.sharedData"
              @onDragStart="onDragStart"
              @update-shared-data="updateSharedData"
            />
          </pane>
          <pane min-size="5">
            <splitpanes horizontal>
              <pane min-size="5">
                <!-- Displays the question -->
                <div class="displayQuery">
                  <h2 class="areaHeading">
                    Question:
                    <!-- {{ this.exNetName }} -->
                    <select
                      @change="getLastWorkingAnswer(true)"
                      v-model="selectedQuestion"
                    >
                      <option
                        v-for="item in questions"
                        :value="item"
                        :key="item"
                      >
                        {{ item.slice(0, -".data".length) }}
                      </option>
                    </select>

                    <!--div class="button-container">
                      <router-link to="/feedback" class="button-link">link to feedback</router-link>
                    </div -->
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
                <div
                  class="displayWorkspace"
                  @drop="onDropWorkspace($event)"
                  @dragover.prevent
                  @dragenter.prevent
                >
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

                  <AnswerArea
                    ref="workspace"
                    :droppedItems="droppedItems"
                    :draggedItem="draggedItem"
                    :offsetX="offsetX"
                    :offsetY="offsetY"
                    :statements="statementElements"
                    :sharedData="this.sharedData"
                    @get-correct-answer="getCorrectWorkingAnswer"
                    @get-last-working-answer="getLastWorkingAnswer"
                    @answer-data="updateJsonOutput"
                    @setDraggedItem="onDragStart"
                    @addDroppedItems="addDroppedItems"
                    @delDroppedItem="delDroppedItem"
                    @update-show-my-answer="updateShowMyAnswer"
                    @update-show-correct-answer="updateShowCorrectAnswer"
                    @update-answer-area-content="handleUpdateAnswerContent"
                    @statement-used="handleStatementUsed"
                    @enable-area="(n) => toggleAnswerArea(n)"
                    @update-shared-data="updateSharedData"
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
              <ConnectorArea
                :sharedData="this.sharedData"
                @update-shared-data="updateSharedData"
              />
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
import MenuBar from "@/components/MenuBar.vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import download from "downloadjs";
import {
  BASE_URL,
  API_ENDPOINTS,
  API_BODY_PARAMS,
  DEFAULT_USER_ID,
} from "../config/constants";
import { buildFeedbackRubricMap } from "@/utils/common";
import { computed, ref } from "vue";

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
      isFeedbackAllowed: false, // flag used to restrict from backend, link to this flag from api response
      isFeedbackAvailable: false, // flag used to check whether client_feedback is there
      isCorrectAnswerAllowed: false, // flag used to check whether student can see the correct answer
      feedback: null,
      showMyAnswer: false,
      showCorrectAnswer: false,
      feedbackRubricMap: ref({}),
      sharedData: "", // awful solution to passing information during drag!
    };
  },

  provide() {
    return {
      feedbackRubricMap: computed(() => {
        return this.feedbackRubricMap.value;
      }),
      isFeedbackAvailable: computed(
        () => this.isFeedbackAvailable && this.isFeedbackAllowed
      ),
      showMyAnswer: computed(() => this.showMyAnswer),
      showCorrectAnswer: computed(() => this.showCorrectAnswer),
      isCorrectAnswerAllowed: computed(() => this.isCorrectAnswerAllowed),
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
    FileReader,
    MenuBar,
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
        await this.sendGetFeedback(this.selectedQuestion);
        window.alert("Submission successful!");
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

    updateShowCorrectAnswer(value) {
      this.showCorrectAnswer = value;
    },

    updateShowMyAnswer(value) {
      this.showMyAnswer = value;
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

    updateSharedData(newValue) {
      // newValue is a JSON.stringified version of
      // {
      //    "draggedWidth" : value;
      //    "draggedHeight" : value;
      //    "drageeType" : "connector";      (or could be "render_statement")
      // }
      this.sharedData = newValue;
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
      console.log(exNetRawData);
      const exnetWorkingAnswerJson = JSON.parse(exNetRawData);
      this.setCurrentExNet(exnetWorkingAnswerJson, true);
    },

    // Download ExNetJson
    onDownloadExNet() {
      console.log(this.dataObject);

      const exNetTemplate = {
        activeExNetQuestionPack: {
          promptText: this.promptText,
          exNetRelativePath: "Explanation Networks/" + this.exNetName,
          exNetName: this.exNetName,
          statementElements: this.statementElements,
        },
        statementElements: [],
        connectorElements: [],
      };
      console.log(exNetTemplate);
      download(
        JSON.stringify(exNetTemplate),
        this.exNetName + "_exnet_question.json",
        "application/json"
      );
    },

    setCurrentExNet(exNetData, clear = false) {
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
    async sendLoginRequest(user_name = DEFAULT_USER_ID) {
      let userID = window.prompt("Enter your user ID.", user_name);
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
        console.log(error);
      }
    },

    // Sends login request and processes returned promise.
    async logIn(userId) {
      let response = await this.sendLoginRequest(userId);
      if (response && response["success"] === true) {
        this.secret_key = response["persistent_secret_key"];
        this.authorised = true;

        // Store authorization status to session storage
        sessionStorage.setItem("authStatus", "authorized");
        sessionStorage.setItem("secretKey", this.secret_key);
        sessionStorage.setItem("clientID", this.clientID);
        sessionStorage.setItem("userID", this.userID);

        window.alert("Successfully authorised!");
      } else {
        window.alert("Login failed!");
      }
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
        console.log(error);
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
        console.log(error);
      }
    },

    async getExnet(exnetName, clear = false) {
      // TODO: reenable this
      let response = await this.sendGetExnetRequest(exnetName);

      // TODO: Remove sample server response.
      // let response = {"success": true, "exnet_name": "sky_question.data", "exnet_working_answer_json": "{\"activeExNetQuestionPack\": {\"promptText\": \"<table style=\\\"border-collapse: collapse; width: 50.0213%; margin:10px;\\\" border=\\\"1\\\"> <tbody> <tr> <td style=\\\"width: 49.949%;\\\"> <h4><span style=\\\"color: #ba372a;\\\"><em><strong>When you look up at the sky,</strong></em></span></h4> <p>the sun is yellow, while the sky is blue.</p> <h4><span style=\\\"text-decoration: underline;\\\"><span style=\\\"color: #169179; text-decoration: underline;\\\"><strong>Explain why the sky is blue.</strong>.</span></span></h4> </td> <td><img src=\\\"blue_sky.jpg\\\" alt=\\\"blue_sky.jpg\\\" width=\\\"100\\\" height=\\\"158\\\" data-api-endpoint=\\\"https://canvas.lms.unimelb.edu.au/api/v1/courses/63494/files/13454251\\\" data-api-returntype=\\\"File\\\" /></td> </tr> </tbody> </table>\", \"exNetRelativePath\": \"Explanation Networks/sky\", \"exNetName\": \"sky\", \"statementElements\": [{\"statementType\": 0, \"id\": 140255704346928, \"content\": {\"originalFacts\": [\"The sky is blue\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 20, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348560, \"content\": {\"originalFacts\": [\"light is comprised of multiple wavelengths\", \"light_has_multiple_wavelengths.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 59, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348608, \"content\": {\"originalFacts\": [\"blue light has a short wavelength\", \"blue_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 221, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348704, \"content\": {\"originalFacts\": [\"yellow light has a long wavelength\", \"yellow_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 338, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348800, \"content\": {\"originalFacts\": [\"the\", [\"--choose--\", \"smaller\", \"longer\"], \"the wavelength the more it is scattered\"], \"userInput\": [\"--choose--\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 455, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348896, \"content\": {\"originalFacts\": [[\"blue light\", \"yellow light\"], \"is scattered more than\", [\"yellow light\", \"blue light\"]], \"userInput\": [\"blue light\", \"yellow light\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 568, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348992, \"content\": {\"originalFacts\": [\"the light we see when we arent looking at the sun\", \"direct_indirect_light.jpg\", \"is scattered light\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 683, \"fontSizeStr\": \"12px\"}}]}, \"statementElements\": [{\"statementType\": 0, \"id\": 140255704346928, \"content\": {\"originalFacts\": [\"The sky is blue\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 20, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348560, \"content\": {\"originalFacts\": [\"light is comprised of multiple wavelengths\", \"light_has_multiple_wavelengths.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 59, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348608, \"content\": {\"originalFacts\": [\"blue light has a short wavelength\", \"blue_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 221, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348704, \"content\": {\"originalFacts\": [\"yellow light has a long wavelength\", \"yellow_light.jpg\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 338, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348800, \"content\": {\"originalFacts\": [\"the\", [\"--choose--\", \"smaller\", \"longer\"], \"the wavelength the more it is scattered\"], \"userInput\": [\"--choose--\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 455, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 2, \"id\": 140255704348896, \"content\": {\"originalFacts\": [[\"blue light\", \"yellow light\"], \"is scattered more than\", [\"yellow light\", \"blue light\"]], \"userInput\": [\"blue light\", \"yellow light\"]}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 568, \"fontSizeStr\": \"12px\"}}, {\"statementType\": 1, \"id\": 140255704348992, \"content\": {\"originalFacts\": [\"the light we see when we arent looking at the sun\", \"direct_indirect_light.jpg\", \"is scattered light\"], \"userInput\": []}, \"graphicalContent\": {\"xPosInParent\": 10, \"yPosInParent\": 683, \"fontSizeStr\": \"12px\"}}], \"connectorElements\": []}"}

      if (response["success"] === true) {
        if (clear) {
          const exnetWorkingAnswerJson = JSON.parse(
            response.exnet_working_answer_json
          );

          this.isFeedbackAllowed = response.is_feedback_allowed;
          this.isCorrectAnswerAllowed = response.is_correct_answer_allowed;

          // Successful response code here.
          this.setCurrentExNet(exnetWorkingAnswerJson, clear);
        }
      } else {
        // What to do if failed?
      }

      return response;
    },

    async StoreLastWorkingAnswer(exnetName) {
      try {
        let response = await this.getExnet(exnetName, false);

        // console.log("Get exnet response\n", response);
        let exnetQuestionPack = response["exnet_working_answer_json"];
        // console.log(JSON.parse(exnetQuestionPack))
        exnetQuestionPack = JSON.parse(exnetQuestionPack);

        let activeExNetQuestionPack =
          exnetQuestionPack["activeExNetQuestionPack"];
        let promptText = activeExNetQuestionPack["promptText"];
        promptText = [promptText, this.dataObject];

        activeExNetQuestionPack["promptText"] = promptText;
        exnetQuestionPack["activeExNetQuestionPack"] = activeExNetQuestionPack;
        exnetQuestionPack = JSON.stringify(exnetQuestionPack);
        // console.log("working answer data")
        // console.log(exnetQuestionPack)

        let msgBody = {
          [API_BODY_PARAMS.CLIENT_ID_BODY_PARAM]: this.clientID,
          [API_BODY_PARAMS.SECRET_KEY_BODY_PARAM]: this.secret_key,
          [API_BODY_PARAMS.EXNET_NAME]: exnetName,
          working_answer_data: exnetQuestionPack,
        };

        // console.log("msgBody", msgBody);
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
        console.log(error);
      }
    },

    async sendGetExnetAnswer(exnetName) {
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
        console.log(error);
      }
    },

    async sendGetFeedback(exnetName) {
      // console.log(this.jsonOutput, this.jsonOutput, 'this.jsonOutput)')
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
        console.log(`Failed to fetch ${exnetName}!`);
      }

      //console.log(JSON.stringify(params))
    },

    async getCorrectWorkingAnswer() {
      this.updateFeedback(null);

      // TODO: check if this call is required, as we all already getting exnet on changing question
      let response = await this.sendGetExnetRequest(this.selectedQuestion);

      if (
        response["success"] &&
        response["exnet_correct_answer_json"] != null &&
        response["exnet_correct_answer_json"] != ""
      ) {
        let lastWorkingAnswerData = await JSON.parse(
          response["exnet_correct_answer_json"]
        );
        let activeExNetQuestionPack =
          lastWorkingAnswerData["activeExNetQuestionPack"];

        // 4. get the query entry via activeExNetQuestionPack > promptText
        let promptText = activeExNetQuestionPack["promptText"];

        // 5. Check promptText is a LIST and not just a string. If it is a string - there is no information
        // that has been stored. Display the question similar to the getExnet above.
        await this.getExnet(this.selectedQuestion, true);
        if (typeof promptText === "string") {
          //console.log(promptText);
        }

        // 6. If promptText is a LIST, LIST[0] is the query itself - display directly.
        // 7. LIST[1] contains all the parameters passed when saving. Extract entries and replace those in App.vue.
        // let data = LIST[1];
        // this.offSetX = data["offSetX"]
        else if (typeof promptText === "object") {
          let data = promptText[1];
          this.offsetX = parseInt(data["offsetX"]);
          this.offsetY = parseInt(data["offsetY"]);
          this.statementElements = data["statementElements"];

          // 8. Pass LIST[1] into AnswerArea.vue using $refs, and have AnswerArea modify the corresponding entries.

          this.$refs.workspace.loadPreviousAnswer(data);
        }
      } else {
        // If fetching the correct working answer fails, log an error
        console.error("Failed to fetch correct working answer.");
      }
    },

    async getLastWorkingAnswer(isNewExnet) {
      this.updateFeedback(null);

      // TODO: check if this call is required, as we all already getting exnet on changing question
      let response = await this.sendGetExnetAnswer(this.selectedQuestion);

      // FIX ME: Success spell is wrong!
      if (response["success"]) {
        let lastWorkingAnswerData = await JSON.parse(
          response["last_working_answer_data"]
        );
        let activeExNetQuestionPack =
          lastWorkingAnswerData["activeExNetQuestionPack"];

        // 4. get the query entry via activeExNetQuestionPack > promptText
        let promptText = activeExNetQuestionPack["promptText"];

        // 5. Check promptText is a LIST and not just a string. If it is a string - there is no information
        // that has been stored. Display the question similar to the getExnet above.
        await this.getExnet(this.selectedQuestion, true);

        // disabling the show correct answer and show my answer buttons
        // whenever there is a change in the exnet question from dropdown
        if (isNewExnet) {
          this.showMyAnswer = false;
          this.showCorrectAnswer = false;
        }

        if (typeof promptText === "string") {
          //console.log(promptText);
        }

        // 6. If promptText is a LIST, LIST[0] is the query itself - display directly.
        // 7. LIST[1] contains all the parameters passed when saving. Extract entries and replace those in App.vue.
        // let data = LIST[1];
        // this.offSetX = data["offSetX"]
        else if (typeof promptText === "object") {
          let data = promptText[1];
          this.offsetX = parseInt(data["offsetX"]);
          this.offsetY = parseInt(data["offsetY"]);
          this.statementElements = data["statementElements"];

          // 8. Pass LIST[1] into AnswerArea.vue using $refs, and have AnswerArea modify the corresponding entries.

          this.$refs.workspace.loadPreviousAnswer(data);
        }
      } else {
        await this.getExnet(this.selectedQuestion, true);
      }
    },

    updateFeedback(feedback) {
      this.feedbackRubricMap.value = buildFeedbackRubricMap(feedback);
      this.feedback = feedback;
      this.isFeedbackAvailable = feedback ? true : false;
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
        this.clientID = sessionStorage.getItem("clientID");
        this.userID = sessionStorage.getItem("userID");
      } else {
        await this.logIn();
      }
    }

    if (this.authorised) {
      await this.getQuestions();

      if (!this.questions !== null) {
        this.selectedQuestion = urlParams.exnetName
          ? urlParams.exnetName
          : this.questions[0];
        await this.getExnet(this.selectedQuestion, true);
        await this.getLastWorkingAnswer(true);
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

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 8px;
  background: rgb(198, 155, 155);
}

.splitpanes--horizontal > .splitpanes__splitter {
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
