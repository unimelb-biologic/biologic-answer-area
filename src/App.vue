<template>
  <div>
      <!-- router -->
      <router-view></router-view>
  </div>

</template>

<script>


export default {
  name: 'App',

  data() {
      return {
      }
  },

  components: {
   
  },

  methods: {
  }
}
</script>

<style>
@import "./assets/appdesign.css";
@import "./assets/tooltips.css";

body {
  margin: 0px;
  padding: 0px;
}

.displayWorkspace {
  position: relative;
}

.sectionTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.sectionTitle h2 {
  width: 220px;
  margin: 0px 0px 0px 10px;
}

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 8px;
  background: gray;
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 8px;
  background: gray;
}

.mainContainer {
  height: 100vh;
}

.statementContainer {
  overflow-y: scroll;
}

.connectorContainer {
  overflow-y: scroll;
}
</style>
