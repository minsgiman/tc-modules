<template>
    <div class="tc_radiobtn">
        <span v-for="(item, index) in items">
            <input type="radio" :name="name" :id="item.value" :value="item.value" v-model="radioValue" @change="changeValue">
            <label :for="item.value" v-html="item.text"></label>
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
        margin-right:8px;
        span {
            display:inline-block;
            margin-right:28px;
            &:last-child {
                margin-right:0;
            }
            input[type="radio"] {
                -webkit-appearance: none;
                border:none;
                vertical-align:top;
            }
            label {
                cursor:pointer;
                font-size:14px;
            }
            label:before {
                display:inline-block;
                overflow:hidden;
                background:url(/resources/img/sp.png) no-repeat;
                width:24px;
                height:24px;
                margin-right:8px;
                background-position:-521px -416px;
                content: '' ;
                vertical-align:middle;
            }
            input:checked+label:before {
                background-position:-491px -416px;
            }
        }
    }
</style>