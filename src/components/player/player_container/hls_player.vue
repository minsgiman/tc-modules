<template>
    <div id="hls_player_wrap" style="width:100%;height:100%;">
        <div style="display:none;" class="localStream">
            <video id="localVideo" muted="muted" autoplay="true"></video>
        </div>

        <div id="remote_stream" style="display:none; height:100%;" class="player_cam remoteStreams">
            <h2>Remote Streams</h2>
            <img id="hls_logo" src="/resources/img/toast_cam_logo.png" style="position:absolute; left:12%; top:5%; width:75%; z-index:1;">
            <img id="hls_loading" src="/resources/img/progress_rolling_white.svg" style="position:absolute; left:48%; top:43%; z-index:1; width:55px;">
            <div id="remoteVideosContainer" style="width:100%;height:100%;"></div>
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

        hlsPlayer: any = null;
        hlsStatus: string = '';
        hlsStatusEnum: any = {
            EVENT_STREAM_CONNECTING : 'v2_event_stream_connecting',
            EVENT_STREAM_CONNECTED : 'v2_event_stream_connected',
            EVENT_STREAM_DISCONNECTED : 'v2_event_stream_disconnected',
            EVENT_STREAM_STOPPED : 'v2_event_stream_stopped'
        };

        private mounted() {
            $('#player').hide();
            $('#remote_stream').show();
        }
        private beforeDestroy() {
            if (this.hlsPlayer) {
                this.hlsPlayer.dispose();
                this.hlsPlayer = null;
            }
        }

        play(cameraIdValue: string, url: string) {
            $('#hls_logo').show();
            $('#hls_loading').show();
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTING;
            if (!this.hlsPlayer) {
                const $video = $('<video/>', {
                    class: 'video-js',
                    id: 'my-player',
                    muted: true
                });
                $('#remoteVideosContainer').append($video);
                this.hlsPlayer = videojs('my-player', {
                    controls: false,
                    preload: 'auto'
                });
                this.updatePlayerSize();
            }
            this.hlsPlayer.src([
                { type: "video/mp4", src: "//vjs.zencdn.net/v/oceans.mp4" },
                { type: "video/webm", src: "//vjs.zencdn.net/v/oceans.webm" }
            ]);
            this.hlsPlayer.on('ready', () => {
                $('#hls_logo').hide();
                $('#hls_loading').hide();
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_CONNECTED;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
                this.hlsPlayer.play();
            });
            this.hlsPlayer.on('error', () => {
                this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_DISCONNECTED;
                this.$emit('playerStatusChanged', {status : this.hlsStatus, code : ''});
            });
        }

        updatePlayerSize() {
            $('#my-player').css('width', '100%');
            $('#my-player').css('height', $("#player").height() + 89);
        }

        resume() {
            if (this.hlsPlayer) {
                this.hlsPlayer.play();
            }
        }

        pause() {
            if (this.hlsPlayer) {
                this.hlsPlayer.pause();
            }
        }

        stop() {
            this.hlsStatus = this.hlsStatusEnum.EVENT_STREAM_STOPPED;
            $('#webrtc_logo').hide();
            $('#webrtc_loading').hide();
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