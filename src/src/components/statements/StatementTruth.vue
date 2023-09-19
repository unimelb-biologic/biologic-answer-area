<template>
    <div class = "StatementTruth"
         :style="{position: this.data.position, left: this.data.left + 'px', top: this.data.top + 'px'}">
        <div v-for="(segment, index) in this.data.content.originalFacts" :key="index">
            <div v-if="typeof segment === 'string'">
                {{ segment }}
            </div>
        </div>

        <span v-if ="data.visible" class="StatementTruth_tooltip">
            The content in this statement is a fact. It is always correct.</span>
    </div>
    
</template>

<script>

export default {
    name: "StatementTruth",
    props: {
        data: Object,
        position: String,
    },

    data() {
        return {
            userInput: this.data.content.userInput
        }
    },
}
</script>

<style scoped>
@import '@/assets/tooltips.css';
    .StatementTruth{
        background-color: LawnGreen;
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
