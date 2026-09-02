<template>
  <div
    v-if="
      isVisible &&
      resolvedGradingInfo &&
      resolvedGradingInfo.matchType == 'direct'
    "
    class="feedback-info"
    :class="gradeColorClass"
  >
    <!--div class="feedback-header"-->
    <v-icon class="feedback-status-icon" size="26">
      {{ feedbackIcon }}
    </v-icon>
    <!--div class="feedback-score">
          {{ score }}
        </div-->
    <!--/div-->
    <!--div class="feedback-body">
        <p class="feedback-message">
          {{ resolvedGradingInfo.feedback || 'No feedback' }}
        </p>
        <p v-if="resolvedGradingInfo.message" class="feedback-note">
          {{ resolvedGradingInfo.message }}
        </p>
      </div-->
  </div>
</template>

<script>
let localDebug = true;
import { isRef } from 'vue';
/**
 * FeedbackRubric
 *
 * Receives a single injected `rubric` object (a Rubric_T instance) and an
 * `exnetID` prop identifying the element this component is attached to.
 *
 * It resolves how the current element relates to the rubric and displays
 * appropriate feedback styling and messaging.
 *
 * Match types (in priority order):
 *   "direct"    — exnetID === rubric.paired_itemStudentExFlowID
 *                 Shows the rubric's own feedback/score as before.
 *
 *   "target"    — exnetID === rubric.matchingStudentTargetID
 *                 This element is the target that the rubric item was
 *                 trying to match against.
 *
 *   "matching"  — exnetID appears in rubric.matchingStatementIDs
 *                 This statement was found and matched correctly.
 *
 *   "missing"   — exnetID appears in rubric.missingStatementIDs
 *                 This statement was expected but absent from the answer.
 *
 *   "extra"     — exnetID appears in rubric.extraStatementIDs
 *                 This statement was present but not expected.
 *
 * If none of the above match, resolvedGradingInfo is null and nothing renders.
 */
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
    exnetType: {
      type: String,
      default: 'student', // "academic" | "student"
    },
  },

  // Replaces the old feedbackRubricMap injection.
  // The parent provides a single Rubric object (or null/undefined if none).
  inject: ['highlightedRubric'],

  emits: ['feedback-visibility-changed'],

  mounted() {
    console.log(
      '************* checking this.exnetID=',
      this.exnetID,
      ' localDeubg = ',
      localDebug,
    );
    localDebug = this.exnetID == '239329140479425';
    if (localDebug) console.log('highlightedRubric:', this.highlightedRubric);
    if (localDebug) console.log('is it a ref?:', isRef(this.highlightedRubric));
  },

  computed: {
    /**
     * Resolves the relationship between this element's exnetID and the
     * injected rubric. Returns an object with:
     *   - all original rubric fields (score, status, feedback, etc.)
     *   - matchType: one of "direct" | "target" | "matching" | "missing" | "extra"
     *   - feedback: overridden with a contextual message for non-direct matches
     *
     * Returns null if there is no rubric or no match of any kind.
     */
    resolvedGradingInfo() {
      localDebug = this.exnetID == '239329140479425';
      console.log(
        '\n\n\n************* checking this.exnetID=',
        this.exnetID,
        ' localDeubg = ',
        localDebug,
      );
      if (localDebug)
        console.log('resolvedGradingInfo isConnector=', this.isConnector);
      const rubric = this.highlightedRubric;
      if (!rubric || this.exnetID == null) return null;
      if (localDebug) console.log('id=', this.exnetID, ' RUBRIC = ', rubric);

      const id = String(this.exnetID);

      // Connector IDs have a trailing 'c' appended to exnetID client-side; strip it from the rubric field for comparison
      const exNetConnectorIDStripped = String(rubric.exNetConnectorID).replace(
        /c$/,
        '',
      );
      const directMatchId = this.isConnector
        ? exNetConnectorIDStripped
        : this.exnetType == 'student'
          ? String(rubric.pairedStudentExFlowID)
          : String(rubric.exnetID);
      if (localDebug) console.log('directMatchId=', directMatchId);

      if (directMatchId === id) {
        if (localDebug) console.log('MATCHED - returning result of direct');
        return {
          ...rubric,
          matchType: 'direct',
          feedback: rubric.feedback ?? 'No feedback',
        };
      }
      if (localDebug) console.log('DIDNT MATCH');

      // 2. Target match — this element is what the rubric was targeting
      if (
        String(
          this.exnetType == 'student'
            ? rubric.matchingStudentTargetID
            : rubric.expectedTargetStatementID,
        ) === id
      ) {
        if (localDebug) console.log('TARGET');
        return {
          ...rubric,
          matchType: 'target',
          feedback: 'This is a target of the current rubric item.',
        };
      }

      // 3. Matching statement — found and matched correctly
      if (this.exnetType == 'student') {
        if ((rubric.matchingStatementIDs ?? []).map(String).includes(id)) {
          if (localDebug) console.log('MATCHING');
          return {
            ...rubric,
            matchType: 'matching',
            feedback: 'This statement was matched for the current rubric item.',
          };
        }
      } else {
        if (
          (rubric.expectedReasonStatementIDs ?? []).map(String).includes(id)
        ) {
          if (localDebug) console.log('MATCHING');
          return {
            ...rubric,
            matchType: 'matching',
            feedback:
              'This statement was a reasoh for the current rubric item.',
          };
        }
      }

      // 4. Missing statement — expected but not present in the answer
      if ((rubric.missingStatementIDs ?? []).map(String).includes(id)) {
        if (localDebug) console.log('MISSING');
        return {
          ...rubric,
          matchType: 'missing',
          feedback:
            'This statement was missing from the expected reasons for the current rubric item.',
        };
      }

      // 5. Extra statement — present but not expected
      if ((rubric.extraStatementIDs ?? []).map(String).includes(id)) {
        if (localDebug) console.log('EXTRA');
        return {
          ...rubric,
          matchType: 'extra',
          feedback:
            'This statement was not expected for the current rubric item.',
        };
      }

      // No match of any kind
      return null;
    },

    /**
     * Maps matchType + rubricStatus to a CSS class name.
     *
     * For "direct" matches the colour follows the rubricStatus (GC/GIC/GPC)
     * as before. For all other match types a fixed colour is used regardless
     * of rubricStatus, since the status describes the rubric item as a whole,
     * not this particular element's relationship to it.
     */
    gradeColorClass() {
      if (!this.resolvedGradingInfo) return 'default';

      if (this.exnetType == 'academic') return 'correct';

      const { matchType, rubricStatus } = this.resolvedGradingInfo;

      if (matchType === 'direct') {
        switch (rubricStatus) {
          case 'GC':
            return 'correct';
          case 'GIC':
            return 'wrong';
          case 'GPC':
            return 'partial-correct';
          default:
            return 'default';
        }
      }

      // Non-direct match types have their own fixed colours
      switch (matchType) {
        case 'target':
          return 'target';
        case 'matching':
          return 'matching';
        case 'missing':
          return 'missing';
        case 'extra':
          return 'extra';
        default:
          return 'default';
      }
    },

    /**
     * Formats the score string.
     * For non-direct matches we still show the rubric's overall score so the
     * student can see the context, but you could return "" here instead if
     * that feels noisy.
     */
    score() {
      if (!this.resolvedGradingInfo) return '0/0';
      const { rubricScore, maxRubricScore } = this.resolvedGradingInfo;
      return `${rubricScore ?? 0}/${maxRubricScore ?? 0}`;
    },

    /**
     * Chooses an mdi icon based on matchType (for non-direct) or
     * rubricStatus (for direct), mirroring the old getFeedbackIcon logic.
     */
    feedbackIcon() {
      if (!this.resolvedGradingInfo) return '';

      const { matchType, rubricStatus } = this.resolvedGradingInfo;

      if (matchType === 'direct') {
        switch (rubricStatus) {
          case 'GC':
            return 'mdi-check-circle';
          case 'GIC':
            return 'mdi-close-circle';
          case 'GPC':
            return 'mdi-check-circle-outline';
          default:
            return '';
        }
      }

      switch (matchType) {
        case 'target':
          return 'mdi-target';
        case 'matching':
          return 'mdi-check-circle-outline';
        case 'missing':
          return 'mdi-minus-circle-outline';
        case 'extra':
          return 'mdi-plus-circle-outline';
        default:
          return '';
      }
    },
  },

  watch: {
    highlightedRubric(val) {
      localDebug = this.exnetID == '239329140479425';
      if (localDebug) console.log('Watching highlightedRubric CHANGED:', val);
      const resolvedVal = this.resolvedGradingInfo;
      if (localDebug) console.log('FeedbackRubric EMIT:', resolvedVal);
      this.$emit('feedback-visibility-changed', {
        isVisible: this.isVisible,
        gradingInfo: resolvedVal,
      });
    },
    isVisible(val) {
      if (localDebug) console.log('Watching isVisible CHANGED:', val);
      this.$emit('feedback-visibility-changed', {
        isVisible: val,
        rubricStatus: this.resolvedGradingInfo?.rubricStatus ?? null,
      });
    },
  },
  // ... rest unchanged
};
</script>

