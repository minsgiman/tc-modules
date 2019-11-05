<template>
    <div class="tc_search">
        <span class="search_box">
            <input ref="searchInput" type="text" :placeholder="placeholder" @input="searchStrUpdate">
            <img @click="deleteSearchStr()" src="/resources/img/btn-input-text-delete.png">
        </span>
    </div>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Search extends Base {
        placeholder: string = '';

        get value() {
            return this.$refs.searchInput.value;
        }
        set value(newValue) {
            this.$refs.searchInput.value = newValue;
        }

        searchStrUpdate() {
            const sInput: any = this.$refs.searchInput;
            this.emitEvent('changed', sInput.value);
        }

        deleteSearchStr() {
            const sInput: any = this.$refs.searchInput;
            sInput.value = '';
            this.emitEvent('changed', sInput.value);
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
            input {
                width: 154px;
                height: 100%;
                margin-right:7px;
                cursor:pointer;
            }
            img {
                margin-top:3px;
                cursor:pointer;
            }
        }
    }
</style>