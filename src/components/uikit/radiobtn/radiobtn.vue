<template>
    <div class="tc_radiobtn">
        <span v-for="(item, index) in items">
            <input type="radio" :name="name" :id="name + item.value" :value="item.value" v-model="radioValue" @change="changeValue">
            <label :for="name + item.value" v-html="item.text"></label>
        </span>
    </div>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Radiobtn extends Base {
        name: string = 'name_' + this.parentId;
        radioValue: string = '';
        items: any = [];

        get value() {
            return this.radioValue;
        }
        set value(newValue) {
            this.radioValue = newValue;
        }

        changeValue() {
            this.emitEvent('changed', this.radioValue);
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