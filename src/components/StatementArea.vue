<template>
  <RenderStatement v-for="statement in visibleStatements" :key="statement.id" :statement-data="statement"
    :showToggle="true" @onDragStart="onDragStart(statement)" @mousedown="$emit('onclick', $event)"
    @toggle-collapsed="toggleCollapsed" @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement" />
</template>

<script>
import RenderStatement from "@/components/AnswerArea/RenderStatement.vue";

export default {
  name: "StatementArea",
  props: {
    statements: Object,
  },
  emits: ["onDragStart", "onclick"],
  components: {
    RenderStatement,
  },
  methods: {
    onDragStart(item) {
      //let the statement know it start to drag
      this.$emit("onDragStart", item);
    },
    toggleCollapsed(id) {
      console.log("StatementArea:toggleCollapsed");
      this.statements[id]["collapsed"] = !this.statements[id]["collapsed"];
    },

    toggleShowPopupFromRenderStatement(id) {
      console.log("StatementArea:toggleShowPopupFromRenderStatement");
      this.statements[id]["showPopup"] = !this.statements[id]["showPopup"];
    },

  },
  computed: {
    // Returns an array of statements only if the "visible" property is true.
    visibleStatements() {
      return this.statements.filter((item) => item.visible === true);
    },
  },
};
</script>

<style></style>
