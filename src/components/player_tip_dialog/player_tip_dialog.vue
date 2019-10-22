<template>
    <div class="player_tip_dialog">
        <modal_dialog @close="onCloseDialog" :dlgStyle="dlgStyle">
            <template slot="content">
                <div class="tip_area is_layer">
                    <h4>{{txtMap.title}}</h4>
                    <img class="tip_img" src="/resources/img/img-player-guide.jpg">
                    <div class="tip_key_fb">
                        <img src="/resources/img/img-guide-key-fb.png">
                        <span v-html="txtMap.guideKeyFb"></span>
                    </div>
                    <div class="tip_space">
                        <img src="/resources/img/img-guide-key-space.png">
                        <span>{{txtMap.guideKeySpace}}</span>
                    </div>
                    <button @click="destroy" class="confirm_btn">{{txtMap.confirm}}</button>
                </div>
            </template>
        </modal_dialog>
    </div>
</template>
<script>
    import modal_dialog from './../uikit/modal_dialog';

    export default {
        props: ['dlgStyle', 'txtMap'],
        created : function () {
        },
        beforeDestroy : function() {
            this.$emit('event', {event: 'close'});
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods: {
            onCloseDialog: function() {
                this.$destroy();
            },
            destroy: function() {
                this.$destroy();
            }
        },
        components : {
            modal_dialog
        }
    }
</script>
<style lang="less">
    @import './../uikit/common';

    .tip_area h4 {
        font-size:20px; color:#262626; text-align:left; margin-bottom:22px;
    }
    .tip_area h4 img {
        margin: 1px 8px 0 0;
    }
    .tip_area .tip_img {
        margin-bottom:20px;
    }
    .tip_area .tip_btn_wrap {
        border-bottom: 1px solid #d8d8d8; padding-bottom:6px; text-align:left;
    }
    .tip_area .tip_btn_wrap .tip_btn_cont_wrap {
        display: inline-block;
        width: 196px;
        text-align: left;
        margin-bottom: 14px;
    }
    .tip_area .tip_btn_wrap .tip_btn_cont_wrap:lang(ja) {
        width:200px;
    }
    .tip_area .tip_btn_wrap .tip_txt {
        font-size:14px; color:#262626; display:inline-block; padding:11px 0 0 12px;
    }
    .tip_area .tip_btn_wrap .tip_txt:lang(ja) {
        padding-left:6px; font-size:11px;
    }
    .tip_area .tip_key_fb {
        border-bottom: 1px solid #d8d8d8; padding-bottom:13px; text-align:left;
    }
    .tip_area .tip_key_fb span {
        display: inline-block; line-height:18px; padding: 10px 0 0 6px;
    }
    .tip_area .tip_key_fb span:lang(ja) {
        font-size:11px;
    }
    .tip_area .tip_space {
        border-bottom: 1px solid #d8d8d8; margin-top:13px; padding-bottom:13px; text-align:left; margin-bottom:36px;
    }
    .tip_area .tip_space span {
        display: inline-block; padding: 20px 0 0 6px;
    }
    .tip_area .confirm_btn {
        width:150px; height:50px; border-radius:25px; background-color:#4b96e6; color:#ffffff; font-size:16px;
    }
    .play_tips_icon {
        position:absolute; width:40px; height:40px; right:12px; top:9px; background:url(/resources/img/btn-player-tips.png) no-repeat; background-position:center; z-index:9999; cursor:pointer;
    }
    .play_tips_icon:hover {background-color:rgba(0,0,0,0.2); border-radius:40px;}

</style>