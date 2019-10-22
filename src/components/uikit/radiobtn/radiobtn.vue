<template>
    <div class="tc_radiobtn">
        <span v-for="(item, index) in items">
            <input type="radio" :name="name" :id="name + item.value" :value="item.value" v-model="radioValue" @change="changeValue">
            <label :for="name + item.value" v-html="item.text"></label>
        </span>
    </div>
</template>
<script>
    import baseComponent from './../base';

    export default {
        extends: baseComponent,
        name: 'radiobtn',
        computed : {
            value: {
                get: function() {
                    return this.radioValue;
                },
                set: function(newValue) {
                    this.radioValue = newValue;
                }
            }
        },
        data: function() {
            return {
                name: '',
                items: []
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        methods: {
            changeValue: function() {
                this.emitEvent('changed', this.radioValue);
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