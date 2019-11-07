<template>
    <button class="tc_toggle" :class="{isOn: isOn}" @click="toggleBtn()"></button>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Toggle extends Base {
        isOn: boolean = true;

        get value(): boolean {
            return this.isOn;
        }
        set value(newValue: boolean) {
            this.isOn = newValue;
        }

        toggleBtn() {
            this.isOn = !this.isOn;
            // @ts-ignore
            this.emitEvent('changed', this.isOn);
        }
    }
</script>
<style lang="less">
    .tc_toggle {
        width:42px;
        height:24px;
        background: url(/resources/img/btn-alarm-off.svg) no-repeat;
        &.isOn {
            background: url(/resources/img/btn-alarm-on.svg) no-repeat;
        }
    }
</style>