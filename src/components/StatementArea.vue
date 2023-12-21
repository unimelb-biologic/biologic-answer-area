<template>
  <RenderStatement
    v-for="statement in visibleStatements"
    :key="statement.id"
    :statement-data="statement"
    :showToggle="true"
    :sharedData = "sharedData"
    @onDragStart="onDragStart(statement)"
    @mousedown="$emit('onclick', $event)"
    @toggle-collapsed="toggleCollapsed"
    @toggle-showPopup-fromrenderstatement="toggleShowPopupFromRenderStatement"
    @update-shared-data="updateSharedData"
  />
</template>

<script>
import RenderStatement from "@/components/RenderStatement.vue";

export default {
  name: "StatementArea",
  props: {
    statements: Object,
    sharedData: Object,
  },
  emits: ["onDragStart", "onclick", "update-shared-data"],
  components: {
    RenderStatement,
  },
  methods: {
    onDragStart(item) {
      //let the statement know it start to drag
      this.$emit("onDragStart", item);
    },
    toggleCollapsed(id)
    {
        console.log("StatementArea:toggleCollapsed");
        this.statements[id]["collapsed"] = !this.statements[id]["collapsed"];
    },

    toggleShowPopupFromRenderStatement(id)
    {
        console.log("StatementArea:toggleShowPopupFromRenderStatement");
        this.statements[id]["showPopup"] = !this.statements[id]["showPopup"];
    },

    updateSharedData(newValue) {
      this.$emit("update-shared-data",newValue);
    }

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
