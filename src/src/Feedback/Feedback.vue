<template>
    <body>
    <div>
        <div v-if="!authorised">
            <button @click="logIn" style="font-size:30px">Log in</button><br>
        </div>

        <div class="main_workspace" v-if="authorised">

            <div class="left_column">
                <!-- Displays Statements -->
                <h2 class="displayStatements">Statement Area</h2>
                <div class="tooltips"> 
                    Please see the instruction here.
                    <span class="tooltip_info">Drag any statement from here to the answer area.</span>
                 </div>

                <StatementArea
                    :statements="statementElements" />
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
                    <h2>Connector Area</h2>
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
import AnswerTextGeneratorArea from '@/components/AnswerTextGeneratorArea.vue';

export default {
    name: 'App',

    data() {
        return {
            questions: null,            // The list of questions from the server.
            selectedQuestion: null,     // The current question that is shown.

            promptText: null,           // Prompt text for the question.
            exNetRelativePath: null,    // The relative path to the question.
            exNetName: null,            // Name of the question file.
            statementElements: [],      // All the statements from the question file.

            statements: [],             // Stores statements, in addition which ares are "visible".
            offsetX: 0,
            offsetY: 0,                 // Records coordinates related to where the mouse stopped.

            clientID: null,             // Records the client ID to be sent to the server.
            authorised: false,          // Whether the client is authorised.
            secret_key: null,           // Secret key for the session.

            answerText: [],             // Worded output from student solution.

            jsonOutput: {},
            jsonData: [],
            dataObject: {}              // Data related to serialising data to the server.
        }
    },

    components: {
        AnswerArea,
        ConnectorArea,
        QuestionArea,
        StatementArea,
        AnswerTextGeneratorArea,
    },

    methods: {
        /**
         * Hashes a value using SHA256 and a predetermined salt.
         *
         * @param msg the value to be hashed.
         * @returns {Promise<string>} the 16-bit string corresponding to the hashed value.
         * @author MDN contributors, https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
         */
        // FIXME: Remove this function once hashing is not required.
        async digestMessage(msg) {
            const message =
                "pre_salt_jkBVJcT9h8" +
                msg +
                "EirlCrW8P6_post_salt"

            const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
            const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
            const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
            // convert bytes to hex string
            return hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
        },

        /**
         * Retrieves a specific question file from the server. This can be used to display a question,
         * or to prepare for the submission of a question.
         *
         * @param exnetName the name of the exnet to be retrieved.
         * @param clear whether the workspace should be cleared after retrieving it. It should be true when swapping
         * questions, and no when performing any other operation (such as retrieving data prior to submission)
         * @returns {Promise<any>} a promise containing the response from the server.
         */
        async getExnet(exnetName, clear = false) {
            let response = await this.sendGetExnetRequest(exnetName)

            if (response["success"] === true) {
                if (clear) {
                    const exnetWorkingAnswerJson = JSON.parse(response.exnet_working_answer_json)
                    // Successful response code here.
                    this.promptText = exnetWorkingAnswerJson.activeExNetQuestionPack.promptText;
                    this.exNetRelativePath = exnetWorkingAnswerJson.activeExNetQuestionPack.exNetRelativePath;
                    this.exNetName = exnetWorkingAnswerJson.activeExNetQuestionPack.exNetName;
                    //this.statementElements = exnetWorkingAnswerJson.activeExNetQuestionPack.statementElements;//Cancel state area data injection
                    for (let statement of this.statementElements) {
                        statement["visible"] = true;
                    }

                    // Clear the current workspace.
                    if( this.$refs.workspace) this.$refs.workspace.clearWorkspace()//The workspace instance does not exist and the method is not called (because the component status is not given, this instance is not created inside the component)
                }
            } else {
                console.err("Cannot retrieve question.")
            }
            return response
        },

        /**
         * Main function to retrieve the previously submitted answer for a question. The question name
         * is automatically set to the currently selected question.
         */
        async getLastWorkingAnswer() {
            let response = await this.sendGetExnetAnswer(this.selectedQuestion)

            // FIXME: server response has misspelled success!
            if (response["succcess"] === true) {
                let last_working_answer_data = await JSON.parse(response["last_working_answer_data"]);
                let activeExNetQuestionPack = last_working_answer_data["activeExNetQuestionPack"];
                let promptText = activeExNetQuestionPack["promptText"];
                await this.getExnet(this.selectedQuestion, true)

                // If the promptText type is string, that means no new data has been submitted by the student.
                // The query can be interpreted right away.

                // If promptText is a LIST, LIST[0] is the query itself - display to question area.
                // LIST[1] are the previously saved content, which includes serialised data for the front end.
                if (typeof promptText === "object") {
                    let data = promptText[1]
                    this.offsetX = parseInt(data["offsetX"])
                    this.offsetY = parseInt(data["offsetY"])
                    this.statementElements = data["statementElements"]
                    // Pass the rest of the data into the workspace.
                    this.$refs.workspace.loadPreviousAnswer(data)
                }
            } else {
                await this.getExnet(this.selectedQuestion, true);
            }
        },

        /**
         * Main function to retrieve the list of questions available.
         */
        async getQuestions() {
            let response = await this.sendGetQuestionsListRequest()

            if (response && response["success"] === true) {
                this.questions = response.available_exnets
            } else {
                console.error('Failed to fetch available questions');
            }
        },

        /**
         * Set a statement's visible property to false, making it not rendered in statementArea.
         *
         * @param statementID the statement to be modified.
         * @param state the visible property of the statement. Defaults to false (no longer visible).
         */
        handleStatementUsed(statementID, state = false) {
            for (let statement of this.statementElements) {
                if (statement["id"] === statementID) {
                    statement["visible"] = state;
                    return
                }
            }
        },

        /**
         * Updates the information in the worded output section of the application.
         *
         * @param info the new information that should be rendered.
         */
        handleUpdateAnswerContent(info) {
            const rootID = Array.from(info[0])
            const newAnswerContentObject = info[1]
            this.answerText = []
            for (let i = 0; i < rootID.length; i++) {
                this.answerText.push(Object.values(newAnswerContentObject[rootID[i]]).join(""))
            }
        },

        /**
         * Main function to handle log in request. Stores the returned secret key if log in was successful.
         */
         async logIn() {
            let response = await this.sendLoginRequest()
            if (response && response["success"] === true) {
                this.secret_key = response["persistent_secret_key"]
                this.authorised = true

                // Store authorization status to session storage
                sessionStorage.setItem('authStatus', 'authorized');
                sessionStorage.setItem('secretKey', this.secret_key);

                window.alert("Successfully authorised!")
            } else {
                window.alert("Login failed!")
            }
        },

        /**
         * Makes the workspace aware that an item has been dropped onto it.
         *
         * @param e the event corresponding to the element being dragged onto the workspace.
         */
        onDropWorkspace(e) {
            this.$refs.workspace.onDrop(e)
        },

        /**
         * Tracks the X and Y coordinate of the mouse as it is clicked.
         *
         * @param e the mouse down event.
         */
        onMousedown(e) {
            this.offsetX = e.offsetX
            this.offsetY = e.offsetY
        },

        /**
         * Send the HTTP request for the previously submitted answer for a question.
         *
         * @param exnetName the name of the question to be retrieved.
         * @returns {Promise<any>} the json format of the server response.
         */
        async sendGetExnetAnswer(exnetName) {
            try {
                // FIXME: Endpoint URL here
                let response = await fetch("http://localhost:5000/get-last-working-answer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: `{
                              "client_id": "${this.clientID}",
                              "persistent_secret_key": "${this.secret_key}",
                              "exnet_name": "${exnetName}"
                           }`
                })
                return await response.json()
            } catch (error) {
                console.log(error)
            }
        },

        /**
         * Sends the HTTP request to retrieve a question.
         *
         * @param exnetName the name of the exnet to be retrieved.
         * @returns {Promise<any>} a json object containing the server response.
         */
        async sendGetExnetRequest(exnetName) {
            try {
                // FIXME: Endpoint URL here
                let response = await fetch("http://localhost:5000/get-exnet", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: `{
                              "client_id": "${this.clientID}",
                              "persistent_secret_key": "${this.secret_key}",
                              "exnet_name": "${exnetName}"
                           }`
                })
                return await response.json()
            } catch (error) {
                console.log(`Failed to fetch ${exnetName}!`)
            }
        },

        /**
         * Sends the HTTP request to retrieve the list of questions available.
         *
         * @returns {Promise<any>} the server response, in json.
         */
        async sendGetQuestionsListRequest() {
            try {
                // FIXME: Endpoint URL here
                let response = await fetch("http://localhost:5000/list-available-exnet", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: `{
                              "client_id": "${this.clientID}",
                              "persistent_secret_key": "${this.secret_key}"
                           }`
                })
                return await response.json()
            } catch (error) {
                console.log(error)
            }
        },

        /**
         * Sends the log in HTTP request to the server.
         *
         * @returns {Promise<any>} the json corresponding to the server response.
         */
        async sendLoginRequest() {
            let userID = window.prompt("Enter your user ID.", "dummy_1")
            this.clientID = userID

            // FIXME: remove this to stop hashing client ID.
            await this.digestMessage(userID).then((digestHex) => {
                userID = digestHex
            })
            this.clientID = userID

            try {
                // FIXME: Endpoint URL here
                let response = await fetch("http://localhost:5000/verify-client", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: `{"client_id":"${userID}"}`
                })
                return await response.json()
            } catch (error) {
                console.log(error)
            }
        },

        /**
         * Send the student's current solution to the server.
         *
         * @param exnetName the current question being worked on
         * @returns {Promise<any>} the server response to whether the store process was successful
         */
        async storeLastWorkingAnswer(exnetName) {
            try {
                let response = await this.getExnet(exnetName, false);
                let exnetQuestionPack = response["exnet_working_answer_json"]
                exnetQuestionPack = JSON.parse(exnetQuestionPack)
                let activeExNetQuestionPack = exnetQuestionPack["activeExNetQuestionPack"]
                let promptText = activeExNetQuestionPack["promptText"]
                promptText = [promptText, this.dataObject]
                activeExNetQuestionPack["promptText"] = promptText
                exnetQuestionPack["activeExNetQuestionPack"] = activeExNetQuestionPack
                exnetQuestionPack = JSON.stringify(exnetQuestionPack)

                let msgBody = {
                    "client_id": this.clientID,
                    "persistent_secret_key": this.secret_key,
                    "exnet_name": exnetName,
                    "working_answer_data": exnetQuestionPack
                }
                msgBody = JSON.stringify(msgBody)

                let postResponse = await fetch("http://localhost:5000/store-working-answer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: msgBody
                })

                if (!postResponse.ok) {
                    console.error(`HTTP error! status: ${postResponse.status}`);
                }
                return await postResponse.json();
            } catch (error) {
                console.log(error);
            }
        },

        /**
         * Prepares the data to be submitted to the server in working answer.
         *
         * @param dataObject the data passed up from answerArea.
         */
        async updateJsonOutput(dataObject) {
            this.dataObject = dataObject
            this.dataObject["offsetX"] = String(this.offsetX)
            this.dataObject["offsetY"] = String(this.offsetY)
            this.dataObject["statementElements"] = this.statementElements
            this.jsonOutput = this.dataObject;
            let response = await this.storeLastWorkingAnswer(this.selectedQuestion)
            if (response["success"] === true) {
                window.alert("Submission successful!")
            }
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
    }
}
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