<template>

    <div>
        <div v-if="isVisible" class="tooltips active feedback-info" :class="getGradeColor">
            <span v-if="gradingInfo">
                {{ gradingInfo.feedback ? gradingInfo.feedback + " - " + getScore : "No Feedback" }}
            </span>

            <span v-if="!gradingInfo">
              No feedback provided
            </span>
        </div>
    </div>

</template>

<script>
import { RUBRIC_STATUS } from '../config/constants';


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

  computed: {
    getGradeColor() {

      if (!this.gradingInfo)
        return 'default';

      switch (this.gradingInfo.rubricStatus) {
        case 'GC':
          return 'correct'
        case 'GIC':
          return 'wrong'
        case 'GPC':
          return 'partial-correct'  
        default:
          break
      }

      return 'default';
    },

    getScore() {
      if (!this.gradingInfo)
        return '0/0';

      return this.gradingInfo.rubricScore + "/" + this.gradingInfo.maxRubricScore;
    }
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
  /* background-color: lightskyblue; */
  padding: 16px;
  color: black;
  bottom: 100%;
  height: fit-content;
  margin-bottom: 16px;
}

.correct {
  background-color: greenyellow;
}

.wrong {
  background-color: red;
}

.partial {
  background-color: lightgreen;
}

.default {
  background-color: lightskyblue;
}

</style>