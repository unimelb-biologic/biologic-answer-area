<template>

    <div>
        <div v-if="isVisible" class="tooltips active feedback-info">
            <span class="" v-if="gradingInfo">
                {{ gradingInfo.feedback }}
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
    if (this.feedbackRubricMap[this.exnetID] != undefined) {
        this.gradingInfo = this.feedbackRubricMap[this.exnetID] 
    }

    this.gradingInfo = {
      "rubricScore": 0,
      "maxRubricScore": "1",
      "feedback": "No Sorry try again. Remember the GOLDEN RULE!",
      "academicNote": null,
      "rubricStatus": "GC",
      "rubricKey": "-lower to higher-",
      "exnetID": "997293734303811",
      "statementIdentifier": "297731945677955",
      "alias": "water-flows-from-choose-direction-water-potential"
    }
  },

  watch: {

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