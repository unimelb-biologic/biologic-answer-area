<template>
    <div><button @click="convertToJson">Submit</button></div>
    
    <div class="answer_area"
         @dragover.prevent
         @dragenter.prevent
         ref="answer_area">

         <RenderStatement
            v-for="item in rootStatementIDs"
            :key="item"
            :data="allStatements[item]" />
        

        <Connector v-for="rootConnectorID in rootConnectorID_list"
            :connector-i-d="allConnectors[rootConnectorID].connectorID"
            :connector-content-i-d="allConnectors[rootConnectorID].connectorContentID"
            :connector-content="allConnectors[rootConnectorID].connectorContent"
            :all-statements="this.allStatements"
            :all-connectors="this.allConnectors"
            :parent="allConnectors[rootConnectorID].parent"
            :left-i-d="allConnectors[rootConnectorID].leftID"
            :left-type="allConnectors[rootConnectorID].leftType"
            :left-content="allConnectors[rootConnectorID].leftContent"
            :right-i-d="allConnectors[rootConnectorID].rightID"
            :right-type="allConnectors[rootConnectorID].rightType"
            :right-content="allConnectors[rootConnectorID].rightContent"
            :click-count="allConnectors[rootConnectorID].clickCount"
            :selected-phrase="allConnectors[rootConnectorID].selectedPhrase"
            :top="allConnectors[rootConnectorID].top"
            :left="allConnectors[rootConnectorID].left"
            :moveItem="moveItem"
            :rootConnectorID="rootConnectorID"
            
            @delete-child-connector="deleteChildConnector"
            @delete-connector="deleteConnector"
            @delete-statement="deleteStatement"
            @dropped-astat="handleAStatementDrop"
            @dropped-bstat="handleBStatementDrop"
            @dropped-aconn="handleAConnectorDrop"
            @dropped-bconn="handleBConnectorDrop"
            @link-word-changed="handleLinkWordChange"
            @update-connector-content="handleConnectContentChange"
            @update-click-count="handleUpdateClickCount"
            @update-child-connector-content="handleUpdateChildConnector"
            @update-child-stat="handleUpdateChildStat"
        />
        
    </div>
</template>

<script>
import Connector from "@/components/Connector.vue";
import RenderStatement from '../components/RenderStatement.vue';

