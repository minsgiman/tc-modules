<template>
    <div class="light_container">
        <div class="player_cam" :id="varPlayerId"></div>
        <div v-show="useControl && isShowControl" class="controller_wrap" @click="hideControl()">
            <div class="dimmed"></div>
            <div class="btns_wrap">
                <div class="btn_cont back_cont">
                    <button v-if="!isLive" class="backward_btn" @click="cvrMoveByInterval('b', $event)"></button>
                </div>
                <div class="btn_cont play_cont">
                    <button type="button" class="sp pause" v-show="playStatus === E_PLAY_STATUS.play || playStatus === E_PLAY_STATUS.none" @click="clickPause" id="pause_btn"></button>
                    <button type="button" class="sp play" v-show="playStatus !== E_PLAY_STATUS.play && playStatus !== E_PLAY_STATUS.none" @click="clickPlay" id="play_btn"></button>
                </div>
                <div class="btn_cont forward_cont">
                    <button v-if="!isLive" class="forward_btn" @click="cvrMoveByInterval('f', $event)"></button>
                </div>
            </div>
        </div>
        <div v-show="showTime" class="time_wrap">
            <div class="time_dim"></div>
            <div class="time_str_wrap">
                <div class="time_str">
                    <span class="date">{{getDateStr(playTime)}}</span>
                    <span class="time">{{getTimeStr(playTime)}}</span>
                </div>
            </div>
        </div>
        <div class="error_status_wrap" v-show="(playStatus === E_PLAY_STATUS.no_cvr) || (playStatus === E_PLAY_STATUS.not_support)">
            <div class="error_mid_wrap">
                <div class="player_off_black">
                    <div></div>
                    <p v-show="(playStatus === E_PLAY_STATUS.no_cvr)">{{language === 'ja' ? '保存された映像がありません。' :  '저장된 영상이 없습니다.'}}</p>
                    <p v-show="(playStatus === E_PLAY_STATUS.not_support)">{{language === 'ja' ? '対応していないブラウザー' : '지원하지 않는 브라우저 입니다.'}}</p>
                </div>
            </div>
        </div>
        <div class="click_layer" @click="showControl()"></div>
    </div>
