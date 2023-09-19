<template>
    <div class="rectangle" :style="{ transform: `translate(${left}px, ${top}px)` }">

        <!-- Delete and collapse buttons. Only shown when connector is used. -->
        <div v-if="this.parent!==undefined" class="container">
            <button  @click="displayFormChanged" style="font-size:10px; margin-bottom: 10px;">T</button>
            <img class="delete-button"
                 src="../assets/recycle_bin.png"
                 alt="Delete"
                 @click="deleteConnector({ id: connectorID })">
        </div>

        <!-- Collapsed form of this connector -->
        <div class="onlyText" v-if="clickCount % 2===1"
                            draggable="true"
                            @dragstart="startDragConnector($event)" >
            {{ this.contentTextAll }}
        </div>

        <!-- Expanded form of this connector -->
        <div class="rectangle" v-if="clickCount % 2===0 || clickCount === undefined">
            <!-- Left link word -->
            <div style="font-weight: bold"
                draggable="true"
                v-if="connectorContent[selectedPhrase][0]"
                @dragstart="startDragConnector($event)">

                <ConnectorContextMenu
                    :choice="selectedPhrase"
                    :options="connectorContent"
                    :connector-i-d="connectorID"
                    :parent-i-d="parent"
                    :index="0"
                    @change-link-word="handleLinkWordChange" />
            </div>

            <!-- left empty space -->
            <!-- in the order of empty, statement, connector -->
            <div class="tooltip">
                <div class="connector-sections"
                    v-if="this.leftType === undefined"
                    @drop="onDrop($event, 'a')"
                    @dragover.prevent
                    @dragenter.prevent

                    @dropped-aconn="handleAConnectorDrop"
                    @dropped-bconn="handleBConnectorDrop"
                    @dropped-astat="handleAStatementDrop"
                    @dropped-bstat="handleBStatementDrop">
                </div>

                <div class="connector-sections"
                    v-if="this.leftType === 'statement'">
                    <RenderStatement
                        @delete-statement="deleteStatement({ id: this.leftID, position: 'left'})"
                        :data="this.allStatements[this.leftID]" 
                        @update-statement-content="handleUpdateStatContentA" 
                        @mousedown="onMousedown('leftType')" />
                </div>

                <div class="connector-sections"
                 v-if="this.leftType === 'connector'">
                <Connector :connector-i-d = this.leftID
                           :connector-content-i-d="allConnectors[this.leftID].connectorContentID"
                           :connector-content="allConnectors[this.leftID].connectorContent"
                           :all-statements="this.allStatements"
                           :all-connectors="this.allConnectors"
                           :rootConnectorID="rootConnectorID"
                           :parent="allConnectors[this.leftID].parent"
                           :left-i-d="allConnectors[this.leftID].leftID"
                           :left-type="allConnectors[this.leftID].leftType"
                           :left-content="allConnectors[this.leftID].leftContent"
                           :right-i-d="allConnectors[this.leftID].rightID"
                           :right-type="allConnectors[this.leftID].rightType"
                           :right-content="allConnectors[this.leftID].rightContent"
                           :click-count="allConnectors[this.leftID].clickCount"
                           :selected-phrase="allConnectors[this.leftID].selectedPhrase"

                           @delete-connector="deleteChildConnector({ id: this.leftID, parentId: this.connectorID, position: 'left'})"
                           @delete-child-connector="deleteChildConnector"
                           @delete-statement="deleteStatement"
                           @dropped-aconn="handleAConnectorDrop"
                           @dropped-bconn="handleBConnectorDrop"
                           @dropped-astat="handleAStatementDrop"
                           @dropped-bstat="handleBStatementDrop"
                           @link-word-changed="handleChildLinkWordChange"
                           @update-connector-content="handleUpdateConnectorContentA" 
                           @update-click-count="handleUpdateChildClickCount" 
                           @update-child-connector-content="handleUpdateChildConnector"
                           @update-child-stat="handleUpdateChildStat" />
                </div>
            </div>

            <!-- middle link word -->
            <div style="font-weight: bold"
                draggable="true"
                v-if="connectorContent[selectedPhrase][1]"
                @dragstart="startDragConnector($event)">

                <ConnectorContextMenu
                    :choice="selectedPhrase"
                    :options="connectorContent"
                    :connector-i-d="connectorID"
                    :parent-i-d="parent"
                    :index="1"
                    @change-link-word="handleLinkWordChange" />
            </div>


            <!-- right empty space -->
            <!-- in the order of empty, statement, connector -->
            <div class="tooltip">
                <div class="connector-sections"
                    v-if="this.rightType === undefined"
                    @drop="onDrop($event, 'b')"
                    @dragover.prevent
                    @dragenter.prevent

                    @dropped-aconn="handleAConnectorDrop"
                    @dropped-bconn="handleBConnectorDrop"
                    @dropped-astat="handleAStatementDrop"
                    @dropped-bstat="handleBStatementDrop">
                </div>

                <div class="connector-sections" v-if="this.rightType === 'statement'">
                <RenderStatement
                    @delete-statement="deleteStatement({ id: this.rightID, position: 'right'})"
                    :data="this.allStatements[this.rightID]" 
                    @update-statement-content="handleUpdateStatContentB"
                    @mousedown="onMousedown('rightType')" />
            </div>


                <div class="connector-sections"
                    v-if="this.rightType === 'connector'">
                    <Connector :connector-i-d = this.rightID
                           :connector-content-i-d="allConnectors[this.rightID].connectorContentID"
                           :connector-content="allConnectors[this.rightID].connectorContent"
                           :all-statements="this.allStatements"
                           :all-connectors="this.allConnectors"
                           :parent="allConnectors[this.rightID].parent"
                           :left-i-d="allConnectors[this.rightID].leftID"
                           :left-type="allConnectors[this.rightID].leftType"
                           :left-content="allConnectors[this.rightID].leftContent"
                           :right-i-d="allConnectors[this.rightID].rightID"
                           :right-type="allConnectors[this.rightID].rightType"
                           :right-content="allConnectors[this.rightID].rightContent"
                           :click-count="allConnectors[this.rightID].clickCount"
                           :selected-phrase="allConnectors[this.rightID].selectedPhrase"
                           :rootConnectorID="rootConnectorID"

                           @delete-connector="deleteChildConnector({ id: this.rightID, parentId: this.connectorID, position: 'right'})"
                           @delete-child-connector="deleteChildConnector"
                           @delete-statement="deleteStatement"
                           @dropped-aconn="handleAConnectorDrop"
                           @dropped-bconn="handleBConnectorDrop"
                           @dropped-astat="handleAStatementDrop"
                           @dropped-bstat="handleBStatementDrop"
                           @link-word-changed="handleChildLinkWordChange"
                           @update-connector-content="handleUpdateConnectorContentB"
                           @update-click-count="handleUpdateChildClickCount"
                           @update-child-connector-content="handleUpdateChildConnector"
                           @update-child-stat="handleUpdateChildStat" />
                </div>
            </div>

            <!-- right link word -->
            <div style="font-weight: bold"
                draggable="true"
                v-if="connectorContent[selectedPhrase][2]"
                @dragstart="startDragConnector($event)">

                <ConnectorContextMenu
                    :choice="selectedPhrase"
                    :options="connectorContent"
                    :connector-i-d="connectorID"
                    :parent-i-d="parent"
                    :index="2"
                    @change-link-word="handleLinkWordChange" />

            </div>
        </div>
    </div>
