<script>
    import store from '../../../service/player/store';
    import webRTCPlayer from './webrtc_player';
    import Vue from 'vue';

    function getBrowserType() {
        if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 )
        {
            return 'opera';
        }
        else if(navigator.userAgent.indexOf("Chrome") != -1 )
        {
            return 'chrome';
        }
        else if(navigator.userAgent.indexOf("Safari") != -1)
        {
            return 'safari';
        }
        else if(navigator.userAgent.indexOf("Firefox") != -1 )
        {
            return 'firefox';
        }
        else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
        {
            return 'ie';
        }
        else
        {
            return 'unknown';
        }
    }

    export default {
        name: 'webrtcPlayerContainer',
        props: [],
        computed: {
            currentCamera: function () {
                return store.state.currentCamera;
            }
        },
        data: function () {
            return {
                player : null
            }
        },
        created : function() {
            const vExtendConstructor = Vue.extend(webRTCPlayer);
            this.player = new vExtendConstructor().$mount('#webrtc_player_wrap');
            this.player.$on('webRTCPlayerStatusChanged', this.webRTCEventCallback.bind(this));
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            this.stop();
        },
        methods : {
            play : function (time) {
                var isBrowserSupport = true, browserType = getBrowserType;
                this.player.dvrConnectFail = false;
                if (browserType === 'ie') {
                    isBrowserSupport = false;
                }
                if (browserType === 'safari' && navigator.userAgent.indexOf('Version/11') == -1) {
                    isBrowserSupport = false;
                }

                if (isBrowserSupport) {
                    this.player.webRTCStatus = this.player.webRTCStatusEnum.EVENT_STREAM_CONNECTING;
                    if (this.player.currentWebRTCPeerId) {
                        this.stop(this.player.currentWebRTCPeerId);
                    }
                    this.player.currentWebRTCPeerId = this.currentCamera.id;
                    this.player.play(this.currentCamera.id, time);
                    $('#webrtc_logo').show();
                    $('#webrtc_loading').show();
                } else {
                    $('#webrtc_logo').hide();
                    $('#webrtc_loading').hide();
                    //$scope.isShowNoSupportBrowser = true; //TODO:
                }
            },
            resume : function () {
                if ($('#remoteVideosContainer').length) {
                    if ($('#remoteVideosContainer').children('video').length) {
                        $('#remoteVideosContainer').children('video')[0].play();
                    }
                }
            },
            pause : function () {
                if (this.cameraData.recorderType == "recorder") {
                    if ($('#remoteVideosContainer').length) {
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video')[0].pause();
                        }
                    }
                }
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
                return this.player.getCurrentTime();
            },
            getStatus : function () {
                return this.player.getStatus();
            },
            setPath : function (url, path) {
                this.player.setPath(url, path);
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