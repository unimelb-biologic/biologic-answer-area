<template>
  <span class="answer-area-title">{{heading}}</span>
  <div class="readout-text">
  <div v-for="item in answerText" :value="item" :key="item">
    {{ item }}
  </div>
</div>
</template>

<script>

import "@/assets/biologic.css";

export default {
  name: "AnswerTextGeneratorArea",
  props: {
    answerText: Array,
    heading: String,
  },
};
</script>

<style>
/* Title Styling */
.answer-area-title {
  font-size: 18px;
  color: var(--biologic-blue-color);
}
.readout-text {
  font-size: medium;/*var(--biologic-statement-font-size);*/
  background-color: var(--biologic-grey-color);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4); /* Drop shadow */
  overflow-y: scroll;
  flex: 1 0 auto;
  width: 100%;
}
</style>
