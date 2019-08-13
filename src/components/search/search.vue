<template>
    <div class="tc_search">
        <span class="search_box">
            <input ref="searchInput" type="text" :placeholder="placeholder" @input="searchStrUpdate">
            <img @click="deleteSearchStr()" src="/resources/img/btn-input-text-delete.png">
        </span>
    </div>
</template>
<script>
    export default {
        props: ['theme', 'placeholder'],
        name: 'search',
        computed : {
        },
        data: function() {
            return {
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods: {
            searchStrUpdate: function(event) {
                this.$emit('event', {event: 'changed', value: event.currentTarget.value});
            },
            getValue: function() {
                return this.$refs.searchInput.value;
            },
            setValue: function(value) {
                this.$refs.searchInput.value = value;
                this.$emit('event', {event: 'changed', value: this.$refs.searchInput.value});
            },
            deleteSearchStr: function() {
                this.$refs.searchInput.value = '';
                this.$emit('event', {event: 'changed', value: this.$refs.searchInput.value});
            },
            destroy: function() {
                this.$destroy();
            }
        },
        components : {
        }
    }
</script>
<style lang="less">
    @import "./../comp_common";
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