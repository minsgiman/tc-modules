<script>
    import store from '../../../service/player/store';
    import flashPlayerContainer from './flash_player_container';
    import webRTCPlayerContainer from './webrtc_player_container';
    import toastcamAPIs from './../../../service/toastcamAPIs';
    import Vue from 'vue';

    var getNvrServerUrl = function(data){

        var returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        var rtIdx = data.indexOf("//");
        var rt = "";
        if(rtIdx != -1){
            rt = data.substring(0,rtIdx+2);
        }

        var tmp = data.substring(rtIdx+2,data.length);

        if(tmp.indexOf("/") != -1){
            returnUrl = rt+tmp.substring(0,tmp.indexOf("/"));
        }

        return returnUrl;
    };

    var getCvrServerUrl = function(data){

        var returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        returnUrl = data;
        var tmp = returnUrl.replace("://","");

        var getPort = parseInt(tmp.substring(tmp.indexOf(":")+1,tmp.length));
        var iePort = getPort+1
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            returnUrl = returnUrl.replace(getPort,iePort);
        }

        return returnUrl;
    };

    var getLiveServerUrl = function(data){

        var returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        var rtIdx = data.indexOf("//");
        var rt = "";
        if(rtIdx != -1){
            rt = data.substring(0,rtIdx+2);
        }

        var tmp = data.substring(rtIdx+2,data.length);

        if(tmp.indexOf("/") != -1){
            returnUrl = rt+tmp.substring(0,tmp.indexOf("/"));
        }

        tmp = returnUrl.replace("://","");

        var getPort = parseInt(tmp.substring(tmp.indexOf(":")+1,tmp.length));
        var iePort = getPort+1
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            returnUrl = returnUrl.replace(getPort,iePort);
        }
        return returnUrl;
    };

    export default {
        name: 'playerContainer',
        props: [],
        computed: {
            cameraData: function () {
                return store.state.cameraData;
            },
            isShared: function () {
                return store.state.isShared;
            }
        },
        data: function () {
            return {
                player : null,
                playTimeoutId : null
            }
        },
        created : function() {
            let vExtendConstructor;
            if (this.cameraData.recorderType == "recorder") {
                vExtendConstructor = Vue.extend(webRTCPlayerContainer);
                this.player = new vExtendConstructor();
            } else {
                vExtendConstructor = Vue.extend(flashPlayerContainer);
                this.player = new vExtendConstructor();
            }
            this.player.$on('playerStatusChanged', this.playerStatusChangedHandler.bind(this));
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            if (this.player) {
                this.player.$destroy();
            }
        },
        methods : {
            play : function (time) {
                if (this.playTimeoutId) {
                    clearTimeout(this.playTimeoutId);
                    this.playTimeoutId = null;
                }
                this.playTimeoutId = setTimeout(() => {
                    if (this.cameraData.recorderType == "nvr") {
                        this.player.play({url: getNvrServerUrl(this.cameraData.mediaStreamURL), path: this.cameraData.channel + (time ? "?time=" + time.getTime() : '')});
                    } else if (this.cameraData.recorderType == "recorder") {
                        this.player.play(time ? time.getTime() : 0);
                    } else {
                        toastcamAPIs.call(this.isShared ? toastcamAPIs.camera.GET_SHARE_CAM_TOKEN : toastcamAPIs.camera.GET_TOKEN, {cameraId: this.cameraData.id}, (res) => {
                            if (time) {
                                this.player.play({url: getCvrServerUrl(res.cvrHostPort), path: '/token=' + res.token + '&time=' + time.getTime()});
                            } else {
                                this.player.play({url: getLiveServerUrl(this.cameraData.mediaStreamURL), path: this.cameraData.id + '?token=' + res.token});
                            }
                        });
                    }
                }, 200);
            },
            resume : function () {
                if (this.player.resume) {
                    this.player.resume();
                }
            },
            pause : function () {
                if (this.player.pause) {
                    this.player.pause();
                }
            },
            stop : function () {
                if (this.player.stop) {
                    this.player.stop();
                }
            },
            close : function () {
                if (this.player.close) {
                    this.player.close();
                }
            },
            getCurrentTime : function () {
                if (this.player.getCurrentTime) {
                    return this.player.getCurrentTime();
                }
            },
            getStatus : function () {
                if (this.player.getStatus) {
                    return this.player.getStatus();
                }
            },
            zoomZone : function (top, left) {
                if (this.player.zoomZone) {
                    this.player.zoomZone(top, left);
                }
            },
            zoomVideo : function (ratio) {
                if (this.player.zoomVideo) {
                    this.player.zoomVideo(ratio);
                }
            },
            zoomVideoWithZoomablePoint : function(x, y) {
                if (this.player.zoomVideoWithZoomablePoint) {
                    this.player.zoomVideoWithZoomablePoint(x, y);
                }
            },
            zoomUp : function(zoom) {
                if (this.player.zoomUp) {
                    this.player.zoomUp(zoom);
                }
            },
            zoomUpWithZoom : function(zoom) {
                if (this.player.zoomUpWithZoom) {
                    this.player.zoomUpWithZoom(zoom);
                }
            },
            positionZoomable : function(zoom) {
                if (this.player.positionZoomable) {
                    this.player.positionZoomable(zoom);
                }
            },
            playerStatusChangedHandler : function (status) {
                this.$emit('event', status);
            },
            setData : function(key, value) {
                if (this.player.setData) {
                    this.player.setData(key, value);
                }
            },
            getData : function(key) {
                if (this.player.getData) {
                    return this.player.getData(key);
                }
            }
        }
    }
</script>