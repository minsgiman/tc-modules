<template>
    <div class="tc_dropdown">
        <div class="drop_btn" :class="{isSelect: isDrop}" @click="itemDropToggle()"></div>
    </div>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Dropdown extends Base {
        dropId: string = '';
        position: string = '';
        btnWidth: number = 24;
        btnHeight: number = 24;
        isDrop: boolean = false;

        get value() {
            return this.isDrop;
        }
        set value(newValue: boolean) {
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

        get dropElementId() {
            return this.dropId;
        }
        set dropElementId(elId) {
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

        get dropPosition() {
            return this.position;
        }
        set dropPosition(position) {
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

        itemDropToggle() {
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