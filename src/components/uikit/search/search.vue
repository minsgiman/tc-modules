<template>
    <div class="tc_search">
        <span class="search_box" :class="{focusable: design === 'search', focused: focused, disabled: !isActive}" :style="boxStyle">
            <span class="search_img">
                <img v-if="design === 'search'" :src="isActive ? '/resources/img/btn-title-shop-search-icon.svg' : '/resources/img/btn-title-shop-search-disabled.svg'">
                <span class="dummy_full"></span>
            </span>
            <input ref="searchInput" type="search" autocomplete="new-password" :placeholder="placeholder" :disabled="!isActive"
                   @focus="onFocus" @blur="onBlur" @input="searchStrUpdate" :style="{width: 'calc(100% - 70px)'}">
            <span class="delete_img">
                <img v-if="isShowDeleteBtn" @click="deleteSearchStr()" src="/resources/img/btn-input-text-delete.svg">
                <span class="dummy_full"></span>
            </span>
        </span>
    </div>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Search extends Base {
        placeholder: string = '';
        design: string = '';
        boxStyle: any = {};
        isShowDeleteBtn: boolean = false;
        focused: boolean = false;
        isActive: boolean = true;

        get value(): string {
            const sInput = this.$refs.searchInput as HTMLInputElement;
            return sInput.value;
        }
        set value(newValue: string) {
            const sInput: any = this.$refs.searchInput as HTMLInputElement;
            sInput.value = newValue;
            this.showDeleteBtn();
        }

        get active(): boolean {
            return this.isActive;
        }

        set active(newValue: boolean) {
            this.isActive = newValue;
        }

        setFocus() {
            (this.$refs.searchInput as HTMLInputElement).focus();
        }

        onFocus() {
            this.focused = true;
        }

        onBlur() {
            this.focused = false;
        }

        searchStrUpdate() {
            const sInput: any = this.$refs.searchInput as HTMLInputElement;
            // @ts-ignore
            this.emitEvent('changed', sInput.value);
            this.showDeleteBtn();
        }

        deleteSearchStr() {
            const sInput: any = this.$refs.searchInput as HTMLInputElement;
            sInput.value = '';
            // @ts-ignore
            this.emitEvent('changed', sInput.value);
            this.showDeleteBtn();
        }

        showDeleteBtn() {
            const sInput: any = this.$refs.searchInput as HTMLInputElement;
            this.isShowDeleteBtn = !!sInput.value;
        }
    }
</script>
<style lang="less">
    .tc_search {
        .search_box {
            display: block;
            position: relative;
            box-sizing: border-box;
            padding: 0 5px;
            background: #fff;
            width: 220px;
            height: 40px;
            margin: 0 auto;
            border: 1px solid #333333;
            &.focusable {
                padding-left: 0;
                border-color: #999999;
                &:focus-within {
                    border-color: #444444;
                }
            }
            &.disabled {
                border: 1px solid #e0e0e0 !important;
                background: #ffffff !important;
                color: #b2b2b2 !important;
            }

            input[type=search]::-ms-clear {  display: none; width : 0; height: 0; }
            input[type=search]::-ms-reveal {  display: none; width : 0; height: 0; }
            input[type="search"]::-webkit-search-decoration,
            input[type="search"]::-webkit-search-cancel-button,
            input[type="search"]::-webkit-search-results-button,
            input[type="search"]::-webkit-search-results-decoration {
                -webkit-appearance:none;
            }

            input {
                width: 154px;
                height: 100%;
                line-height: 100%;
                margin-right:7px;
                vertical-align: middle;
                cursor:pointer;
            }
            .search_img {
                display: inline-block;
                float: left;
                height: 100%;
                margin-left: 5px;
            }
            .delete_img {
                display: inline-block;
                float: right;
                height: 100%;
            }
            .dummy_full {
                display: inline-block;
                height: 100%;
                width: 1px;
                vertical-align: middle;
            }
            img {
                cursor:pointer;
                vertical-align: middle;
            }
        }
    }
</style>