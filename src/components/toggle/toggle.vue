<template>
    <button class="tc_toggle" :class="{isOn: isOn}" @click="toggleBtn()"></button>
</template>
<script>
    export default {
        props: ['theme'],
        name: 'toggle',
        computed : {
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
        beforeDestroy : function() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods: {
            toggleBtn: function() {
                this.isOn = !this.isOn;
                this.$emit('event', {event: 'toggle', isOn: this.isOn});
            },
            setData: function(key, value) {
                this[key] = value;
            },
            destroy: function() {
                this.$destroy();
            }
        },
        components : {
        }
    }
</script>
<style lang="less">
    .tc_toggle {
        width:56px;
        height:38px;
        border:0;
        cursor:pointer;
        outline:none;
        background: url(/resources/img/btn-alarm-off.png) no-repeat;
        &.isOn {
            background: url(/resources/img/btn-alarm-on.png) no-repeat;
        }
    }
</style>