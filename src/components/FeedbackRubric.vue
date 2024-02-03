<template>

    <div>
        <div v-if="isVisible" class="tooltips active feedback-info">
            <span class="" v-if="gradingInfo">
                {{ gradingInfo.feedback ? gradingInfo.feedback : "No Feedback" }}
            </span>

            <span v-if="!gradingInfo">
              No feedback provided
            </span>
        </div>
    </div>

</template>

<script>

export default {
  name: "FeedbackRubric",
  data() {
    return {
        gradingInfo: null,
    }
  },
  props: {
    isVisible: {
        type: Boolean,
        default: false
    }, 
    exnetID: {
      type: Number
    }
  },
  inject: ['feedbackRubricMap'],
  methods: {
  },

  mounted() {

  },

  watch: {
    isVisible() {
      if (this.isVisible && this.feedbackRubricMap && this.feedbackRubricMap[this.exnetID] != undefined) {
        this.gradingInfo = this.feedbackRubricMap[this.exnetID] 
      }
    }
  }

};
</script>

<style scoped>

.feedback-info {
  position: absolute;
  background-color: lightskyblue;
  padding: 16px;
  color: black;
  bottom: 100%;
  height: fit-content;
  margin-bottom: 16px;
}

</style>