export default {
    name: "AnswerArea",
    components: {Connector, RenderStatement},
    emits: ['update-answer-area-content', 'statementUsed', 'connector-deleted','answer-data'],
    props: {
        statements: Object,
        data: Object,
        offsetX: Number,
        offsetY: Number,
        dataObject: Object
    },
    data() {
        return {
            connectorCount: 0,                  // To assign IDs to newly dragged in connectors
            rootConnectorID_list: new Set(),
            rootStatementIDs : new Set(),
            rootConnectorID: null,              // This variable may be redundant.

            allConnectors: {},                  // These two variables stores a "lookup table" of items.
            allStatements: {},                  // Key is the item's ID, value are its contents.
            left: 0,
            top: 0,

            moveItem: null,
            moveX: 0,
            moveY: 0,                           // These three variables may be redundant.

            data_Object: {},                    // For serialising the object.

            answerContent: {},                  // {ID: Content} record the element ID and its content
        }
    },
    methods: {
        /**
         * Clears all variables in AnswerArea. Useful when changing questions.
         */
        clearWorkspace() {
            this.connectorCount = 0
            this.rootConnectorID_list = new Set()
            this.rootStatementIDs = new Set()
            this.rootConnectorID = null

            this.allConnectors = {}
            this.allStatements = {}  // Record all user input

            this.left = 0
            this.top = 0

            this.answerContent = {}   // {ID: Content} record the element ID and its content
        },

        /**
         * Serialise the answerArea object, then pass it up to App.vue. Used when submitting a solution.
         */
        convertToJson() {
            this.data_Object = {
                connectorCount: String(this.connectorCount),
                rootConnectorID_list: Array.from(this.rootConnectorID_list),
                rootConnectorID: this.rootConnectorID,
                rootStatementIDs: Array.from(this.rootStatementIDs),
                allConnectors: this.allConnectors,
                allStatements: this.allStatements,
                left: String(this.left),
                top: String(this.top),
                moveItem: this.moveItem,
                moveX: String(this.moveX),
                moveY: String(this.moveY),
                statementFlag: this.statementFlag,
                statementsType: this.statementsType,
                rootContent: this.rootContent,
                answerContent: this.answerContent,
                offsetX: undefined,
                offsetY: undefined
            }
            this.$emit('answer-data', this.data_Object)
        },

        /**
         * Remove a connector's children.
         *
         * @param params an object in the format of {deletedConnector, parentConnector, leftOrRight}
         */
        deleteChildConnector(params) {
            const {id, parentId, position} = params;
            if (position && parentId !== undefined) {
                const parentId = this.allConnectors[id].parent;
                delete this.allConnectors[parentId][`${position}ID`];
                delete this.allConnectors[parentId][`${position}Type`];
            }
            this.deleteConnector({id})
        },

        /**
         * Delete a connector from the allConnectors look up table.
         *
         * @param params the id of the connector to be removed.
         */
        deleteConnector(params) {
            const {id} = params;
            const {leftType, leftID, rightType, rightID} = this.allConnectors[id];
            if (leftType === 'connector') {
                this.deleteConnector({id: leftID})
            }
            if (rightType === 'connector') {
                this.deleteConnector({id: rightID})
            }
            if (leftType === 'statement') {
                this.$emit('statementUsed', leftID, true);
            }
            if (rightType === 'statement') {
                this.$emit('statementUsed', rightID, true)
            }
            delete this.allConnectors[id];
            this.rootConnectorID_list.delete(id)
            this.$emit('connector-deleted', id);
        },


        /**
         * Remove a statement from allStatements, and restores it to the left.
         *
         * @param params an object in the format of {statementID, parentConnectorID, leftOrRight}
         */
        deleteStatement(params) {
            const {id, parentId, position} = params
            if (position) {
                this.$emit('statementUsed', id, true)
                delete this.allConnectors[parentId][`${position}ID`]
                delete this.allConnectors[parentId][`${position}Type`]
            }
        },

        /**
         * Let App.vue know that answer readout should be updated.
         *
         * @param newAnswerContentObject the new answer readout information.
         */
        emitUpdateContent(newAnswerContentObject) {
            this.$emit('update-answer-area-content', [this.rootConnectorID_list, newAnswerContentObject]);
        },

        /**
         * Handles having a connector dropped to the left side of a connector, creating
         * a nested connector.
         *
         * @param info a list in the format [connectorBeingDroppedOnto, droppedConnectorInformation]
         */
        handleAConnectorDrop(info) {
            const connectorID = info[0]
            const data = info[1]

            // If a connector was dragged onto itself...
            if (connectorID === data.connectorID) {
                return
            }

            let droppedConnectorID = data.connectorID

            // A new connector from the right is dropped onto a connector
            if (droppedConnectorID === undefined) {
                droppedConnectorID = this.connectorCount
                this.connectorCount++

                this.allConnectors[droppedConnectorID] = info[1]
                this.allConnectors[droppedConnectorID]["connectorID"] = droppedConnectorID
                this.allConnectors[droppedConnectorID]["parent"] = connectorID
                this.allConnectors[droppedConnectorID]["leftID"] = undefined
                this.allConnectors[droppedConnectorID]["leftType"] = undefined
                this.allConnectors[droppedConnectorID]["leftContent"] = undefined
                this.allConnectors[droppedConnectorID]["rightID"] = undefined
                this.allConnectors[droppedConnectorID]["rightType"] = undefined
                this.allConnectors[droppedConnectorID]["rightContent"] = undefined
                this.allConnectors[droppedConnectorID]["clickCount"] = 0

            } else if (data.parentID === -1) {
                // Dragged from the answer area itself, i.e. it was a root connector.
                if (this.rootConnectorID_list.has(droppedConnectorID)) {
                    this.rootConnectorID_list.delete(droppedConnectorID)
                }
                this.allConnectors[droppedConnectorID]["parent"] = connectorID
            } else {
                // Dragged from a connector to this new connector.
                if (this.allConnectors[data.parentID]["leftID"] === droppedConnectorID) {
                    this.allConnectors[data.parentID]["leftID"] = undefined
                    this.allConnectors[data.parentID]["leftType"] = undefined
                    this.allConnectors[data.parentID]["leftContent"] = undefined
                } else if (this.allConnectors[data.parentID]["rightID"] === droppedConnectorID) {
                    this.allConnectors[data.parentID]["rightID"] = undefined
                    this.allConnectors[data.parentID]["rightType"] = undefined
                    this.allConnectors[data.parentID]["rightContent"] = undefined
                } else {
                    console.error("Something went wrong! The logic of connector to connector is wrong!!")
                }
                this.allConnectors[droppedConnectorID]["parent"] = connectorID
            }

            // Add this new connector's information to where it's dropped.
            this.allConnectors[connectorID].leftType = "connector"
            this.allConnectors[connectorID].leftID = droppedConnectorID
            this.allConnectors[connectorID].leftContent = info[2]

            // Record content
            this.answerContent[droppedConnectorID] = info[2]
        },

        /**
         * Handles having a statement dropped to the left side of a connector.
         *
         * @param info a list in the format of [connectorID, statementID, statementInWords]
         */
        handleAStatementDrop(info) {
            const connectorID = info[0]
            const statementID = info[1]
            const statementContent = info[2]

            const statementDropped = this.allStatements[statementID]
            const statementOldParent = statementDropped["parent"]
            const statementOldSide = statementDropped["side"]

            this.allStatements[statementID]["parent"] = connectorID
            this.allStatements[statementID]["position"] = undefined
            this.allStatements[statementID]["top"] = undefined
            this.allStatements[statementID]["left"] = undefined
            this.allStatements[statementID]["side"] = "left"

            // The statement was dragged from the side.
            if (statementOldParent === undefined) {
                this.$emit('statementUsed', statementID)
            }
            // A statement was dragged from answer area onto connector left side.
            else if (statementOldParent === -1) {
                this.rootStatementIDs.delete(statementID)
            }
            // A statement was dragged from a connector to a connector left side.
            else {
                if (statementOldSide === "left") {
                    this.allConnectors[statementOldParent]["leftID"] = undefined
                    this.allConnectors[statementOldParent]["leftType"] = undefined
                    this.allConnectors[statementOldParent]["leftContent"] = undefined
                } else if (statementOldSide === "right") {
                    this.allConnectors[statementOldParent]["rightID"] = undefined
                    this.allConnectors[statementOldParent]["rightType"] = undefined
                    this.allConnectors[statementOldParent]["rightContent"] = undefined
                } else {
                    console.error()
                }
            }

            this.allConnectors[connectorID]["leftID"] = statementID
            this.allConnectors[connectorID]["leftType"] = 'statement'
            this.allConnectors[connectorID]["leftContent"] = statementContent
        },

        /**
         * Handles having a connector dropped to the right side of a connector, creating
         * a nested connector.
         * Note: this function has duplicate code with handleAConnectorDrop. Consider merging these functions.
         *
         * @param info a list in the format [connectorBeingDroppedOnto, droppedConnectorInformation]
         */
        handleBConnectorDrop(info) {
            const connectorID = info[0]
            const data = info[1]

            if (connectorID === data.connectorID) {
                return
            }

            let droppedConnectorID = data.connectorID

            // A new connector is dropped into here!
            if (droppedConnectorID === undefined) {
                droppedConnectorID = this.connectorCount
                this.connectorCount++
                this.allConnectors[droppedConnectorID] = info[1]
                this.allConnectors[droppedConnectorID]["connectorID"] = droppedConnectorID
                this.allConnectors[droppedConnectorID]["parent"] = connectorID
                this.allConnectors[droppedConnectorID]["leftID"] = undefined
                this.allConnectors[droppedConnectorID]["leftType"] = undefined
                this.allConnectors[droppedConnectorID]["leftContent"] = undefined
                this.allConnectors[droppedConnectorID]["rightID"] = undefined
                this.allConnectors[droppedConnectorID]["rightType"] = undefined
                this.allConnectors[droppedConnectorID]["rightContent"] = undefined
                this.allConnectors[droppedConnectorID]["clickCount"] = 0
            } else if (data.parentID === -1) {
                if (this.rootConnectorID_list.has(droppedConnectorID)) {
                    this.rootConnectorID_list.delete(droppedConnectorID)
                }
                this.allConnectors[droppedConnectorID]["parent"] = connectorID
            } else {
                if (this.allConnectors[data.parentID]["leftID"] === droppedConnectorID) {
                    this.allConnectors[data.parentID]["leftID"] = undefined
                    this.allConnectors[data.parentID]["leftType"] = undefined
                    this.allConnectors[data.parentID]["leftContent"] = undefined
                } else if (this.allConnectors[data.parentID]["rightID"] === droppedConnectorID) {
                    this.allConnectors[data.parentID]["rightID"] = undefined
                    this.allConnectors[data.parentID]["rightType"] = undefined
                    this.allConnectors[data.parentID]["rightContent"] = undefined
                } else {
                    console.error("Something went wrong! The logic of connector to connector is wrong!!")
                }
                this.allConnectors[droppedConnectorID]["parent"] = connectorID
            }


            this.allConnectors[connectorID].rightType = "connector"
            this.allConnectors[connectorID].rightID = droppedConnectorID
            this.allConnectors[connectorID].rightContent = info[2]

            // Record content
            this.answerContent[droppedConnectorID] = info[2]
        },

        /**
         * Handles having a statement dropped to the right side of a connector.
         * Note: some duplicate code with handleAStatementDrop function. Consider
         * extract and merging to the same function.
         *
         * @param info a list in the format of [connectorID, statementID, statementInWords]
         */
        handleBStatementDrop(info) {
            const connectorID = info[0]
            const statementID = info[1]
            const statementContent = info[2]

            const statementDropped = this.allStatements[statementID]
            const statementOldParent = statementDropped["parent"]
            const statementOldSide = statementDropped["side"]

            this.allStatements[statementID]["parent"] = connectorID
            this.allStatements[statementID]["position"] = undefined
            this.allStatements[statementID]["top"] = undefined
            this.allStatements[statementID]["left"] = undefined
            this.allStatements[statementID]["side"] = "right"

            if (statementOldParent === undefined) {
                this.$emit('statementUsed', statementID)
            } else if (statementOldParent === -1) {
                this.rootStatementIDs.delete(statementID)
            } else {
                if (statementOldSide === "left") {
                    this.allConnectors[statementOldParent]["leftID"] = undefined
                    this.allConnectors[statementOldParent]["leftType"] = undefined
                    this.allConnectors[statementOldParent]["leftContent"] = undefined
                } else if (statementOldSide === "right") {
                    this.allConnectors[statementOldParent]["rightID"] = undefined
                    this.allConnectors[statementOldParent]["rightType"] = undefined
                    this.allConnectors[statementOldParent]["rightContent"] = undefined
                } else {
                    console.error()
                }
            }

            this.allConnectors[connectorID]["rightID"] = statementID
            this.allConnectors[connectorID]["rightType"] = 'statement'
            this.allConnectors[connectorID]["rightContent"] = statementContent
        },

        /**
         * Update a change in the connector's content, which may occur when user selects an
         * option in a multi-choice statement.
         *
         * @param info a list in the format of [connectorID, newConnectorContent]
         */
        handleConnectContentChange(info) {
            const currConnectID = info[0]
            this.answerContent[currConnectID] = info[1]

        },

        /**
         * Handles having the link word changed inside a connector.
         *
         * @param info a list in the format of [connectorID, newLinkWordID]
         */
        handleLinkWordChange(info) {
            const connectorID = info[0]
            this.allConnectors[connectorID]['selectedPhrase'] = info[1]
        },

        /**
         * Handles a change in the data in a statement.
         *
         * @param newStatData the new statement data.
         */
        handleStatDataChange(newStatData) {
            const statID = newStatData.id
            this.allStatements[statID] = newStatData
        },

        /**
         * Update a child connector's content.
         *
         * @param info a list in the format of [oldConnectorID, updatedContent, newConnectorID, leftOrRightSide]
         */
        handleUpdateChildConnector(info) {
            const currParent = info[2]
            if (info[3] === "left") {
                this.allConnectors[currParent]["leftContent"] = info[1]
            } else if (info[3] === "right") {
                this.allConnectors[currParent]["rightContent"] = info[1]
            }
        },

        /**
         * Update the child's content.
         *
         * @param info a list in the format of [connectorID, updatedContent, leftOrRightSide]
         */
        handleUpdateChildStat(info) {
            const currConn = info[0]
            if (info[2] === "left") {
                this.allConnectors[currConn]["leftContent"] = info[1]
            } else if (info[2] === "right") {
                this.allConnectors[currConn]["rightContent"] = info[1]
            }
        },

        /**
         * Handles the incrementation of expanded/collapse form button.
         *
         * @param transID the connectorID that the button is clicked for.
         */
        handleUpdateClickCount(transID) {
            this.allConnectors[transID]["clickCount"] += 1
        },

        /**
         * Based on the information passed down from App.vue, restores previously serialised variables.
         *
         * @param parameter the json object passed from App.vue
         */
        loadPreviousAnswer(parameter) {
            this.connectorCount = parseInt(parameter["connectorCount"]);
            this.rootConnectorID_list = new Set(parameter.rootConnectorID_list);
            this.rootStatementIDs = new Set(parameter.rootStatementIDs);
            this.rootConnectorID = parameter["rootConnectorID"]
            this.allConnectors = parameter["allConnectors"];
            this.allStatements = parameter["allStatements"];
            this.left = parseInt(parameter["left"]);
            this.top = parseInt(parameter["top"]);
            this.answerContent = parameter["answerContent"];
        },

        /**
         * Processes having an item dropped onto the answerArea itself.
         *
         * @param e the mouse drag event corresponding to the dropped item.
         */
        onDrop(e) {
            e.preventDefault()
            e.stopImmediatePropagation()

            // Determines dropped coordinate of the item being dragged.
            const areaEl = this.$refs.answer_area;
            if (areaEl && areaEl.offsetTop) {
                this.top = e.clientY - e.currentTarget.offsetTop - areaEl.offsetTop - 50;
            }
            if (areaEl && areaEl.offsetLeft) {
                this.left = e.clientX - e.currentTarget.offsetLeft - areaEl.offsetLeft - 100;
            }

            const type = e.dataTransfer.getData("type")
            const data = JSON.parse(e.dataTransfer.getData("data"))
            const transContent = e.dataTransfer.getData("content")


            // Deal with the dropped type is 'Connector'
            if (type === "connector") {
                // A new connector from the right (parent === undefined) is dropped onto answer area.
                if (data.connectorID === undefined) {
                    this.allConnectors[this.connectorCount] = data

                    this.allConnectors[this.connectorCount]["connectorID"] = this.connectorCount
                    this.allConnectors[this.connectorCount]["parent"] = -1
                    this.allConnectors[this.connectorCount]["leftID"] = undefined
                    this.allConnectors[this.connectorCount]["leftType"] = undefined
                    this.allConnectors[this.connectorCount]["leftContent"] = undefined
                    this.allConnectors[this.connectorCount]["rightID"] = undefined
                    this.allConnectors[this.connectorCount]["rightType"] = undefined
                    this.allConnectors[this.connectorCount]["rightContent"] = undefined
                    this.allConnectors[this.connectorCount]["clickCount"] = 0

                    this.allConnectors[this.connectorCount]["top"] = this.top
                    this.allConnectors[this.connectorCount]["left"] = this.left

                    this.rootConnectorID_list.add(this.connectorCount)
                    this.answerContent[this.connectorCount] = transContent
                    this.connectorCount++
                } else {
                    // A connector is already in answerArea.
                    this.allConnectors[data.connectorID]["parent"] = -1
                    this.allConnectors[data.connectorID]["top"] = this.top
                    this.allConnectors[data.connectorID]["left"] = this.left
                    this.rootConnectorID_list.add(data.connectorID)
                    this.answerContent[data.connectorID] = transContent

                    const oldParentID = data.parentID

                    // If it is being moved out of a connector, remove parent's memory of child.
                    if (this.allConnectors[oldParentID] !== undefined) {
                        if (this.allConnectors[oldParentID]["leftID"] !== undefined &&
                            this.allConnectors[oldParentID]["leftID"] === data.connectorID) {
                            this.allConnectors[oldParentID]["leftID"] = undefined
                            this.allConnectors[oldParentID]["leftType"] = undefined
                            this.allConnectors[oldParentID]["leftContent"] = undefined
                        } else {
                            this.allConnectors[oldParentID]["rightID"] = undefined
                            this.allConnectors[oldParentID]["rightType"] = undefined
                            this.allConnectors[oldParentID]["rightContent"] = undefined
                        }
                    }
                }
            }
            // If the item dragged onto the workspace is a statement...
            else if (type === "statement") {
                const statementID = data.id
                const statementOldParent = this.allStatements[statementID]['parent']

                if (statementOldParent === undefined) {
                    this.allStatements[statementID]['parent'] = -1
                    this.allStatements[statementID]['top'] = "absolute"
                    this.allStatements[statementID]['top'] = this.top
                    this.allStatements[statementID]['left'] = this.left
                    this.rootStatementIDs.add(statementID)
                    this.$emit('statementUsed', statementID)
                } else if (statementOldParent === -1) {
                    this.allStatements[statementID]['top'] = "absolute"
                    this.allStatements[statementID]['top'] = this.top
                    this.allStatements[statementID]['left'] = this.left
                } else {
                    this.allStatements[statementID]['parent'] = -1
                    this.allStatements[statementID]['top'] = "absolute"
                    this.allStatements[statementID]['top'] = this.top
                    this.allStatements[statementID]['left'] = this.left
                    this.rootStatementIDs.add(statementID)

                    // Remove connector's memory of this item.
                    if (this.allConnectors[statementOldParent]["leftID"] === statementID) {
                        this.allConnectors[statementOldParent]["leftID"] = undefined
                        this.allConnectors[statementOldParent]["leftType"] = undefined
                        this.allConnectors[statementOldParent]["leftContent"] = undefined
                    } else if (this.allConnectors[statementOldParent]["rightID"] === statementID) {
                        this.allConnectors[statementOldParent]["rightID"] = undefined
                        this.allConnectors[statementOldParent]["rightType"] = undefined
                        this.allConnectors[statementOldParent]["rightContent"] = undefined
                    } else {
                        console.error("The dropped statement has a wrong parent ID.")
                    }
                }
            }
        },
    },

    mounted() {
        // Only up to 50 statements are allowed at this moment.
        const statementCount = this.statements.length
        if (statementCount > 50) {
            console.log('statementCount error!')
            return
        }
        let i = 0

        // Makes the object where the id is the key to the value.
        while (i < statementCount) {
            const item = this.statements[i]
            this.allStatements[item.id] = item
            i++
        }
    },

    watch: {
        answerContent: {
            handler(newAnswerContentObject) {
                this.emitUpdateContent(newAnswerContentObject)
            },
            deep: true
        },

        // Update allStatements once a new question is loaded, and hence resetting the allStatement values.
        statements(newStatements) {
            this.allStatements = {}
            for (let item in newStatements) {
                item = newStatements[item]
                this.allStatements[item.id] = item
                this.allStatements[item.id]["parent"] = undefined
                this.allStatements[item.id]["top"] = undefined
                this.allStatements[item.id]["left"] = undefined
                this.allStatements[item.id]["position"] = undefined
                this.allStatements[item.id]["side"] = undefined
            }
        },
}
}
</script>

<style>
.answer_area > .rectangle{
    position: absolute;
}
</style>