<style scoped>
/* ── Layout & base card ─────────────────────────────────────────── */
.feedback-info {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  /*min-width: 180px;
  max-width: 260px;*/
  height: auto;
  /*padding: 12px 14px;
  margin-bottom: 18px;*/
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

/* Left accent bar 
.feedback-info::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 8px 0 0 8px;
  background: var(--feedback-accent, #2563eb);
}

 Downward-pointing caret 
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
  */

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

/* ── Colour themes ──────────────────────────────────────────────── */

/* Direct match — rubricStatus-driven */
.correct {
  --feedback-accent: #16a34a;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 72%);
}

.wrong {
  --feedback-accent: #dc2626;
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 72%);
}

.partial-correct {
  --feedback-accent: #6c88d5;
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 72%);
}

/* Non-direct match types */
.target {
  --feedback-accent: #ea580c; /* orange */
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 72%);
}

.matching {
  --feedback-accent: #0891b2; /* cyan */
  background: linear-gradient(180deg, #ecfeff 0%, #ffffff 72%);
}

.missing {
  --feedback-accent: #dc2626; /* red */
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 72%);
}

.extra {
  --feedback-accent: #7c3aed; /* violet */
  background: linear-gradient(180deg, #f5f3ff 0%, #ffffff 72%);
}

.default {
  --feedback-accent: #2563eb;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 72%);
}
</style>
