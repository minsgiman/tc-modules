<template>
    <div class="tc_dropdown">
        <div class="drop_btn" :class="{isSelect: isDrop, isDisabled: !isActive}" @click="itemDropToggle()"></div>
    </div>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Dropdown extends Base {
        dropId: string = '';
        position: string = '';
        btnHeight: number = 24;
        isDrop: boolean = false;
        isActive: boolean = true;

        get value(): boolean {
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

        get active(): boolean {
            return this.isActive;
        }

        set active(newValue: boolean) {
            this.isActive = newValue;
        }

        get dropElementId(): string {
            return this.dropId;
        }

        set dropElementId(elId: string) {
            const el: any = this.$el;
            if (el.parentElement.parentElement) {
                el.parentElement.parentElement.style.position = 'relative';
                el.parentElement.parentElement.style.display = 'inline-block';
            }
            const dropEl: HTMLElement | null = document.getElementById(elId);
            if (dropEl) {
                dropEl.style.display = 'none';
                dropEl.style.position = 'absolute';
                dropEl.style.top = (this.btnHeight + 10) + 'px';
            }
            this.dropId = elId;
        }

        get dropPosition(): string {
            return this.position;
        }

        set dropPosition(position: string) {
            const dropEl: HTMLElement | null = document.getElementById(this.dropId);
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
            if (!this.isActive) {
                return;
            }

            this.isDrop = !this.isDrop;
            const dropEl: HTMLElement | null = document.getElementById(this.dropId);
            if (dropEl) {
                if (this.isDrop) {
                    dropEl.style.display = 'block';
                } else {
                    dropEl.style.display = 'none';
                }
            }
            // @ts-ignore
            this.emitEvent('changed', this.isDrop);
        }
    }
</script>
<style lang="less">
    .tc_dropdown {
        .drop_btn {
            width: 24px;
            height: 24px;
            background: url(/resources/img/btn-title-shop-sorting-normal.svg) no-repeat;
            cursor: pointer;
            margin-bottom: -3px;
            &.isSelect {
                background-image: url(/resources/img/btn-title-shop-sorting-select.svg);
            }
            &.isDisabled {
                background-image: url(/resources/img/btn-title-shop-sorting-disabeld.svg) !important;
            }
        }
    }
</style>