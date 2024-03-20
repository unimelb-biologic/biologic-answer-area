<template>
  <div
    style="
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    "
  >
    <div style="display: flex; flex-direction: row; align-items: center">
      <img src="https://murraym678.github.io/images/biologic/BiologicEditor_Icon_for_poster.png" width="30">
      <h3 style="color:rgb(162, 38, 38);">&nbsp;&nbsp;&nbsp;Biologic Editor</h3>

    </div>
    <div v-if="show" style="display: flex; flex-direction: row">
      <div>
        <file-reader
          :title="'Browse ExNet File:'"
          @read-file="onExNetReadFile"
        ></file-reader>
      </div>
      <div>
        <div style="display: flex; flex-direction: row; align-items: center">
          <h3 style="padding-right: 10px">
            <label for="save-file">Save ExNet File: </label>
          </h3>
          <button id="save-file" type=" button" @click="onDownloadExNet">
            Save ExNet
          </button>
        </div>
      </div>
    </div>

    <div class="right_menu">
      <h3>Student: {{ userID }}</h3>

      <button @click="show = !show">Show offline features</button>
      <button class="biologic_logout_button" @click="handleLogout">Logout</button>
    </div>
  </div>
</template>

<script>
import FileReader from "@/components/FileReader.vue";

export default {
  name: "MenuBar",
  data() {
    return {
      show: false,
    };
  },

  props: ["userID"],
  emits: ["onDownloadExNet", "setCurrentExNet", "logout"],
  components: {
    FileReader,
  },
  methods: {
    onExNetReadFile(exNetRawData) {
      const exnetWorkingAnswerJson = JSON.parse(exNetRawData);
      // this.setCurrentExNet(exnetWorkingAnswerJson, true);
      this.$emit("setCurrentExNet", exnetWorkingAnswerJson, true);
    },
    onDownloadExNet() {
      this.$emit("onDownloadExNet");
    },
    handleLogout() {
      this.$emit("logout");
    },
  },
  inject: ["selectedQuestion"],
};
</script>

<style scoped>
.right_menu {
  right: 16px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  height: 50px;
}
.biologic_logout_button {
  font-size: 20px;
  color:rgb(162, 38, 38);
  background-color: #fff;
  margin: 2px;
  padding: 4px;
  align-items: center;
  border-bottom: 2px solid #595959; /* Darker green for bevel effect */
  border-right: 2px solid #595959; /* Darker green for bevel effect */
}

.biologic_logout_button:hover {
    background-color: #e1e1e1; /* Change color on hover */
    border-bottom: 2px solid #7a5a5a; /* Darker green for bevel effect on hover */
    border-right: 2px solid #7a5a5a; /* Darker green for bevel effect on hover */
  }

.biologic_logout_button:active {
    background-color: #ffffff; /* Darker green when button is pressed */
    border-bottom: 0; /* Remove bottom border when button is pressed */
    border-right: 0; /* Remove right border when button is pressed */
    transform: translate(1px,1px); /* Move button down by 2 pixels when pressed */
  }
</style>
