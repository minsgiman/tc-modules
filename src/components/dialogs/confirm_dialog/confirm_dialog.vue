<template>
    <div class="confirm_dialog">
        <modal_dialog @close="onCloseDialog" :dlgStyle="dlgStyle" :noCloseBtn="noCloseBtn">
            <template slot="content">
                <div class="content_wrap">
                    <div v-if="theme === 'normal'" class="normal" :class="{no_tit: !title}">
                        <h2 v-if="title" v-html="title"></h2>
                        <p v-html="description"></p>
                    </div>
                    <div v-if="theme === 'checker'" class="checker">
                        <h2 v-if="title" v-html="title"></h2>
                        <p v-html="description"></p>
                    </div>
                    <div class="btn_wrap">
                        <button v-for="(btn, index) in btns" :class="btn.class" @click="btnClick(btn.name)">{{btn.text}}</button>
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
        @Prop({default: 'normal'}) theme!: string;
        @Prop() noCloseBtn!: boolean;

        private beforeDestroy() {
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
            h2 {
                font-size:20px;
                color:#333;
                line-height:26px;
                font-weight:400;
            }
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
                    &.white {
                        border: 1px solid #d5d5d5;
                        color: #555555;
                        background: #fff;
                    }
                }
            }
            .normal {
                p {
                    color: #777;
                    font-size: 14px;
                }
                &.no_tit {
                    p {
                        color:#333;
                        font-size:16px;
                        text-align:center;
                        margin-top:32px;
                        height:49px;
                    }
                }
            }
            .checker {
                text-align:center;
                p {
                    color: #4a96e6;
                    font-size: 16px;
                    margin-top: 16px;
                    padding-bottom: 6px;
                }
            }
        }
    }
</style>