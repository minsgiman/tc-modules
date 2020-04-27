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
    import videojs from 'video.js';

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
        pausedTime: number = 0;
        loadCheckInterval: any = null;
        showLoading: boolean = false;
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
            $('#player').hide();
            $('#hls_remote_stream').show();
        }
        private beforeDestroy() {
            if (this.hlsPlayer) {
                this.hlsPlayer.dispose();
                this.hlsPlayer = null;
            }
            clearInterval(this.loadCheckInterval);
            $('#hls_player_wrap').hide();
        }

        play(cameraIdValue: string, url: string) {
            let isResume: boolean = false;

            this.showLoading = true;
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTING;
            if (!this.hlsPlayer) {
                const $video = $('<video/>', {
                    class: 'video-js',
                    id: 'my-player'
                });
                $('#remoteHLSContainer').append($video);
                this.hlsPlayer = videojs('my-player', {
                    controls: false,
                    errorDisplay: false,
                    preload: 'auto'
                });
                this.updatePlayerSize();
            }

            if (!this.isLive && this.hlsPlayer.paused() && this.pausedTime === this.currentTime.valueOf()) {
                isResume = true;
            }

            if (!isResume) {
                const playUrl = this.hlsServer + '/mp4play?url=' + encodeURIComponent(url);
                store.dispatch('HLS_PLAY_URL_CHANGE', playUrl);
                this.hlsPlayer.src([
                    { type: "video/mp4", src: playUrl }
                ]);
            }

            clearInterval(this.loadCheckInterval);
            this.loadCheckInterval = setInterval(() => {
                if (this.hlsPlayer.duration()) {
                    clearInterval(this.loadCheckInterval);
                    this.showLoading = false;
                    this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTED;
                    this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                    this.hlsPlayer.play();
                }
            }, 200);

            this.hlsPlayer.on('canplay', () => {
                console.log('canplay');
            });
            this.hlsPlayer.on('ended', () => {
                console.log('ended');
            });
            this.hlsPlayer.on('playing', () => {
                console.log('playing');
            });
            this.hlsPlayer.on('loadeddata', () => {
                console.log('loadeddata');
            });
            this.hlsPlayer.on('progress', () => {
                console.log('progress');
            });
            this.hlsPlayer.on('stalled', () => {
                console.log('stalled');
            });
            this.hlsPlayer.on('suspend', () => {
                console.log('suspend');
            });
            this.hlsPlayer.on('abort', () => {
                console.log('abort');
            });
            this.hlsPlayer.on('progress', () => {
                console.log('progress');
            });
            this.hlsPlayer.on('error', () => {
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
            if (!this.hlsPlayer) {
                return;
            }
            this.hlsPlayer.children()[0].style['transform'] = value;
        }

        mute() {
            const videoEl: HTMLVideoElement | null = document.querySelector('#my-player video');
            if (videoEl) {
                videoEl.muted = !videoEl.muted;
            }
        }

        resume() {
            if (this.hlsPlayer) {
                this.hlsPlayer.play();
            }
        }

        pause() {
            if (this.hlsPlayer) {
                this.pausedTime = this.currentTime.valueOf();
                this.hlsPlayer.pause();
            }
        }

        stop() {
            clearInterval(this.loadCheckInterval);
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_STOPPED;
            this.showLoading = false;
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
    .vjs-loading-spinner {
        display:none!important;
    }
</style>