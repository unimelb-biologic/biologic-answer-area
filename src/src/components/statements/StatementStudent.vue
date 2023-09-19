<template>
    <div class = "StatementStudent"
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

        <span v-if ="data.visible" class="StatementStudent_tooltip">
            You can use this statement to answer the question.</span>
    </div>
    
</template>

<script>
export default {
    name:"StatementStudent",
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
    },
}
</script>

<style scoped>
@import '@/assets/tooltips.css';
    .StatementStudent{
        background-color: Khaki;
        border: 1px solid black;
        font-size: 14px;
        width: fit-content;
        height: fit-content;
        text-align: left;
        padding: 10px;
        margin: 10px;
        position: relative;
    }
</style>
