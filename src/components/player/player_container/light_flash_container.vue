<script>
    import flashPlayer from './light_flash_player';
    import Vue from 'vue';

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
        props: ['serialNo', 'elementId', 'startTime', 'endTime', 'loop', 'coreSwfPath', 'skinSwfPath', 'getTokenUrl', 'playEventHandler'],
        computed: {
        },
        data: function () {
            return {
                E_PLAY_STATUS : {
                    none : 0,
                    play : 1,
                    finish : 2,
                    error : 3
                },
                E_PLAY_EVENT : {
                    start : 'start',
                    finish : 'finish',
                    error : 'error'
                },
                player : null,
                playTimeoutId : null,
                playIntervalId : null,
                playTime : 0,
                timeInterval : 200,
                playStatus : 0
            }
        },
        created : function() {
            const vExtendConstructor = Vue.extend(flashPlayer);
            this.player = new vExtendConstructor({
                propsData : {
                    varPlayerId: 'player',
                    varName: 'rmcPlayer_flash',
                    videoId: '',
                    inKey: '',
                    outKey: '',
                    player: 'flash',
                    width: '100%',
                    height: '100%',
                    serviceId: '',
                    varCoreSwf: this.coreSwfPath ? this.coreSwfPath : '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf',
                    varSkinPath: this.skinSwfPath ? this.skinSwfPath : '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf',
                    varServerUrl: ''
                }
            }).$mount(this.elementId ? '#' + this.elementId : '#player');
            this.player.$on('playerStatusChanged', this.playerStatusChangedHandler.bind(this));
            this.player.zoomZone(450, 150);
            this.player.displayRMCPlayer();
            this.play(this.startTime);
        },
        mounted : function() {
            console.log('mounted Player');

        },
        beforeDestroy : function() {
            if (this.playTimeoutId) {
                clearTimeout(this.playTimeoutId);
                this.playTimeoutId = null;
            }
            if (this.playIntervalId) {
                clearInterval(this.playIntervalId);
                this.playIntervalId = null;
            }
            if (this.player) {
                this.player.$destroy();
            }
        },
        methods : {
            play : function (time) {
                const that = this;
                this.playTime = time;

                this.playStatus = that.E_PLAY_STATUS.none;
                this.stopPlayTimer();
                if (this.playTimeoutId) {
                    clearTimeout(this.playTimeoutId);
                    this.playTimeoutId = null;
                }
                this.playTimeoutId = setTimeout(function() {
                    if (!that.player) {
                        return null;
                    }
                    const httpRequest = new XMLHttpRequest();
                    httpRequest.onreadystatechange = function() {
                        if (httpRequest.readyState === XMLHttpRequest.DONE) {
                            if (httpRequest.status === 200) {
                                const resObj = JSON.parse(httpRequest.responseText);
                                that.player.setPath(getCvrServerUrl(resObj.cvrHostPort), '/token=' + resObj.token + '&time=' + time);
                                that.startPlayTimer();
                            } else {
                                //TODO: ERROR
                            }
                        }
                    };
                    httpRequest.open('GET', 'http://10.161.240.93:10000' + (that.getTokenUrl ? that.getTokenUrl : '/biz/cameras/token/') + that.serialNo);
                    httpRequest.send();
                }, 200);
            },
            resume : function () {
                this.player.resume();
            },
            mute : function () {
                this.player.mute();
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
            startPlayTimer : function () {
                const that = this;

                this.stopPlayTimer();
                this.playIntervalId = setInterval(function() {
                    if (that.playStatus === that.E_PLAY_STATUS.play) {
                        that.playTime += that.timeInterval;
                        if (that.playTime >= that.endTime) {
                            that.pause();
                            that.playStatus = that.E_PLAY_STATUS.finish;
                            if (that.playEventHandler) {
                                that.playEventHandler({status: that.E_PLAY_EVENT.finish});
                            }
                            if (that.loop) {
                                that.play(that.startTime);
                            }
                        }
                    }
                }, this.timeInterval);
            },
            stopPlayTimer : function () {
                if (this.playIntervalId) {
                    clearInterval(this.playIntervalId);
                    this.playIntervalId = null;
                }
            },
            playerStatusChangedHandler : function (status) {
                if (status === 'NetStream.Play.Start' && this.playStatus != this.E_PLAY_STATUS.play) {
                    this.playStatus = this.E_PLAY_STATUS.play;
                    if (this.playEventHandler) {
                        this.playEventHandler({status: this.E_PLAY_EVENT.start});
                    }
                } else if (status === 'NetConnection.Connect.Closed' || status === 'NetStream.Play.Stop') {
                    this.playStatus = this.E_PLAY_STATUS.error;
                    if (this.playEventHandler) {
                        this.playEventHandler({status: this.E_PLAY_EVENT.error});
                    }
                }
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