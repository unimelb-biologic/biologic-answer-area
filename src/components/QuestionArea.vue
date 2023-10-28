<template>
    <div class="questionArea" v-html="prompttext"></div>
</template>

<script>

export default {
    name:"QuestionArea",

    props: {
        prompttext: String
    },

}
</script>


<style scoped>
.questionArea{
    font-size: 14px;
    text-align: left;
    padding: 0;
    margin-left: 20px;
}
</style>