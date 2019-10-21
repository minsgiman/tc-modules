<template>
    <div style="width:100%; height:100%; position:relative;">
        <div class="player_cam" :id="varPlayerId" style="width:100%; height:100%;"></div>
        <div style="position:absolute; bottom:10px; width:100%;" v-if="showTime">
            <div class="cam_info_area cam_info_bg" :style="{width:usePauseResume ? '160px' : '142px'}" style="border:1px solid; margin:0 auto; text-align:center; box-sizing:border-box; background:rgba(0,0,0,.8);">
                <div id="time_area" class="time_area" style="position:relative; padding:2px 0;">
                    <button type="button" class="sp pause" v-show="usePauseResume && playStatus === E_PLAY_STATUS.play" @click="pause()" id="pause_btn"></button>
                    <button type="button" class="sp play" v-show="usePauseResume && playStatus !== E_PLAY_STATUS.play" @click="resume()" id="play_btn"></button>
                    <span class="date" style="display:inline-block; color:#fff;font-size:13px;margin-right:6px;line-height: 14px;">{{getDateStr(playTime)}}</span>
                    <span class="time" style="display:inline-block; padding:4px 9px; background:#e60012; color:#fff; font-size:13px; line-height: 14px; width:51px;">{{getTimeStr(playTime)}}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import webRTCPlayer from './light_webrtc_player';
    import Vue from 'vue';
    import browser from './../browser_checker';

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
        props: ['serialNo', 'elementId', 'startTime', 'endTime', 'loop', 'showTime', 'getTokenUrl', 'usePauseResume', 'credentialUrl', 'candidateUrl', 'offerUrl', 'playEventHandler'],
        computed: {
        },
        data: function () {
            return {
                E_PLAY_STATUS : {
                    none : 0,
                    play : 1,
                    finish : 2,
                    error : 3,
                    pause : 4
                },
                E_PLAY_EVENT : {
                    start : 'start',
                    finish : 'finish',
                    error : 'error',
                    webrtc_not_support_browser : 'webrtc_not_support_browser'
                },
                player : null,
                playTimeoutId : null,
                playIntervalId : null,
                varPlayerId : this.elementId,
                playTime : 0,
                timeInterval : 100,
                playStatus : 0,
                retryTimeout : null,
                defGetTokenUrl : '/biz/cameras/token/:serialNo',
                defCredentialUrl : '/rtc/credential',
                defCandidateUrl : '/rtc/candidate',
                defOfferUrl : '/rtc/offer'
            }
        },
        created : function() {
        },
        mounted : function() {
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
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
            }
            if (this.player) {
                this.player.$destroy();
            }
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods : {
            initPlayer : function () {
                if (browser.name === 'Internet Explorer' || browser.name === 'Edge' || (browser.name === 'Safari' && browser.version < 11)) {
                    if (this.playEventHandler) {
                        this.playEventHandler({status: this.E_PLAY_EVENT.webrtc_not_support_browser});
                    }
                } else {
                    const vExtendConstructor = Vue.extend(webRTCPlayer);
                    this.player = new vExtendConstructor({
                        propsData : {
                            credentialUrl : this.credentialUrl ? this.credentialUrl : this.defCredentialUrl,
                            candidateUrl : this.candidateUrl ? this.candidateUrl : this.defCandidateUrl,
                            offerUrl : this.offerUrl ? this.offerUrl : this.defOfferUrl
                        }
                    }).$mount('#' + this.varPlayerId);

                    this.player.$on('playerStatusChanged', this.playerStatusChangedHandler.bind(this));
                    this.play(this.startTime);
                }
            },
            play : function (time) {
                const that = this;
                if (time) {
                    this.playTime = time;
                }

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
                                    that.player.play(resObj.cameraId, resObj.cvrHostPort + '/flvplayback/' + resObj.cameraId + '?token=' + resObj.token + '&time=' + time);
                                    that.startPlayTimer();
                                } else {
                                    that.player.play(resObj.cameraId, resObj.cvrHostPort + '/flvplayback/' + resObj.cameraId + '?token=' + resObj.token);
                                    that.playTime = new Date().valueOf();
                                    that.startLiveTimer();
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
                if (this.playStatus === this.E_PLAY_STATUS.pause || this.playStatus === this.E_PLAY_STATUS.error) {
                    this.stop();
                    if (this.startTime) { //CVR
                        this.playStatus = this.E_PLAY_STATUS.play;
                        this.play(this.playTime ? this.playTime : this.startTime);
                    } else { //Live
                        this.play();
                    }
                }
            },
            mute : function () {
                this.player.mute();
            },
            pause : function () {
                if (this.playStatus === this.E_PLAY_STATUS.play) {
                    this.playStatus = this.E_PLAY_STATUS.pause;
                    this.player.pause();
                }
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
            startLiveTimer : function () {
                const that = this;

                this.stopPlayTimer();
                this.playIntervalId = setInterval(function() {
                    if (that.playStatus === that.E_PLAY_STATUS.play) {
                        that.playTime += that.timeInterval;
                    }
                }, this.timeInterval);
            },
            startPlayTimer : function () {
                const that = this;

                this.stopPlayTimer();
                this.playIntervalId = setInterval(function() {
                    if (that.playStatus === that.E_PLAY_STATUS.play) {
                        that.playTime += that.timeInterval;
                        if (that.playTime >= that.endTime) {
                            that.stop();
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
                const statusEnum = this.player.getData('webRTCStatusEnum');

                if (status === statusEnum.EVENT_STREAM_CONNECTED && this.playStatus != this.E_PLAY_STATUS.play) {
                    this.playStatus = this.E_PLAY_STATUS.play;
                    if (this.playEventHandler) {
                        this.playEventHandler({status: status});
                    }
                } else if (status === statusEnum.EVENT_ERROR_WEBRTC_SERVER || status === statusEnum.EVENT_STREAM_DISCONNECTED) {
                    this.playStatus = this.E_PLAY_STATUS.error;
                    if (this.playEventHandler) {
                        this.playEventHandler({status: status});
                    }
                    if (this.retryTimeout) {
                        clearTimeout(this.retryTimeout);
                    }
                    this.retryTimeout = setTimeout(() => {
                        this.resume();
                    }, 4000);
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

<style lang="less">
    button::-moz-focus-inner{padding:0;border:0}
    button.sp {
        width: 28px;
        height: 28px;
        margin: -1px 4px 0 -2px;
        vertical-align: middle;
        appearance:none;
        -webkit-appearance:none;
        overflow:visible;border:0;background:transparent;cursor:pointer;line-height:0;outline:none;
        &.play {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAALJJREFUSA1jYBgFoyEwGgKjIYAvBP7//38RiGcAMSc+dVSTA1oEA1eBDF2qGYzLIJhtUPo7kM7GpZYq4mgWwrgbgQxhqliAbgjMBiz0E6CYHbp6bHxGbIK4xEAW4ZIDir9hZGQUxSMPlmIipIBI+e9AdZVEqiVeGZagBAmdAWJ14k0hQSWahX+A/BYgZiXBCNKUIll4D8i2Jk03GaqBllwA4llAzEuG9lEtoyEwGgKDJAQAOQK3keKHUkgAAAAASUVORK5CYII=') no-repeat;
        }
        &.pause {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAEZJREFUSA1jYBgFoyEwGgKjIYAvBP5DAbIaoNBaqHAQsjguNhMuCVqJj1pI9ZAdDdLRICU5BOieaEh24aiG0RAYDQGqhwAAwi0TApiIpzQAAAAASUVORK5CYII=') no-repeat;
        }
    }
</style>