<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../../service/player/store';
    import webRTCPlayer from './webrtc_player.vue';

    const $: any = (window as any).$ as any;

    function getBrowserType() {
        if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            return 'opera';
        } else if(navigator.userAgent.indexOf("Chrome") != -1) {
            return 'chrome';
        } else if(navigator.userAgent.indexOf("Safari") != -1) {
            return 'safari';
        } else if(navigator.userAgent.indexOf("Firefox") != -1) {
            return 'firefox';
        } else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!(document as any).documentMode == true)) {
            return 'ie';
        } else {
            return 'unknown';
        }
    }

    @Component
    export default class WebrtcPlayerContainer extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }

        player: any = null;

        private created() {
            const vExtendConstructor = Vue.extend(webRTCPlayer);
            this.player = new vExtendConstructor().$mount('#webrtc_player_wrap');
            this.player.$on('playerStatusChanged', this.webRTCEventCallback.bind(this));
        }

        private beforeDestroy() {
            this.stop();
            if (this.player) {
                this.player.$destroy();
            }
        }

        play(time: any) {
            var isBrowserSupport = true, browserType = getBrowserType();
            this.player.dvrConnectFail = false;
            if (browserType === 'ie') {
                isBrowserSupport = false;
            }
            // if (browserType === 'safari' && navigator.userAgent.indexOf('Version/11') == -1) {
            //     isBrowserSupport = false;
            // }

            if (isBrowserSupport) {
                this.player.webRTCStatus = this.player.webRTCStatusEnum.EVENT_STREAM_CONNECTING;
                if (this.player.currentWebRTCPeerId) {
                    this.stop();
                }
                this.player.currentWebRTCPeerId = this.cameraData.id;
                this.player.play(this.cameraData.id, time);
                $('#webrtc_logo').show();
                $('#webrtc_loading').show();
            } else {
                $('#webrtc_logo').hide();
                $('#webrtc_loading').hide();
                //$scope.isShowNoSupportBrowser = true; //TODO:
            }
        }

        resume() {
            this.player.resume();
        }

        mute() {
            return;
        }

        pause() {
            this.player.pause();
        }

        stop() {
            $('#remoteVideosContainer').empty();
            this.player.stop();
            $('#webrtc_logo').hide();
            $('#webrtc_loading').hide();
        }

        close() {
            this.player.close();
        }

        getCurrentTime() {
            return;
        }

        getStatus() {
            return this.player.getStatus();
        }

        zoomZone() {
            return;
        }

        zoomVideo() {
            return;
        }

        zoomVideoWithZoomablePoint(x: any, y: any) {
            return;
        }

        zoomUp(zoom: any) {
            return;
        }

        zoomUpWithZoom(zoom: any) {
            return;
        }

        positionZoomable(zoom: any) {
            return;
        }

        webRTCEventCallback(status: any) {
            this.$emit('playerStatusChanged', status);
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>