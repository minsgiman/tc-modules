<template>
    <div class="tc_search">
        <span class="search_box" :class="{focusable: design === 'search'}">
            <img v-if="design === 'search'" class="search_img" src="/resources/img/btn-title-shop-search-small.svg">
            <input ref="searchInput" type="search" autocomplete="new-password" :placeholder="placeholder" @input="searchStrUpdate" :style="{width: design === 'search' ? '152px' : '176px'}">
            <img v-if="isShowDeleteBtn" class="delete_img" @click="deleteSearchStr()" src="/resources/img/btn-input-text-delete.svg">
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
        isShowDeleteBtn: boolean = false;

        get value(): string {
            const sInput = this.$refs.searchInput as HTMLInputElement;
            return sInput.value;
        }
        set value(newValue: string) {
            const sInput: any = this.$refs.searchInput as HTMLInputElement;
            sInput.value = newValue;
            this.showDeleteBtn();
        }

        setFocus() {
            (this.$refs.searchInput as HTMLInputElement).focus();
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
                margin-right:7px;
                cursor:pointer;
            }
            img {
                cursor:pointer;
                &.search_img {
                    float:left;
                }
                &.delete_img {
                    margin-top:11px;
                }
            }
        }
    }
</style>