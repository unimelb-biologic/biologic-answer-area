<template>
    <RenderStatement
        v-for="statement in visibleStatements"
        :data="statement" />
</template>

<script>
import RenderStatement from "@/components/RenderStatement.vue";

export default {
    name:"StatementArea",
    props: {
        statements: Object
    },
    components: {
        RenderStatement
    },

    computed: {
        // Returns an array of statements only if the "visible" property is true.
        visibleStatements() {
            return this.statements.filter((item) => item.visible === true)
        }
    }
}
</script>

<style>

</style>