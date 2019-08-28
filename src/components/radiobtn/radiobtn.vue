<template>
    <div class="tc_radiobtn">
        <span v-for="(item, index) in items">
            <input type="radio" :name="name" :id="name + item.value" :value="item.value" v-model="radioValue" @change="changeValue">
            <label :for="name + item.value" v-html="item.text"></label>
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
    @import "./../comp_common";
    .tc_radiobtn {
        margin-right:8px;
        span {
            display:inline-block;
            margin-right:28px;
            &:last-child {
                margin-right:0;
            }
            label {
                cursor:pointer;
                font-size:14px;
            }
            label:before {
                display:inline-block;
                overflow:hidden;
                background:url(/resources/img/btn-radio-unchecked.svg) no-repeat;
                width:20px;
                height:20px;
                margin-right:8px;
                content: '' ;
                vertical-align:middle;
            }
            input:checked+label:before {
                background-image:url(/resources/img/btn-radio-checked.svg);
            }
        }
    }
</style>