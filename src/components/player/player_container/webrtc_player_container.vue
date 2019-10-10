<script>
    import store from '../../../service/player/store';
    import webRTCPlayer from './webrtc_player';
    import Vue from 'vue';

    export default {
        name: 'webrtcPlayerContainer',
        props: [],
        computed: {
            cameraData: function () {
                return store.state.cameraData;
            },
            browserInfo: function () {
                return store.state.browserInfo;
            }
        },
        data: function () {
            return {
                player : null,
                type : 'webrtc'
            }
        },
        created : function() {
            const vExtendConstructor = Vue.extend(webRTCPlayer);
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
            play : function (time) {
                this.player.dvrConnectFail = false;

                if (this.browserInfo.supportWebRTC) {
                    this.player.webRTCStatus = this.player.webRTCStatusEnum.EVENT_STREAM_CONNECTING;
                    if (this.player.currentWebRTCPeerId) {
                        this.stop(this.player.currentWebRTCPeerId);
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
                $('#remoteVideosContainer').empty();
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
            zoomZone: function () {
                return;
            },
            zoomVideo: function () {
                return;
            },
            zoomVideoWithZoomablePoint : function(x, y) {
                return;
            },
            zoomUp : function(zoom) {
                return;
            },
            zoomUpWithZoom : function(zoom) {
                return;
            },
            positionZoomable : function(zoom) {
                return;
            },
            webRTCEventCallback : function (status) {
                this.$emit('playerStatusChanged', status);
            },
            setData : function(key, value) {
                this[key] = value;
            },
            getData : function(key) {
                return this[key];
            }
        }
    }
</script>