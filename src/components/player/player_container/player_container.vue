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
                this.player.resume();
            },
            pause : function () {
                this.player.pause();
            },
            stop : function () {
                this.player.stop();
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
            zoomZone : function (top, left) {
                this.player.zoomZone(top, left);
            },
            zoomVideo : function (ratio) {
                this.player.zoomVideo(ratio);
            },
            zoomVideoWithZoomablePoint : function(x, y) {
                this.player.zoomVideoWithZoomablePoint(x, y);
            },
            zoomUp : function(zoom) {
                this.player.zoomUp(zoom);
            },
            zoomUpWithZoom : function(zoom) {
                this.player.zoomUpWithZoom(zoom);
            },
            positionZoomable : function(zoom) {
                this.player.positionZoomable(zoom);
            },
            playerStatusChangedHandler : function (status) {
                this.$emit('event', status);
            },
            setData : function(key, value) {
                this.player.setData(key, value);
            },
            getData : function(key) {
                return this.player.getData(key);
            }
        }
    }
</script>