<template>
  <div style="
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width:100%;
    ">

    <div style="display: flex; flex-direction: row; align-items: center">
      <img src="/src/assets/BioLogic_BlueGreen_Icon.jpg" height="50" />
      <img src="/src/assets/BioLogic_Word.jpg" height="50px;" />
      <h2 class="biologic-component">EDITOR</h2>
    </div>

    <div class="biologic-medium-text" v-if="show" style="display: flex; flex-direction: row; align-items: center; ">

      <div>
        <file-reader :title="'Open:'" @read-file="onExNetReadFile"></file-reader>
      </div>

      <div>
        <div style="display: flex; flex-direction: row; align-items: center ">
          <div class="biologic-medium-text">
            <label for="save-file">Save: </label>
          </div>
          <v-btn style="color: var(--biologic-green-color); background-color: transparent;" id="save-file"
            @click="onDownloadExNet">
            Save to disk
          </v-btn>
        </div>
      </div>


    </div>

    <div class="right_menu">

      <Tooltip text="current user">
        <h3 style="color:var(--biologic-green-color)">{{ clientType }}: {{ userID }}</h3>
      </Tooltip>

      <Tooltip text="Show buttons to allow read and write to local disk">
        <v-btn style="color:var(--biologic-green-color)" @click="show = !show">
          <v-icon>mdi-file-arrow-up-down-outline</v-icon>
        </v-btn>
      </Tooltip>

      <Tooltip text="logout">
        <v-btn class="biologic_logout_button" @click="handleLogout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </Tooltip>

    </div>
  </div>
</template>

<script>
import FileReader from "@/components/FileReader.vue";
import Tooltip from "@/components/AnswerArea/Tooltip.vue";
import "@/assets/biologic.css";

export default {
  name: "MenuBar",
  data() {
    return {
      show: false,
    };
  },

  props: ["userID", "clientType"],
  emits: ["onDownloadExNet", "setExNetAnswer", "logout"],
  components: {
    FileReader,
    Tooltip,
  },
  methods: {
    onExNetReadFile(exNetRawData) {
      const exnetWorkingAnswerJson = JSON.parse(exNetRawData);
      this.$emit("setExNetAnswer", exnetWorkingAnswerJson);
    },
    onDownloadExNet() {
      this.$emit("onDownloadExNet");
    },
    handleLogout() {
      this.$emit("logout");
    },
  },
};
</script>

<style scoped>
.right_menu {
  position: relative;
  top: 0;
  right: 16px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  /*height: 50px;*/
}

.biologic_logout_button {
  font-size: 20px;
  color: var(--biologic-green-color);
  background-color: #fff;
  margin: 2px;
  padding: 4px;
  align-items: top;
  border-bottom: 2px solid #595959;
  /* Darker green for bevel effect */
  border-right: 2px solid #595959;
  /* Darker green for bevel effect */
}

.biologic_logout_button:hover {
  background-color: #e1e1e1;
  /* Change color on hover */
  border-bottom: 2px solid #7a5a5a;
  /* Darker green for bevel effect on hover */
  border-right: 2px solid #7a5a5a;
  /* Darker green for bevel effect on hover */
}

.biologic_logout_button:active {
  background-color: #ffffff;
  /* Darker green when button is pressed */
  border-bottom: 0;
  /* Remove bottom border when button is pressed */
  border-right: 0;
  /* Remove right border when button is pressed */
  transform: translate(1px,
      1px);
  /* Move button down by 2 pixels when pressed */
}
</style>
