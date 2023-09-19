<template>
    <div class="statement-box" :draggable="true" @dragstart="startDrag($event)">

        <StatementRoot v-bind="$attrs" v-if="this.data.statementType === 0" :data="this.data"
                       @user-choice-changed="handleUserChoiceChanged"/>
        <StatementTruth v-bind="$attrs" v-if="this.data.statementType === 1" :data="this.data" />
        <StatementStudent v-bind="$attrs" v-if="this.data.statementType === 2" :data="this.data"
                          @user-choice-changed="handleUserChoiceChanged"/>
        <StatementFreeText v-bind="$attrs" v-if="this.data.statementType === 3" :data="this.data"
                           @user-input-changed="handleUserInputChanged"/>
    </div>
</template>

<script>
import StatementRoot from "@/components/statements/StatementRoot.vue";
import StatementTruth from "@/components/statements/StatementTruth.vue";
import StatementStudent from "@/components/statements/StatementStudent.vue";
import StatementFreeText from "@/components/statements/StatementFreeText.vue";

export default {
    name: "RenderStatement",
    components: {StatementFreeText, StatementStudent, StatementTruth, StatementRoot},
    emits: ['update-statement-content'],
    inheritAttrs: false,
    props: {
        data: Object,
    },
    data() {
        return {
            contentText: "",
            answeredStat: null,
        }
    },
    methods: {
        startDrag(e) {
            e.dataTransfer.dropEffect = "move"
            e.dataTransfer.effectAllowed = "move"
            e.dataTransfer.setData("data", JSON.stringify(this.data))
            e.dataTransfer.setData("type", "statement")
            // Pass the statement content through drag event
            e.dataTransfer.setData("content", this.contentText)
            //let the statement know it start to drag
        },

        handleUserChoiceChanged(info) {
            this.contentText = info[0];
            this.answeredStat = info[1]
            this.$emit('update-statement-content', [this.contentText, this.answeredStat])
        },

        handleUserInputChanged(info) {
            this.contentText = info[0]
            this.answeredStat = info[1]
            this.$emit('update-statement-content', [this.contentText, this.answeredStat])
        },

        initContent() {
            // Temporary solution to image URI in server reply.
            // Likely will no longer be needed once images become public URLs.
            if (this.data.statementType === 0 || this.data.statementType === 1) {
                this.contentText = this.data.content.originalFacts
                    .filter(fact => !fact.includes('.jpg')).join(' ')
            }
            this.answeredStat = this.data
        },
    },

    watch: {
        data() {
            this.initContent();
        }
    },

    created() {
        this.initContent();
    }
}
</script>