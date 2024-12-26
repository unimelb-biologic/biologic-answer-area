<template>
    <body>
    <div>
        <div v-if="!authorised">
            <button @click="logIn" style="font-size:30px">Log in</button><br>
        </div>

        <div class="main_workspace" v-if="authorised">

            <div class="left_column">
                <!-- Displays Statements -->
                <h2 class="displayStatements">Submission</h2>
                <div class="tooltips"> 
                    Please see the instruction here.
                    <span class="tooltip_info">Records of answers submitted by students.</span>
                 </div>

                <!-- <StatementArea
                    :statements="statementElements" /> -->
            </div>

            <div class="centre_column">
                <!-- Displays the question -->
                <div class="displayQuery" style="height:60vh;    background-color: Khaki;">
                    <h2>Correct
                        <div class = button-container>
                            <router-link to="/home" class="button-link">Return</router-link>
                        </div> 

                    </h2>
              
                    <div class="tooltips"> 
                        Please see the instruction here.
                        <span class="tooltip_info" style="visibility: initial;">This feature can provide student users with information about what is correct and incorrect in the current answer</span>
                    </div>
                    <div class="container"> 
                    <img src="../assets/alice.png" alt="" style="width:300px;height: auto;">
                    <textarea name="" id="" cols="30" rows="10">123213213</textarea>
                   </div>
                    

                </div>
                <div class="displayQuery" style="height:40vh;    background-color: #F0E9FF;">
                    <h2>
                        Feedback
                    </h2>
                    <div class="tooltips"> 
                        Please see the instruction here.
                        <span class="tooltip_info" style="visibility: initial;">This is feedback section,where students can view text feedback provided by the teacher</span>
                    </div>
                
                </div>

              
            </div>

            <div class="right_column">
                <!-- Displays the connectors -->
                <div class="displayConnectors">
                    <h2>Recent Feedback</h2>
                    <!-- <ConnectorArea /> Open to render content -->
                </div>
            </div>
        </div>
    </div>
    </body>
</template>

<script>
  import QuestionArea from '@/components/QuestionArea.vue';
  import StatementArea from '@/components/StatementArea.vue';
  import ConnectorArea from "@/components/ConnectorArea.vue";
  import AnswerArea from "@/components/AnswerArea.vue";
  import AnswerTextGeneratorArea from "@/components/AnswerTextGeneratorArea.vue";
  import { Splitpanes, Pane } from "splitpanes";
  import "splitpanes/dist/splitpanes.css";
  
  export default {
    name: "App",
  
    data() {
      return {
        questions: null,
        showQuestionList: false,
        selectedQuestion: null,
  
        promptText: null,
        exNetRelativePath: null,
        exNetName: null,
        statementElements: [],
  
        statements: [],
        connectors: [],
        offsetX: 0,
        offsetY: 0,
        answerAreaEnabled: true,
  
        clientID: null,
        authorised: false,
        secret_key: null,
  
        answerText: [], // Receive all content texts from AnswerArea
        jsonOutput: {},
        jsonData: [],
        dataObject: {},
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
    },
  
    created() {
      // TODO: put this to the statements added later.
      for (let statement of this.statementElements) {
        statement["visible"] = true;
      }
    },
  
    methods: {
      async updateJsonOutput(dataObject) {
        this.dataObject = dataObject;
        this.dataObject["offsetX"] = String(this.offsetX);
        this.dataObject["offsetY"] = String(this.offsetY);
        this.dataObject["statementElements"] = this.statementElements;
        this.jsonOutput = this.dataObject;
        console.log(this.jsonOutput);
        let response = await this.StoreLastWorkingAnswer(this.selectedQuestion);
        if (response["success"] === true) {
          //window.alert("Submission successful!");
        }
        console.log("Submission response:", response);
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
  

  
      //sets the dragged statement to the item that has started to be dragged
      onDragStart(item) {
       
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
  
        // FIXME: remove this to stop hashing client ID.
        await this.digestMessage(userID).then((digestHex) => {
          userID = digestHex;
        });
  
        this.clientID = userID;
  
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

                // Store authorization status to session storage
                sessionStorage.setItem('authStatus', 'authorized');
                sessionStorage.setItem('secretKey', this.secret_key);

                //window.alert("Successfully authorised!")
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
            this.promptText =
              exnetWorkingAnswerJson.activeExNetQuestionPack.promptText;
            console.log("FIXED PROMPT TEXT", this.promptText);
            this.exNetRelativePath =
              exnetWorkingAnswerJson.activeExNetQuestionPack.exNetRelativePath;
            this.exNetName =
              exnetWorkingAnswerJson.activeExNetQuestionPack.exNetName;
            this.statementElements =
              exnetWorkingAnswerJson.activeExNetQuestionPack.statementElements;
            for (let statement of this.statementElements) {
              statement["visible"] = true;
              // this.statements.push(statement);
            }
  
            this.showQuestionList = false;
  
            this.$refs.workspace.clearWorkspace();
            
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
  
          // console.log(exnetQuestionPack)
  
          let msgBody = {
            client_id: this.clientID,
            persistent_secret_key: this.secret_key,
            exnet_name: exnetName,
            working_answer_data: exnetQuestionPack,
          };
  
          console.log("msgBody", msgBody);
          msgBody = JSON.stringify(msgBody);
          // console.log(msgBody)
  
          let postResponse = await fetch(
            "http://localhost:5000/store-working-answer",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: msgBody,
            }
          );
  
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
        // Check if there is login status in session storage
        const storedAuthStatus = sessionStorage.getItem('authStatus');
    
        if (storedAuthStatus === 'authorized') {
        // If there is an authorized state in the session storage, login is no longer required.
            this.authorised = true;
            this.secret_key = sessionStorage.getItem('secretKey');
        } else {
            await this.logIn()
        }
        if (this.authorised) {
            await this.getQuestions();

            if (!this.questions !== null) {
                this.selectedQuestion = this.questions[0]
                await this.getExnet(this.selectedQuestion,true)
            }
        }
    },
  };
  </script>

<style>
 .container{
    display: flex;
    flex-direction: column;
 }
.displayWorkspace {
    position: relative;
}
.button-container {
  position: absolute;
  top: 10px; 
  right: 10px; 
}

.button-link {
  background-color: #007bff;
  color: #fff;
  padding: 5px 10px;
  text-decoration: none;
}

.button-link:hover {
  background-color: #0056b3; 
}
</style>