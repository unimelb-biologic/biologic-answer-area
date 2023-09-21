<template>
  <div v-for="item in answerText" :value="item" :key="item">
    {{ item }}
  </div>
</template>

<script>
export default {
  name: "AnswerTextGeneratorArea",
  props: {
    answerText: Array,
  },
};
</script>

<style></style>
