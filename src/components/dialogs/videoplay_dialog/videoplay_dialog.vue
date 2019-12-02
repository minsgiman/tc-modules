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
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { modal_dialog } from './../../uikit';

    @Component({
        components: {
            modal_dialog
        }
    })
    export default class VideoPlayDialog extends Vue {
        @Prop() dlgStyle!: any;
        @Prop({ default: '' }) webmUrl!: string;
        @Prop({ default: '' }) mp4Url!: string;

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
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

    .video_modal_dialog {
        .video_cont {
            width: 100%;
            height: 100%;
            overflow:hidden;
            object-fit: contain;
        }
    }
</style>