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
@import './assets/appdesign.css';
@import './assets/tooltips.css'; 

.displayWorkspace {
    position: relative;
}
</style>