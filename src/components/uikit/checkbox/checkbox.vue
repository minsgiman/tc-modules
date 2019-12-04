<template>
    <div class="tc_checkbox">
        <span>
            <input type="checkbox" :id="name" v-model="checked" @change="changeValue" :disabled="disabled">
            <label :for="name" class="ng-binding" v-html="text"></label>
        </span>
    </div>
</template>
<script lang="ts">
    import { Component, Prop } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Checkbox extends Base {
        @Prop() pText!: string;
        @Prop() pChecked!: boolean;
        @Prop() disabled!: boolean;

        // @ts-ignore
        name: string = 'name_' + this.parentId;
        text: string = '';
        checked: boolean = false;

        private created () {
            if (this.pText) {
                this.text = this.pText;
            }
            if (this.pChecked) {
                this.checked = this.pChecked;
            }
        }

        get value(): boolean {
            return this.checked;
        }
        set value(newValue: boolean) {
            this.checked = newValue;
        }

        changeValue() {
            //this.$emit('changed', this.checked);
            // @ts-ignore
            this.emitEvent('changed', this.checked);
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