</template>

<script>
import RenderStatement from "@/components/RenderStatement.vue";
import ConnectorContextMenu from "@/components/ConnectorContextMenu.vue";

export default {
    name: "Connector",
    components: {ConnectorContextMenu, RenderStatement},
    emits: ['droppedAstat', 'droppedBstat', 'delete-connector', 'delete-child-connector', 'delete-statement',
        'droppedAconn', 'droppedBconn',
        'update-connector-content', 'linkWordChanged','update-stat-data', 'delDroppedItem',
        'update-child-connector-content', 'update-child-stat', 'update-click-count'],
    props: {
        connectorContentID: Number,
        connectorContent: Object,
        selectedPhrase: Number,

        rootConnectorID: Number,
        connectorID: Number,
        parent: Number,
        leftID: Number,
        leftType: String,
        leftContent: String,
        rightID: Number,
        rightType: String,
        rightContent: String,
        top: Number,
        left: Number,
        connectorRelationships: Object,
        allConnectors: Object,
        allStatements: Object,
        clickCount: Number
    },
    data() {
        return {
            currConnectorContent: {},
            acontent: null,
            aindex: -1,
            bcontent: null,
            bindex: -1,
            contentTextAll: null,  // Record the contents in children and in itself
        }
    },
    methods: {
        // Get the statement property inside the connector
        deleteChildConnector({id, parentId, position = ''}) {
            // Emit an event to the parent component indicating that this connector should be deleted
            this.$emit('delete-child-connector', {id, parentId, position});
        },

        deleteConnector({id}) {
            // Emit an event to the parent component indicating that this connector should be deleted
            this.$emit('delete-connector', {id});
        },

        deleteStatement({id, parentId = this.connectorID, position = ''}) {
            // Emit an event to the parent component indicating that this connector should be deleted
            this.$emit('delete-statement', {id, parentId, position});
        },

        /**
         * Collapses/Reopen a connector.
         */
        displayFormChanged() {
            this.$emit('update-click-count', this.connectorID)

            if (this.clickCount % 2 === 0) {
                this.acontent = (this.allConnectors[this.connectorID].leftContent === undefined ?
                    "[A]" : this.allConnectors[this.connectorID].leftContent)
                this.bcontent = (this.allConnectors[this.connectorID].rightContent === undefined ?
                    "[B]" : this.allConnectors[this.connectorID].rightContent)
                this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                    + this.acontent
                    + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                    + this.bcontent
                    + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
            }
        },

        /**
         * Chaining the event emitted from a child connector.
         *
         * @param info the child connector's emitted information.
         */
        handleAConnectorDrop(info) {
            this.$emit('droppedAconn', info)
        },

        /**
         * Chaining the event emitted from a child connector.
         *
         * @param info the child connector's emitted information.
         */
        handleAStatementDrop(info) {
            this.$emit('droppedAstat', info)
        },

        /**
         * Chaining the event emitted from a child connector.
         *
         * @param info the child connector's emitted information.
         */
        handleBConnectorDrop(info) {
            this.$emit('droppedBconn', info)
        },

        /**
         * Chaining the event emitted from a child connector.
         *
         * @param info the child connector's emitted information.
         */
        handleBStatementDrop(info) {
            this.$emit('droppedBstat', info)
        },

        /**
         * Pass a child's link word change up to the parent (all the way up to answerArea).
         *
         * @param info the information regarding which connector changed to which form.
         */
        handleChildLinkWordChange(info) {
            this.$emit('linkWordChanged', info)
        },

        /**
         * When the form of the connector is changed (e.g. because -> due to), update worded output.
         *
         * @param info the new choice of the connector.
         */
        handleLinkWordChange(info) {
            const newChoice = info[1]
            this.currConnectorContent = JSON.parse(JSON.stringify(this.connectorContent[newChoice]));

            this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                + (this.acontent === null ? "" : this.acontent)
                + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                + (this.bcontent === null ? "" : this.bcontent)
                + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])

            this.$emit('linkWordChanged', info)
        },

        handleStatDataChange(info) {
            this.$emit('update-stat-data', info)
        },

        handleUpdateChildClickCount(info) {
            this.$emit('update-click-count', info)
        },

        handleUpdateChildConnector(info) {
            this.$emit('update-child-connector-content', info)
        },

        handleUpdateChildStat(info) {
            this.$emit('update-child-stat', info)
        },

        handleUpdateConnectorContentA(info) {
            const currConnectID = info[0]
            this.acontent = info[1]

            this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                + this.acontent
                + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                + (this.bcontent === null ? "" : this.bcontent)
                + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
            this.$emit('update-child-connector-content', [currConnectID, this.acontent, this.connectorID, "left"])
        },

        handleUpdateConnectorContentB(info) {
            const currConnectID = info[0]
            this.bcontent = info[1]
            this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                + (this.acontent === null ? "" : this.acontent)
                + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                + this.bcontent
                + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
            this.$emit('update-child-connector-content', [currConnectID, this.bcontent, this.connectorID, "right"])

        },

        /**
         * Update the content of the connector, if a user has chosen a specific choice for a statement
         * within a connector's 'a' side.
         *
         * @param info information describing the new content that is on the 'a' side.
         */
        handleUpdateStatContentA(info) {
            this.acontent = info[0]
            this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                + this.acontent
                + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                + (this.bcontent === null ? "" : this.bcontent)
                + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])

            const newStatData = info[1]
            this.$emit('update-stat-data', newStatData)
            this.$emit('update-child-stat', [this.connectorID, this.acontent, "left"])
        },

        /**
         * Update the content of the connector, if a user has chosen a specific choice for a statement
         * within a connector's 'b' side.
         *
         * @param info information describing the new content that is on the 'b' side.
         */
        handleUpdateStatContentB(info) {
            this.bcontent = info[0]
            this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                + (this.acontent === null ? "" : this.acontent)
                + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                + this.bcontent
                + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])

            const newStatData = info[1]
            this.$emit('update-stat-data', newStatData)
            this.$emit('update-child-stat', [this.connectorID, this.bcontent, "right"])
        },

        initContent() {
            this.currConnectorContent = JSON.parse(JSON.stringify(this.connectorContent[this.selectedPhrase]));
            if (this.allConnectors !== undefined) {
                this.acontent = (this.allConnectors[this.connectorID].leftContent === undefined ?
                    "[A]" : this.allConnectors[this.connectorID].leftContent)
                this.bcontent = (this.allConnectors[this.connectorID].rightContent === undefined ?
                    "[B]" : this.allConnectors[this.connectorID].rightContent)
                this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                    + this.acontent
                    + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                    + this.bcontent
                    + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
            }
        },

        /**
         * Handles having an element dropped onto the connector. This element could be a statement or
         * another connector, and can be dropped on the left (A side) or right (B side). Emits the corresponding
         * information through an event to be learned by AnswerArea.
         *
         * @param e the drag and drop event containing information about the object being dropped.
         * @param side 'a' or 'b' indicating which side the item dropped on.
         */
        onDrop(e, side) {
            e.stopImmediatePropagation()

            const type = e.dataTransfer.getData("type")
            const data = JSON.parse(e.dataTransfer.getData("data"))
            const transContent = e.dataTransfer.getData("content")

            if (side === 'a' && type === 'statement') {
                const statementID = data.id
                this.acontent = transContent
                this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                    + this.acontent
                    + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                    + (this.bcontent === null ? "" : this.bcontent)
                    + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
                this.$emit('droppedAstat', [this.connectorID, statementID, transContent])
            } else if (side === 'b' && type === 'statement') {
                const statementID = data.id
                this.bcontent = transContent
                this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                    + (this.acontent === null ? "" : this.acontent)
                    + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                    + this.bcontent
                    + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
                this.$emit('droppedBstat', [this.connectorID, statementID, transContent])
            } else if (side === 'a' && type === 'connector') {
                this.acontent = transContent
                this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                    + this.acontent
                    + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                    + (this.bcontent === null ? "" : this.bcontent)
                    + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
                this.$emit('droppedAconn', [this.connectorID, data, transContent])
            } else if (side === 'b' && type === 'connector') {
                this.bcontent = transContent
                this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                    + (this.acontent === null ? "" : this.acontent)
                    + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                    + this.bcontent
                    + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
                this.$emit('droppedBconn', [this.connectorID, data, transContent])
            }
        },

        onMousedown(type) {
            let item = null;
            if (type === 'rightType') {
                item = this.allStatements[this.rightID]
            } else if (type === 'leftType') {
                item = this.allStatements[this.leftID]
            }
            let parent = this.$parent;
            while (parent.$options.name !== 'AnswerArea') {
                parent = parent.$parent;
            }
        },
        /**
         * Handles having a connector being dragged, including storing its information within the drag event.
         *
         * @param e the drag event to store information in.
         */
        startDragConnector(e) {
            e.stopImmediatePropagation()
            e.dataTransfer.dropEffect = "move"
            e.dataTransfer.effectAllowed = "move"

            e.dataTransfer.setData("data", JSON.stringify(
                {
                    "connectorContentID": this.connectorContentID,
                    "connectorContent": this.connectorContent,
                    "selectedPhrase": this.selectedPhrase,
                    "connectorID": this.connectorID,
                    "parentID": this.parent
                }))
            e.dataTransfer.setData("type", "connector")
            e.dataTransfer.setData("content", this.contentTextAll)

            const currentX = e.clientX;
            const currentY = e.clientY;
            const currentConnectorX = e.target.offsetLeft;
            const currentConnectorY = e.target.offsetTop;
            const dragListener = (e) => {
                const newConnectorX = currentConnectorX + e.clientX - currentX;
                const newConnectorY = currentConnectorY + e.clientY - currentY;
                e.target.style.left = newConnectorX + 'px';
                e.target.style.top = newConnectorY + 'px';
            };

            document.addEventListener('drag', dragListener);
            const dragEndListener = () => {
                document.removeEventListener('drag', dragListener);
            };
            e.target.addEventListener('dragend', dragEndListener);
        },
    },
    watch: {
        // Pass new content texts once there are changes
        contentTextAll(newConnectorContent) {
            this.$emit('update-connector-content', [this.connectorID, newConnectorContent]);
        },

        connectorID() {
            this.initContent()
        },

        leftContent() {
            this.acontent = (this.allConnectors[this.connectorID].leftContent === undefined ?
                "[A]" : this.allConnectors[this.connectorID].leftContent)
            this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                + this.acontent
                + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                + this.bcontent
                + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
        },

        rightContent() {
            this.bcontent = (this.allConnectors[this.connectorID].rightContent === undefined ?
                "[B]" : this.allConnectors[this.connectorID].rightContent)
            this.contentTextAll = (this.currConnectorContent[0] === null ? "" : this.currConnectorContent[0])
                + (this.acontent === null ? "" : this.acontent)
                + (this.currConnectorContent[1] === null ? "" : this.currConnectorContent[1])
                + this.bcontent
                + (this.currConnectorContent[2] === null ? "" : this.currConnectorContent[2])
        }
    },

    created() {
        if (this.allConnectors === undefined) {
            this.contentTextAll = "[A]" + this.connectorContent[this.selectedPhrase].join("") + "[B]"
        }
        this.initContent()
    },

}
</script>

<style scoped>
/* CSS for each of the connector */
.rectangle {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    flex-basis: auto;
    /* TODO: These will need to be modified to have dynamic sizes */
    width: fit-content;
    min-height: 80px;
    align-items: center;
    border: 1px solid black;
}

.onlyText {
    background-color: rgb(214, 233, 244);
    max-width: 250px;
    overflow-wrap: break-word;
}

.connector-sections {
    display: flex;
    padding: 10px;
    border: 2px black;
}

/* Tooltip container */
.tooltip {
    position: relative;
    display: inline-block;
    border: 2px solid black;
}

/* Tooltip text */
/* Not sure why, but removing tooltiptext breaks the connectors*/
.tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;

    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1;
}

.tooltiptext {
    top: 105%
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
    visibility: visible;
}

.delete-button {
    width: 20px;
    height: 20px;
    cursor: pointer;
}
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
  }

</style>