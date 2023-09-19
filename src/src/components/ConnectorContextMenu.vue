<template>
    <div id="demo" @click.right="openMenu($event)">
        <h3 class="center">{{ options[choice][index] }}</h3>
        <ul ref="right" id="right-click-menu"
            tabindex="-1"
            v-if="viewMenu  && parentID"
            @blur="closeMenu"
            :style="{top:top, left:left}">
            <li v-for="(item, index) in options" @click="handleContentSelect(index)">
                {{ (item[0] === undefined ? '' : item[0]) }} [A]
                {{ (item[1] === undefined ? '' : item[1]) }} [B]
                {{ (item[2] === undefined ? '' : item[2]) }}
                </li>
        </ul>
    </div>
</template>

<script>
import {nextTick} from "vue";

export default {
    name: "ConnectorContextMenu",

    emits: ['changeLinkWord'],

    props: {
        index: Number,
        connectorID: Number,
        choice: Number,
        options: Object,
        parentID: Number
    },

    data() {
        return {
            viewMenu: false,
            top: '0px',
            left: '0px'
        }
    },

    methods: {
        handleContentSelect(choice) {
            this.$emit('changeLinkWord', [this.connectorID, choice])
            this.viewMenu = false
        },

        setMenu: function(top, left) {
            const largestHeight = window.innerHeight - this.$refs.right.offsetHeight - 120;
            const largestWidth = window.innerWidth - this.$refs.right.offsetWidth - 100;

            if (top > largestHeight) top = largestHeight;

            if (left > largestWidth) left = largestWidth;

            this.top = top + 'px' - 100;
            this.left = left + 'px' - 200;
        },

        closeMenu: function() {
            this.viewMenu = false;
        },

        openMenu: function(e) {
            this.viewMenu = true;

            nextTick(function() {
                this.$refs.right.focus();

                this.setMenu(e.clientY, e.clientX)
            }.bind(this));
            e.preventDefault();
        }
    }
}

</script>

<style scoped>
body {
    width: 100%;
    height: 100%;
}

h1 {
    font-size: 3em;
}

.center {
    text-align: center;
}

#demo {
    width: 100%;
    height: 100%;
}

#right-click-menu{
    background: #FAFAFA;
    border: 1px solid #BDBDBD;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: fixed;
    width: 250px;
    z-index: 999999;
}

#right-click-menu li {
    border-bottom: 1px solid #E0E0E0;
    margin: 0;
    padding: 5px 35px;
}

#right-click-menu li:last-child {
    border-bottom: none;
}

#right-click-menu li:hover {
    background: #1E88E5;
    color: #FAFAFA;
}
</style>