</template>
<script>
    import webRTCPlayer from './light_webrtc_player';
    import Vue from 'vue';
    import browser from './../browser_checker';

    function setPathParams (url, params) {
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
    }

    function getPlatform() {
        const uagentLow = navigator.userAgent.toLocaleLowerCase();
        let platform = 'pc';

        if (uagentLow.search("android") > -1) {
            platform = 'aos';
        } else if (uagentLow.search("iphone") > -1 || uagentLow.search("ipad") > -1 || uagentLow.search("ipod") > -1) {
            platform = 'ios';
        }
        return platform;
    }

    function getLanguage() {
        let locale = 'ko';
        if (navigator.language.indexOf('ko') != -1) {
            locale = 'ko';
        } else if (navigator.language.indexOf('ja') != -1) {
            locale = 'ja';
        } else if (navigator.language.indexOf('en') != -1) {
            locale = 'en';
        }
        return locale;
    }

    function getMaxFontSizeApprox(el) {
        var fontSize = 18;
        var p = el.parentNode.parentNode;

        var parent_h = p.offsetHeight ? p.offsetHeight : p.style.pixelHeight;
        if(!parent_h)
            parent_h = 0;

        var parent_w = p.offsetHeight ? p.offsetWidth : p.style.pixelWidth;
        if(!parent_w)
            parent_w = 0;

        el.style.fontSize = fontSize + "px";

        var el_h = el.offsetHeight ? el.offsetHeight : el.style.pixelHeight;
        if(!el_h)
            el_h = 0;

        var el_w = el.offsetHeight ? el.offsetWidth : el.style.pixelWidth;
        if(!el_w)
            el_w = 0;

        // 0.5 is the error on the measure that JavaScript does
        // if the real measure had been 12.49 px => JavaScript would have said 12px
        // so we think about the worst case when could have, we add 0.5 to
        // compensate the round error
        var fs1 = (fontSize*(parent_w + 0.5))/(el_w + 0.5);
        var fs2 = (fontSize*(parent_h) + 0.5)/(el_h + 0.5);

        fontSize = Math.floor(Math.min(fs1,fs2));
        fontSize += 1;
        el.style.fontSize = fontSize + "px";
        return fontSize;
    }

    function addZero(data){
        return (data<10) ? "0"+data : data;
    }

    export default {
        name: 'playerContainer',
        props: ['serialNo', 'elementId', 'startTime', 'endTime', 'cvrMoveInterval', 'useControl', 'loop', 'showTime', 'getTokenUrl',
            'credentialUrl', 'candidateUrl', 'getTimelineUrl', 'offerUrl', 'playEventHandler'],
        computed: {
        },
        data: function () {
            return {
                E_PLAY_STATUS : {
                    none : 0,
                    play : 1,
                    finish : 2,
                    server_error : 3,
                    pause : 4,
                    no_cvr : 5,
                    not_support : 6
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
                isLive : false,
                isShowControl : false,
                varPlayerId : this.elementId,
                playTime : 0,
                timeInterval : 100,
                playStatus : 0,
                retryTimeout : null,
                showControlTimeout : null,
                defCvrMoveInterval : 5000,
                defGetTokenUrl : '/biz/cameras/token/:serialNo',
                defGetTimelineUrl : '/biz/cameras/:serialNo/video',
                defCredentialUrl : '/rtc/credential',
                defCandidateUrl : '/rtc/candidate',
                defOfferUrl : '/rtc/offer',
                isCvrLoading : false,
                cvrData: {
                    startTime: 0,
                    endTime: 0,
                    recordList: []
                },
                language: 'ko',
                platform: 'pc'
            }
        },
        created : function() {
        },
        mounted : function() {
            this.language = getLanguage();
            setTimeout(() => {
                getMaxFontSizeApprox(document.querySelector('.time_str'));
            }, 100);
        },
        beforeDestroy : function() {
            this.stopPlayTimeout();
            this.stopPlayTimer();
            this.stopRetryTimeout();
            if (this.player) {
                this.player.$destroy();
            }
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods : {
            initPlayer : function () {
                this.platform = getPlatform();
                if ((this.platform === 'pc' && (browser.name === 'Internet Explorer' || browser.name === 'Edge' || (browser.name === 'Safari' && browser.version < 11))) ||
                    (this.platform === 'ios' && (browser.name === 'Chrome' || (browser.name === 'Safari' && browser.version < 11)))) {
                    this.playStatus = this.E_PLAY_STATUS.not_support;
                    if (this.playEventHandler) {
                        this.playEventHandler({status: this.E_PLAY_EVENT.webrtc_not_support_browser});
                    }
                    return;
                }

                const vExtendConstructor = Vue.extend(webRTCPlayer);
                this.player = new vExtendConstructor({
                    propsData : {
                        credentialUrl : this.credentialUrl ? this.credentialUrl : this.defCredentialUrl,
                        candidateUrl : this.candidateUrl ? this.candidateUrl : this.defCandidateUrl,
                        offerUrl : this.offerUrl ? this.offerUrl : this.defOfferUrl,
                        varPlayerId : this.varPlayerId
                    }
                }).$mount('#' + this.varPlayerId);
                this.isLive = !this.startTime;
                //this.showControl();
                this.player.$on('playerStatusChanged', this.playerStatusChangedHandler.bind(this));
                this.play(this.startTime);
            },
            play : function (time) {
                const that = this;
                if (time) {
                    this.playTime = time;
                } else {
                    this.playTime = 0;
                }

                this.playStatus = that.E_PLAY_STATUS.none;
                this.stopPlayTimer();
                this.stopRetryTimeout();
                this.stopPlayTimeout();

                if (this.playTime) {
                    this.requestTimeline(function(resObj) {
                        if (resObj) {
                            that.cvrData.recordList = resObj.recordList;
                            if (that.checkHasCvr(time, resObj.recordList)) {
                                that.playTimeoutId = setTimeout(that.requestToken.bind(that)(function(resObj) {
                                    if (resObj) {
                                        that.playStart(resObj.cameraId, resObj.cvrHostPort, resObj.token);
                                    }
                                }), 200);
                            } else {
                                that.playStatus = that.E_PLAY_STATUS.no_cvr;
                                //that.hideControl();
                            }
                        }
                    });
                } else {
                    this.playTimeoutId = setTimeout(that.requestToken.bind(that)(function(resObj) {
                        if (resObj) {
                            that.playStart(resObj.cameraId, resObj.cvrHostPort, resObj.token);
                        }
                    }), 200);
                }
            },

            playStart : function (cameraId, cvrHostPort, token) {
                if (this.playTime) {
                    this.player.play(cameraId, cvrHostPort + '/flvplayback/' + cameraId + '?token=' + token + '&time=' + this.playTime);
                    this.startPlayTimer();
                } else {
                    this.player.play(cameraId, cvrHostPort + '/flvplayback/' + cameraId + '?token=' + token);
                    this.playTime = new Date().valueOf();
                    this.startLiveTimer();
                }
            },

            checkHasCvr : function (time, recTimes) {
                if (!recTimes || !recTimes.length) {
                    return false;
                }

                return recTimes.some((recTime) => {
                    return (parseInt(recTime.startTime) <= time) && (parseInt(recTime.endTime) >= time);
                });
            },

            hideControl : function () {
                this.stopShowControlTimeout();
                this.isShowControl = false;
            },

            cvrMoveByInterval : function (direction, event) {
                this.showControl();
                if (direction === 'b') {
                    this.stop();
                    this.play(this.playTime - (this.cvrMoveInterval ? this.cvrMoveInterval : this.defCvrMoveInterval));
                } else if (direction === 'f') {
                    const fTime = this.playTime + (this.cvrMoveInterval ? this.cvrMoveInterval : this.defCvrMoveInterval);
                    const curDate = new Date();
                    this.stop();
                    this.play(fTime >= curDate.valueOf() ? 0 : fTime);
                }
                event.preventDefault();
                event.stopPropagation();
            },

            requestTimeline : function (callback) {
                const httpRequest = new XMLHttpRequest();
                this.isCvrLoading = true;
                httpRequest.onreadystatechange = () => {
                    if (httpRequest.readyState === XMLHttpRequest.DONE) {
                        if (httpRequest.status === 200) {
                            const resObj = JSON.parse(httpRequest.responseText);
                            callback(resObj);
                        } else {
                            callback(null);
                        }
                        this.isCvrLoading = false;
                    }
                };

                const startDate = new Date(this.playTime);
                const endDate = new Date(this.playTime);
                startDate.setMinutes(0);
                startDate.setSeconds(0);
                startDate.setMilliseconds(0);
                endDate.setMinutes(0);
                endDate.setSeconds(1);
                endDate.setHours(startDate.getHours() + 1);
                this.cvrData.startTime = startDate.valueOf();
                this.cvrData.endTime = endDate.valueOf();
                const timelineUrl = this.getTimelineUrl ? this.getTimelineUrl : this.defGetTimelineUrl;
                httpRequest.open('GET', setPathParams(timelineUrl + '?startTime=' + this.cvrData.startTime + '&endTime=' + this.cvrData.endTime , {serialNo : this.serialNo}));
                httpRequest.send();
            },

            requestToken : function (callback) {
                if (!this.player) {
                    return null;
                }
                const httpRequest = new XMLHttpRequest();
                httpRequest.onreadystatechange = () => {
                    if (httpRequest.readyState === XMLHttpRequest.DONE) {
                        if (httpRequest.status === 200) {
                            const resObj = JSON.parse(httpRequest.responseText);
                            callback(resObj);
                        } else {
                            callback(null);
                        }
                    }
                };
                httpRequest.open('GET', setPathParams((this.getTokenUrl ? this.getTokenUrl : this.defGetTokenUrl), {serialNo : this.serialNo}));
                httpRequest.send();
            },

            showControl : function () {
                this.isShowControl = true;
                this.stopShowControlTimeout();
                this.showControlTimeout = setTimeout(() => {
                    if (this.playStatus !== this.E_PLAY_STATUS.finish) {
                        this.isShowControl = false;
                    }
                }, 3000);
            },

            clickPause : function(event) {
                this.pause();
                this.showControl();
                event.stopPropagation();
                event.preventDefault();
            },

            clickPlay : function(event) {
                this.resume();
                this.showControl();
                event.stopPropagation();
                event.preventDefault();
            },

            resume : function () {
                if (this.playStatus === this.E_PLAY_STATUS.pause || this.playStatus === this.E_PLAY_STATUS.server_error || this.playStatus === this.E_PLAY_STATUS.no_cvr) {
                    this.stop();
                    if (this.startTime) { //CVR
                        this.playStatus = this.E_PLAY_STATUS.play;
                        this.play(this.playTime ? this.playTime : this.startTime);
                    } else { //Live
                        this.play();
                    }
                } else if (this.playStatus === this.E_PLAY_STATUS.finish) {
                    this.replay();
                }
            },
            replay : function (startTime, endTime) {
                if (startTime && endTime) {
                    this.startTime = startTime;
                    this.endTime = endTime;
                }
                this.stop();
                if (this.startTime) { //CVR
                    this.playStatus = this.E_PLAY_STATUS.play;
                    this.play(this.startTime);
                } else { //Live
                    this.play();
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
                const week = this.language === 'ja' ? ['日', '月', '火', '水', '木', '金', '土'] : ['일', '월', '화', '수', '목', '금', '토'];
                const dayOfWeek = week[date.getDay()];

                return addZero(date.getMonth()+1) + '.' + addZero(date.getDate().toString()) + ' (' + dayOfWeek + ') ';
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
                                that.playEventHandler({status: that.playStatus});
                            }
                            if (that.loop != false) {
                                that.play(that.startTime);
                            } else {
                                that.showControl();
                            }
                        } else if (!that.isCvrLoading) {
                            const curDate = new Date(that.playTime);
                            if (curDate.getMilliseconds() >= 900) {
                                if (!that.checkHasCvr(that.playTime, that.cvrData.recordList)) {
                                    that.stop();
                                    that.playStatus = that.E_PLAY_STATUS.no_cvr;
                                    if (that.playEventHandler) {
                                        that.playEventHandler({status: that.playStatus});
                                    }
                                    that.hideControl();
                                } else if (curDate.getMinutes() === 59 && curDate.getSeconds() === 59) {
                                    that.requestTimeline(function(resObj) {
                                        if (resObj) {
                                            that.cvrData.recordList = resObj.recordList;
                                        }
                                    });
                                }
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
            stopRetryTimeout : function () {
                if (this.retryTimeout) {
                    clearTimeout(this.retryTimeout);
                    this.retryTimeout = null;
                }
            },
            stopPlayTimeout : function () {
                if (this.playTimeoutId) {
                    clearTimeout(this.playTimeoutId);
                    this.playTimeoutId = null;
                }
            },
            stopShowControlTimeout : function () {
                if (this.showControlTimeout) {
                    clearTimeout(this.showControlTimeout);
                    this.showControlTimeout = null;
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
                    if (this.playStatus === this.E_PLAY_STATUS.no_cvr) {
                        return;
                    }
                    this.playStatus = this.E_PLAY_STATUS.server_error;
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
    .full_sized {
        width:100%;
        height:100%;
    }
    .light_container {
        .full_sized;
        position:relative;
        .player_cam {
            .full_sized;
        }
        .click_layer {
            position: absolute;
            z-index: 11;
            .full_sized;
        }
        .controller_wrap {
            .full_sized;
            position: relative;
            z-index:12;
            .dimmed {
                .full_sized;
                position: absolute;
                left: 0px;
                top: 0px;
                opacity: 0.3;
                background-color: #000000;
            }
            .btns_wrap {
                position: relative;
                display: table;
                margin: 0 auto;
                width: 50%;
                height: 100%;
            }
            .btn_cont {
                display: table-cell;
                text-align: center;
                vertical-align: middle;
                &.back_cont {
                    width: 8%;
                }
                &.play_cont {
                    width: 13.8%;
                }
                &.forward_cont {
                    width: 8%;
                }
                button {
                    display: inline-block;
                    width: 60%;
                    padding-top:60%;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-color: transparent;
                    appearance:none;
                    -webkit-appearance:none;
                    overflow:visible;border:0;cursor:pointer;line-height:0;outline:none;
                    &.backward_btn {
                        /*backward*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj4KICAgIDxkZWZzPgogICAgICAgIDxmaWx0ZXIgaWQ9ImEiIHdpZHRoPSIxMTguMiUiIGhlaWdodD0iMTE1LjQlIiB4PSItOS4xJSIgeT0iLTcuNyUiIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCI+CiAgICAgICAgICAgIDxmZU9mZnNldCBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+CiAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiIHN0ZERldmlhdGlvbj0iMSIvPgogICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ic2hhZG93Qmx1ck91dGVyMSIgcmVzdWx0PSJzaGFkb3dNYXRyaXhPdXRlcjEiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMSAwIi8+CiAgICAgICAgICAgIDxmZU1lcmdlPgogICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJzaGFkb3dNYXRyaXhPdXRlcjEiLz4KICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICAgICAgICA8L2ZlTWVyZ2U+CiAgICAgICAgPC9maWx0ZXI+CiAgICA8L2RlZnM+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz4KICAgICAgICA8ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbHRlcj0idXJsKCNhKSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOCA0KSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMiA3YzEyLjE1IDAgMjIgOS44NSAyMiAyMnMtOS44NSAyMi0yMiAyMlMwIDQxLjE1IDAgMjljMC0uNjc0LjAzLTEuMzQxLjA5LTJoNC4wMmMtLjA3My42NTctLjExIDEuMzI0LS4xMSAyIDAgOS45NDEgOC4wNTkgMTggMTggMThzMTgtOC4wNTkgMTgtMTgtOC4wNTktMTgtMTgtMThjLS4zMzUgMC0uNjY5LjAxLTEgLjAyN1Y3LjAyMmMuMzMyLS4wMTUuNjY1LS4wMjIgMS0uMDIyeiIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMTIuMzQ3IDkuNTM3bDguMDIyIDYuMTMyYzEuNTg4IDEuMTE1IDEuNjMxLS45NDcgMS42MzEtLjk0N1YyLjM0NWMtLjA0NC0yLjE3NC0xLjU0Ny0xLjA2LTEuNTQ3LTEuMDZsLTguMDIxIDYuMzU3Yy0uOTIuODkyLS4wODUgMS44OTUtLjA4NSAxLjg5NXoiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTMuMzQ3IDkuNTM3bDguMDIyIDYuMTMyYzEuNTg4IDEuMTE1IDEuNjMxLS45NDcgMS42MzEtLjk0N1YyLjM0NWMtLjA0NC0yLjE3NC0xLjU0Ny0xLjA2LTEuNTQ3LTEuMDZMMy40MzIgNy42NDNjLS45Mi44OTItLjA4NSAxLjg5NS0uMDg1IDEuODk1eiIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==');
                        &:active {
                            width: 50%;
                            padding-top: 50%;
                        }
                    }
                    &.forward_btn {
                        /*forward*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj4KICAgIDxkZWZzPgogICAgICAgIDxmaWx0ZXIgaWQ9ImEiIHdpZHRoPSIxMTguMiUiIGhlaWdodD0iMTE1LjQlIiB4PSItOS4xJSIgeT0iLTcuNyUiIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCI+CiAgICAgICAgICAgIDxmZU9mZnNldCBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+CiAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiIHN0ZERldmlhdGlvbj0iMSIvPgogICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ic2hhZG93Qmx1ck91dGVyMSIgcmVzdWx0PSJzaGFkb3dNYXRyaXhPdXRlcjEiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMSAwIi8+CiAgICAgICAgICAgIDxmZU1lcmdlPgogICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJzaGFkb3dNYXRyaXhPdXRlcjEiLz4KICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICAgICAgICA8L2ZlTWVyZ2U+CiAgICAgICAgPC9maWx0ZXI+CiAgICA8L2RlZnM+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz4KICAgICAgICA8ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbHRlcj0idXJsKCNhKSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgNTIgNCkiPgogICAgICAgICAgICA8cGF0aCBkPSJNMjIgN2MxMi4xNSAwIDIyIDkuODUgMjIgMjJzLTkuODUgMjItMjIgMjJTMCA0MS4xNSAwIDI5YzAtLjY3NC4wMy0xLjM0MS4wOS0yaDQuMDJjLS4wNzMuNjU3LS4xMSAxLjMyNC0uMTEgMiAwIDkuOTQxIDguMDU5IDE4IDE4IDE4czE4LTguMDU5IDE4LTE4LTguMDU5LTE4LTE4LTE4Yy0uMzM1IDAtLjY2OS4wMS0xIC4wMjdWNy4wMjJjLjMzMi0uMDE1LjY2NS0uMDIyIDEtLjAyMnoiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTEyLjM0NyA5LjUzN2w4LjAyMiA2LjEzMmMxLjU4OCAxLjExNSAxLjYzMS0uOTQ3IDEuNjMxLS45NDdWMi4zNDVjLS4wNDQtMi4xNzQtMS41NDctMS4wNi0xLjU0Ny0xLjA2bC04LjAyMSA2LjM1N2MtLjkyLjg5Mi0uMDg1IDEuODk1LS4wODUgMS44OTV6Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zLjM0NyA5LjUzN2w4LjAyMiA2LjEzMmMxLjU4OCAxLjExNSAxLjYzMS0uOTQ3IDEuNjMxLS45NDdWMi4zNDVjLS4wNDQtMi4xNzQtMS41NDctMS4wNi0xLjU0Ny0xLjA2TDMuNDMyIDcuNjQzYy0uOTIuODkyLS4wODUgMS44OTUtLjA4NSAxLjg5NXoiLz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPgo=');
                        &:active {
                            width: 50%;
                            padding-top: 50%;
                        }
                    }
                    &.play {
                        /*play*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTA0IiBoZWlnaHQ9IjEwNCIgdmlld0JveD0iMCAwIDEwNCAxMDQiPgogICAgPGRlZnM+CiAgICAgICAgPHBhdGggaWQ9ImIiIGQ9Ik04Mi4zIDU2Ljc5M0wzOC41OTcgODUuMTM5Yy04LjY1IDUuMTUzLTguODg0LTQuMzgtOC44ODQtNC4zOFYyMy41NTFjLjI0Mi0xMC4wNTEgOC40MjUtNC44OTggOC40MjUtNC44OThsNDMuNjk5IDI5LjM3OGM1LjAxIDQuMTI0LjQ2MSA4Ljc2LjQ2MSA4Ljc2eiIvPgogICAgICAgIDxmaWx0ZXIgaWQ9ImEiIHdpZHRoPSIxMDUuNSUiIGhlaWdodD0iMTA0LjMlIiB4PSItMi44JSIgeT0iLTIuMiUiIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCI+CiAgICAgICAgICAgIDxmZU9mZnNldCBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+CiAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiIHN0ZERldmlhdGlvbj0iLjUiLz4KICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggaW49InNoYWRvd0JsdXJPdXRlcjEiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMSAwIi8+CiAgICAgICAgPC9maWx0ZXI+CiAgICA8L2RlZnM+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDBoMTA0djEwNEgweiIvPgogICAgICAgIDxnIGZpbGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgIDx1c2UgZmlsbD0iIzAwMCIgZmlsdGVyPSJ1cmwoI2EpIiB4bGluazpocmVmPSIjYiIvPgogICAgICAgICAgICA8dXNlIGZpbGw9IiNGRkYiIHhsaW5rOmhyZWY9IiNiIi8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K');
                    }
                    &.pause {
                        /*pause*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0IiB2aWV3Qm94PSIwIDAgMTA0IDEwNCI+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDBoMTA0djEwNEgweiIvPgogICAgICAgIDxnIGZpbGw9IiNGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMjkuNzE0IDE3LjMzM2gxMi4zODF2NjkuMzMzaC0xMi4zOHpNNjEuOTA0IDE3LjMzM2gxMi4zODF2NjkuMzMzaC0xMi4zOHoiLz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPgo=');
                    }
                }
            }
        }
        .time_wrap {
            position: absolute;
            left: 12px;
            top: 12px;
            width: 28%;
            height: 10%;
            z-index: 20;
            .time_dim {
                position: absolute;
                left: 0px;
                top: 0px;
                .full_sized;
                border-radius: 6px;
                opacity: 0.48;
                background-color: #000000;
            }
            .time_str_wrap {
                position: relative;
                display: table;
                .full_sized;
            }
            .time_str {
                display: table-cell;
                position: relative;
                font-size: 0;
                color: white;
                text-align: center;
                vertical-align: middle;
            }
        }

        .error_status_wrap {
            .full_sized;
            position: absolute;
            background: #222;
            left: 0px;
            top: 0px;
            z-index: 10;
            .error_mid_wrap {
                .full_sized;
                display: table;
                text-align: center;
                .player_off_black {
                    display: table-cell;
                    vertical-align: middle;
                    p {
                        color: #ffffff;
                    }
                }
            }
        }
    }
</style>