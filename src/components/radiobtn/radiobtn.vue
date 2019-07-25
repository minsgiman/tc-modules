<template>
    <div class="tc_radiobtn">
        <span v-for="(item, index) in items">
            <input type="radio" :name="name" :value="item.value" v-model="radioValue" @change="changeValue">
            <label>{{item.text}}</label>
        </span>
    </div>
</template>
<script>
    export default {
        props: ['theme', 'name', 'items'],
        name: 'timeselect',
        computed : {
        },
        data: function() {
            return {
                radioValue: null
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
            changeValue: function() {
                this.$emit('event', {event: 'changed', value: this.radioValue});
            },
            getValue: function() {
                return this.radioValue;
            },
            setValue: function(value) {
                this.radioValue = value;
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
    .tc_radiobtn {
        span {
            display:inline-block;
        }
    }
</style>