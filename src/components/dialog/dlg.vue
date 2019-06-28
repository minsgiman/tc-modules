<template>
    <div class="tc_dlg">
        <modal_dlg @close="fireEvent('close')" :dlgStyle="dlgStyle">
            <template slot="content">
                <div class="content_wrap">
                    <header v-html="header"></header>
                    <div class="contents" v-html="contents"></div>
                    <footer v-html="footer"></footer>
                    <div ng-show="btns" class="btn_wrap">
                        <button v-for="(item, index) in btns" @click="fireEvent(item.id)" :class="item.type">{{item.name}}</button>
                    </div>
                </div>
            </template>
        </modal_dlg>
    </div>
</template>
<script>
    import modal_dlg from './modal_dlg';
    import dlgManager from './dlg_manager';

    export default {
        props: ['theme', 'header', 'contents', 'footer', 'btn'],
        name: 'confirmDlg',
        computed : {
            btns: function () {
                return (this.btn && this.btn.items && this.btn.items.length) ? this.btn.items : null;
            }
        },
        data: function() {
            return {
                dlgStyle: {
                    width: '484px', height: 'auto', padding: '24px 30px', boxSizing: 'border-box'
                }
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
            fireEvent: function(type) {
                this.$emit('event', {event: type});
            },
            destroy: function() {
                dlgManager.destroyDlg(this._uid);
            }
        },
        components : {
            modal_dlg
        }
    }
</script>
<style lang="less">
    .tc_dlg {
        .content_wrap {
            text-align:left;
            header {
                display:inline-block;
                font-size:20px;
                color:#333;
                line-height:22px;
                font-weight:400;
            }
            .contents {
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
                    overflow:visible;
                    border:0;
                    cursor:pointer;
                    outline:none;
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