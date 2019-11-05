<template>
    <div class="tc_search">
        <span class="search_box" :class="{focusable: design === 'search'}">
            <img v-if="design === 'search'" class="search_img" src="/resources/img/btn-title-shop-search-normal.svg">
            <input ref="searchInput" type="text" :placeholder="placeholder" @input="searchStrUpdate" :style="{width: design === 'search' ? '132px' : '154px'}">
            <img v-if="isShowDeleteBtn" @click="deleteSearchStr()" src="/resources/img/btn-input-text-delete.png">
        </span>
    </div>
</template>
<script>
    import baseComponent from './../base';

    export default {
        extends: baseComponent,
        name: 'search',
        computed : {
            value: {
                get: function() {
                    return this.$refs.searchInput.value;
                },
                set: function(newValue) {
                    this.$refs.searchInput.value = newValue;
                    this.showDeleteBtn();
                }
            }
        },
        data: function() {
            return {
                placeholder: '',
                design: '',
                isShowDeleteBtn: false
            }
        },
        methods: {
            searchStrUpdate: function(event) {
                this.showDeleteBtn();
                this.emitEvent('changed', this.$refs.searchInput.value);
            },
            deleteSearchStr: function() {
                this.$refs.searchInput.value = '';
                this.showDeleteBtn();
                this.emitEvent('changed', this.$refs.searchInput.value);
            },
            showDeleteBtn: function() {
                if (this.$refs.searchInput.value) {
                    this.isShowDeleteBtn = true;
                } else {
                    this.isShowDeleteBtn = false;
                }
            }
        },
        components : {
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