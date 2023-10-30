<template>
  <!-- record the statement position-->
  <div class="StatementTruth">
    <!-- <div v-for="(fact, index) in this.data.content.originalFacts" :key="index">
                <div v-if="isImage(fact)">
                    {{ this.data.content.originalFacts[0] }}
                    <img :src="this.data.content.originalFacts[1]"  :alt="this.data.content.originalFacts[1]">
                </div>
             <div v-else="typeof fact === 'string'">
                {{ fact }}
            </div> -->
    <!-- </div>  -->
    <div
      v-for="(segment, index) in this.data.content.originalFacts"
      :key="index"
    >
      <!-- render the text from selection -->
      <div v-if="typeof segment === 'string'">
        {{ segment }}
      </div>

      <!-- render the options -->
      <div v-else>
        <select v-model="userSelected[index]">
          <option v-for="item in segment" :value="item" :key="item">
            {{ item }}
          </option>
        </select>
      </div>
    </div>
    <!-- Display tooltips for this statement-->
    <span v-if="data.visible" class="StatementTruth_tooltip">
      The content in this statement is a fact. It is always correct.
    </span>
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
      //TODO: confirm that the first entry is text, 2nd entry is image.
      userInput: this.data.content.userInput,
    };
  },
  methods: {
    // Verify the image format to display
    isImage(fact) {
      return (
        fact.endsWith(".jpg") || fact.endsWith(".png") || fact.endsWith(".jpeg")
      );
    },
  },
};
</script>

<style scoped>
@import "@/assets/tooltips.css";
.StatementTruth {
  background-color: rgb(233, 255, 212);
  font-size: 14px;
  width: fit-content;
  height: fit-content;
  text-align: left;
  padding: 2px;
  margin: 2px;
  position: relative;
  display: inline-block;
  white-space: pre-wrap;
  max-width: 100px;
}
</style>
