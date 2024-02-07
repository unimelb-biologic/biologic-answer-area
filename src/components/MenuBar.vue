<template>

    <div  style="display:flex;flex-direction: row;" > 
        <div v-if="show">
            <div>
                <file-reader :title="'Browse ExNet File:'" @read-file="onExNetReadFile"></file-reader>
            </div>
            <div>
                <div style="display:flex; flex-direction:row; align-items: center;">
                <h3 style="padding-right: 10px;"><label for="save-file">Save ExNet File: </label></h3>
                Under constructionn
                <button id="save-file" type=" button" @click="onDownloadExNet">Save ExNet</button>
                </div>
            </div>
        </div>

        <div>
            <span> Hi {{userID}}</span>
            <button @click="show = !show"> Show offline features</button>
        </div>
    </div>


</template>

<script>
import FileReader from "@/components/FileReader.vue";

export default {
    name: 'MenuBar',
    data() {
        return {
            show: true
        }
    },

    props: ['userID'],
    emits: [
        'onDownloadExNet',
        'setCurrentExNet'
    ],
    components: {
        FileReader
    }, 
    methods: {
        onExNetReadFile(exNetRawData) {
            const exnetWorkingAnswerJson = JSON.parse(exNetRawData);
            // this.setCurrentExNet(exnetWorkingAnswerJson, true);
            this.$emit('setCurrentExNet', exnetWorkingAnswerJson, true);

        },
        onDownloadExNet () {
            this.$emit('onDownloadExNet')
        }
    },
    inject: ['selectedQuestion']
}
</script>

<style scoped>
</style>