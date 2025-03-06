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
  margin: 100px;
  padding: 100px;
}
#app {
  margin: 10px; /* Space around the app */
  padding: 10px; /* Space inside the app */
  /*background-color: #f5f5f5;  Background for visibility */
  /*border: 2px solid red;*/
  box-sizing: border-box; /* Include padding in total width/height */
  width: calc(100% - 20px); /* Full width minus margin */
  max-height: calc(100vh - 20px); /* Full height minus margin */
  min-height: calc(100vh - 20px); /* Full height minus margin */
  
  overflow: hidden; /* Prevent elements from spilling outside */
  display: flex;
  flex-direction: column;
}

#app > div:first-child {
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  width:100%;
}

</style>
