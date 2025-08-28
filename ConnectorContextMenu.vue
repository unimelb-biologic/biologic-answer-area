<template>
  <div id="demo" >
    <div class="connectorTextContainer">
      <button class="popupButton biologic-dropdown-shadow" @click="openMenu($event)"><span>{{ options?.[choice]?.[1] ?? '⋮' }}</span></button>
    </div>

    <ul
      ref="right"
      id="right-click-menu"
      tabindex="-1"
      v-if="viewMenu && parentID"
      @blur="closeMenu"
      :style="{ top: top, left: left }"
      class = "connectorMenuUnorderedList"
    >
      <li
        v-for="(item, index) in options"
        @click="handleContentSelect(index)"
        :key="index"
      >
        {{ item[0] === undefined ? "" : item[0] }} ...
        {{ item[1] === undefined ? "" : item[1] }} ...
        {{ item[2] === undefined ? "" : item[2] }}
      </li>
    </ul>
  </div>
</template>

<script>
import { nextTick } from "vue";

export default {
  name: "ConnectorContextMenu",

  emits: ["changeLinkWord"],

  props: {
    index: Number,
    connectorID: Number,
    choice: Number,
    options: Object,
    parentID: Number,
  },

  data() {
    return {
      viewMenu: false,
      top: "0px",
      left: "0px",
    };
  },

  methods: {
    handleContentSelect(choice) {
      console.log(choice);
      this.$emit("changeLinkWord", [this.connectorID, choice]);
      this.viewMenu = false;
    },

    setMenu: function (top, left) {
      const largestHeight =
        window.innerHeight - this.$refs.right.offsetHeight - 120;
      const largestWidth =
        window.innerWidth - this.$refs.right.offsetWidth - 100;

      if (top > largestHeight) top = largestHeight;

      if (left > largestWidth) left = largestWidth;

      this.top = top + "px" - 100;
      this.left = left + "px" - 200;
    },

    closeMenu: function () {
      this.viewMenu = false;
    },

    openMenu: function (e) {
      this.viewMenu = true;

      nextTick(
        function () {
          this.$refs.right.focus();

          this.setMenu(e.clientY, e.clientX);
        }.bind(this)
      );
      e.preventDefault();
    },
  },
};
</script>

<style scoped>
body {
  width: 100%;
  height: 100%;
}

h1 {
  font-size: 3em;
}

.connectorTextContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 20px;
}

.connectorTextContainer p {
  z-index: 99;
  font-size: 12px;
  color: rgb(0, 0, 0);
}

.connectorTextContainer img {
  position: absolute;
  width: 80px;
}

.connectorTextContainer:hover .popupButton {
  opacity:1;
  background-color:rgb(252, 191, 191);
}

.connectorText {
  text-align: center;
  font-size: 30px;
  max-width: 80px;
  margin: 0px 5px 0px 5px;
  color:#d50000;
}

#demo {
  width: 100%;
  height: 100%;
}

#right-click-menu {
  background: #f9f0f0;
  border: 1px solid #ffd0d0;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  display: block;
  list-style: none;
  margin: 0;
  padding: 0;
  position: absolute;
  width: 250px;
  z-index: 999999;
}

#right-click-menu li {
  border-bottom: 1px solid #e0e0e0;
  margin: 0;
  padding: 5px 35px;
}

#right-click-menu li:last-child {
  border-bottom: none;
}

#right-click-menu li:hover {
  background: #1e88e5;
  color: #fafafa;
}

.connectorMenuUnorderedList{
  font-size: 12px;
}

.popupButton{
  color:var(--biologic-blue-color);
  background-color:rgb(255, 255, 255);
  margin: 0px 15px 0px 0px;
  font-weight:bolder;
  padding:0px 2px 0px 2px;
  /*opacity: 0.05;
  transition: opacity 0.3s ease;*/
}

</style>
