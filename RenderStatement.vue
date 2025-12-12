<template>
  <div
    class="statement-box"
    id="renderStatementElement"
    :draggable="true"
    @dragstart.stop="startDrag($event, data)"
    @dragover.prevent
    @dragenter.prevent="handleDragEnteringRenderStatement"
    @dragleave.prevent="handleDragLeavingRenderStatement"
    @drop="onDrop($event)"
    ref="mmStatementBox"
    :style="{
      position: this.statementData.position,
      left: this.statementData.left + 'px',
      top: this.statementData.top + 'px',
    }"
  >
    <div class="drag-handle">&nbsp;</div>

    <StatementRoot
      ref="statementRootRef"
      v-bind="$attrs"
      v-if="this.statementData.statementType === 0"
      :statement-data="this.statementData"
      @user-choice-changed="handleUserChoiceChanged"
      @duplicate-statement="duplicateStatement"
      @delete-statement="deleteStatement"
      @toggle-collapsed-statement-root="toggleCollapsedStatementRoot"
      @toggle-showPopup-fromstatementroot="toggleShowPopupStatementRoot"
    />
    <StatementTruth
      ref="statementTruthRef"
      v-bind="$attrs"
      v-if="this.statementData.statementType === 1"
      :statement-data="this.statementData"
      @user-choice-changed="handleUserChoiceChanged"
      @duplicate-statement="duplicateStatement"
      @delete-statement="deleteStatement"
      @toggle-collapsed-statement-truth="toggleCollapsedStatementTruth"
    />
    <StatementStudent
      ref="statementStudentRef"
      v-bind="$attrs"
      v-if="this.statementData.statementType === 2"
      :statement-data="this.statementData"
      @user-choice-changed="handleUserChoiceChanged"
      @duplicate-statement="duplicateStatement"
      @delete-statement="deleteStatement"
      @toggle-collapsed-statement-student="toggleCollapsedStatementStudent"
      @toggle-showPopup-fromstatementstudent="toggleShowPopupStatementStudent"
    />
    <StatementFreeText
      ref="statementFreeTextRef"
      v-bind="$attrs"
      v-if="this.statementData.statementType === 3"
      :statement-data="this.statementData"
      @user-input-changed="handleUserInputChanged"
      @duplicate-statement="duplicateStatement"
      @delete-statement="deleteStatement"
      @toggle-collapsed-statement-freetext="toggleCollapsedStatementFreeText"
    />
    <div v-if="renderedText">{{ renderedText }}</div>
  </div>
</template>

<script>
import StatementRoot from './statements/StatementRoot.vue';
import StatementTruth from './statements/StatementTruth.vue';
import StatementStudent from './statements/StatementStudent.vue';
import StatementFreeText from './statements/StatementFreeText.vue';
import { globalConsoleLog } from './util';

