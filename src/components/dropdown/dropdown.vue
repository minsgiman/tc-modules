<template>
    <div class="tc_dropdown">
        <div class="drop_btn" :class="{isSelect: isDrop}" @click="itemDropToggle()"></div>
    </div>
</template>
<script>
    export default {
        props: ['theme', 'position', 'dropElId'],
        name: 'dropdown',
        computed : {
        },
        data: function() {
            return {
                isDrop: false,
                btnWidth: 24,
                btnHeight: 24
            }
        },
        created : function() {
        },
        mounted : function() {
            this.$el.parentElement.style.position = 'relative';
            this.$el.parentElement.style.display = 'inline-block';
            const dropEl = document.getElementById(this.dropElId);
            if (dropEl) {
                dropEl.style.display = 'none';
                dropEl.style.position = 'absolute';
                dropEl.style.top = (this.btnHeight + 10) + 'px';
                if (this.position === 'left') {
                    dropEl.style.right = '0px';
                } else {
                    dropEl.style.left = '0px';
                }
            }
        },
        beforeDestroy : function() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods: {
            itemDropToggle: function() {
                this.isDrop = !this.isDrop;
                const dropEl = document.getElementById(this.dropElId);
                if (this.isDrop) {
                    dropEl.style.display = 'block';
                } else {
                    dropEl.style.display = 'none';
                }
                this.$emit('event', {event: 'changed', value: this.isDrop});
            },
            getValue: function() {
                return this.isDrop;
            },
            setValue: function(value) {
                this.isDrop = value;
                const dropEl = document.getElementById(this.dropElId);
                if (this.isDrop) {
                    dropEl.style.display = 'block';
                } else {
                    dropEl.style.display = 'none';
                }
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
    .tc_dropdown {
        .drop_btn {
            width: 24px;
            height: 24px;
            background: url(/resources/img/btn-title-shop-sorting-normal.png) no-repeat;
            cursor: pointer;
            margin-bottom: -3px;
            &.isSelect {
                background-image: url(/resources/img/btn-title-shop-sorting-select.png);
            }
        }
    }
</style>