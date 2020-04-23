<script lang="ts">
    import store from '../../../service/player/store';
    import webRTCV2Player from './webrtcv2_player.vue';
    import Vue from 'vue';

    const $: any = (window as any).$ as any;

    export default {
        name: 'webrtcV2PlayerContainer',
        props: [],
        computed: {
            cameraData: function () {
                return store.state.cameraData;
            }
        },
        data: function () {
            return {
                player : null,
                type : 'webrtcv2'
            }
        },
        created : function() {
            const vExtendConstructor = Vue.extend(webRTCV2Player);
            this.player = new vExtendConstructor().$mount('#webrtc_player_wrap');
            this.player.$on('playerStatusChanged', this.webRTCEventCallback.bind(this));
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            this.stop();
            if (this.player) {
                this.player.$destroy();
            }
        },
        methods : {
            play : function (url: string) {
                this.player.dvrConnectFail = false;
                this.player.webRTCStatus = this.player.webRTCStatusEnum.EVENT_STREAM_CONNECTING;
                if (this.player.currentWebRTCPeerId) {
                    this.stop(this.player.currentWebRTCPeerId);
                }
                this.player.currentWebRTCPeerId = this.cameraData.id;
                this.player.play(this.cameraData.id, url);
                $('#webrtc_logo').show();
                $('#webrtc_loading').show();
            },
            resume : function () {
                this.player.resume();
            },
            mute : function () {
                return;
            },
            pause : function () {
                this.player.pause();
            },
            stop : function () {
                $('#remoteWebRTCContainer').empty();
                this.player.stop();
                $('#webrtc_logo').hide();
                $('#webrtc_loading').hide();
            },
            close : function () {
                this.player.close();
            },
            getCurrentTime : function () {
                return;
            },
            getStatus : function () {
                return this.player.getStatus();
            },
            transformChange : function(value: string) {
                return;
            },
            zoomZone: function () {
                return;
            },
            zoomVideo: function () {
                return;
            },
            zoomVideoWithZoomablePoint : function(x: any, y: any) {
                return;
            },
            zoomUp : function(zoom: any) {
                return;
            },
            zoomUpWithZoom : function(zoom: any) {
                return;
            },
            positionZoomable : function(zoom: any) {
                return;
            },
            updatePlayerSize : function() {
                return;
            },
            webRTCEventCallback : function (status: any) {
                this.$emit('playerStatusChanged', status);
            },
            setData(key: any, value: any) {
                (this as any)[key] = value;
            },
            getData(key: any) {
                return (this as any)[key];
            }
        }
    }
</script>