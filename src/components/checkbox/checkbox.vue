<template>
    <div class="tc_checkbox">
        <span>
            <input type="checkbox" :id="name" v-model="checked" @change="changeValue">
            <label :for="name" class="ng-binding" v-html="text"></label>
        </span>
    </div>
</template>
<script>
    export default {
        props: ['theme', 'name', 'text'],
        name: 'checkbox',
        computed : {
        },
        data: function() {
            return {
                checked: false
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
                this.$emit('event', {event: 'changed', value: this.checked});
            },
            getValue: function() {
                return this.checked;
            },
            setValue: function(value) {
                this.checked = value;
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
    @import './../comp_common';
    .tc_checkbox {
        span {
            label {
                cursor:pointer;
                font-size:14px;
                margin-left:10px;
                line-height:23px;
            }
            label:before {
                display:inline-block;
                overflow:hidden;
                vertical-align:middle;
                width:20px;
                height:20px;
                background:url(/resources/img/btn-checkbox-unchecked.svg) no-repeat;
                content: '';
                float: left;
            }
            input:checked+label:before {
                background-image:url(/resources/img/btn-checkbox-checked.svg);
            }
        }
    }
</style>