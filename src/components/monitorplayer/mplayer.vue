<template>
    <div style="width:100%;height:100%;">
        <div :id="'remote_stream_' + camera.id" style="height:100%;" class="player_cam remoteStreams">
            <div :id="'remoteVideosContainer_' + camera.id" style="width:100%;height:100%;"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import videojs from 'video.js';
    import $ from 'jquery';

    //const $: any = (window as any).$ as any;

    @Component
    export default class MonitorHlsPlayer extends Vue {
        @Prop() camera!: any;

        hlsServer: string = 'https://devmedia010.toastcam.com:10099';
        hlsPlayer: any = null;
        hlsStatus: string = '';
        hlsStatusEnum: any = {
            EVENT_STREAM_CONNECTING : 'event_stream_connecting',
            EVENT_STREAM_CONNECTED : 'event_stream_connected',
            EVENT_STREAM_DISCONNECTED : 'event_stream_disconnected',
            EVENT_STREAM_STOPPED : 'event_stream_stopped'
        };

        private mounted() {
            $('#remote_stream_' + this.camera.id).show();
            this.play('xxx');
        }
        private beforeDestroy() {
            if (this.hlsPlayer) {
                this.hlsPlayer.dispose();
                this.hlsPlayer = null;
            }
        }

        play(url: string) {
            if (!this.camera.url) {
                return;
            }
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTING;
            if (!this.hlsPlayer) {
                const $video = $('<video/>', {
                    class: 'video-js',
                    id: 'my-player-' + this.camera.id,
                    muted: true
                });
                $('#remoteVideosContainer_' + this.camera.id).append($video);
                this.hlsPlayer = videojs('my-player-' + this.camera.id, {
                    controls: false,
                    errorDisplay: false,
                    preload: 'auto'
                });
            }

            const playUrl = this.hlsServer + '/mp4play?url=' + encodeURIComponent(url);
            this.hlsPlayer.src([
                { type: "video/mp4", src: this.camera.url } //"//vjs.zencdn.net/v/oceans.mp4"
            ]);
            this.hlsPlayer.on('ready', () => {
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTED;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                this.hlsPlayer.play();
            });
            this.hlsPlayer.on('error', () => {
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_DISCONNECTED;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
            });
        }

        stop() {
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_STOPPED;
            if (this.hlsPlayer) {
                this.hlsPlayer.dispose();
                this.hlsPlayer = null;
            }
        }

        getStatus() {
            return this.hlsStatus;
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>
<style lang="less">
    .video-js {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0px;
            top: 0px;
        video {
            object-fit:initial;
        }
    }
    .vjs-loading-spinner {
        display:none!important;
    }
</style>