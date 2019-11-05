<template>
    <div class="tc_search">
        <span class="search_box" :class="{focusable: design === 'search'}">
            <img v-if="design === 'search'" class="search_img" src="/resources/img/btn-title-shop-search-normal.svg">
            <input ref="searchInput" type="text" :placeholder="placeholder" @input="searchStrUpdate" :style="{width: design === 'search' ? '132px' : '154px'}">
            <img v-if="isShowDeleteBtn" @click="deleteSearchStr()" src="/resources/img/btn-input-text-delete.png">
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

        get value() {
            const sInput: any = this.$refs.searchInput;
            return sInput.value;
        }
        set value(newValue) {
            const sInput: any = this.$refs.searchInput;
            sInput.value = newValue;
            this.showDeleteBtn();
        }

        searchStrUpdate() {
            const sInput: any = this.$refs.searchInput;
            this.emitEvent('changed', sInput.value);
            this.showDeleteBtn();
        }

        deleteSearchStr() {
            const sInput: any = this.$refs.searchInput;
            sInput.value = '';
            this.emitEvent('changed', sInput.value);
            this.showDeleteBtn();
        }

        showDeleteBtn() {
            const sInput: any = this.$refs.searchInput;
            if (sInput.value) {
                this.isShowDeleteBtn = true;
            } else {
                this.isShowDeleteBtn = false;
            }
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
            width: 200px;
            height: 40px;
            margin: 0 auto;
            border: 1px solid #333333;
            &.focusable {
                border-color: #999999;
                &:focus-within {
                    border-color: #444444;
                }
            }
            input {
                width: 154px;
                height: 100%;
                margin-right:7px;
                cursor:pointer;
            }
            img {
                margin-top:3px;
                cursor:pointer;
                &.search_img {
                    float:left;
                    margin-top:8px;
                }
            }
        }
    }
</style>