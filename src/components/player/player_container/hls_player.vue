<template>
    <div id="hls_player_wrap" style="width:100%;height:100%;">
        <div style="display:none;" class="localStream">
            <video id="localVideo" muted="muted" autoplay="true"></video>
        </div>

        <div id="hls_remote_stream" style="display:none; height:100%;" class="player_cam remoteStreams">
            <!--img id="hls_logo" src="/resources/img/toast_cam_logo.png" style="position:absolute; left:12%; top:5%; width:75%; z-index:1;"-->
            <img v-show="showLoading" id="hls_loading" src="/resources/img/progress_rolling_white.svg" style="position:absolute; left:47%; top:33%; z-index:1; width:55px;">
            <div id="remoteHLSContainer" style="width:100%;height:100%;"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../../service/player/store';
    import Hls from 'hls.js';

    const $: any = (window as any).$ as any;

    function getCookie (cName: string) {
        cName = cName + '=';
        var cookieData = document.cookie;
        var start = cookieData.indexOf(cName);
        var cValue = '';
        if(start != -1){
            start += cName.length;
            var end = cookieData.indexOf(';', start);
            if(end == -1)end = cookieData.length;
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
    }

    @Component
    export default class HlsPlayer extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get browserInfo() {
            return store.state.browserInfo;
        }
        get currentTime() {
            return store.state.currentTime;
        }
        get isLive() {
            return store.state.isLive;
        }
        get isMute() {
            return store.state.mute;
        }
        pausedTime: number = 0;
        loadCheckInterval: any = null;
        showLoading: boolean = false;
        hlsPlayer: any = null;
        videoObj: any = null;
        hlsStatus: string = '';
        hlsStatusEnum: any = {
            EVENT_STREAM_CONNECTING : 'event_stream_connecting',
            EVENT_STREAM_CONNECTED : 'event_stream_connected',
            EVENT_STREAM_DISCONNECTED : 'event_stream_disconnected',
            EVENT_STREAM_STOPPED : 'event_stream_stopped',
            EVENT_STREAM_SUSPEND : 'event_stream_suspend'
        };

        private mounted() {
            $('#player').hide();
            $('#hls_remote_stream').show();
        }
        private beforeDestroy() {
            if (this.hlsPlayer) {
                this.hlsPlayer.destroy();
                this.hlsPlayer = null;
            }
            clearInterval(this.loadCheckInterval);
            $('#hls_player_wrap').hide();
        }

        play(cameraIdValue: string, url: string, serverUrls: string[]) {
            let isResume: boolean = false;

            this.showLoading = true;
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTING;
            if (!this.hlsPlayer) {
                const options: any = {
                    class: 'video-js',
                    id: 'my-player'
                };
                if (this.isMute) {
                    options.muted = true;
                }
                const $video = $('<video/>', options);
                $('#remoteHLSContainer').append($video);
                this.videoObj = $video[0];
                this.hlsPlayer = new Hls();
                this.hlsPlayer.attachMedia(this.videoObj);
                /*
                this.hlsPlayer = videojs('my-player', {
                    controls: false,
                    errorDisplay: false,
                    preload: 'auto'
                });
                 */
                this.updatePlayerSize();
            }

            if (!this.isLive && this.videoObj.paused() && this.pausedTime === this.currentTime.valueOf()) {
                isResume = true;
            }

            this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                this.showLoading = false;
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTED;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                console.log('Hls.Events.MANIFEST_PARSED');
                this.videoObj.play();
            });

            //clearInterval(this.loadCheckInterval);
            if (!isResume) {
                if (serverUrls && serverUrls.length) {
                    const playUrl = 'https://' + serverUrls[0] + '/hlsplay?url=' + encodeURIComponent(url);
                    store.dispatch('HLS_PLAY_URL_CHANGE', playUrl);
                    this.hlsPlayer.loadSource(playUrl);
                    // this.hlsPlayer.src([
                    //     { type: "application/x-mpegURL", src: playUrl }
                    // ]);
                } else {
                    this.showLoading = true;
                    this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_DISCONNECTED;
                    this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                    return;
                }
            }

            /*
            this.loadCheckInterval = setInterval(() => {
                if (this.videoObj && this.videoObj.duration()) {
                    clearInterval(this.loadCheckInterval);
                    this.showLoading = false;
                    this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTED;
                    this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                    this.hlsPlayer.play();
                }
            }, 200);
             */

            this.videoObj.on('canplay', () => {
                console.log('canplay');
            });
            this.videoObj.on('ended', () => {
                clearInterval(this.loadCheckInterval);
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_SUSPEND;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                console.log('ended');
            });
            this.videoObj.on('playing', () => {
                console.log('playing');
            });
            this.videoObj.on('loadeddata', () => {
                console.log('loadeddata');
            });
            this.videoObj.on('stalled', () => {
                console.log('stalled');
            });
            this.videoObj.on('suspend', () => {
                clearInterval(this.loadCheckInterval);
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_SUSPEND;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                console.log('suspend');
            });
            this.videoObj.on('abort', () => {
                console.log('abort');
            });
            this.videoObj.on('error', () => {
                console.log('error');
                //$('#hls_logo').show();
                clearInterval(this.loadCheckInterval);
                this.showLoading = true;
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_DISCONNECTED;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
            });
        }

        updatePlayerSize() {
            const pWidth = $("#player").width(),
                pHeight = $("#player").height() + 5;

            $('#my-player').css('width', '100%');
            $('#my-player').css('height', pHeight);
            store.dispatch('PLAYER_SIZE_CHANGE', {width: pWidth, height: pHeight});
        }

        transformChange(value: string) {
            if (!this.videoObj) {
                return;
            }
            //this.videoObj.children()[0].style['transform'] = value;
        }

        mute() {
            const videoEl: HTMLVideoElement | null = document.querySelector('#my-player video');
            if (videoEl) {
                videoEl.muted = !videoEl.muted;
            }
        }

        resume() {
            if (this.videoObj) {
                this.videoObj.play();
            }
        }

        close() {
            return;
        }

        pause() {
            if (this.videoObj) {
                this.pausedTime = this.currentTime.valueOf();
                this.videoObj.pause();
            }
        }

        stop() {
            clearInterval(this.loadCheckInterval);
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_STOPPED;
            this.showLoading = false;
            if (this.hlsPlayer) {
                this.hlsPlayer.destroy();
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
    .vjs-loading-spinner {
        display:none!important;
    }
</style>