<template>
    <div v-for="item in answerText">
        {{ item }}
    </div>
</template>

<script>
export default {
    name: "AnswerTextGeneratorArea",
    props: {
        answerText: Array,
    }
}
</script>

<style>

</style>