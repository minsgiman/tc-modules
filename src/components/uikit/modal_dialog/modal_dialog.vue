<template>
    <div class="modal_dialog_cont">
        <div class="dlg_wrap">
            <div class="content" :style="dlgStyle">
                <slot name="content"></slot>
                <button v-show="!noCloseBtn" class="btn_close" @click="closeDialog"></button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import { Component, Prop } from 'vue-property-decorator';

    @Component
    export default class ModalDialog extends Vue {
        @Prop() dlgStyle: any;
        @Prop() noCloseBtn!: boolean;

        private created() {
            document.body.className = 'blockScroll';
        }

        private destroyed() {
            if (!this.checkIsDlgOpened()) {
                document.body.className = '';
            }
        }

        private checkIsDlgOpened(): boolean {
            const modalDlgConts = document.getElementsByClassName('modal_dialog_cont'),
                modalDlgs = document.getElementsByClassName('modal_dlg');
            let i, len, modalEls: any[] = [];

            len = modalDlgs.length;
            for (i = 0; i < len; i+=1) {
                if (modalDlgs[i]) {
                    modalEls.push(modalDlgs[i]);
                }
            }
            len = modalDlgConts.length;
            for (i = 0; i < len; i+=1) {
                if (modalDlgConts[i]) {
                    modalEls.push(modalDlgConts[i]);
                }
            }
            return modalEls.some((el: HTMLElement) => {
                return this.isVisible(el);
            });
        }

        private isVisible(el: HTMLElement): boolean {
            if (!el) {
                return false;
            }
            const $style = window.getComputedStyle(el, null);
            if (!$style || $style.display === 'none' || $style.visibility === 'hidden') {
                return false;
            } else {
                return true;
            }
        }

        closeDialog() {
            this.$emit('close');
        }
    }
</script>
<style lang="less">
    body.blockScroll {overflow:hidden;}
    .modal_dialog_cont {
        position: fixed;
        display: table;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.6);
        z-index: 999;
        .dlg_wrap {
            display:table-cell;
            text-align:center;
            vertical-align:middle;
            width:100%;
            height:100%;
            .content {
                max-height:100vh;
                position:relative;
                background-color:#fff;
                padding:0px;
                margin: 0 auto;
            }
            .btn_close {
                position:absolute;
                right:24px;
                top:23px;
                background:url(/resources/img/btn-close-alert.png) no-repeat;
                width:20px; height:20px
            }
        }
    }
</style>