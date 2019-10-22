<template>
    <div class="tc_search">
        <span class="search_box">
            <input ref="searchInput" type="text" :placeholder="placeholder" @input="searchStrUpdate">
            <img @click="deleteSearchStr()" src="/resources/img/btn-input-text-delete.png">
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
                }
            }
        },
        data: function() {
            return {
                placeholder: ''
            }
        },
        methods: {
            searchStrUpdate: function(event) {
                this.emitEvent('changed', this.$refs.searchInput.value);
            },
            deleteSearchStr: function() {
                this.$refs.searchInput.value = '';
                this.emitEvent('changed', this.$refs.searchInput.value);
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