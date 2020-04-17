<template>
    <div class="monitor_player" :class="{
        dimension1: dimension === 1, dimension2: dimension === 2, dimension3: dimension === 3,
        dimension4: dimension === 4, dimension5: dimension === 5, dimension6: dimension === 6
    }">
        <div :id="'remote_stream_' + cameraId" style="height:100%;" class="player_cam remoteStreams">
            <div :id="'remoteVideosContainer_' + cameraId" style="width:100%;height:100%;"></div>
        </div>
        <div class="label_wrap">
            <span class="cam_name_label">{{cameraConfig ? cameraConfig.labelName : ''}}</span>
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
        @Prop() dimension!: number;

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
            if (this.cameraConfig && this.cameraConfig.categoryList) {
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
            if (!this.cameraConfig || !this.cameraId || !this.serverUrl || !this.commonToken || this.cameraErrorStatus === 'status_off' || this.cameraErrorStatus === 'status_disconnect') {
                return;
            }
            const playUrl: string = this.serverUrl + '/mp4play?url=' + encodeURIComponent(this.cameraConfig.streamServer + '/flvplayback/' + this.cameraId + '?token=' + this.commonToken);
            this.stop();
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTING;
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
        position:relative;
        width:100%;
        height:100%;
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
            .cam_name_label {
                text-shadow: 0.7px 0.7px 7px rgba(0, 0, 0, 0.77);
                font-weight: bold;
            }
            .share_icon {
                margin-left: 5px;
                margin-bottom: -3px;
            }
        }
        .event_marker {
            position: absolute;
        }
        .error_wrap {
            position: absolute;
            left: 47%;
            top: 40%;
            text-align: center;
            .error_text {
                color: #b4b4b4;
                font-weight: 300;
                margin-top: 20px;
            }
        }
        &.dimension1 {
            .label_wrap {
                bottom: 27px; left: 25px;
                .cam_name_label {
                    font-size: 21px;
                }
                .share_icon {
                    width: 30px; height: 31px;
                }
            }
            .event_marker {
                bottom: 58px; left: 20px;
                img {
                    width: 44px; height: 44px;
                }
            }
            .error_wrap {
                img {
                    width: 64px; height: 58px;
                }
                .error_text {
                    font-size: 22px;
                }
            }
        }
        &.dimension2 {
            .label_wrap {
                bottom: 25px; left: 22px;
                .cam_name_label {
                    font-size: 19px;
                }
                .share_icon {
                    width: 27px; height: 28px;
                }
            }
            .event_marker {
                bottom: 52px; left: 16px;
                img {
                    width: 42px; height: 42px;
                }
            }
            .error_wrap {
                img {
                    width: 60px; height: 53px;
                }
                .error_text {
                    font-size: 20px;
                }
            }
        }
        &.dimension3 {
            .label_wrap {
                bottom: 22px; left: 22px;
                .cam_name_label {
                    font-size: 17px;
                }
                .share_icon {
                    width: 25px; height: 26px;
                }
            }
            .event_marker {
                bottom: 46px; left: 20px;
                img {
                    width: 40px; height: 40px;
                }
            }
            .error_wrap {
                left: 45%; top: 36%;
                img {
                    width: 54px; height: 48px;
                }
                .error_text {
                    font-size: 18px;
                }
            }
        }
        &.dimension4 {
            .label_wrap {
                bottom: 18px; left: 20px;
                .cam_name_label {
                    font-size: 16px;
                }
                .share_icon {
                    width: 22px; height: 23px;
                }
            }
            .event_marker {
                bottom: 42px; left: 19px;
                img {
                    width: 34px; height: 34px;
                }
            }
            .error_wrap {
                left: 43%; top: 32%;
                img {
                    width: 42px; height: 39px;
                }
                .error_text {
                    font-size: 16px;
                    margin-top: 11px;
                }
            }
        }
        &.dimension5 {
            .label_wrap {
                bottom: 16px; left: 18px;
                .cam_name_label {
                    font-size: 15px;
                }
                .share_icon {
                    width: 21px; height: 22px;
                }
            }
            .event_marker {
                bottom: 36px; left: 16px;
                img {
                    width: 30px; height: 30px;
                }
            }
            .error_wrap {
                left: 42%; top: 29%;
                img {
                    width: 34px; height: 32px;
                }
                .error_text {
                    font-size: 15px;
                    margin-top: 10px;
                }
            }
        }
        &.dimension6 {
            .label_wrap {
                bottom: 14px; left: 17px;
                .cam_name_label {
                    font-size: 14px;
                }
                .share_icon {
                    width: 20px; height: 21px;
                }
            }
            .event_marker {
                bottom: 35px; left: 14px;
                img {
                    width: 28px; height: 28px;
                }
            }
            .error_wrap {
                left: 42%; top: 29%;
                img {
                    width: 30px; height: 28px;
                }
                .error_text {
                    font-size: 14px;
                    margin-top: 5px;
                }
            }
        }
    }

</style>