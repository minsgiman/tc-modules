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
            if (!document.getElementsByClassName('modal_dialog_cont').length && !document.getElementsByClassName('modal_dlg').length) {
                document.body.className = '';
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