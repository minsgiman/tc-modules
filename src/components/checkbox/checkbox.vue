<template>
    <div class="tc_checkbox">
        <span>
            <input type="checkbox" :id="name">
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
    .tc_checkbox {
        span {
            input[type='checkbox'] {
                border:none;
                appearance: none;
                -webkit-appearance: none;
                vertical-align:top;
            }
            label {
                cursor:pointer;
                font-size:14px;
            }
            label:before {
                display:inline-block;
                overflow:hidden;
                vertical-align:middle;
                width:18px;
                height:18px;
                background:url(/resources/img/sp.png) no-repeat;
                background-position:0 -95px;
                content: '';
                float: left;
            }
            input:checked+label:before {
                background-position:-20px -95px;
            }
        }
    }
</style>