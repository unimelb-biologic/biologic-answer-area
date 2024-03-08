<template>

    <div>

      <div v-if="isVisible" class="tooltips active feedback-info" :class="getGradeColor">
          <img v-if = "gradingInfo" class="feedback-icon" :src="getFeedbackIcon"/>

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
    },
    isConnector: {
      type: Boolean,
      default: false
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
    },

    getFeedbackIcon() {

      if (!this.gradingInfo)
        return '';

      switch (this.gradingInfo.rubricStatus) {
        case 'GC':
          return 'src/assets/correct_icon.png'
        case 'GIC':
          return 'src/assets/wrong_icon.png'
        case 'GPC':
          return ''  
        default:
          break
      }

      return '';
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
  padding: 24px;
  color: black;
  bottom: 100%;
  height: fit-content;
  margin-bottom: 16px;
}

.feedback-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  height: 24px;
}

.correct {
  background-color: lightgreen;
}

.wrong {
  background-color: lightcoral;
}

.partial {
  background-color: lightyellow;
}

.default {
  background-color: lightskyblue;
}

</style>