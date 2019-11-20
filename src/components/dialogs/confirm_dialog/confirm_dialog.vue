<template>
    <div class="confirm_dialog">
        <modal_dialog @close="onCloseDialog" :dlgStyle="dlgStyle" :noCloseBtn="noCloseBtn">
            <template slot="content">
                <div class="content_wrap" :class="{no_tit: !title}">
                    <h2 v-if="title">{{title}}</h2>
                    <p v-html="description"></p>
                    <div class="btn_wrap">
                        <button v-for="(btn, index) in btns" @click="btnClick(btn.name)">{{btn.text}}</button>
                    </div>
                </div>
            </template>
        </modal_dialog>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { modal_dialog } from './../../uikit';

    @Component({
        components: {
            modal_dialog
        }
    })
    export default class PlayerTipDialog extends Vue {
        @Prop() dlgStyle!: any;
        @Prop() title!: string;
        @Prop() description!: string;
        @Prop() btns!: [];
        @Prop() noCloseBtn!: boolean;

        private beforeDestroy() {
            this.$emit('event', {event: 'close'});
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        btnClick(name: string) {
            this.$emit('event', {event: 'btn-click', name});
        }

        onCloseDialog() {
            this.$destroy();
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    @import './../../uikit/common';

    .confirm_dialog {
        .content_wrap {
            text-align:left;
            p {
                font-size:16px;
                margin-top:30px;
                line-height:24px;
            }
            .btn_wrap {
                text-align:center;
                margin-top:24px;
                button {
                    height: 50px;
                    width: 150px;
                    font-size: 16px;
                    color: #fff;
                    background: #4b96e6;
                    border-radius: 25px;
                    margin: 0 5px;
                    &.blue {
                        color: #fff;
                        background: #4b96e6;
                    }
                }
            }

            &.no_tit {
                p {
                    text-align:center;
                    margin-top:32px;
                    height:49px;
                }
            }
        }
    }
</style>