<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../../service/player/store';
    import flashPlayerContainer from './flash_player_container.vue';
    import webRTCPlayerContainer from './webrtc_player_container.vue';
    import webRTCV2PlayerContainer from './webrtcv2_player_container.vue';
    import hlsPlayerContainer from './hls_player_container.vue';
    import toastcamAPIs from './../../../service/toastcamAPIs';

    var getNvrServerUrl = function(data: any){

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

    var getCvrServerUrl = function(data: any){

        var returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        returnUrl = data;
        var tmp = returnUrl.replace("://","");

        var getPort: any = parseInt(tmp.substring(tmp.indexOf(":")+1,tmp.length));
        var iePort: any = getPort+1
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            returnUrl = returnUrl.replace(getPort,iePort);
        }

        return returnUrl;
    };

    var getLiveServerUrl = function(data: any){

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

        var getPort: any = parseInt(tmp.substring(tmp.indexOf(":")+1,tmp.length));
        var iePort: any = getPort+1
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            returnUrl = returnUrl.replace(getPort,iePort);
        }
        return returnUrl;
    };

    @Component
    export default class PlayerContainer extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get isShared() {
            return store.state.isShared;
        }
        get browserInfo() {
            return store.state.browserInfo;
        }
        get playerType() {
            return store.state.playerType;
        }

        player: any = null;
        playTimeoutId: any = null;

        private created() {
            let vExtendConstructor;
            if (this.cameraData.recorderType == "recorder") {
                vExtendConstructor = Vue.extend(webRTCPlayerContainer);
            } else {
                if (this.playerType === 'webrtc') {
                    vExtendConstructor = Vue.extend(webRTCV2PlayerContainer);
                } else if (this.playerType === 'hls') {
                    vExtendConstructor = Vue.extend(hlsPlayerContainer);
                } else {
                    vExtendConstructor = Vue.extend(flashPlayerContainer);
                }
            }
            this.player = new vExtendConstructor();
            this.player.$on('playerStatusChanged', this.playerStatusChangedHandler.bind(this));
        }

        private beforeDestroy() {
            if (this.player) {
                this.player.$destroy();
            }
        }

        play(time: any) {
            if (this.playTimeoutId) {
                clearTimeout(this.playTimeoutId);
                this.playTimeoutId = null;
            }
            this.playTimeoutId = setTimeout(() => {
                if (this.cameraData.recordType === "none") {
                    this.player.stop();
                    this.playerStatusChangedHandler('recordNone');
                    return;
                }

                if (this.cameraData.recorderType == "nvr") {
                    this.player.play({url: getNvrServerUrl(this.cameraData.mediaStreamURL), path: this.cameraData.channel + (time ? "?time=" + time.getTime() : '')});
                } else if (this.cameraData.recorderType == "recorder") {
                    this.player.play(time ? time.getTime() : 0);
                } else {
                    if (!time && this.cameraData.controlStatus !== "on") {
                      return;
                    }
                    toastcamAPIs.call(this.isShared ? toastcamAPIs.camera.GET_SHARE_CAM_TOKEN : toastcamAPIs.camera.GET_TOKEN, {cameraId: this.cameraData.id}, (res: any) => {
                        if (this.playerType === 'webrtc') {
                            if (time) {
                                this.player.play(this.cameraData.mediaStreamURL + '?token=' + res.token + '&time=' + time.getTime());
                            } else {
                                this.player.play(this.cameraData.mediaStreamURL + '?token=' + res.token);
                            }
                        } else if (this.playerType === 'hls') {
                            if (time) {
                                this.player.play(this.cameraData.mediaStreamURL + '?token=' + res.token + '&time=' + time.getTime());
                            } else {
                                this.player.play(this.cameraData.mediaStreamURL + '?token=' + res.token);
                            }
                        } else {
                            if (time) {
                                this.player.play({url: getCvrServerUrl(res.cvrHostPort), path: '/token=' + res.token + '&time=' + time.getTime()});
                            } else {
                                this.player.play({url: getLiveServerUrl(this.cameraData.mediaStreamURL), path: this.cameraData.id + '?token=' + res.token});
                            }
                        }
                    });
                }
            }, 500);
        }

        resume() {
            this.player.resume();
        }

        mute(val: boolean) {
            this.player.mute(val);
        }

        pause() {
            this.player.pause();
        }

        stop() {
            this.player.stop();
        }

        close() {
            this.player.close();
        }

        getCurrentTime() {
            return this.player.getCurrentTime();
        }

        getStatus() {
            return this.player.getStatus();
        }

        transformChange(value: string) {
            return this.player.transformChange(value);
        }

        zoomZone(top: any, left: any) {
            this.player.zoomZone(top, left);
        }

        zoomVideo(ratio: any) {
            this.player.zoomVideo(ratio);
        }

        zoomVideoWithZoomablePoint(x: any, y: any) {
            this.player.zoomVideoWithZoomablePoint(x, y);
        }

        zoomUp(zoom: any) {
            this.player.zoomUp(zoom);
        }

        zoomUpWithZoom(zoom: any) {
            this.player.zoomUpWithZoom(zoom);
        }

        positionZoomable(zoom: any) {
            this.player.positionZoomable(zoom);
        }

        updatePlayerSize() {
            this.player.updatePlayerSize();
        }

        playerStatusChangedHandler(status: any) {
            this.$emit('event', status);
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>