<template>
    <div class="tc_simple_player">
        <img id="splay_loading" src="/resources/img/progress_rolling_white.svg" style="position:absolute; left:47%; top:38%; z-index:1; width:40px;">
        <div id="simpleHLSContainer" style="width:100%;height:100%;"></div>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import videojs from 'video.js';
    import toastcamAPIs from './../../service/toastcamAPIs';
    //import $ from 'jquery';

    const $: any = (window as any).$ as any;

    @Component({
    })
    export default class player extends Vue {
        hlsServer: string = 'https://devmedia010.toastcam.com:10099';
        hlsPlayer: any = null;

        private created() {
            toastcamAPIs.setConfig({
                prefix: '/json/biz/'
            });
        }

        private beforeDestroy() {
            this.stop();
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        stop() {
            if (this.hlsPlayer) {
                this.hlsPlayer.dispose();
                this.hlsPlayer = null;
            }
        }

        play(url: string) {
            $('#splay_loading').show();
            this.stop();
            const $video = $('<video/>', {
                class: 'video-js',
                id: 's-player',
                muted: true
            });
            $('#simpleHLSContainer').append($video);
            this.hlsPlayer = videojs('s-player', {
                controls: false,
                errorDisplay: false,
                preload: 'auto'
            });

            toastcamAPIs.call(toastcamAPIs.camera.GET_STREAMING_SERVER, {}, (res: any) => {
                const playUrl = 'https://' + res.servers[0] + '/mp4play?url=' + encodeURIComponent(url);
                this.hlsPlayer.on('canplay', () => {
                    console.log('canplay');
                    $('#splay_loading').hide();
                    this.hlsPlayer.play();
                });
                this.hlsPlayer.on('error', () => {
                    $('#splay_loading').hide();
                    this.$emit('event', {type: 'error'});
                });
                this.hlsPlayer.src([
                    { type: "video/mp4", src: playUrl }
                ]);
            }, () => {
                $('#splay_loading').hide();
                this.$emit('event', {type: 'error'});
            });
        }

        pause() {
            if (this.hlsPlayer) {
                this.hlsPlayer.pause();
            }
        }

        getIsPlaying(): boolean {
            if (this.hlsPlayer) {
                return (this.hlsPlayer.duration() && !this.hlsPlayer.paused());
            } else {
                return false;
            }
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    .tc_simple_player {
        width: 100%;
        height: 100%;
        .vjs-loading-spinner {
            display:none!important;
        }
        .video-js {
            width: 100%;
            height: 100%;
        }
    }
</style>