export default {
  name: 'RenderStatement',
  components: {
    StatementFreeText,
    StatementStudent,
    StatementTruth,
    StatementRoot,
  },
  emits: [
    'update-statement-content',
    'onDragStart',
    'connector-dropped-on-statement',
    'statement-dropped-on-statement',
    'duplicate-statement',
    'delete-statement',
    'toggle-collapsed-renderstatement',
    'toggle-showPopup-fromrenderstatement',
  ],
  inheritAttrs: false,
  props: {
    statementData: Object,
  },
  inject: [
    'displayOnly', // this means no editing of popups or dragging etc. Like it's readonly. But we do allow collapsing/uncollapsing
  ],
  data() {
    return {
      contentText: '',
      answeredStat: null,
      hide_renderCollapsed: false,
      hide_renderShowPopups: true,
      remove_formats: ['.png', '.jpg', '.jpeg'], // array of formats to exclude from the answer string
    };
  },
  computed: {
    concatenatedRenderStatement() {
      const refMap = {
        0: this.$refs.statementRootRef,
        1: this.$refs.statementTruthRef,
        2: this.$refs.statementStudentRef,
        3: this.$refs.statementFreeTextRef,
      };
      const ref = refMap[this.statementData.statementType];
      if (ref) {
        if (typeof ref.concatenatedStatement === 'function')
          return ref.concatenatedStatement();
        else
          return (
            'Error: concatenatedStatement is not a function. The type is ' +
            typeof ref.concatenatedStatement
          );
      } else {
        return `Reference for statementType ${this.statementData.statementType} is not available`;
      }
    },
  },
  methods: {
    handleDoubleClick(combinedText) {
      this.renderedText = combinedText;
    },
    handleDragOveringRenderStatement() {
      //globalConsoleLog("any", "render over event");
    },
    handleDragEnteringRenderStatement() {
      //globalConsoleLog("any", "render enter event");
    },
    handleDragLeavingRenderStatement() {
      //globalConsoleLog("any", "render leave event");
    },

    startDrag(e, data) {
      if (this.displayOnly) {
        globalConsoleLog(
          'any',
          '\n\nCANT DRAG RENDERSTATEMENT BECAUSE WERE IN DISPLAYONLY MODE\n\n',
        );
        return;
      }

      // e.target.className = 'dragEffect';
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('data', JSON.stringify(this.statementData));
      e.dataTransfer.setData('type', 'statement');
      // Pass the statement content through drag event
      e.dataTransfer.setData('content', this.contentText);

      // Pass the click offset
      const mmBox = this.$refs.mmStatementBox;
      var rect = mmBox.getBoundingClientRect();
      const grabOffsetLeft = e.clientX - rect.left;
      const grabOffsetTop = e.clientY - rect.top;
      /*
      globalConsoleLog("geom", "---START DRAG e.client (X,Y)---", e.clientX, e.clientY);
      globalConsoleLog("geom", "---START DRAG rect position=---", rect.left, rect.top);
      globalConsoleLog("geom"
        "---START DRAG grabOffset is diff---",
        grabOffsetLeft,
        grabOffsetTop
      );
      */
      e.dataTransfer.setData('grabOffsetLeft', grabOffsetLeft.toString());
      e.dataTransfer.setData('grabOffsetTop', grabOffsetTop.toString());

      this.$emit('onDragStart', data);

      // the following geometry information is used by the Target boxes in the connectors to change size dynamically.
      // However the spec for the drag, dragenter, dragleave, dragover and dragend events the drag data store mode is protected mode.
      // this means you can see the types but not the values. So the workaround is to encode the values into the type names.
      const widthTypeStr = 'draggedWidth/' + e.currentTarget.offsetWidth;
      e.dataTransfer.setData(
        widthTypeStr,
        0 /* i.e. the zero is a dummy value*/,
      );
      const heightTypeStr = 'draggedHeight/' + e.currentTarget.offsetHeight;
      e.dataTransfer.setData(
        heightTypeStr,
        0 /* i.e. the zero is a dummy value*/,
      );
      const typeTypeStr = 'draggedType/' + 'render_statement';
      e.dataTransfer.setData(
        typeTypeStr,
        0 /* i.e. the zero is a dummy value*/,
      );
      const connectorIDTypeStr = 'draggedConnectorID/';
      e.dataTransfer.setData(
        connectorIDTypeStr,
        0 /* i.e. the zero is a dummy value*/,
      );

      globalConsoleLog(
        'geom',
        ' SET UP DATA TRANSFER:',
        widthTypeStr,
        heightTypeStr,
        typeTypeStr,
        connectorIDTypeStr,
      );
    },

    onDrop(e) {
      if (this.displayOnly) {
        globalConsoleLog(
          'conn',
          'RenderStatement:onDrop but display only so return ',
        );
        return;
      }

      e.stopImmediatePropagation();
      const type = e.dataTransfer.getData('type');
      //globalConsoleLog("conn", "RenderStatement:onDrop type=", type);
      if (type == 'connector') {
        // ignore if it was statement droopped on statement
        //globalConsoleLog("conn", " emitting connector-dropped-on-statement");
        this.$emit('connector-dropped-on-statement', [
          this.statementData.id,
          undefined,
          e,
        ]); // let the Parent deal with it
      } else if (type == 'statement') {
        globalConsoleLog('conn', ' emitting statement-dropped-on-statement');
        this.$emit('statement-dropped-on-statement', [
          this.statementData.id,
          e,
        ]); // let the Parent deal with it
      }
    },

    handleUserChoiceChanged(info) {
      this.contentText = info[0];
      this.answeredStat = info[1];
      const statementID = info[1]['id'];
      //globalConsoleLog("conn", "RenderStatement::emitting update-statement-content ",this.contentText,this.answeredStat);
      this.$emit(
        'update-statement-content',
        [this.contentText, this.answeredStat],
        statementID,
      );
    },

    handleUserInputChanged(info) {
      this.contentText = info[0];
      this.answeredStat = info[1];
      const statementID = info[1]['id'];
      this.$emit(
        'update-statement-content',
        [this.contentText, this.answeredStat],
        statementID,
      );
    },

    duplicateStatement(id) {
      if (this.displayOnly) return;

      console.log(
        'RenderStatement:duplicateStatement - calling emit duplicate-statement',
      );
      this.$emit('duplicate-statement', id); // pass it on up the chain
    },

    deleteStatement(id) {
      if (this.displayOnly) return;

      console.log(
        'RenderStatement:deleteStatement - calling emit delete-statement',
      );
      this.$emit('delete-statement', id); // pass it on up the chain
    },

    toggleCollapsedStatementStudent(id) {
      console.log(
        'RenderStatement:toggleCollapsedStatementStudent - calling emit toggle-collapsed-renderstatement',
      );
      this.$emit('toggle-collapsed-renderstatement', id); // pass it on up the chain
    },
    toggleCollapsedStatementTruth(id) {
      console.log(
        'RenderStatement:toggleCollapsedStatementTruth - calling emit toggle-collapsed-renderstatement',
      );
      this.$emit('toggle-collapsed-renderstatement', id); // pass it on up the chain
    },
    toggleCollapsedStatementRoot(id) {
      console.log(
        'RenderStatement:toggleCollapsedStatementRoot - calling emit toggle-collapsed-renderstatement',
      );
      this.$emit('toggle-collapsed-renderstatement', id); // pass it on up the chain
    },
    toggleCollapsedStatementFreeText(id) {
      console.log(
        'RenderStatement:toggleCollapsedStatementFreeText - calling emit toggle-collapsed-renderstatement',
      );
      this.$emit('toggle-collapsed-renderstatement', id); // pass it on up the chain
    },

    toggleShowPopupStatementStudent(id) {
      console.log(
        'RenderStatement:toggleShowPopupStatementStudent - calling emit toggle-showPopup-fromrenderstatement',
      );
      this.$emit('toggle-showPopup-fromrenderstatement', id); // pass it on up the chain
    },

    toggleShowPopupStatementRoot(id) {
      console.log(
        'RenderStatement:toggleShowPopupStatementRoot - calling emit toggle-showPopup-fromrenderstatement',
      );
      this.$emit('toggle-showPopup-fromrenderstatement', id); // pass it on up the chain
    },

    initContent() {
      if (
        this.statementData.statementType === 0 ||
        this.statementData.statementType === 1
      ) {
        // TODO: process the "xxx.jpg" in TRUTH statement
        this.contentText = this.statementData.content.originalFacts
          .filter(
            (fact) =>
              !this.remove_formats.some((format) => fact.includes(format)),
          )
          .join(' ');
      }
      this.answeredStat = this.statementData;
    },
  },
  watch: {
    data() {
      this.initContent();
    },
    // Pass the changed statement content
    // contentText(newStatementContent) {
    //     this.$emit('update-statement-content', newStatementContent);
    //     // console.log(this.contentText);
    // }
  },

  created() {
    // this.answeredStat = this.statementData;
    this.initContent();
  },
  mounted() {
    //globalConsoleLog("conn", "RenderStatement mounted with injected displayOnly=",this.displayOnly);
  },
};
</script>

<style scoped>
.statement-box {
  background-color: #ffffff;
  display: inline-block;
  /* Display as inline block */
  border: 1px solid rgb(209, 210, 158);
  /* Optional: Add border for visualization */
  position: relative;
}

.statement-box:hover {
  background-color: #dbbaba;
  display: inline-block;
  /* Display as inline block */
  border: 2px solid var(--biologic-hover-border-color);
  /* Optional: Add border for visualization */
  transform: translate(-1px, -1px);
  position: relative;
  cursor: move;
}

.statement-box:hover .iconContainer {
  border: 5px solid rgb(12, 0, 246);
}
</style>
