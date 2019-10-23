<template>
    <div class="video_modal_dialog">
        <modal_dialog @close="onCloseDialog" :dlgStyle="dlgStyle">
            <template slot="content">
                <div class="video_area is_layer">
                    <video class="video_cont" controls="" controlslist="nodownload" autoplay="" loop="" poster="">
                        <source :src="webmUrl" type="video/webm">
                        <source :src="mp4Url" type="video/mp4">
                    </video>
                </div>
            </template>
        </modal_dialog>
    </div>
</template>
<script>
    import modal_dialog from './../uikit/modal_dialog';

    export default {
        props: ['dlgStyle', 'webmUrl', 'mp4Url'],
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

    .video_modal_dialog {
        .video_cont {
            width: 100%;
            height: 100%;
            overflow:hidden;
            object-fit: contain;
        }
    }
</style>