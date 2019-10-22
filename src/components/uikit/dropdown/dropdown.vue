<template>
    <div class="tc_dropdown">
        <div class="drop_btn" :class="{isSelect: isDrop}" @click="itemDropToggle()"></div>
    </div>
</template>
<script>
    import baseComponent from './../base';

    export default {
        extends: baseComponent,
        name: 'dropdown',
        computed : {
            value: {
                get: function() {
                    return this.isDrop;
                },
                set: function(newValue) {
                    this.isDrop = newValue;
                    const dropEl = document.getElementById(this.dropId);
                    if (dropEl) {
                        if (this.isDrop) {
                            dropEl.style.display = 'block';
                        } else {
                            dropEl.style.display = 'none';
                        }
                    }
                }
            },
            dropElementId: {
                get: function() {
                    return this.dropId;
                },
                set: function(elId) {
                    if (this.$el.parentElement.parentElement) {
                        this.$el.parentElement.parentElement.style.position = 'relative';
                        this.$el.parentElement.parentElement.style.display = 'inline-block';
                    }
                    const dropEl = document.getElementById(elId);
                    if (dropEl) {
                        dropEl.style.display = 'none';
                        dropEl.style.position = 'absolute';
                        dropEl.style.top = (this.btnHeight + 10) + 'px';
                    }
                    this.dropId = elId;
                }
            },
            dropPosition: {
                get: function() {
                    return this.position;
                },
                set: function(position) {
                    const dropEl = document.getElementById(this.dropId);
                    if (dropEl) {
                        if (position === 'left') {
                            dropEl.style.right = '0px';
                        } else {
                            dropEl.style.left = '0px';
                        }
                    }
                    this.position = position;
                }
            }
        },
        data: function() {
            return {
                dropId: '',
                position: '',
                btnWidth: 24,
                btnHeight: 24,
                isDrop: false
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        methods: {
            itemDropToggle: function() {
                this.isDrop = !this.isDrop;
                const dropEl = document.getElementById(this.dropId);
                if (dropEl) {
                    if (this.isDrop) {
                        dropEl.style.display = 'block';
                    } else {
                        dropEl.style.display = 'none';
                    }
                }
                this.emitEvent('changed', this.isDrop);
            }
        }
    }
</script>
<style lang="less">
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