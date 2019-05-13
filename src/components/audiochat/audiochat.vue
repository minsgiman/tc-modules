<template>
    <div class="audio_chat">
        <!-- header -->
        <!-- audiochat_pop_alert : 오디오챗 미지원 브라우저 얼럿 -->
        <div class="audiochat_pop_alert" v-show="notSupportAudioChat">
            <div class="audiochat_pop_alert_area">
                <button class="audiochat_pop_alert_close_btn">
                    <div class="audiochat_pop_alert_close_btn_img"></div>
                </button>

                <button class="audiochat_pop_alert_chrome_btn">
                    <img src="/resources/im/icon_chrome.png" class="audiochat_chrome_img">
                    <span class="audiochat_pop_alert_chrome_btn_txt" @click="chromeDownload()">Chrome {{$t('BUTTON_DOWNLOAD')}}</span>
                </button>

                <div class="audiochat_pop_alert_close_btn_txt">現在使用しているブラウザは、トーストカムオーディオチャットをサポートしていません。<br>ChromeまたはSafari 11バージョンのブラウザで実行してください</div>
            </div>
            <div class="audiochat_pop_alert_line"></div>
        </div>

        <div class="toggle cont_min">
            <div id="wrap">
                <!-- container -->
                <div id="container_audiochat">
                    <!-- content -->
                    <div id="content_audiochat_detail">
                        <div class="inr">
                            <div class="tit_area fclear">
                                <h2 class="tit fl tit_xx">{{labelName}}</h2>
                            </div>
                            <!-- camdtl_view -->
                            <div class="camdtl_view" style="margin-top:12px;" >

                                <div class="audiochat_player_area0">
                                    <div class="audiochat_player_area1" id="fullscreen">
                                        <div class="player_cam" id="playerAudioChat" style="position:absolute; left:0px; top:0px; width:inherit; height:100%;"></div>
                                    </div>

                                    <div class="audiochat_top_area">
                                        <div class="audiochat_red_alert" v-show="showUpperAlertMsg">{{upperAlertMsg}}</div>
                                        <div class="audiochat_center_txt_area">
                                            <div class="audiochat_center_txt1" style="display:none;">
                                                {{$t('AUDIOCHAT_TIME')}}
                                                <span class="audiochat_center_txt2">{{audioChatTime}}</span>
                                            </div>
                                            <span v-show="audioChatStatus != 'fail'" class="audiochat_center_txt3">{{connectingStr}}</span>
                                        </div>
                                    </div>

                                    <div class="audiochat_player_center_thumb_area" style="display:none;">
                                        <div class="audiochat_player_center_thumb"></div>
                                    </div>
                                    <div style="display:none;" class="localStream">
                                        <video id="localVideo" muted="muted" autoplay="true"></video>
                                    </div>
                                    <div style="display:none;" class="remoteStreams">
                                        <h2>Remote Streams</h2>
                                        <div id="remoteVideosContainer"></div>
                                    </div>
                                    <div class="audiochat_retry_btn_area">
                                        <button type="button" class="audiochat_retry_btn2" @click="audioChatStop()"></button>
                                    </div>

                                    <div v-show="audioChatStatus === 'fail'" class="fail_retry_wrap">
                                        <h4>{{$t('AUDIOCHAT_CON_FAIL')}}</h4>
                                        <div class="retry_btn_wrap">
                                            <p>{{$t('SETUP_FIN_MSG4')}}<br>{{$t('9rRqk7Vo_01968')}}</p>
                                            <button class="audio_chat_retry" @click="retryAudioChat()">{{$t('AUDIOCHAT_RETRY')}}</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <!-- //camdtl_view -->
                        </div>
                    </div>
                    <!-- //content -->
                </div>
                <!-- //container -->
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { i18n } from '../../i18n/audiochat/i18n';
    import webrtc from '../../service/audiochat/webrtc';
    import toastcamAPIs from './../../service/toastcamAPIs';

    var getBrowserType = function() {
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

    var Player = function (cameraId, mediaUrl) {
        var mediaIp = Util.getServerIp(mediaUrl);

        this.control = new VideoInfraRMCPlayer('playerAudioChat', 'rmcPlayer_flash',
            cameraId, '', '', 'flash', '100%', '100%', '',
            '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf',
            '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf',
            mediaIp,mediaUrl);
        this.control.zoomZone(450, 150);
        this.control.properties.jsCallable = 'true';
        this.control.displayRMCPlayer();
    };

    Player.prototype = {
        play: function () {
            this.control.play();
        },

        pause: function () {
            this.control.pause();
        }
    };

    export default {
        name: 'audiochat',
        props: ['pCameraId', 'pEventCb'],
        computed: {
        },
        data: function () {
            return {
                player : null,
                webrtc : null,
                fullscreenTimer : null,
                fullscreenFlag : false,
                audioChatTimeValue : 0,
                intervalId : null,
                chatTimeIntervalId : null,
                connectionTime : 0,
                AUDIO_CHAT_STATUS : {
                    CONNECTING : 'connecting',
                    FAIL : 'fail',
                    ONGOING : 'ongoing'
                },
                browserType : '',
                showUpperAlertMsg : false,
                labelName : '',
                isMute : false,
                isShowVideo : true,
                notSupportAudioChat : false,
                upperAlertMsg : '',
                connectingStr : '',
                audioChatTime : '00:00',
                audioChatStatus : ''
            }
        },
        created : function() {
            this.browserType = getBrowserType();
            this.connectingStr = this.$i18n.t('AUDIOCHAT_CONNECTING') + "...";
            this.audioChatTime = '00:00';
            this.audioChatStatus = this.AUDIO_CHAT_STATUS.CONNECTING;
            const vConstructor = Vue.extend(webrtc);
            this.webrtc = new vConstructor({i18n, propsData: null});
            this.webrtc.$on('event', this.webrtcStatusHandler.bind(this));
        },
        mounted : function() {
            window.onPlayerStatusChangeFlash = (status) => {
                if (status === 'NetStream.Play.Start') {
                    if (this.isMute !== true) {
                        this.isMute = true;
                        this.player.control.mute();
                    }
                }
            };
            this.livePlayStart();
        },
        beforeDestroy : function() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            if (this.chatTimeIntervalId) {
                clearInterval(this.chatTimeIntervalId);
            }
            if (this.player) {
                this.player.control.destroy();	// ie에서 메모리 계속 점유..
            }
            window.onPlayerStatusChangeFlash = null;
        },
        methods : {
            audioChatTimer : function () {
                var minutes = 0, seconds = 0, minuteStr, secondStr;

                this.audioChatTimeValue += 1;
                seconds = this.audioChatTimeValue % 60;
                minutes = parseInt(this.audioChatTimeValue / 60, 10);

                if (seconds < 10) {
                    secondStr = '0' + seconds;
                } else {
                    secondStr = '' + seconds;
                }
                if (minutes < 10) {
                    minutes = '0' + minutes;
                } else {
                    minutes = '' + minutes;
                }
                this.audioChatTime = minutes + ':' + secondStr;
            },

            showAlert : function (title, message) {
                this.showAlert = true;
                this.alertTitle = title;
                this.alertMessage = message;
            },

            hideAlert : function () {
                this.showAlert = false;
            },

            pressedFullScreenButton : function () {
                if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                    var rv = 0;
                    var ua = navigator.userAgent;
                    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                    if (re.exec(ua) != null)
                        rv = parseFloat(RegExp.$1);
                    if(rv != 0 && rv <=10){
                        this.showAlert(this.$i18n.t("EXPLORE_UNDER10_SUBJECT"), this.$i18n.t("EXPLORE_UNDER10_CONTENT1")+"<br>"+ this.$i18n.t("EXPLORE_UNDER10_CONTENT2")+"<br>"+ this.$i18n.t("EXPLORE_UNDER10_CONTENT3"));
                        return;
                    }
                }

                var element = document.getElementById("fullscreen");

                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if(element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if(element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }

                this.fullscreenFlag = true;
                this.isShowFullscreenButton = false;
                this.isToggleOn = true;
            },

            pressedExitFullScreenButton : function () {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                this.isShowFullscreenButton = true;
                this.isShowTimelineToggleArea = true;
                this.isToggleOn = false;
                this.fullscreenFlag = false;
            },

            webrtcStatusHandler : function (data) {
                if (data.status === 'connect') {
                    this.webRtcConnectedHandler(data);
                } else if (data.status === 'disconnect') {
                    this.webRtcDisconnectedHandler(data);
                }
            },

            webRtcConnectedHandler : function (data) {
                this.audioChatStatus = this.AUDIO_CHAT_STATUS.ONGOING;
                this.showUpperAlertMsg = false;
                $('.audiochat_center_txt3').hide();
                $('.audiochat_center_txt1').show();
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
                if (this.chatTimeIntervalId) {
                    clearInterval(this.chatTimeIntervalId);
                }
                this.audioChatTime = 0;
                this.chatTimeIntervalId = setInterval(this.audioChatTimer, 1000);
            },

            webRtcDisconnectedHandler : function (data) {
                this.audioChatStatus = this.AUDIO_CHAT_STATUS.FAIL;
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
                if (this.chatTimeIntervalId) {
                    clearInterval(this.chatTimeIntervalId);
                }
                this.webrtc.audioChatStop(this.pCameraId);

                if (data.code == -3) {
                    this.showUpperAlertMsg = true;
                    this.upperAlertMsg = this.$i18n.t('AUDIOCHAT_ALREADY');
                    this.showAlert(this.$i18n.t('AUDIOCHAT_CON_FAIL'), this.$i18n.t('AUDIOCHAT_ALREADY') + '<br>' + this.$i18n.t('AUDIOCHAT_LATER'));
                } else if (data.code == -1) {
                    this.showAlert(this.$i18n.t('AUDIOCHAT_CON_FAIL'), this.$i18n.t('AUDIOCHAT_CONFIRM_CAM'));
                } else if (data.code == -2) {
                    this.showAlert(this.$i18n.t('AUDIOCHAT_CON_FAIL'), this.$i18n.t('AUDIOCHAT_CONFIRM_CAM'));
                } else if (data.code == -5) {
                    this.showUpperAlertMsg = true;
                    this.upperAlertMsg = this.$i18n.t('AUDIOCHAT_MICE_OFF');
                    this.showAlert(this.$i18n.t('MIC_OFF'), this.$i18n.t('AUDIOCHAT_MICE_OFF'));
                } else if (data.code == -6) {
                    this.showAlert(this.$i18n.t('AUDIOCHAT_CON_FAIL'), this.$i18n.t('AUDIOCHAT_CONFIRM_CAM'));
                } else if (data.code == 'disconnect') {
                    this.showAlert(this.$i18n.t('AUDIOCHAT_CON_DISCON'), this.$i18n.t('AUDIOCHAT_CONFIRM_CAM'));
                } else if (data.code == 'nomike') {
                    this.showAlert(this.$i18n.t('AUDIOCHAT_CON_FAIL'), this.$i18n.t('AUDIOCHAT_NO_MIKE'));
                }
                $('.audiochat_center_txt1').hide();
                $('.audiochat_center_txt3').show();
                if (data.code == 'disconnect') {
                    this.connectingStr = this.$i18n.t('AUDIOCHAT_CON_DISCON');
                } else {
                    this.connectingStr = this.$i18n.t('AUDIOCHAT_CON_FAIL');
                }
            },

            audioChatStart : function() {
                this.audioChatStatus = this.AUDIO_CHAT_STATUS.CONNECTING;
                this.webrtc.audioChatStart(this.pCameraId);
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
                if (this.chatTimeIntervalId) {
                    clearInterval(this.chatTimeIntervalId);
                }
                this.connectingStr = this.$i18n.t('AUDIOCHAT_CONNECTING');
                this.connectionTime = 0;
                this.intervalId = setInterval(() => {
                    if (this.connectingStr === this.$i18n.t('AUDIOCHAT_CONNECTING') + "...") {
                        this.connectingStr = this.$i18n.t('AUDIOCHAT_CONNECTING');
                    } else {
                        this.connectingStr = (this.connectingStr + '.');
                    }
                    this.connectionTime+=1;
                    if (this.connectionTime > 10) {
                        if (this.intervalId) {
                            clearInterval(this.intervalId);
                        }
                        this.audioChatStatus = this.AUDIO_CHAT_STATUS.FAIL;
                        this.webrtc.audioChatStop(this.pCameraId);
                        $('.audiochat_center_txt1').hide();
                        $('.audiochat_center_txt3').show();
                        this.connectingStr = this.$i18n.t('AUDIOCHAT_CON_FAIL');
                    }
                }, 1000);
            },

            audioChatStop : function() {
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
                if (this.chatTimeIntervalId) {
                    clearInterval(this.chatTimeIntervalId);
                }
                this.audioChatTime = 0;
                this.webrtc.audioChatStop(this.pCameraId);
                if (this.pEventCb) {
                    this.pEventCb('goDetail');
                }
                //$state.go('main.cameraDetail', { cameraId: this.pCameraId });
            },

            retryAudioChat : function() {
                this.webrtc.audioChatStop(this.pCameraId);
                this.audioChatStart();
            },

            livePlayStart : function(){
                var that = this;
                toastcamAPIs.call(toastcamAPIs.camera.GET_CAMERA_DETAIL, {cameraId: this.pCameraId}, (cameraData) => {
                    that.labelName = cameraData.labelName;
                    that.player = new Player("", "");
                    toastcamAPIs.call(toastcamAPIs.camera.GET_TOKEN, {cameraId: that.pCameraId}, (res) => {
                        setTimeout(function(){
                            that.player.control.setPath(getLiveServerUrl(cameraData.mediaStreamURL), that.pCameraId + '?token=' + res.token);
                        }, 1000);
                    });
                    if (that.browserType === 'ie' || (that.browserType === 'safari' && navigator.userAgent.indexOf('Version/11') == -1)) {
                        $('.audiochat_center_txt3').hide();
                        that.notSupportAudioChat = true;
                    } else {
                        that.notSupportAudioChat = false;
                        that.audioChatStart();
                    }
                });
            },

            chromeDownload : function () {
                window.open('https://www.google.com/chrome/browser/desktop/index.html', 'popup','width=800px,height=600px');
            },
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>