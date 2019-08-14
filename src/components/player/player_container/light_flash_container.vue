<template>
    <div style="width:100%; height:100%; position:relative;">
        <div class="player_cam" :id="varPlayerId" style="width:100%; height:100%;"></div>
        <div style="position:absolute; bottom:10px; width:100%;" v-if="showTime">
            <div class="cam_info_area cam_info_bg" style="width:142px;border:1px solid; margin:0 auto; text-align:center; box-sizing:border-box; background:rgba(0,0,0,.8);">
                <div id="time_area" class="time_area" style="position:relative; padding:2px 0;">
                    <span class="date" style="display:inline-block; color:#fff;font-size:13px;margin-right:6px;line-height: 14px;">{{getDateStr(playTime)}}</span>
                    <span class="time" style="display:inline-block; padding:4px 9px; background:#e60012; color:#fff; font-size:13px; line-height: 14px; width:51px;">{{getTimeStr(playTime)}}</span>
                </div>
            </div>
        </div>
    </div>
</template>
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

    var setPathParams = function(url, params) {
        const pathParamReg = /\/:\w+/gi;
        let pathParams = url.match(pathParamReg);

        if (pathParams) {
            pathParams = pathParams.map(function(item) {
                return item.replace(/\/:/g, '');
            });
            pathParams.forEach(function(item) {
                if (params[item]) {
                    url = url.replace(':' + item, params[item]);
                }
            });
        }
        return url;
    };

    function addZero(data){
        return (data<10) ? "0"+data : data;
    }

    export default {
        name: 'playerContainer',
        props: ['serialNo', 'elementId', 'startTime', 'endTime', 'loop', 'showTime', 'coreSwfPath', 'skinSwfPath', 'getTokenUrl', 'playEventHandler'],
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
                varPlayerId : 'tc_player_light',
                varName : 'rmcPlayer_flash',
                playTime : 0,
                timeInterval : 200,
                playStatus : 0,
                defCoreSwfPath : '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf',
                defSkinPath : '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf',
                defGetTokenUrl : '/biz/cameras/token/:serialNo'
            }
        },
        created : function() {
        },
        mounted : function() {
            const vExtendConstructor = Vue.extend(flashPlayer);
            this.player = new vExtendConstructor({
                propsData : {
                    varPlayerId: this.varPlayerId,
                    varName: this.varName,
                    videoId: '',
                    inKey: '',
                    outKey: '',
                    player: 'flash',
                    width: '100%',
                    height: '100%',
                    serviceId: '',
                    varCoreSwf: this.coreSwfPath ? this.coreSwfPath : this.defCoreSwfPath,
                    varSkinPath: this.skinSwfPath ? this.skinSwfPath : this.defSkinPath,
                    varServerUrl: ''
                }
            });
            this.player.$on('playerStatusChanged', this.playerStatusChangedHandler.bind(this));
            this.player.zoomZone(450, 150);
            this.player.displayRMCPlayer();
            this.play(this.startTime);

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
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
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
                                if (time) {
                                    that.player.setPath(getCvrServerUrl(resObj.cvrHostPort), '/token=' + resObj.token + '&time=' + time);
                                    that.startPlayTimer();
                                } else {
                                    that.player.setPath(getCvrServerUrl(resObj.cvrHostPort), resObj.cameraId + '?token=' + resObj.token);
                                }
                            } else {
                                //TODO: ERROR
                            }
                        }
                    };
                    httpRequest.open('GET', setPathParams((that.getTokenUrl ? that.getTokenUrl : that.defGetTokenUrl), {serialNo : that.serialNo}));
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
            getDateStr : function (timestamp) {
                const date = new Date(timestamp);
                return addZero(date.getMonth()+1) + '. ' + addZero(date.getDate().toString());
            },
            getTimeStr : function (timestamp) {
                const date = new Date(timestamp);
                return addZero(date.getHours().toString()) + ':' + addZero(date.getMinutes().toString()) + ':' + addZero(date.getSeconds().toString())
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
                            if (that.loop != false) {
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
                        this.playEventHandler({status: status});
                    }
                } else if (status === 'NetConnection.Connect.Closed' || status === 'NetStream.Play.Stop') {
                    this.playStatus = this.E_PLAY_STATUS.error;
                    if (this.playEventHandler) {
                        this.playEventHandler({status: status});
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