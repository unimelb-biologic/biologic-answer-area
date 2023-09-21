<template>
  <RenderStatement
    v-for="statement in visibleStatements"
    :key="statement.id"
    :data="statement"
    @onDragStart="onDragStart(statement)"
    @mousedown="$emit('onclick', $event)"
  />
</template>

<script>
import RenderStatement from "@/components/RenderStatement.vue";

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
