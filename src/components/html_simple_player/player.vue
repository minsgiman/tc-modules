<template>
    <div class="tc_simple_player">
        <img id="splay_loading" src="/resources/img/progress_rolling_white.svg" style="position:absolute; left:47%; top:38%; z-index:1; width:40px;">
        <div id="simpleHLSContainer" style="width:100%;height:100%;"></div>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import Hls from 'hls.js';
    import toastcamAPIs from './../../service/toastcamAPIs';
    //import $ from 'jquery';

    const $: any = (window as any).$ as any;

    @Component({
    })
    export default class player extends Vue {
        hlsPlayer: any = null;
        videoObj: any = null;

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
                this.hlsPlayer.destroy();
                this.hlsPlayer = null;
            }
            $('#simpleHLSContainer').empty();
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
            this.videoObj = $video[0];
            this.hlsPlayer = new Hls();
            this.hlsPlayer.attachMedia(this.videoObj);

            toastcamAPIs.call(toastcamAPIs.camera.GET_STREAMING_SERVER, {}, (res: any) => {
                const playUrl = 'https://' + res.servers[0] + '/hlsplay?url=' + encodeURIComponent(url);
                this.hlsPlayer.loadSource(playUrl);
                this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('Hls.Events.MANIFEST_PARSED');
                    $('#splay_loading').hide();
                    this.videoObj.play();
                });
                this.videoObj.addEventListener('error', () => {
                    $('#splay_loading').hide();
                    this.$emit('event', {type: 'error'});
                });
            }, () => {
                $('#splay_loading').hide();
                this.$emit('event', {type: 'error'});
            });
        }

        pause() {
            if (this.videoObj) {
                this.videoObj.pause();
            }
        }

        resume() {
            if (this.videoObj) {
                this.videoObj.play();
            }
        }

        getIsPlaying(): boolean {
            if (this.videoObj) {
                return (this.videoObj.duration && !this.videoObj.paused);
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