<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../../service/player/store';
    import webRTCPlayer from './webrtc_player.vue';

    const $: any = (window as any).$ as any;

    @Component
    export default class WebrtcPlayerContainer extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get browserInfo() {
            return store.state.browserInfo;
        }

        player: any = null;
        type: string = 'webrtc';

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
            this.player.dvrConnectFail = false;

            if (this.browserInfo.supportWebRTC) {
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