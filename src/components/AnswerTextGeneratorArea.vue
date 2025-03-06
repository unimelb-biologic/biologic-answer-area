<template>
  <span class="answer-area-title">READOUT</span>
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
  },
};
</script>

<style>

.readout-text {
  font-size: var(--biologic-statement-font-size);
  background-color: var(--biologic-grey-color);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4); /* Drop shadow */
  overflow-y: scroll;
  flex: 1 0 auto;
  width: 100%;
}
</style>
