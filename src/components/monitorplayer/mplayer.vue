<template>
    <div class="monitor_player" style="position:relative; width:100%;height:100%;">
        <div :id="'remote_stream_' + cameraId" style="height:100%;" class="player_cam remoteStreams">
            <div :id="'remoteVideosContainer_' + cameraId" style="width:100%;height:100%;"></div>
        </div>
        <div class="label_wrap">
            <span class="cam_label">{{cameraConfig ? cameraConfig.labelName : ''}}</span>
            <img class="share_icon" v-if="shareStatus" src="/resources/img/ic-cctv-share.png">
        </div>
        <div class="event_marker" v-if="cameraConfig && cameraConfig.motionTimestamp">
            <img src="/resources/img/ic-cctv-motion.png">
        </div>
        <div class="error_wrap" v-if="cameraErrorStatus !== 'status_normal'">
            <img class="error_img" src="/resources/img/ic-camera-disconnected.png">
            <div class="error_text">{{cameraErrorText}}</div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import videojs from 'video.js';
    import $ from 'jquery';
    import { ICameraInfo } from './interface';
    //const $: any = (window as any).$ as any;

    @Component
    export default class MonitorHlsPlayer extends Vue {
        @Prop() camera!: ICameraInfo;
        @Prop() serverUrl!: string;
        @Prop() commonToken!: string;

        cameraConfig: ICameraInfo | null = null;
        hlsPlayer: any = null;
        hlsStatus: string = '';
        hlsStatusEnum: any = {
            EVENT_STREAM_CONNECTING : 'event_stream_connecting',
            EVENT_STREAM_CONNECTED : 'event_stream_connected',
            EVENT_STREAM_DISCONNECTED : 'event_stream_disconnected',
            EVENT_STREAM_STOPPED : 'event_stream_stopped'
        };

        get cameraId(): string {
            return this.cameraConfig ? this.cameraConfig.cameraId : '';
        }

        get cameraErrorStatus(): string {
            if (this.cameraConfig) {
                if (this.cameraConfig.streamStatusConfig === 'off' && this.cameraConfig.controlStatus === 'on' && this.cameraConfig.streamStatus === 'off') {
                    return 'status_off';
                } else if (this.cameraConfig.recordType !== 'event' && this.cameraConfig.streamStatusConfig === 'on' &&
                    this.cameraConfig.controlStatus === 'on' && this.cameraConfig.streamStatus === 'off') {
                    return 'status_delay';
                } else if (this.cameraConfig.controlStatus !== 'on') {
                    return 'status_disconnect';
                } else {
                    return 'status_normal';
                }
            }
            return 'status_normal';
        }

        get cameraErrorText(): string {
            if (this.cameraErrorStatus === 'status_off') {
                return '카메라 꺼짐'; // '録画OFF'
            } else if (this.cameraErrorStatus === 'status_delay') {
                return '녹화 지연'; // '録画の遅延'
            } else {
                return '접속 끊김'; // '接続切れ'
            }
        }

        get shareStatus(): boolean {
            if (this.cameraConfig) {
                return this.cameraConfig.categoryList.some((category: string) => {
                    return category.indexOf('share') !== -1;
                });
            } else {
                return false;
            }
        }

        private created() {
            this.cameraConfig = this.camera ? this.camera : null;
        }

        private mounted() {
            this.play();
        }
        private beforeDestroy() {
            if (this.hlsPlayer) {
                this.hlsPlayer.dispose();
                this.hlsPlayer = null;
            }
        }

        play() {
            if (!this.cameraConfig || !this.cameraId || !this.serverUrl || !this.commonToken) {
                return;
            }
            const playUrl: string = this.serverUrl + '/mp4play?url=' + encodeURIComponent(this.cameraConfig.streamServer + '/flvplayback/' + this.cameraId + '?token=' + this.commonToken);

            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTING;
            if (!this.hlsPlayer) {
                const $video = $('<video/>', {
                    class: 'video-js',
                    id: 'my-player-' + this.cameraId,
                    muted: true
                });
                $('#remoteVideosContainer_' + this.cameraId).append($video);
                this.hlsPlayer = videojs('my-player-' + this.cameraId, {
                    controls: false,
                    errorDisplay: false,
                    preload: 'auto'
                });
            }
            this.hlsPlayer.src([
                { type: "video/mp4", src: playUrl }
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

        updateCameraConfig(camera: ICameraInfo) {
            if (camera) {
                this.cameraConfig = camera;
            }
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
    .monitor_player {
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
        .label_wrap {
            position: absolute;
            bottom: 10px;
            left: 10px;
            img {
                width: 27px;
                height: 28px;
            }
        }
        .event_marker {
            position: absolute;
            bottom: 50px;
            left: 10px;
            img {
                width: 42px;
                height: 42px;
            }
        }
        .error_wrap {
            position: absolute;
            left: 47%;
            top: 45%;
            img {
                width: 60px;
                height: 53px;
            }
        }
    }

</style>