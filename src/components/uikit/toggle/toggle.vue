<template>
    <button class="tc_toggle" :class="{isOn: isOn}" @click="toggleBtn()"></button>
</template>
<script>
    import baseComponent from './../base';

    export default {
        extends: baseComponent,
        name: 'toggle',
        computed : {
            value: {
                get: function() {
                    return this.isOn;
                },
                set: function(newValue) {
                    this.isOn = newValue;
                }
            }
        },
        data: function() {
            return {
                isOn: true
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        methods: {
            toggleBtn: function() {
                this.isOn = !this.isOn;
                this.emitEvent('changed', this.isOn);
            }
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