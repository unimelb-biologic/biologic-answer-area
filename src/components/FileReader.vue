<template>
    <div style="display:flex; flex-direction:row; align-items: center;">
        <h3 style="padding-right: 10px;"><label for="open-file">{{ title }}</label></h3>
        <input id="open-file" type="file" @change="onOpenFile" accept=".json" />
    </div>
</template>
<script>
export default {
    name: "FileReader",
    props: ["title"],
    emits: ["readFile"],
    data() {
        return {

        }
    }, methods: {
        "onOpenFile": function (e) {
            const dataFile = e.target.files[0];

            if (!dataFile) {
                return;
            }

            var reader = new FileReader();
            reader.onload = e => this.$emit("readFile", e.target.result);
            reader.readAsText(dataFile);


        }
    }
};
</script>