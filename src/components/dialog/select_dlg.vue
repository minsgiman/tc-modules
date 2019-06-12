<template>
    <div class="select_dialog">
        <modal_dlg @close="fireEvent('close')" :dlgStyle="dlgStyle">
            <template slot="content">
                <div class="content_wrap">
                    <h2>{{title}}</h2>
                    <p v-html="message"></p>
                    <div class="btn_wrap">
                        <button class="cancel" @click="fireEvent('cancel')">{{cancelBtn ? cancelBtn : $t('BUTTON_CANCEL')}}</button>
                        <button class="confirm" @click="fireEvent('confirm')">{{confirmBtn ? confirmBtn : $t('BUTTON_CONFIRM')}}</button>
                    </div>
                </div>
            </template>
        </modal_dlg>
    </div>
</template>
<script>
    import modal_dlg from './modal_dlg';

    export default {
        props: ['title', 'message', 'confirmBtn', 'cancelBtn'],
        name: 'confirmDlg',
        data: function() {
            return {
                dlgStyle: {
                    width: '484px', height: 'auto', padding: '24px 30px', boxSizing: 'border-box'
                }
            }
        },
        created : function() {
        },
        beforeDestroy : function() {
            $(this.$el).detach();
        },
        methods: {
            fireEvent: function(type) {
                this.$emit('event', {event: type});
            }
        },
        components : {
            modal_dlg
        }
    }
</script>
<style lang="less">
    .select_dialog {
        .content_wrap {
            text-align:left;
            h2 {
                display:inline-block;
                font-size:20px;
                color:#333;
                line-height:22px;
                font-weight:400;
            }
            p {
                font-size:16px;
                word-break:break-all;
                color:#777;
                letter-spacing:-0.9px;
                margin-top:40px;
            }
            .btn_wrap {
                text-align:center;
                margin-top:44px;
                button {
                    height: 50px;
                    width: 150px;
                    font-size: 16px;
                    border-radius: 25px;
                    margin: 0 5px;
                    &.confirm {
                        color: #fff;
                        background: #4b96e6;
                    }
                    &.cancel {
                        color: #fff;
                        background: #777777;
                    }
                }
            }
        }
    }
</style>