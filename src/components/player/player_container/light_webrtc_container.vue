<template>
    <div class="light_container">
        <div class="player_cam" :id="varPlayerId"></div>
        <div v-show="useControl && isShowControl && playStatus !== E_PLAY_STATUS.not_connected" class="controller_wrap" @click="hideControl()">
            <div class="dimmed"></div>
            <div class="btns_wrap">
                <div class="btn_cont back_cont"></div>
                <div class="btn_cont play_cont">
                    <button type="button" class="sp pause" v-show="playStatus === E_PLAY_STATUS.play || playStatus === E_PLAY_STATUS.none" @click="clickPause" id="pause_btn"></button>
                    <button type="button" class="sp play" v-show="playStatus !== E_PLAY_STATUS.play && playStatus !== E_PLAY_STATUS.none" @click="clickPlay" id="play_btn"></button>
                </div>
                <div class="btn_cont forward_cont"></div>
            </div>
        </div>
        <div v-show="showTime && playStatus !== E_PLAY_STATUS.not_connected && playStatus !== E_PLAY_STATUS.not_support" id="time_wrap" class="time_wrap">
            <!--div class="time_dim"></div-->
            <div class="time_str_wrap">
                <div class="time_str">
                    <span class="date">{{getDateStr(playTime)}}</span>
                    <span class="time">{{getTimeStr(playTime)}}</span>
                </div>
            </div>
        </div>
        <div class="error_status_wrap" v-show="(playStatus === E_PLAY_STATUS.not_support) || (playStatus === E_PLAY_STATUS.not_connected)">
            <div class="error_mid_wrap">
                <div class="player_off_black">
                    <div></div>
                    <p class="tcam_light_play_error_desc" v-show="(playStatus === E_PLAY_STATUS.not_support)">{{language === 'ja' ? '対応していないブラウザー' : '지원하지 않는 브라우저 입니다.'}}</p>
                    <p class="tcam_light_play_error_desc" v-show="(playStatus === E_PLAY_STATUS.not_connected)">{{language === 'ja' ? 'カメラの接続が途切れました。' : '카메라의 접속이 끊겼습니다.'}}</p>
                </div>
            </div>
        </div>
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
        var fontSize = 14;
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

        if (getPlatform() === 'pc') {
            if (parent_w > 220) {
                fontSize = 24;
            } else if (parent_w > 150) {
                fontSize = 18;
            } else {
                fontSize = Math.floor(Math.min(fs1,fs2));
            }
            if (fontSize < 11) {
                fontSize = 11;
            }
            el.style.fontSize = fontSize + "px";
        } else {
            el.style.fontSize = '2.63vw';
        }
        return fontSize;
    }

    function addZero(data){
        return (data<10) ? "0"+data : data;
    }

    export default {
        name: 'playerContainer',
        props: ['serialNo', 'elementId', 'useControl', 'showTime', 'getTokenUrl',
            'credentialUrl', 'candidateUrl', 'offerUrl', 'requestHeaders', 'playEventHandler'],
        computed: {
        },
        data: function () {
            return {
                E_PLAY_STATUS : {
                    none : 0,
                    play : 1,
                    server_error : 3,
                    pause : 4,
                    not_support : 6,
                    not_connected : 7
                },
                E_PLAY_EVENT : {
                    start : 'start',
                    error : 'error',
                    webrtc_not_support_browser : 'webrtc_not_support_browser',
                    not_connected : 'not_connected'
                },
                player : null,
                playTimeoutId : null,
                playIntervalId : null,
                isLive : true,
                isShowControl : false,
                varPlayerId : this.elementId,
                playTime : 0,
                timeInterval : 100,
                playStatus : 0,
                retryTimeout : null,
                showControlTimeout : null,
                defGetTokenUrl : '/biz/cameras/token/:serialNo',
                defCredentialUrl : '/rtc/credential',
                defCandidateUrl : '/rtc/candidate',
                defOfferUrl : '/rtc/offer',
                language: 'ko',
                platform: 'pc'
            }
        },
        created : function() {
        },
        mounted : function() {
            this.language = getLanguage();
            setTimeout(() => {
                //getMaxFontSizeApprox(document.querySelector('.time_str'));
                if (getPlatform() !== 'pc') {
                    const errorTxtEl = document.querySelectorAll('.tcam_light_play_error_desc');
                    if (errorTxtEl) {
                        let i, len = errorTxtEl.length;
                        for (i = 0; i < len; i+=1) {
                            errorTxtEl[i].style.fontSize = '2.9vw';
                        }
                    }
                } else {
                    const btnWrap = document.querySelector('.btns_wrap');
                    const pauseBtn = document.getElementById('pause_btn');
                    const playBtn = document.getElementById('play_btn');
                    const backBtn = document.querySelector('.backward_btn');
                    const forwardBtn = document.querySelector('.forward_btn');
                    if (btnWrap) {
                        btnWrap.style.maxWidth = '353px';
                    }
                    if (pauseBtn) {
                        pauseBtn.style.maxWidth = '100px';
                        pauseBtn.style.maxHeight = '100px';
                    }
                    if (playBtn) {
                        playBtn.style.maxWidth = '100px';
                        playBtn.style.maxHeight = '100px';
                    }
                    if (backBtn) {
                        backBtn.style.maxWidth = '58px';
                        backBtn.style.maxHeight = '58px';
                    }
                    if (forwardBtn) {
                        forwardBtn.style.maxWidth = '58px';
                        forwardBtn.style.maxHeight = '58px';
                    }
                }
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
                        varPlayerId : this.varPlayerId,
                        requestHeaders : this.requestHeaders
                    }
                }).$mount('#' + this.varPlayerId);
                //this.showControl();
                this.player.$on('playerStatusChanged', this.playerStatusChangedHandler.bind(this));
                this.play();
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
                this.playTimeoutId = setTimeout(that.requestToken.bind(that)(function(resObj) {
                    if (resObj) {
                        that.playStart(resObj.cameraId, resObj.cvrHostPort, resObj.token);
                    }
                }), 200);
            },

            playStart : function (cameraId, cvrHostPort, token) {
                this.player.play(cameraId, cvrHostPort + '/flvplayback/' + cameraId + '?token=' + token);
                this.playTime = new Date().valueOf();
                this.startLiveTimer();
            },

            hideControl : function () {
                this.stopShowControlTimeout();
                this.isShowControl = false;
            },

            setHeaders : function (request) {
                if (request && this.requestHeaders) {
                    let key;
                    for (key in this.requestHeaders) {
                        request.setRequestHeader(key, this.requestHeaders[key]);
                    }
                }
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
                this.setHeaders(httpRequest);
                httpRequest.send();
            },

            showControl : function () {
                this.isShowControl = true;
                this.stopShowControlTimeout();
                this.showControlTimeout = setTimeout(() => {
                    if (this.playStatus !== this.E_PLAY_STATUS.pause) {
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
                if (this.playStatus === this.E_PLAY_STATUS.pause || this.playStatus === this.E_PLAY_STATUS.server_error) {
                    this.stop();
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
                return date.getFullYear() + '-' + addZero(date.getMonth() + 1) + '-' +  addZero(date.getDate());
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
                    background-size: contain;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-color: transparent;
                    appearance:none;
                    -webkit-appearance:none;
                    overflow:visible;border:0;cursor:pointer;line-height:0;outline:none;
                    &.backward_btn {
                        /*backward*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj4KICAgIDxkZWZzPgogICAgICAgIDxmaWx0ZXIgaWQ9ImEiIHdpZHRoPSIxMTklIiBoZWlnaHQ9IjEzMC44JSIgeD0iLTkuNSUiIHk9Ii0xNS40JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij4KICAgICAgICAgICAgPGZlT2Zmc2V0IGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJzaGFkb3dPZmZzZXRPdXRlcjEiLz4KICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIGluPSJzaGFkb3dPZmZzZXRPdXRlcjEiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMSIgc3RkRGV2aWF0aW9uPSIxIi8+CiAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IGluPSJzaGFkb3dCbHVyT3V0ZXIxIiByZXN1bHQ9InNoYWRvd01hdHJpeE91dGVyMSIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjcgMCIvPgogICAgICAgICAgICA8ZmVNZXJnZT4KICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0ic2hhZG93TWF0cml4T3V0ZXIxIi8+CiAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgICAgICAgPC9mZU1lcmdlPgogICAgICAgIDwvZmlsdGVyPgogICAgPC9kZWZzPgogICAgPGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWx0ZXI9InVybCgjYSkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkgMTcpIj4KICAgICAgICA8cGF0aCBkPSJNLjY5NCAxNC43OTdsMTYuMDQ0IDEwLjYzQzE5LjkxNCAyNy4zNiAyMCAyMy43ODQgMjAgMjMuNzg0VjIuMzMyYy0uMDg5LTMuNzctMy4wOTMtMS44MzctMy4wOTMtMS44MzdMLjg2NCAxMS41MTJjLTEuODQgMS41NDYtLjE3IDMuMjg1LS4xNyAzLjI4NXpNMjIuNjk0IDE0Ljc5N2wxNi4wNDQgMTAuNjNDNDEuOTE0IDI3LjM2IDQyIDIzLjc4NCA0MiAyMy43ODRWMi4zMzJjLS4wODktMy43Ny0zLjA5My0xLjgzNy0zLjA5My0xLjgzN0wyMi44NjQgMTEuNTEyYy0xLjg0IDEuNTQ2LS4xNyAzLjI4NS0uMTcgMy4yODV6Ii8+CiAgICA8L2c+Cjwvc3ZnPgo=');
                        &:active {
                            width: 50%;
                            padding-top: 50%;
                        }
                    }
                    &.forward_btn {
                        /*forward*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj4KICAgIDxkZWZzPgogICAgICAgIDxmaWx0ZXIgaWQ9ImEiIHdpZHRoPSIxMTklIiBoZWlnaHQ9IjEzMC44JSIgeD0iLTkuNSUiIHk9Ii0xNS40JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij4KICAgICAgICAgICAgPGZlT2Zmc2V0IGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJzaGFkb3dPZmZzZXRPdXRlcjEiLz4KICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIGluPSJzaGFkb3dPZmZzZXRPdXRlcjEiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMSIgc3RkRGV2aWF0aW9uPSIxIi8+CiAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IGluPSJzaGFkb3dCbHVyT3V0ZXIxIiByZXN1bHQ9InNoYWRvd01hdHJpeE91dGVyMSIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjcgMCIvPgogICAgICAgICAgICA8ZmVNZXJnZT4KICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0ic2hhZG93TWF0cml4T3V0ZXIxIi8+CiAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgICAgICAgPC9mZU1lcmdlPgogICAgICAgIDwvZmlsdGVyPgogICAgPC9kZWZzPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBkPSJNMCAwaDYwdjYwSDB6Ii8+CiAgICAgICAgPGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWx0ZXI9InVybCgjYSkiIHRyYW5zZm9ybT0ibWF0cml4KC0xIDAgMCAxIDUxIDE3KSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0uNjk0IDE0Ljc5N2wxNi4wNDQgMTAuNjNDMTkuOTE0IDI3LjM2IDIwIDIzLjc4NCAyMCAyMy43ODRWMi4zMzJjLS4wODktMy43Ny0zLjA5My0xLjgzNy0zLjA5My0xLjgzN0wuODY0IDExLjUxMmMtMS44NCAxLjU0Ni0uMTcgMy4yODUtLjE3IDMuMjg1ek0yMi42OTQgMTQuNzk3bDE2LjA0NCAxMC42M0M0MS45MTQgMjcuMzYgNDIgMjMuNzg0IDQyIDIzLjc4NFYyLjMzMmMtLjA4OS0zLjc3LTMuMDkzLTEuODM3LTMuMDkzLTEuODM3TDIyLjg2NCAxMS41MTJjLTEuODQgMS41NDYtLjE3IDMuMjg1LS4xNyAzLjI4NXoiLz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPgo=');
                        &:active {
                            width: 50%;
                            padding-top: 50%;
                        }
                        &.disabled {
                            cursor: default;
                            /*forward disabled*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIvPgogICAgICAgIDxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgb3BhY2l0eT0iLjQiPgogICAgICAgICAgICA8cGF0aCBkPSJNNTAuMzA2IDMxLjc5N2wtMTYuMDQ0IDEwLjYzQzMxLjA4NiA0NC4zNiAzMSA0MC43ODQgMzEgNDAuNzg0VjE5LjMzMmMuMDg5LTMuNzcgMy4wOTMtMS44MzcgMy4wOTMtMS44MzdsMTYuMDQzIDExLjAxN2MxLjg0IDEuNTQ2LjE3IDMuMjg1LjE3IDMuMjg1ek0yOC4zMDYgMzEuNzk3bC0xNi4wNDQgMTAuNjNDOS4wODYgNDQuMzYgOSA0MC43ODQgOSA0MC43ODRWMTkuMzMyYy4wODktMy43NyAzLjA5My0xLjgzNyAzLjA5My0xLjgzN2wxNi4wNDMgMTEuMDE3YzEuODQgMS41NDYuMTcgMy4yODUuMTcgMy4yODV6Ii8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K');
                            &:active {
                                width: 60%;
                                padding-top: 60%;
                            }
                        }
                    }
                    &.play {
                        /*play*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0IiB2aWV3Qm94PSIwIDAgMTA0IDEwNCI+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDBoMTA0djEwNEgweiIvPgogICAgICAgIDxjaXJjbGUgY3g9IjUyIiBjeT0iNTIiIHI9IjM3LjEzMyIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDIiIHN0cm9rZT0iI0YwRjBGMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgICAgPHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJub256ZXJvIiBkPSJNNjUuMDg0IDUzLjkxN0w0Ny4wMDggNjUuMjU1Yy0zLjU3OCAyLjA2Mi0zLjY3NS0xLjc1Mi0zLjY3NS0xLjc1MlY0MC42MjFjLjEtNC4wMiAzLjQ4NS0xLjk2IDMuNDg1LTEuOTZsMTguMDc1IDExLjc1MmMyLjA3MyAxLjY1LjE5MSAzLjUwNC4xOTEgMy41MDR6Ii8+CiAgICA8L2c+Cjwvc3ZnPgo=');
                    }
                    &.pause {
                        /*pause*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0IiB2aWV3Qm94PSIwIDAgMTA0IDEwNCI+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDBoMTA0djEwNEgweiIvPgogICAgICAgIDxjaXJjbGUgY3g9IjUyIiBjeT0iNTIiIHI9IjM3LjEzMyIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDIiIHN0cm9rZT0iI0YwRjBGMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgICAgPHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJub256ZXJvIiBkPSJNNDMuMzMzIDM4LjEzM2g1LjJ2MjcuNzMzaC01LjJ6TTU1LjQ2NyAzOC4xMzNoNS4ydjI3LjczM2gtNS4yeiIvPgogICAgPC9nPgo8L3N2Zz4K');
                    }
                    &.replay {
                        /*replay*/ background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0IiB2aWV3Qm94PSIwIDAgMTA0IDEwNCI+CiAgICA8ZGVmcz4KICAgICAgICA8ZmlsdGVyIGlkPSJhIiB3aWR0aD0iMTEyLjUlIiBoZWlnaHQ9IjExMy43JSIgeD0iLTYuMiUiIHk9Ii02LjglIiBmaWx0ZXJVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giPgogICAgICAgICAgICA8ZmVPZmZzZXQgaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9InNoYWRvd09mZnNldE91dGVyMSIvPgogICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgaW49InNoYWRvd09mZnNldE91dGVyMSIgcmVzdWx0PSJzaGFkb3dCbHVyT3V0ZXIxIiBzdGREZXZpYXRpb249IjEiLz4KICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggaW49InNoYWRvd0JsdXJPdXRlcjEiIHJlc3VsdD0ic2hhZG93TWF0cml4T3V0ZXIxIiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuNyAwIi8+CiAgICAgICAgICAgIDxmZU1lcmdlPgogICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJzaGFkb3dNYXRyaXhPdXRlcjEiLz4KICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICAgICAgICA8L2ZlTWVyZ2U+CiAgICAgICAgPC9maWx0ZXI+CiAgICA8L2RlZnM+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDBoMTA0djEwNEgweiIvPgogICAgICAgIDxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsdGVyPSJ1cmwoI2EpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOS4wNjcgMjQuMjY3KSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zNC4yMSAwYzE2LjI3MyAwIDI5LjQ2NiAxMy4xOTMgMjkuNDY2IDI5LjQ2N1M1MC40ODMgNTguOTMzIDM0LjIwOSA1OC45MzNjLTE0LjUgMC0yNi41NTMtMTAuNDcyLTI5LjAxLTI0LjI2NmgzLjUzYzIuNDEgMTEuODY3IDEyLjkwMiAyMC44IDI1LjQ4IDIwLjggMTQuMzYgMCAyNi0xMS42NCAyNi0yNnMtMTEuNjQtMjYtMjYtMjZhMjUuOTAzIDI1LjkwMyAwIDAgMC0xNy4zMzQgNi42MnYtMS40MmgtMy41MzhDMTguNjczIDMuMzEyIDI2LjA1NCAwIDM0LjIxIDB6Ii8+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik04LjE0MyAxNS43MTVsMTIuNDY0LjM2OGMyLjM5Mi0uMDI4Ljg1Ni0yLjE1My44NTYtMi4xNTNMMTEuOTk1IDEuMzY2Yy0xLjcwNi0yLjE3NS0yLjMxLjA1My0yLjMxLjA1M2wtMi45MSAxMi4zMWMtLjIwOSAxLjU3NyAxLjM2OCAxLjk4NiAxLjM2OCAxLjk4NnoiLz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPgo=');
                    }
                }
            }
        }
        .time_wrap {
            margin: 0 auto;
            padding-top: 3.2vw;
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
                text-align: center;
                .full_sized;
            }
            .time_str {
                display: inline-block;
                width: 31.4vw;
                box-sizing: border-box;
                line-height: 2;
                border-radius: 0.8vw;
                box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.16);
                background-color: rgba(38, 38, 38, 0.7);
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