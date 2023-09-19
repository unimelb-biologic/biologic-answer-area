<template>
    <!-- record the statement position-->
    <div class = "StatementRoot"
         :style="{position: this.data.position, left: this.data.left + 'px', top: this.data.top + 'px'}">
        <div v-for="(segment, index) in this.data.content.originalFacts" :key="index">
            <div v-if="typeof segment === 'string'">
                {{ segment }}
            </div>

            <div v-else>
                <select v-model="userSelected[index]">
                    <option v-for="item in segment" :value="item">
                        {{ item }}
                    </option>
                </select>
            </div>
        </div>
        <!-- Display tooltips for this statement-->
        <span v-if ="data.visible" class="StatementRoot_tooltip">
            This statement must be used.<br><br>It is a starting point for the rest of the problem.</span>
    </div>
    
</template>

<script>
export default {
    name:"StatementRoot",
    emits: ['user-choice-changed'],
    props: {  
        data: Object,
        position: String
    },

    data() {
        return {
            statementType: this.data.statementType,
            id: this.data.id,
            originalFacts: this.data.content.originalFacts,
            previousUserInput: this.data.content.userInput,
            userSelected: [],
            answeredData: null,
        }
    },

    methods: {
        handleSelectChange() {
            let studentContentText = '';
            // Concat all the texts
            for (let i = 0; i < this.originalFacts.length; i++) {
                if (typeof(this.originalFacts[i]) === 'string') {
                    studentContentText += this.originalFacts[i]
                    studentContentText += ' '
                }
                else {
                    studentContentText += this.userSelected[i]
                    studentContentText += ' '
                }

            }

            let newUserInput = []
            for (let i = 0; i < this.userSelected.length; i++) {
                if (this.userSelected[i] !== "") {
                    newUserInput.push(this.userSelected[i])
                }
            }
            this.answeredData.content.userInput = newUserInput

            this.$emit('user-choice-changed', [studentContentText, this.answeredData])
        },

        initContent() {
            this.statementType = this.data.statementType
            this.id = this.data.id
            this.originalFacts = this.data.content.originalFacts
            this.previousUserInput = this.data.content.userInput

            let userInputID = 0
            this.userSelected = []
            for (let i = 0; i < this.originalFacts.length; i++) {
                if (typeof(this.originalFacts[i]) === 'string') {
                    this.userSelected.push("")
                }
                else {
                    this.userSelected.push(this.previousUserInput[userInputID])
                    userInputID += 1
                }
            }
            this.answeredData = this.data
        },
    },

    watch: {
        userSelected: {
            handler: 'handleSelectChange',
            deep: true,
        },

        data() {
            this.initContent()
        }
    },

    created() {
        this.initContent()
    }
}
</script>

<style scoped>
@import '@/assets/tooltips.css';
    .StatementRoot{
        background-color: LightSkyBlue;
        border: 1px solid black;
        padding: 10px;
        margin: 10px;
        font-size: 14px;
        width: fit-content;
        height: fit-content;
        text-align: center;
        position: relative;
    }
</style>
