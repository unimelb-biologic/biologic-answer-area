<template>
    <div class="mytooltip-wrapper">
        <slot />
        <span v-if="globalTooltipState.showTooltips" class="mytooltip__text">{{ text }}</span>
    </div>
</template>


<script>
export default {
    inject: ['globalTooltipState'],
    name: "Tooltip",
    props: {
    text: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'bottom'
    },
    computed: {
    tooltipClasses() {
      return {
        'mytooltip__text': true,
        [`tooltip--${this.position}`]: true
      };
    }
  }
},

};
</script>
<style>
.mytooltip__text {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;

    color: #16003c;
    text-align: center;
    padding: 5px 0;
    border-radius: 2px;
    min-width: 120px;
    background: #f4f2fe;
    box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.4); /* Drop shadow */
    font-size: small;


    position: absolute;
    z-index: 10;
    inset-block-start: 120%;
    inset-inline-start: 50%;
    margin-inline-start: -60px;
}
.tooltip--top {
    inset-block-end: 120%;
    inset-inline-start: 50%;
    margin-inline-start: -60px;
}
.tooltip--bottom {
    inset-block-start: 120%;
    inset-inline-start: 50%;
    margin-inline-start: -60px;
}
.tooltip--left {
    inset-block-end: 0%;
    inset-inline-end: 110%;
}
.tooltip--right {
    inset-block-end: 0%;
    inset-inline-start: 110%;
}

.mytooltip-wrapper {
    display: inline-block;
    position: relative;
}

.mytooltip-wrapper:hover .mytooltip__text{
    visibility: visible;
    opacity: 1;
    transition-delay: 1.5s;
    pointer-events: auto;
}
</style>