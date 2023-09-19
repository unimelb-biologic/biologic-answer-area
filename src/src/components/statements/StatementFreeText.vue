<template>
    <!-- record the statement position-->
    <div class="StatementFreeText"
         :style="{position: this.data.position, left: this.data.left + 'px', top: this.data.top + 'px'}">
        <div class = "text">Free text entry...</div>
        <textarea v-model="userInputText" id="input" class="textarea"></textarea>
        <!-- Display tooltips for this statement-->
        <span v-if ="data.visible" class="StatementFreeText_tooltip">
            Enter any text here if you believe none of the options is correct.
        </span>
    </div>

</template>

<script>
export default {
    name: "StatementFreeText",
    emits: ['user-input-changed'],
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
            userInputText: "",

            answeredData: null,
        }
    },

    methods: {
        initContent() {
            this.statementType = this.data.statementType
            this.id = this.data.id
            this.originalFacts = this.data.content.originalFacts
            this.previousUserInput = this.data.content.userInput
            
            this.userInputText = this.previousUserInput
            this.answeredData = this.data
        }
    },

    watch: {
        // Pass the new input to other component
        userInputText(newUserInput) {
            this.answeredData.content.userInput = newUserInput
            this.$emit('user-input-changed', [newUserInput, this.answeredData])
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
    .StatementFreeText{
        background-color: White;
        border: 1px solid black;
        font-size: 14px;
        width: fit-content;
        height: fit-content;
        text-align: center;
        margin: 10px;
        position: relative;
        
    } 
    .text{
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .textarea {
        height: 6vw;
    }



</style>