<template>
  <div>
    <div
      v-if="isVisible && resolvedGradingInfo"
      class="feedback-info"
      :class="getGradeColor"
    >
      <div class="feedback-header">
        <v-icon class="feedback-status-icon" size="26">
          {{ getFeedbackIcon }}
        </v-icon>
        <div class="feedback-score">
          {{ getScore }}
        </div>
      </div>
      <div class="feedback-body">
        <p class="feedback-message">
          {{
            resolvedGradingInfo.feedback
              ? resolvedGradingInfo.feedback
              : 'No feedback'
          }}
        </p>
        <p v-if="resolvedGradingInfo.message" class="feedback-note">
          {{ resolvedGradingInfo.message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeedbackRubric',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    exnetID: {
      type: String,
    },
    isConnector: {
      type: Boolean,
      default: false,
    },
  },
  inject: ['feedbackRubricMap'],
  methods: {},

  mounted() {},

  computed: {
    resolvedGradingInfo() {
      const map = this.feedbackRubricMap || {};
      const directMatch = map[String(this.exnetID)];
      if (directMatch) return directMatch;

      const connectorFeedback = map.__connectorFeedback || [];
      if (this.isConnector && connectorFeedback.length === 1) {
        return connectorFeedback[0];
      }

      return null;
    },

    getGradeColor() {
      if (!this.resolvedGradingInfo) return 'default';

      switch (this.resolvedGradingInfo.rubricStatus) {
        case 'GC':
          return 'correct';
        case 'GIC':
          return 'wrong';
        case 'GPC':
          return 'partial-correct';
        default:
          break;
      }

      return 'default';
    },

    getScore() {
      if (!this.resolvedGradingInfo) return '0/0';

      return (
        this.resolvedGradingInfo.rubricScore +
        '/' +
        this.resolvedGradingInfo.maxRubricScore
      );
    },

    getFeedbackIcon() {
      if (!this.resolvedGradingInfo) return '';

      switch (this.resolvedGradingInfo.rubricStatus) {
        case 'GC':
          return 'mdi-check-circle';
        case 'GIC':
          return 'mdi-close-circle';
        case 'GPC':
          return 'mdi-alert-circle';
        default:
          return '';
      }
    },
  },
};
</script>

<style scoped>
.feedback-info {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  max-width: 260px;
  height: auto;
  padding: 12px 14px;
  margin-bottom: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  box-sizing: border-box;
  color: #1f2937;
  background: #ffffff;
  line-height: normal;
  box-shadow:
    0 14px 32px rgba(15, 23, 42, 0.16),
    0 2px 8px rgba(15, 23, 42, 0.08);
  z-index: 10000;
  overflow: visible;
}

.feedback-info::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 8px 0 0 8px;
  background: var(--feedback-accent, #2563eb);
}

.feedback-info::after {
  content: '';
  position: absolute;
  left: 24px;
  bottom: -7px;
  width: 14px;
  height: 14px;
  transform: rotate(45deg);
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.feedback-status-icon {
  color: var(--feedback-accent, #2563eb);
}

.feedback-score {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: #111827;
}

.feedback-body {
  display: grid;
  gap: 4px;
}

.feedback-message,
.feedback-note {
  margin: 0;
  overflow-wrap: anywhere;
}

.feedback-message {
  font-size: 13px;
  font-weight: 650;
  line-height: 1.35;
  color: #374151;
}

.feedback-note {
  font-size: 12px;
  line-height: 1.35;
  color: #6b7280;
}

.feedback-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  height: 24px;
}

.correct {
  --feedback-accent: #16a34a;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 72%);
}

.wrong {
  --feedback-accent: #dc2626;
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 72%);
}

.partial-correct {
  --feedback-accent: #d97706;
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 72%);
}

.default {
  --feedback-accent: #2563eb;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 72%);
}
</style>
