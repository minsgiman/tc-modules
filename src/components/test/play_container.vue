<template>
</template>

<script>
    import Vue from 'vue';
    import flashPlayer from './flash_player.vue';
    import timeline from './timeline.vue';
    import * as d3 from "d3";
    import toastcamAPIs from './../../service/toastcamAPIs';
    import store from '../../service/test/store';
    import moment from 'moment';
    import 'moment-timezone';

    var isFullScreen = function () {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    };

    var isExpiredCloud = function(camera) {
        if (camera && (camera.serviceType === 'n/a' || camera.serviceType === '0d' || camera.saveEndDate < Date.now()) && camera.recorderType !== 'nvr') {
            return true;
        }
        return false;
    };

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

    export default {
        name : 'playContainer',
        components: {},
        props : ['playEventCb'],
        computed : {
            cameraData: function () {
                return store.state.cameraData;
            },
            shopId: function () {
                return store.state.shopId;
            },
            isShared: function () {
                return store.state.isShared;
            }
        },
        data : function() {
            return {
                timeline: null,
                player : null,
                fullscreenFlag : false,
                zoomZoneBottom : 149,
                isLive : true,
                config : {},
                isPlaying : false,
                plyBtnStatus : false,
                playerCheck : false,
                cvrReplay : 0,
                liveReloadCnt : 1,
                flashStatusFlush : false,
                playCheackCnt : 0,
                clickTime : 0,
                lastCameraStatus : 0,
                playserStop : null,
                timer : null,
                statusCheck : 0,
                stopStatusCheck : 0,
                currentTime : new Date(),
                screenloading : 0,
                beforeServerTime : 0,
                RecTime : null,
                cvrCheck : false,
                cursorIdx : 0,
                cursorNowTime : 0,
                fixRange : 0,
                range : 0,
                newTimelineDragCnt : 0,
                cursorDragStatus : false,
                serviceDateTime : 0,
                serviceDay : 0,
                goCvrStatus : false,
                currentZoom : 1.0,
                isShowZoomLocation : true,
                isShowControlToggleArea : false,
                fullscreenTimer : null,
                dragThumCancle : false,
                timeRange : 60,
                nowScale : "1h",
                cachedTimelineparams : null,
                dragTimeLine : false,
                arrEvents : [],
                cvrArray : [],
                lastRec : 0,
                lastEvent : 0,
                lineMoveFlag : false,
                showNoPlayLayer : false,
                showCameraOffLayer : false,
                showCameraStreamLayer : false,
                showNextPlayLayer : false,
                isCameraOffLastRec : false,
                isCameraOffLastEvent : false,
                isCameraOffLastShowRec : false
            }
        },
        created : function() {
            const bindEventCb = this.fullscreenChangeEvent.bind(this);
            d3.select('#fullscreen').on('fullscreenchange', bindEventCb);
            d3.select('#fullscreen').on('webkitfullscreenchange', bindEventCb);
            d3.select('#fullscreen').on('mozfullscreenchange', bindEventCb);
            d3.select(document).on('MSFullscreenChange', bindEventCb);

            const bindFullscreenCb = this.fullscreenHandler.bind(this);
            document.addEventListener('webkitfullscreenchange', bindFullscreenCb, false);
            document.addEventListener('mozfullscreenchange', bindFullscreenCb, false);
            document.addEventListener('fullscreenchange', bindFullscreenCb, false);
            document.addEventListener('MSFullscreenChange', bindFullscreenCb, false);

            window.onresize = this.resizeTimline.bind(this);
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            if (this.player) {
                this.player.$destroy();
            }
            if (this.timeline) {
                this.timeline.$destroy();
            }
            this.stopTimer();
            this.stopFullscreenTimer();
            document.removeEventListener('webkitfullscreenchange', this.fullscreenHandler, false);
            document.removeEventListener('mozfullscreenchange', this.fullscreenHandler, false);
            document.removeEventListener('fullscreenchange', this.fullscreenHandler, false);
            document.removeEventListener('MSFullscreenChange', this.fullscreenHandler, false);
            window.onresize = null;
        },
        methods : {
            pauseBtn : function() {
                if (this.cameraData.recorderType == "recorder") {
                    if ($('#remoteVideosContainer').length) {
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video')[0].pause();
                        }
                    }
                } else {
                    if (this.player) {
                        this.player.pause();
                    }
                }
                this.isPlaying=false;
                this.plyBtnStatus = false;
            },

            playBtn : function() {
                if (this.cameraData.recorderType == "recorder") {
                    if ($('#remoteVideosContainer').length) {
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video')[0].play();
                        }
                    }
                } else {
                    if (this.player) {
                        this.player.play();
                    }
                }
                this.isPlaying=true;
                this.plyBtnStatus = true;

                this.cameraStatusAllOff();
                if(this.isLive == false){
                    this.clickedCVRArea(new Date(this.timeline.x.invert($(".cursor").children("line").attr("x1")).getTime()));
                }else{
                    this.playEventCb('livePlay');
                }
            },

            livePlayStart : function(mediaUrl) {
                if (this.cameraData.recorderType == "nvr") {
                    if (this.player) {
                        this.player.setPath(getNvrServerUrl(this.cameraData.mediaStreamURL), this.cameraData.channel);
                    }
                } else if (this.cameraData.recorderType == "recorder") {
                    //TODO:
                    //$scope.webRTCStart(0);
                } else {
                    toastcamAPIs.call(this.isShared ? toastcamAPIs.camera.GET_SHARE_CAM_TOKEN : toastcamAPIs.camera.GET_TOKEN, {cameraId: this.cameraData.id}, (res) => {
                        setTimeout(() => {
                            if (this.player) {
                                this.player.setPath(mediaUrl, this.cameraData.id + '?token=' + res.token);
                            }
                        }, 1000);
                    }, (err) => {
                        console.log(err);
                    });
                }
            },

            //녹화 지연
            cameraRecDelay : function() {
                this.showNoPlayLayer = true;
                this.showCameraOffLayer = false;
                this.showCameraStreamLayer = false;
                this.showNextPlayLayer = false;
            },

            //카메라 접속 끊김
            cameraConnectOff : function() {
                this.showNoPlayLayer = false;
                this.showCameraOffLayer = true;
                this.showCameraStreamLayer = false;
                this.showNextPlayLayer = false;
                toastcamAPIs.call(toastcamAPIs.camera.CHECK_IS_LAST_RECORD, {cameraId: this.cameraData.id}, (data) => {
                    this.playEventCb('currentCameraIsLastRecordDataSet', data);
                });
            },

            //저장된 영상 없음
            cameraNoSave : function(){
                this.showNoPlayLayer = false;
                this.showCameraOffLayer = false;
                this.showCameraStreamLayer = false;
                this.showNextPlayLayer = true;
            },

            //녹화가 꺼져 있음
            cameraRecOff : function() {
                this.showNoPlayLayer = false;
                this.showCameraOffLayer = false;
                this.showCameraStreamLayer = true;
                this.showNextPlayLayer = false;
            },

            //정상 플레이
            cameraStatusAllOff : function() {
                this.showNoPlayLayer = false;
                this.showCameraOffLayer = false;
                this.showCameraStreamLayer = false;
                this.showNextPlayLayer = false;
                this.isCameraOffLastRec = false;
                this.isCameraOffLastEvent = false;
            },

            resizeTimline : function() {
                this.playEventCb('resizeTimline');

                if(this.fullscreenFlag === false){
                    this.timeline.redrawWithWidth(parseInt($("#view_timeline_ctrl").width()));
                }

                if(this.fullscreenFlag == true){
                    if (this.player) {
                        this.player.zoomZone(260, parseInt($("#player").css("width"))-20);
                    }
                }else{
                    if (this.player) {
                        this.player.zoomZone(this.zoomZoneBottom, parseInt($("#player").css("width"))-20);
                    }
                }

                this.camInfoBarChange();
            },

            camInfoBarChange : function() {
                if(this.isLive == false){
                    if(parseInt(window.innerWidth) < 1900){
                        $(".cam_info_bg").css("width","280px");
                        $(".cam_info_bg").css("margin-left"," -140px");

                        $(".cam_info_bg_en").css("width","290px");
                        $(".cam_info_bg_en").css("margin-left"," -145px");
                    }else{
                        $(".cam_info_bg").css("width","280px");
                        $(".cam_info_bg").css("margin-left"," -140px");

                        $(".cam_info_bg_en").css("width","290px");
                        $(".cam_info_bg_en").css("margin-left"," -145px");
                    }
                }else{
                    if(parseInt(window.innerWidth) < 1900){
                        $(".cam_info_bg").css("width","206px");
                        $(".cam_info_bg").css("margin-left"," -103px");

                        $(".cam_info_bg_en").css("width","216px");
                        $(".cam_info_bg_en").css("margin-left"," -108px");
                    }else{
                        $(".cam_info_bg").css("width","206px");
                        $(".cam_info_bg").css("margin-left"," -103px");

                        $(".cam_info_bg_en").css("width","216px");
                        $(".cam_info_bg_en").css("margin-left"," -108px");
                    }
                }
            },

            cameraStatusChange : function(status) {
                this.lastCameraStatus = status;
                switch(status){
                    case 0:
                        this.cameraStatusAllOff();
                        break;
                    case 1:
                        this.cameraRecOff();
                        break;
                    case 2:
                        this.cameraRecDelay();
                        break;
                    case 3:
                        this.cameraConnectOff();
                        break;
                    case 4:
                        this.cameraConnectOff();
                        break;
                    default:
                        this.cameraStatusAllOff();
                        break;
                }
            },

            flashEventCallback : function(status) {
                this.playerCheck = true;

                if(this.showNextPlayLayer == true){
                    return;
                }

                if (status === 'NetStream.Play.Start') {
                    this.cvrReplay=0;
                    this.liveReloadCnt =0;
                    this.flashStatusFlush = false;
                    if(this.playCheackCnt == 1){
                        this.playCheackCnt =0;
                        return;
                    }
                    this.playCheackCnt++;
                    $("#cam_info").css("background","");

                    setTimeout(() => {
                        this.resizeTimline();
                    },100);
                    this.isPlaying = true;
                    this.timeline.setData('isPlaying', this.isPlaying);
                    this.playEventCb('isShowMikeChanged', true);

                    this.cameraStatusAllOff();

                    if (this.isLive) {
                        this.startLiveTimer();
                    } else {
                        this.startRecTimer(this.clickTime);
                    }
                } else {
                    if (this.isLive){
                        this.cameraStatusChange(this.lastCameraStatus);
                    }

                    if(status === "NetStream.Buffer.Flush"){
                        this.flashStatusFlush = true;
                    }else if(this.flashStatusFlush === true && status === "NetStream.Buffer.Empty"){
                        this.playserStop = setTimeout(() => {
                            if (this.player) {
                                this.player.stop();
                            }
                            clearInterval(this.timer);
                            if (this.cameraData.recordType == "event") {
                                this.jumpToNextRecord();
                            }
                        },3000);
                    }else if(this.flashStatusFlush === false && status === "NetStream.Buffer.Empty"){
                        this.flashStatusFlush = false;
                    }else if(status === "NetStream.Buffer.Empty"){
                        if(this.cvrReplay == 0){
                            if(this.isLive == false){
                                setTimeout(() => {
                                    this.clickedCVRArea(this.clickTime);
                                },1000);
                                this.cvrReplay++;
                            }
                        }
                    }else if(status == "NetConnection.Connect.Closed" || status === 'NetStream.Play.Stop'){
                        if (this.isLive){
                            if (status === "NetConnection.Connect.Closed" && this.config.streamStatus !== "off" && this.showCameraOffLayer !== true) {
                                setTimeout(() => {
                                    if (this.plyBtnStatus) {
                                        this.playEventCb('livePlay', status);
                                    }
                                },4000);
                            } else {
                                this.statusCheck++;
                                if(this.statusCheck == 2){
                                    setTimeout(() => {
                                        if (this.isLive && this.liveReloadCnt ==0){
                                            this.statusCheck = 0;
                                            this.liveReloadCnt++;
                                            this.playEventCb('livePlay', status);
                                        }
                                    },4000);
                                }
                            }
                        } else {
                            if (status === "NetStream.Play.Stop") {
                                this.stopStatusCheck++;
                                if (this.stopStatusCheck == 2) {
                                    this.stopStatusCheck = 0;
                                    var i, len, curTime, cvrData = this.timeline.getData('cvrData');
                                    if (this.currentTime && cvrData && cvrData.length) {
                                        len = cvrData.length;
                                        curTime = this.currentTime.getTime();
                                        for (i = 0; i < len; i+=1) {
                                            if (curTime > parseInt(cvrData[i].startTime, 10) && curTime <= parseInt(cvrData[i].endTime, 10)) {
                                                if (cvrData[i+1]) {
                                                    if ((parseInt(cvrData[i+1].startTime) - parseInt(cvrData[i].endTime)) < 1000) {
                                                        this.clickedCVRArea(new Date(parseInt(cvrData[i+1].startTime, 10) + 1000));
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else if (status === "NetConnection.Connect.Closed") {
                                var i, len, curTime, cvrData = this.timeline.getData('cvrData');
                                if (this.currentTime && cvrData && cvrData.length) {
                                    len = cvrData.length;
                                    curTime = this.currentTime.getTime();
                                    for (i = 0; i < len; i+=1) {
                                        if (curTime > parseInt(cvrData[i].startTime, 10) && curTime <= parseInt(cvrData[i].endTime, 10)) {
                                            if (cvrData[i+1]) {
                                                if ((parseInt(cvrData[i+1].startTime) - parseInt(cvrData[i].endTime)) < 1000) {
                                                    this.clickedCVRArea(new Date(parseInt(cvrData[i+1].startTime, 10) + 1000));
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }else if(status == "NetStream.Buffer.Full" && this.lastCameraStatus == 4){
                        if (this.isLive){
                            this.statusCheck++;
                            if(this.statusCheck == 2){
                                setTimeout(() => {
                                    if (this.isLive && this.liveReloadCnt ==0){
                                        this.statusCheck = 0;
                                        this.liveReloadCnt++;
                                        this.playEventCb('livePlay', status);
                                    }
                                },4000);
                            }
                        }
                    }
                }
            },

            onTimelineEvent : function(param) {
                switch (param.event) {
                    case 'clickedCVRArea':
                        this.clickedCVRArea(param.data);
                        break;
                    case 'goLive':
                        this.goLive();
                        break;
                    case 'setupDomain':
                        this.setupDomain(param.data);
                        break;
                    case 'loadingDataAlert':
                        this.playEventCb('loadingDataAlert');
                        break;
                    case 'doubleClick':
                        this.newTimelineDragCnt = 0;
                        this.playEventCb('dblClickFlagChanged', true);
                        break;
                    case 'dragStart':
                        this.playEventCb('timelineDragStart');
                        this.dragThumCancle = true;
                        break;
                    case 'dragging':
                        this.playEventCb('timelineDragging');
                        break;
                    case 'dragEnd':
                        this.playEventCb('timelineDragEnd');
                        this.newTimelineDragCnt = 0;
                        this.dragThumCancle = false;
                        break;
                    case 'updateByDrag':
                        this.lineMoveFlag = true;
                        this.dragTimeLine = true;
                        break;
                    case 'moveDomain':
                        this.newTimelineDragCnt = 0;
                        this.dragThumCancle = false;
                        break;
                    case 'clickedCVRBg':
                        this.playEventCb('thumnailDrawChanged', true);
                        this.lineMoveFlag = false;
                        this.dragThumCancle = false;
                        this.plyBtnStatus = true;
                        break;
                    case 'cursorDragEnd':
                        this.plyBtnStatus = true;
                        this.cursorDragStatus = false;
                        this.liveReloadCnt = 0;
                        this.dragThumCancle = false;
                        break;
                    case 'checkCVRSeucre':
                        this.playEventCb('checkCVRSeucre', param.data);
                        break;
                    case 'pressedExitFullScreenButton':
                        this.playEventCb('pressedExitFullScreenButton');
                        break;
                    case 'updateCVRSecureStatus':
                        this.playEventCb('updateCVRSecureStatus', param.data);
                        break;
                    case 'cvrMouseoverEventsNew':
                        this.playEventCb('cvrMouseoverEventsNew', param.data);
                        break;
                    case 'mouseoutEvents':
                        this.playEventCb('mouseoutEvents');
                        break;
                    case 'cursorDragStart':
                        this.playEventCb('cursorDragStart');
                        break;
                    case 'cursorDragging':
                        this.playEventCb('cursorDragging', param.data);
                        break;
                    case 'cursorDragEnd':
                        this.playEventCb('cursorDragEnd');
                        break;
                    case 'hideCursorNavigation':
                        this.playEventCb('hideCursorNavigation');
                        break;
                    case 'newTimelineDragCntUpdate':
                        this.newTimelineDragCnt = param.data;
                        break;
                    case 'cursorDragStatusChanged':
                        this.cursorDragStatus = param.data;
                        break;
                    case 'changeTimeRangeFlagUpdate':
                        this.playEventCb('changeTimeRangeFlagUpdate', param.data);
                        break;
                    case 'dragThumCancleUpdate':
                        this.dragThumCancle = param.data;
                        break;
                    case 'liveReloadCntUpdate':
                        this.liveReloadCnt = param.data;
                        break;
                    case 'timelineMapChanged':
                        this.playEventCb('timelineMapChanged', param.data);
                        break;
                    case 'timelineSgidWidthMapChanged':
                        this.playEventCb('timelineSgidWidthMapChanged', param.data);
                        break;
                    case 'timelineSgidWidthMapPut':
                        this.playEventCb('timelineSgidWidthMapPut', param.data);
                        break;
                    default:
                        break;
                }
            },

            initPlayer : function() {
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
                        varCoreSwf: '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf',
                        varSkinPath: '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf',
                        varServerUrl: ''
                    }
                }).$mount('#player');
                this.player.$on('flashPlayerStatusChanged', this.flashEventCallback.bind(this));
                this.player.zoomZone(450, 150);
                this.player.displayRMCPlayer();
                setTimeout(() => {
                    this.screenloading++;
                },1050);

                return this.player;
            },

            initTimeline : function() {
                const vExtendConstructor = Vue.extend(timeline);
                this.timeline = new vExtendConstructor({
                    propsData: {
                        elementId: 'timebar_area',
                        pWidth: $("#timeline_table").width(),
                        pHeight: $("#timebar_area").height(),
                        pTimeRange: 60
                    }
                }).$mount('#timebar_area');
                this.timeline.$on('timelineEvent', this.onTimelineEvent.bind(this));
                this.timeline.setData('cursorInterval', 1000);
                this.timeline.setData('currentTime', this.currentTime);

                return this.timeline;
            },

            initSizeTimline : function() {
                var timelineWidth = isFullScreen() ? $('#fullscreen').width() : $("#view_timeline_ctrl").width();
                this.timeline.getData('svg').select('.cursor').classed('hide', true);
                this.timeline.redrawWithWidth(parseInt(timelineWidth));
            },

            startRecTimer : function(time) {
                this.beforeServerTime = 0;
                this.startRecTime = time;
                this.currentTime =  new Date(this.startRecTime.valueOf());
                this.timeline.setData('currentTime', this.currentTime);
                this.playEventCb('currentTimeChanged', this.currentTime);
                var cntRecTimer = 0;
                clearInterval(this.timer);
                this.timer = setInterval(() => {

                    if(this.plyBtnStatus == false){
                        return;
                    }

                    if(this.playerCheck == false){
                        return;
                    }

                    this.cvrDrawCheck(this.currentTime);

                    if(this.cvrCheck == false){
                        if (this.cameraData.recordType == "event") {
                            this.jumpToNextRecord();
                        } else {
                            if(this.lineMoveFlag == false){
                                this.isPlaying = false;
                                this.timeline.setData('isPlaying', this.isPlaying);
                                this.cameraNoSave();
                                clearInterval(this.timer);
                                if (this.player) {
                                    this.player.close();
                                }
                                return;
                            }
                        }
                    }else{
                        this.isPlaying = true;
                        this.timeline.setData('isPlaying', this.isPlaying);
                        if(this.showNextPlayLayer == true){
                            this.goCvr(this.currentTime.valueOf());
                        }
                    }

                    if(this.cursorIdx == 0){
                        this.cursorNowTime = this.currentTime.valueOf();
                        this.cursorIdx++;
                    }else{
                        if (this.player) {
                            var addSec = (((this.player.getCurrentTime()[0] || 0 ) * 1000) - this.beforeServerTime);
                            if(addSec <= 0){
                                addSec = 1000;
                            }
                            this.cursorNowTime = this.cursorNowTime + addSec;
                            this.beforeServerTime = (this.player.getCurrentTime()[0] || 0 ) * 1000;
                            this.currentTime = new Date(this.cursorNowTime);
                        } else {
                            addSec = 1000;
                            this.cursorNowTime = this.cursorNowTime + addSec;
                            this.currentTime = new Date(this.cursorNowTime);
                        }
                        this.timeline.setData('currentTime', this.currentTime);
                        this.playEventCb('currentTimeChanged', this.currentTime);
                    }

                    var currentDomain = this.timeline.getData('currentDomain');
                    if(currentDomain == undefined){
                        return;
                    }

                    var domain = currentDomain;

                    switch(this.timeline.getData('timeRange')){
                        case 10:
                            this.range = 600000;
                            this.fixRange = 0;
                            break;
                        case 60:
                            this.range = 600000 * 6;
                            this.fixRange = 200000;
                            break;
                        case 360:
                            this.range = 600000 * 6 * 6;
                            this.fixRange = 1245000;
                            break;
                        case 1440:
                            this.range = 600000 * 6 * 6 * 4;
                            this.fixRange = 3650000;
                            break;
                    }

                    if (domain[0] + this.range < this.currentTime.valueOf() && domain[1] - this.range - this.fixRange > this.currentTime.valueOf()) {
                        this.lineMoveFlag = false;
                    }else{
                        if(this.lineMoveFlag == false){
                            this.timeline.setData('changeTimeRangeClick', true);
                            this.playEventCb('pressedFindCursorButton');
                        }
                    }

                    if(this.lineMoveFlag == false){
                        if (domain[0] < this.cursorNowTime && domain[1] > this.cursorNowTime) {
                            this.timeline.updateCursor(new Date(this.cursorNowTime));
                        }else{
                            this.timeline.setData('changeTimeRangeClick', true);
                            this.timeline.nextDomain();
                        }
                    }

                }, this.timeline.getData('cursorInterval'));
            },

            clickedCVRArea : function(time, status) {
                this.newTimelineDragCnt=0;
                clearInterval(this.timer);
                if(this.isShared == true){
                    this.playEventCb('shareEnd');
                }

                var currentDomain = this.timeline.getData('currentDomain');
                this.setupDomain([currentDomain[0], currentDomain[1]]);
                if((new Date()).valueOf() < time.valueOf()){
                    this.goLive();
                    return;
                }

                if(this.cursorDragStatus == true){
                    return;
                }

                setTimeout(() => {
                    this.serviceDateTime = ((new Date()).valueOf() - (1000*60*60*24*(this.serviceDay)));
                    this.timeline.setData('serviceDateTime', this.serviceDateTime);
                    if(this.serviceDateTime > time){
                        //return;
                        time = new Date(this.serviceDateTime + 3000);
                    }

                    this.clickTime = time;
                    this.cameraStatusAllOff();

                    this.cursorIdx = 0;
                    if(status != 'f'){
                        this.cvrDrawCheck(time);
                    }
                    if(this.cursorDragStatus == true){
                        return;
                    }

                    this.playerCheck = false;
                    this.startRecTimer(time);
                    if(this.cvrCheck == true || this.goCvrStatus == true){
                        this.isLive = false;
                        this.timeline.setData('isLive', this.isLive);
                        this.playEventCb('isLiveChanged', this.isLive);
                        this.camInfoBarChange();
                        this.goCvrStatus = false;
                        this.cameraStatusAllOff();
                        toastcamAPIs.call(this.isShared ? toastcamAPIs.camera.GET_SHARE_CAM_TOKEN : toastcamAPIs.camera.GET_TOKEN, {cameraId: this.cameraData.id}, (res) => {
                            if (this.cameraData.recorderType == "nvr") {
                                if (this.player) {
                                    this.player.setPath(getNvrServerUrl(this.cameraData.mediaStreamURL), this.cameraData.channel + "?time=" + time.getTime());
                                }
                                this.plyBtnStatus = true;
                            } else if (this.cameraData.recorderType == "recorder") {
                                //TODO:
                                //$scope.webRTCStart(time.getTime());
                            } else{
                                var newURL = res.cvrHostPort + "/token=" + res.token + "&time=" + time.getTime();
                                if (this.player) {
                                    this.player.setPath(getCvrServerUrl(res.cvrHostPort),'/token=' + res.token + '&time=' + time.getTime());
                                }
                                this.plyBtnStatus = true;
                            }
                            //TODO:
                            // if($scope.currentTab == 'zone'){
                            //     setTimeout(function(){
                            //         $scope.setCurrentTab('zone');
                            //     },500);
                            // }
                        }, (err) => {
                            console.log(err);
                        });
                    }else{
                        if (this.cameraData.recordType == "event") {
                            this.jumpToNextRecord();
                        }
                    }

                    this.timeline.updateCursor(new Date(time));
                    this.playEventCb('isCursorLeftChanged', false);
                    this.playEventCb('isCursorRightChanged', false);
                },800);
            },

            zoomVideoWithZoomablePoint : function(x, y) {
                var containerWidth = parseInt($("#zoom_area").width());
                var containerHeight = parseInt($("#zoom_area").height());

                var percentX = parseInt(x / containerWidth * 100);
                var percentY = parseInt(y / containerHeight * 100);

                if (this.player) {
                    this.player.zoomVideo(this.currentZoom, percentY, percentX);
                }
            },

            zoomUp : function(zoom) {
                this.playEventCb('zoomDragValChanged', 0);

                if(this.fullscreenFlag == true){
                    if (this.player) {
                        this.player.zoomZone(260, parseInt($("#player").css("width"))-20);
                    }
                }else{
                    if (this.player) {
                        this.player.zoomZone(this.zoomZoneBottom, parseInt($("#player").css("width"))-20);
                    }
                }

                var newZoom = this.currentZoom + zoom;
                if (newZoom > 5.0) {
                    newZoom = 5.0;
                }

                if (newZoom < 1.0) {
                    newZoom = 1.0;
                }

                $("#zoom_cursor_length").css("width",((newZoom-1) * 25)+"%");

                this.zoomUpWithZoom(newZoom);
            },

            zoomUpWithZoom : function(zoom) {
                if (zoom > 1.0) {
                    this.isShowZoomLocation = true;
                    this.playEventCb('isShowTimelineToggleAreaChanged', false);
                    this.isShowControlToggleArea = false;
                } else {
                    this.isShowZoomLocation = false;
                    if(isFullScreen()){
                        this.playEventCb('isShowTimelineToggleAreaChanged', true);
                    } else {
                        this.isShowControlToggleArea = true;
                    }
                }

                this.currentZoom = zoom;
                this.playEventCb('currentZoomChanged', this.currentZoom);
                this.positionZoomable(zoom);
            },

            positionZoomable : function(newZoom) {
                var zoomable = d3.select('.zoom_area .selected');
                var container = d3.select('.zoom_area');
                var containerWidth = parseInt(getComputedStyle(container.node()).width);
                var containerHeight = parseInt(getComputedStyle(container.node()).height);

                var zoomableX = 0;
                var zoomableY = 0;

                if(newZoom == 2){
                    $("#zoom_area").css("left", "0px");
                    $("#zoom_area").css("top", "0px");
                }else{
                    zoomableX =  parseInt($("#zoom_area").css("left"));
                    zoomableY =  parseInt($("#zoom_area").css("top"));
                }

                var zoomableWidth = parseInt($("#zoom_area").width());
                var zoomableHeight = parseInt($("#zoom_area").height());

                var currentCenterX = zoomableX + parseInt(zoomableWidth / 2);
                var currentCenterY = zoomableY + parseInt(zoomableHeight / 2);

                var newZoomableWidth = containerWidth / newZoom;
                var newZoomableHeight = containerHeight / newZoom;

                var newX = currentCenterX - parseInt(newZoomableWidth / 2);
                if (newX < 0) {
                    newX = 0;
                } else if (newX + newZoomableWidth > containerWidth) {
                    newX = containerWidth - newZoomableWidth;
                }

                var newY = currentCenterY - parseInt(newZoomableHeight / 2);
                if (newY < 0) {
                    newY = 0;
                } else if (newY + newZoomableHeight > containerHeight) {
                    newY = containerHeight - newZoomableHeight;
                }

                var percentX = newX / containerWidth * 100;
                var percentY = newY / containerHeight * 100;
                if (this.player) {
                    this.player.zoomVideo(newZoom);
                }
            },

            fullscreenChangeEvent : function() {
                var leftDefault = 166;
                var topDefault = 96;
                this.isFullScreen = isFullScreen();
                this.playEventCb('isFullScreenChanged', this.isFullScreen);
                this.newTimelineDragCnt = 0;
                if (this.isFullScreen) {
                    $("#cloud_out_small").hide();
                    $("#cloud_out_full").show();
                    this.fullscreenFlag = true;

                    if (isExpiredCloud(this.cameraData)) {
                        if (this.player) {
                            this.player.zoomZone(topDefault, parseInt($("#player").css("width"))-20);
                        }
                    } else {
                        if (this.player) {
                            this.player.zoomZone(topDefault + 110, parseInt($("#player").css("width"))-20);
                        }
                    }
                } else {

                    $("#cloud_out_small").children("img").css("margin-left","20px");

                    $("#cloud_out_small").show();
                    $("#cloud_out_full").hide();
                    this.playEventCb('fullScreenAlertChanged', false);
                    this.fullscreenFlag = false;
                    $("#view_timeline_area").removeAttr( 'style' );

                    clearTimeout(this.fullscreenTimer);
                    if (this.player) {
                        this.player.zoomZone(350, parseInt($("#player").css("width"))-20);
                    }
                    this.playEventCb('timelineVisibleChanged', true);

                    if (this.currentZoom > 1) {
                        this.currentZoom = 1;	// 줌 상태일 경우 줌해제 처리
                        this.playEventCb('currentZoomChanged', this.currentZoom);
                        this.zoomUp(0);
                    }

                    this.playEventCb('isClickTimelineShowChanged', false);
                    this.playEventCb('isToggleOnChanged', false);
                    this.playEventCb('isShowTimelineToggleAreaChanged', false);

                    $("#time_area_bar").css("top","");
                    $("#view_timeline_ctrl").show();
                    $("#view_timeline_date").show();
                    $("#view_btn_area").show();
                    $("#view_camdtl_tab").show();
                    $("#footer").show();
                    $("#header").show();
                    $("#play_back").css("position","");
                    $("#play_back").css("width","");

                    $("#view_timeline_area").css("position","");
                    $("#view_timeline_area").css("bottom","");

                    this.playEventCb('fullScreenMakeViewStop');

                    this.timeline.redrawWithWidth(parseInt($("#view_timeline_ctrl").width()));
                    $(".axis-bottom-line").show();

                    $(".cam_ctrl").css("position","relative");
                    $(".cam_ctrl").css("top",0);

                    $("#controlFullTimeLine").hide();
                    $("#controlNdTimeLine").show();

                    this.playEventCb('timelineHideTimerStop');
                    $("#showControl").hide();
                    $("#timebar_area").children("svg").children("g").attr("transform", 'translate(0, -19)');
                    $("#timebar_area").children("svg").height("85");
                    $("#controlNdTimeLine").css("position","");
                    $("#controlNdTimeLine").css("top", "");
                    $("#timelinedesc").css("top","51px");
                    $("#prevLineBtn").css("top","");
                    $("#nextLineBtn").css("top","");
                    $("#cursorLeftBtn").css("top","");
                    $("#cursorRightBtn").css("top","");
                    $(".fs_time").hide();
                    $(".cam_info_area").css("top","");
                    $("#cloud_out_small").children("img").css("margin-left","20px");
                }
            },

            getTimeline : function() {
                if(this.isShared == false){
                    toastcamAPIs.call(toastcamAPIs.camera.GET_TIMELINE, this.cachedTimelineparams, (res) => {
                        this.drawTimelineData(res);
                    }, (err) => {
                        this.timeline.setData('isLoading', false);
                    });
                }else{
                    toastcamAPIs.call(toastcamAPIs.camera.GET_SHARE_CAM_TIMELINE, this.cachedTimelineparams, (res) => {
                        this.drawTimelineData(res);
                    }, (err) => {
                        this.timeline.setData('isLoading', false);
                    });
                }
            },

            drawTimelineData : function(d) {
                var check = 0;
                var eventTime = d.recTimes;

                d.recTimes = [];

                if (eventTime) {
                    for(var i=0;i<eventTime.length;i++){
                        if(i< eventTime.length){
                            if(eventTime[i+1] != undefined){
                                if(eventTime[i].endTime == eventTime[i+1].startTime){
                                    check++;
                                }else{
                                    var recTime = {};
                                    recTime.startTime = eventTime[i-check].startTime;
                                    recTime.endTime = eventTime[i].endTime;
                                    d.recTimes.push(recTime);
                                    check = 0;
                                }
                            }else{
                                var recTime = {};
                                recTime.startTime = eventTime[i-check].startTime;
                                recTime.endTime = eventTime[i].endTime;
                                d.recTimes.push(recTime);
                                check = 0;
                            }
                        }
                    }
                }
                this.timeline.setData('firstDataLoadingFlag', true);
                this.timelineDataSet(d);
            },


            setupDomain : function(domain) {
                if(this.isShared == true){
                    this.playEventCb('shareEnd');
                }
                if(this.dragThumCancle == true){
                    return;
                }

                this.cachedTimelineparams = {
                    cameraId: this.cameraData.id,
                    start: domain[0],
                    end: domain[1],
                    shopId: this.shopId
                };

                //
                /**타임라인 호출
                 *10분일땐 1초에 한번
                 *1시간일땐 1분에 한번
                 *6시간일땐 5분에 한번
                 *24시간일땐 10분에 한번 호출
                 *예외상황 커서 드래그, cvr, 타임라인 드래그, 라이브보기, 이전 타임라인, 다음 타임라인
                 */

                if (this.timeRange == 10) {
                    this.cachedTimelineparams.scale = "10m";
                    this.nowScale = "10m";
                    this.cachedTimelineparams.start = this.cachedTimelineparams.start - 100000;
                }else if(this.timeRange == 60){
                    this.cachedTimelineparams.scale = "1h";
                    this.nowScale = "1h";
                    if(this.newTimelineDragCnt > 0 && this.newTimelineDragCnt < 6){
                        this.newTimelineDragCnt++;
                        return;
                    }else if(this.newTimelineDragCnt==6){
                        this.newTimelineDragCnt=0;
                    }

                }else if(this.timeRange == 360){
                    this.cachedTimelineparams.scale = "6h";
                    this.nowScale = "6h";
                    if(this.newTimelineDragCnt > 0 && this.newTimelineDragCnt < 30){
                        this.newTimelineDragCnt++;
                        return;
                    }else if(this.newTimelineDragCnt==30){
                        this.newTimelineDragCnt=0;
                    }
                }else if(this.timeRange == 1440){
                    this.cachedTimelineparams.scale = "24h";
                    this.nowScale = "24h";
                    if(this.newTimelineDragCnt > 0 && this.newTimelineDragCnt < 60){
                        this.newTimelineDragCnt++;
                        return;
                    }else if(this.newTimelineDragCnt==60){
                        this.newTimelineDragCnt=0;
                    }
                }

                this.newTimelineDragCnt++;
                this.timeline.setData('isLoading', true);
                if(this.serviceDay != 0){
                    this.serviceDateTime = ((new Date()).valueOf() - (1000*60*60*24*(this.serviceDay)));
                }else{
                    this.serviceDateTime = 0;
                }
                this.timeline.setData('serviceDateTime', this.serviceDateTime);

                if(this.cachedTimelineparams.start < this.serviceDateTime){
                    this.cachedTimelineparams.start = this.serviceDateTime;
                }

                this.playEventCb('getAlarmZones');

                var removedBufferDomain = this.timeline.removeBufferCursorCheckDomain(domain , this.timeline.getData('timeRange'));
                if (this.currentTime && (removedBufferDomain[0] > this.currentTime.valueOf())) {
                    this.playEventCb('isCursorLeftChanged', true);
                    this.playEventCb('isCursorRightChanged', false);
                } else if (this.currentTime && (removedBufferDomain[1] < this.currentTime.valueOf())) {
                    this.playEventCb('isCursorLeftChanged', false);
                    this.playEventCb('isCursorRightChanged', true);
                } else {
                    this.playEventCb('isCursorLeftChanged', false);
                    this.playEventCb('isCursorRightChanged', false);
                    if(this.isPlaying == false){
                        this.timeline.updateCursor(this.currentTime);
                    }
                }
            },

            timelineDataSet : function(d){
                if(this.dragTimeLine == true){
                    this.dragTimeLine = false;
                    if (this.isFullScreen) {
                        $("#timebar_area").children("svg").children("g").attr("transform","translate(0, -15)");
                    }else{
                        $("#timebar_area").children("svg").children("g").attr("transform","translate(0, -19)");
                    }
                    this.playEventCb('changedSelectedZone');
                    $(".cvr").attr("transform","");
                    $(".cursor").attr("transform","");
                    this.playEventCb('thumnailDrawChanged', true);
                }

                this.arrEvents = d.events;
                this.playEventCb('eventsChanged', d.events);
                this.timeline.setData('cvrData', d.recTimes);
                this.timeline.drawRecordBar();
                this.timeline.updateBar(500);
                this.cvrArray = [];
                this.cvrArray.push($(".cvr").children("rect"));
                this.timeline.redrawEvents(d.events, d.avg);
                this.timeline.setData('isLoading', false);
                setTimeout(() => {
                    this.playEventCb('changedSelectedZone');
                },200);

                this.playEventCb('changedSelectedZone');
            },

            cvrDrawCheck : function(time) {
                this.isLive = false;
                this.timeline.setData('isLive', this.isLive);
                this.playEventCb('isLiveChanged', this.isLive);
                this.camInfoBarChange();
                var trueCnt = 0;
                this.startRecTime = time;
                var cursorX = parseFloat(this.timeline.getData('x')(time));

                this.cvrCheck = false;

                var nextTime = (new Date).valueOf();
                var checkNextTime = 0;
                var cvrData = this.timeline.getData('cvrData');
                var currentDomain = this.timeline.getData('currentDomain');
                var timeRange = this.timeline.getData('timeRange');

                for(var i=0;i<cvrData.length;i++){
                    var startX = parseInt(cvrData[i].startTime)
                    var endX = parseInt(cvrData[i].endTime)

                    if(startX > time.valueOf() && checkNextTime == 0){
                        nextTime = startX;
                        checkNextTime++;
                        clearTimeout(this.playserStop);
                    }

                    if(timeRange == 10){
                        if(parseInt(cvrData[cvrData.length-1].endTime) <= time.valueOf()+3000){
                            this.setupDomain([currentDomain[0], currentDomain[1]]);
                        }
                    }else{
                        if(parseInt(cvrData[cvrData.length-1].endTime) <= time.valueOf()+30000){
                            this.setupDomain([currentDomain[0],currentDomain[1]]);
                        }
                    }

                    if(startX <= time.valueOf()  && endX >= time.valueOf()){
                        this.cvrCheck = true;
                        trueCnt++;
                    }else{
                        if(trueCnt == 0){
                            this.cvrCheck = false;
                        }
                    }
                }
                if(this.cvrCheck == false){
                    if((new Date).valueOf() - time.valueOf() < 8000){
                        this.goLive();
                        this.newTimelineDragCnt = 0;
                        return;
                    }

                    if((new Date).valueOf() - time.valueOf() < 15000){
                        this.cvrCheck = true;
                        this.newTimelineDragCnt=0;
                    }
                }

                if(this.cvrCheck == false){
                    if(this.lineMoveFlag == false && this.plyBtnStatus == true){
                        this.lineMoveFlag = false;
                        this.isPlaying = false;
                        this.timeline.setData('isPlaying', this.isPlaying);
                        this.cameraNoSave();
                        clearInterval(this.timer);
                        var videoDateFormat = 'M월 D일 dddd';  //TODO: $translate.instant('CAMERA_DETAIL_EVENT_DATE_FORMAT');
                        var videoTimeFormat = 'HH:mm:ss';  //TODO: $translate.instant('CAMERA_DETAIL_EVENT_TIME_FORMAT');
                        if(checkNextTime == 1){
                            var lastRecMoment = moment(nextTime);
                            this.cameraData.lastRecDateString = lastRecMoment.locale($("html").attr("lang")).format(videoDateFormat);
                            this.cameraData.lastRecTimeString = lastRecMoment.locale($("html").attr("lang")).format(videoTimeFormat);
                            $("#camera_off_lastrec").show();
                            this.isCameraOffLastShowRec = true;

                            this.cameraData.lastRecDate = nextTime;
                        }else{
                            this.isCameraOffLastRec = true;
                        }
                        return;
                    }
                }
            },

            stopTimer : function() {
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            },

            startLiveTimer : function() {
                this.timeline.setData('forceDomain', true);
                clearInterval(this.timer);
                // if($scope.serviceDay == 0){
                // 	return;
                // }
                this.timer = setInterval(() => {
                    switch(this.timeline.getData('timeRange')){
                        case 10:
                            this.range = 600000;
                            this.fixRange = 0;
                            break;
                        case 60:
                            this.range = 600000 * 6;
                            this.fixRange = 200000;
                            break;
                        case 360:
                            this.range = 600000 * 6 * 6;
                            this.fixRange = 1245000;
                            break;
                        case 1440:
                            this.range = 600000 * 6 * 6 * 4;
                            this.fixRange = 3650000;
                            break;
                    }

                    if(this.plyBtnStatus == false){
                        return;
                    }

                    this.currentTime = new Date();
                    this.timeline.setData('currentTime', this.currentTime);
                    this.playEventCb('currentTimeChanged', this.currentTime);
                    var currentDomain = this.timeline.getData('currentDomain');
                    if(currentDomain == undefined){
                        return;
                    }

                    var domain = currentDomain;

                    if (domain[0] + this.range < this.currentTime.getTime() && domain[1]- this.range - this.fixRange > this.currentTime.getTime()) {
                        this.timeline.updateCursor();
                        this.lineMoveFlag = false;
                    }else{
                        if(this.lineMoveFlag == false){
                            this.timeline.setData('changeTimeRangeClick', true);
                            this.playEventCb('pressedFindCursorButton');
                            this.lineMoveFlag = true;
                        }
                    }
                }, this.timeline.getData('cursorInterval'));
            },

            goCvr : function(time, status) {
                clearInterval(this.timer);
                this.dragThumCancle = false;
                var tmpX = 9999;

                if(time == undefined){
                    this.timeline.updateCursor(this.currentTime);
                    var cursorX = parseFloat($(".cursor").children("line").attr("x1"));
                    for(var i=0;i<this.cvrArray[0].length;i++){
                        if(cursorX < parseFloat(this.cvrArray[0].eq(i).attr("x"))){
                            var x = parseFloat(this.cvrArray[0].eq(i).attr("x"));
                            if(tmpX >= x){
                                tmpX = x;
                                time = this.timeline.getData('x').invert(x).getTime()+1000;
                            }
                        }
                    }
                }

                if(time == undefined){
                    this.timeline.updateCursor(this.currentTime);
                    if(this.cvrArray[0].length-1 > 0){
                        var x = parseFloat(this.cvrArray[0].eq(this.cvrArray[0].length-1).attr("x"));
                        if(tmpX >= x){
                            tmpX = x;
                            time = this.timeline.getData('x').invert(x).getTime()+1000;
                        }
                    }
                }

                if(time == undefined){
                    time = this.lastRec;
                    if(time == 0){
                        time = this.lastEvent;
                    }
                }

                var timeRange = this.timeline.getData('timeRange');
                if(time == 0){
                    toastcamAPIs.call(toastcamAPIs.camera.CHECK_IS_LAST_RECORD, {cameraId: this.cameraData.id}, (data) => {
                        this.cameraData.lastEventDate = data.lastEventStartTime;
                        this.cameraData.lastRecDate = data.lastRectStartTime;

                        var videoDateFormat = 'M월 D일 dddd'; //TODO: $translate.instant('CAMERA_DETAIL_EVENT_DATE_FORMAT');
                        var videoTimeFormat = 'HH:mm:ss'; //TODO: $translate.instant('CAMERA_DETAIL_EVENT_TIME_FORMAT');

                        var lastRecMoment = moment(this.cameraData.lastRecDate);
                        this.cameraData.lastRecDateString = lastRecMoment.locale($("html").attr("lang")).format(videoDateFormat);
                        this.cameraData.lastRecTimeString = lastRecMoment.locale($("html").attr("lang")).format(videoTimeFormat);

                        var date = new Date(data.lastRectStartTime);
                        this.timeline.setData('changeTimeRangeClick', true);
                        this.cameraStatusAllOff();
                        this.currentTime = date;
                        this.timeline.setData('currentTime', this.currentTime);
                        this.playEventCb('currentTimeChanged', this.currentTime);
                        this.timeline.zoomDomain(data.lastRectStartTime, timeRange);
                        this.goCvrStatus = true;
                        this.clickedCVRArea(date, status);
                    });
                }else{
                    var date = new Date(time);
                    this.timeline.setData('changeTimeRangeClick', true);
                    this.cameraStatusAllOff();
                    this.currentTime = date;
                    this.timeline.setData('currentTime', this.currentTime);
                    this.playEventCb('currentTimeChanged', this.currentTime);
                    this.timeline.zoomDomain(date.getTime(), timeRange);
                    this.goCvrStatus = true;
                    this.clickedCVRArea(date, status);
                }
            },

            goLive : function() {
                this.newTimelineDragCnt=0;
                this.isLive = true;
                this.timeline.setData('isLive', this.isLive);
                this.playEventCb('isLiveChanged', this.isLive);
                this.camInfoBarChange();
                this.cameraStatusAllOff();
                this.currentTime = new Date();
                this.timeline.setData('currentTime', this.currentTime);
                this.playEventCb('currentTimeChanged', this.currentTime);
                this.timeline.setData('changeTimeRangeClick', true);

                this.lineMoveFlag = false;
                this.dragThumCancle = false;
                this.timeline.zoomDomain(Date.now(), this.timeline.getData('timeRange'));
                this.startLiveTimer();
                this.playEventCb('livePlay');
            },

            stopFullscreenTimer : function() {
                if (this.fullscreenTimer) {
                    clearTimeout(this.fullscreenTimer);
                    this.fullscreenTimer = null;
                }
            },

            startFullscreenTimer : function() {
                clearTimeout(this.fullscreenTimer);
                this.fullscreenTimer = setTimeout(() => {
                    this.playEventCb('timelineVisibleChanged', false);
                }, 5000);
            },

            fullscreenHandler : function(event) {
                if (isFullScreen()) {
                    if (this.cameraData.recorderType === "recorder") {
                        $('#player').show();
                        $('#player').css('opacity', 0);
                        setTimeout(() => {
                            if ($('#remoteVideosContainer').children('video').length) {
                                $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - 100);
                            }
                        }, 500);
                    }
                } else {
                    setTimeout(() => {
                        if (this.cameraData.recorderType === "recorder") {
                            $('#player').hide();
                        }
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - $('#timeline_table').height());
                        }
                    }, 100);
                }
            },

            jumpToNextRecord : function() {
                var callbackFunc = function() {
                    if (this.cameraData.recordType == "event") {
                        var curTime = this.currentTime.getTime();
                        var currentDomain = this.timeline.getData('currentDomain');
                        var cvrData = this.timeline.getData('cvrData');
                        if (!currentDomain || !currentDomain[0] || !currentDomain[1]) {
                            return;
                        }
                        if (!(currentDomain[0] < curTime && curTime < currentDomain[1])) {
                            return;
                        }
                        var findTime = 0;
                        if (cvrData && cvrData.length) {
                            var i, len;
                            len = cvrData.length;

                            for (i = 0; i < len; i+=1) {
                                if (curTime > parseInt(cvrData[i].startTime, 10) && curTime <= parseInt(cvrData[i].endTime, 10)) {
                                    findTime = cvrData[i].endTime;
                                    break;
                                }
                            }
                            if (findTime === 0) {
                                findTime = this.currentTime.valueOf();
                            }
                        } else {
                            findTime = this.currentTime.valueOf();
                        }
                        toastcamAPIs.call(toastcamAPIs.camera.FIND_CVR, {cameraId: this.cameraData.id, cvrId: findTime, findDirection: 'next'}, (cvrData) => {
                            if (cvrData && cvrData.cvr && cvrData.cvr.start && cvrData.cvr.end) {
                                this.goCvr(parseInt(cvrData.cvr.start, 10));
                            } else {
                                this.goLive();
                            }
                        }, (err) => {
                            this.goLive();
                        });
                    }
                };
                if (this.playserStop) {
                    clearTimeout(this.playserStop);
                    this.playserStop = null;
                }
                this.playEventCb('checkCVRSeucre', (isSecureMode) => {
                    if(isSecureMode){
                        if(document.msFullscreenElement) {
                            this.playEventCb('pressedExitFullScreenButton');
                        }
                        this.playEventCb('updateCVRSecureStatus', callbackFunc.bind(this));
                    }else{
                        callbackFunc();
                    }
                });
            },

            destroy : function() {
                this.$destroy();
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

<style lang="less">
    #timebar_area {
    }
</style>