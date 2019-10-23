<template>
    <div class="tc_checkbox">
        <span>
            <input type="checkbox" :id="name" v-model="checked" @change="changeValue">
            <label :for="name" class="ng-binding" v-html="text"></label>
        </span>
    </div>
</template>
<script>
    import baseComponent from './../base';

    export default {
        extends: baseComponent,
        props: [],
        name: 'checkbox',
        computed : {
            value: {
                get: function () {
                    return this.checked;
                },
                set: function (newValue) {
                    this.checked = newValue;
                }
            }
        },
        data: function() {
            return {
                name: 'name_' + this.parentId,
                text: '',
                checked: false
            }
        },
        methods: {
            changeValue: function() {
                this.emitEvent('changed', this.checked);
            }
        }
    }
</script>
<style lang="less">
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