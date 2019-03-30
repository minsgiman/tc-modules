<template>
</template>

<script>
    import Vue from 'vue';
    import { i18n } from '../../i18n/player/i18n';
    import playContainer from './player_container/player_container';
    import timeline from './timeline.vue';
    import fullscreenBtn from './fullscreen_btn.vue';
    import zoomBtn from './zoom_btn.vue';
    import playInfoBar from './play_info_bar.vue';
    import playTimer from './play_timer.vue';
    import errorStatusLayer from './error_status_layer.vue';
    import cvrPlaySecureManager from './cvrPlaySecureManager.vue';
    import timelineDateSelector from './timeline_date_selector.vue';
    import timelineTimeController from './timeline_time_controller.vue';
    import eventMoveBtn from './event_move_btn.vue';
    import toastcamAPIs from './../../service/toastcamAPIs';
    import store from '../../service/player/store';
    // import moment from 'moment';
    // import 'moment-timezone';

    var isExpiredCloud = function(camera) {
        if (camera && (camera.serviceType === 'n/a' || camera.serviceType === '0d' || camera.saveEndDate < Date.now()) && camera.recorderType !== 'nvr') {
            return true;
        }
        return false;
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
            },
            isFullScreen: function () {
                return store.state.isFullScreen;
            },
            isPlaying: function () {
                return store.state.isPlaying;
            },
            isLive: function () {
                return store.state.isLive;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            currentDomain: function () {
                return store.state.currentDomain;
            },
            dataLoadingStatus: function () {
                return store.state.dataLoadingStatus;
            },
            playBtnStatus: function () {
                return store.state.playBtnStatus;
            },
            serviceDay: function () {
                return store.state.serviceDay;
            },
            cvrData: function () {
                return store.state.cvrData;
            },
            timeRange: function () {
                return store.state.timeRange;
            }
        },
        data : function() {
            return {
                timeline: null,
                player : null,
                zoomBtn : null,
                errorStatusLayer : null,
                fullscreenBtn : null,
                config : {},
                cvrReplay : 0,
                liveReloadCnt : 1,
                flashStatusFlush : false,
                playCheackCnt : 0,
                playserStop : null,
                fullScreenMakeViewTimeout : null,
                statusCheck : 0,
                stopStatusCheck : 0,
                RecTime : null,
                fixRange : 0,
                range : 0,
                goCvrStatus : false,
                fullscreenTimer : null,
                cachedTimelineparams : null,
                lastRec : 0,
                lastEvent : 0
            }
        },
        created : function() {
            this.player = this.createComponent(playContainer, null, this.playStatusChangedHandler.bind(this));
            this.timeline = this.createComponent(timeline, 'view_timeline_area', this.onTimelineEvent.bind(this), {elementId: 'timebar_area', playEventCallback: this.playEventCb});
            this.fullscreenBtn = this.createComponent(fullscreenBtn, 'fullscreen_btn_wrap', this.fullscreenEventHandler.bind(this));
            this.zoomBtn = this.createComponent(zoomBtn, 'zoom_btn_wrap', this.zoomEventHandler.bind(this));
            this.errorStatusLayer = this.createComponent(errorStatusLayer, 'error_status_wrap', this.errorLayerEventHandler.bind(this));
            this.playInfoBar = this.createComponent(playInfoBar, 'cam_info', this.playInfoBarEventHandler.bind(this));
            this.playTimer = this.createComponent(playTimer, null, this.playTimerEventHandler.bind(this));
            this.cvrPlaySecureManager = this.createComponent(cvrPlaySecureManager, 'cvr_play_manager_wrap', this.cvrPlaySecureEventHandler.bind(this));
            this.timelineDateSelector = this.createComponent(timelineDateSelector, 'view_timeline_date', this.timlineDateSelectorEventHandler.bind(this));
            this.eventMoveBtn = this.createComponent(eventMoveBtn, 'event_move_btn_wrap', this.eventMoveBtnEventHandler.bind(this));
            this.eventMoveFullBtn = this.createComponent(eventMoveBtn, 'event_move_btn_full_wrap', this.eventMoveBtnEventHandler.bind(this), {fullMode: true});
            this.timelineTimeController = this.createComponent(timelineTimeController, 'timeline_time_controller_wrap', this.timelineTimeControllerEventHandler.bind(this), {timeline: this.timeline, fullMode: false});
            this.timelineTimeFullController = this.createComponent(timelineTimeController, 'timeline_time_controller_full_wrap', this.timelineTimeControllerEventHandler.bind(this), {timeline: this.timeline, fullMode: true});
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            this.timeline.destroy();
            this.zoomBtn.destroy();
            this.errorStatusLayer.destroy();
            this.playInfoBar.destroy();
            this.playTimer.destroy();
            this.cvrPlaySecureManager.destroy();
            this.timelineDateSelector.destroy();
            this.eventMoveBtn.destroy();
            this.eventMoveFullBtn.destroy();
            this.timelineTimeController.destroy();
            this.timelineTimeFullController.destroy();
            this.fullscreenBtn.destroy();
            //this.playTimer.stopTimer();
            this.stopFullscreenTimer();
            window.onresize = null;
        },
        methods : {
            createComponent : function (constructor, elementId, eventHandler, prop) {
                const vConstructor = Vue.extend(constructor);
                const vComponent = new vConstructor({i18n, propsData: prop});
                if (elementId) {
                    vComponent.$mount('#' + elementId);
                }
                vComponent.$on('event', eventHandler);
                return vComponent;
            },
            playStatusChangedHandler : function(status) {
                if (status.status) {
                    if (status.status === this.player.getData('webRTCStatusEnum').EVENT_STREAM_CONNECTED) {
                        this.player.setData('dvrConnectFail', false);
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - $('#timeline_table').height());
                        }
                        $('#webrtc_logo').hide();
                        $('#webrtc_loading').hide();
                        this.playTimer.playerCheck = true;
                        if (this.isLive) {
                            this.playTimer.startLiveTimer(this.timeline);
                        } else {
                            this.playTimer.startRecTimer(this.timeline.clickTime, this.player, this.timeline);
                        }
                    } else if (status.status === this.player.getData('webRTCStatusEnum').EVENT_STREAM_DISCONNECTED) {
                        //$('#remote_stream').hide();
                        this.player.setData('dvrConnectFail', true);
                        this.playTimer.stopTimer();
                        this.player.stop(this.currentCamera.id);
                        this.errorStatusLayer.cameraStatusChange(3);
                    }
                    return;
                }

                this.playTimer.playerCheck = true;

                if(this.errorStatusLayer.showNextPlayLayer == true){
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
                        this.timeline.resizeTimline();
                    },100);
                    store.dispatch('IS_PLAYING_CHANGE', true);
                    this.playEventCb('isShowMikeChanged', true);

                    this.errorStatusLayer.cameraStatusAllOff();

                    if (this.isLive) {
                        this.playTimer.startLiveTimer(this.timeline);
                    } else {
                        this.playTimer.startRecTimer(this.timeline.clickTime, this.player, this.timeline);
                    }
                } else {
                    if (this.isLive){
                        this.errorStatusLayer.cameraStatusChange(this.errorStatusLayer.lastCameraStatus);
                    }

                    if(status === "NetStream.Buffer.Flush"){
                        this.flashStatusFlush = true;
                    }else if(this.flashStatusFlush === true && status === "NetStream.Buffer.Empty"){
                        this.playserStop = setTimeout(() => {
                            if (this.player) {
                                this.player.stop();
                            }
                            this.playTimer.stopTimer();
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
                                    this.timeline.clickedCVRArea(this.timeline.clickTime);
                                },1000);
                                this.cvrReplay++;
                            }
                        }
                    }else if(status == "NetConnection.Connect.Closed" || status === 'NetStream.Play.Stop'){
                        if (this.isLive){
                            if (status === "NetConnection.Connect.Closed" && this.config.streamStatus !== "off") {
                                setTimeout(() => {
                                    if (this.playBtnStatus) {
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
                                    var i, len, curTime, cvrData = this.cvrData;
                                    if (this.currentTime && cvrData && cvrData.length) {
                                        len = cvrData.length;
                                        curTime = this.currentTime.getTime();
                                        for (i = 0; i < len; i+=1) {
                                            if (curTime > parseInt(cvrData[i].startTime, 10) && curTime <= parseInt(cvrData[i].endTime, 10)) {
                                                if (cvrData[i+1]) {
                                                    if ((parseInt(cvrData[i+1].startTime) - parseInt(cvrData[i].endTime)) < 1000) {
                                                        this.timeline.clickedCVRArea(new Date(parseInt(cvrData[i+1].startTime, 10) + 1000));
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else if (status === "NetConnection.Connect.Closed") {
                                var i, len, curTime, cvrData = this.cvrData;
                                if (this.currentTime && cvrData && cvrData.length) {
                                    len = cvrData.length;
                                    curTime = this.currentTime.getTime();
                                    for (i = 0; i < len; i+=1) {
                                        if (curTime > parseInt(cvrData[i].startTime, 10) && curTime <= parseInt(cvrData[i].endTime, 10)) {
                                            if (cvrData[i+1]) {
                                                if ((parseInt(cvrData[i+1].startTime) - parseInt(cvrData[i].endTime)) < 1000) {
                                                    this.timeline.clickedCVRArea(new Date(parseInt(cvrData[i+1].startTime, 10) + 1000));
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }else if(status == "NetStream.Buffer.Full" && this.errorStatusLayer.lastCameraStatus == 4){
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
                    case 'resize':
                        this.playEventCb('resizeTimline');
                        if(this.isFullScreen == true){
                            if (this.player) {
                                this.player.zoomZone(260, parseInt($("#player").css("width"))-20);
                            }
                        }else{
                            if (this.player) {
                                this.player.zoomZone(this.player.zoomZoneBottom, parseInt($("#player").css("width"))-20);
                            }
                        }
                        this.playInfoBar.camInfoBarChange();
                        break;
                    case 'goLive':
                        this.play();
                        break;
                    case 'stopPlayTimer':
                        this.playTimer.stopTimer();
                        break;
                    case 'cameraStatusAllOff':
                        this.errorStatusLayer.cameraStatusAllOff();
                        break;
                    case 'noCvr':
                        if(this.timeline.lineMoveFlag == false && this.playBtnStatus == true){
                            this.timeline.lineMoveFlag = false;
                            store.dispatch('IS_PLAYING_CHANGE', false);
                            this.errorStatusLayer.cameraNoSave();
                            this.playTimer.stopTimer();
                            var videoDateFormat = 'M월 D일 dddd';  //TODO: $translate.instant('CAMERA_DETAIL_EVENT_DATE_FORMAT');
                            var videoTimeFormat = 'HH:mm:ss';  //TODO: $translate.instant('CAMERA_DETAIL_EVENT_TIME_FORMAT');
                            if(param.data){
                                var lastRecMoment = moment(param.data);
                                this.errorStatusLayer.lastRecDateString = lastRecMoment.locale($("html").attr("lang")).format(videoDateFormat);
                                this.errorStatusLayer.lastRecTimeString = lastRecMoment.locale($("html").attr("lang")).format(videoTimeFormat);
                                $("#camera_off_lastrec").show();
                                this.errorStatusLayer.isCameraOffLastShowRec = true;
                                this.errorStatusLayer.lastRecDate = param.data;
                            }else{
                                this.errorStatusLayer.isCameraOffLastRec = true;
                            }
                            return;
                        }
                        break;
                    case 'cvrPlayRequest':
                        var time = param.data.time, status = param.data.status;
                        this.timeline.serviceDateTime = ((new Date()).valueOf() - (1000*60*60*24*(this.serviceDay)));
                        if(this.timeline.serviceDateTime > time){
                            //return;
                            time = new Date(this.timeline.serviceDateTime + 3000);
                        }

                        this.timeline.clickTime = time;
                        this.errorStatusLayer.cameraStatusAllOff();

                        this.playTimer.cursorIdx = 0;
                        if(status != 'f'){
                            this.timeline.cvrDrawCheck(time);
                        }
                        if(this.timeline.cursorDragStatus == true){
                            return;
                        }
                        this.playTimer.playerCheck = false;
                        this.playTimer.startRecTimer(time, this.player, this.timeline);
                        if(this.timeline.cvrCheck == true || this.goCvrStatus == true){
                            store.dispatch('IS_LIVE_CHANGE', false);
                            this.playInfoBar.camInfoBarChange();
                            this.goCvrStatus = false;
                            this.errorStatusLayer.cameraStatusAllOff();
                            this.player.play(time);
                        }else{
                            if (this.cameraData.recordType == "event") {
                                this.jumpToNextRecord();
                            }
                        }
                        this.timeline.updateCursor(new Date(time));
                        this.timeline.isCursorLeft = false;
                        this.timeline.isCursorRight = false;
                        break;
                    case 'startRecTimer':
                        this.playTimer.startRecTimer(param.data, this.player, this.timeline);
                        break;
                    case 'timerCursorIdxChange':
                        this.playTimer.cursorIdx = param.data;
                        break;
                    case 'camInfoBarChange':
                        this.playInfoBar.camInfoBarChange();
                        break;
                    case 'clearPlayerStopTimeout':
                        clearTimeout(this.playserStop);
                        break;
                    case 'checkCVRSeucre':
                        this.cvrPlaySecureManager.checkCVRSeucre(param.data);
                        break;
                    case 'updateCVRSecureStatus':
                        this.cvrPlaySecureManager.setCVRSecureCallback(param.data);
                        break;
                    case 'liveReloadCntUpdate':
                        this.liveReloadCnt = param.data;
                        break;
                    default:
                        break;
                }
            },

            playInfoBarEventHandler : function(param) {
                if (param.event === 'pause') {
                    this.pauseBtn();
                } else if (param.event === 'play') {
                    this.playBtn();
                } else if (param.event === 'goLive') {
                    this.play();
                }
            },

            playTimerEventHandler : function(param) {
                if (param.event === 'jumpToNextRecord') {
                    this.jumpToNextRecord();
                } else if (param.event === 'noCvrError') {
                    this.errorStatusLayer.cameraNoSave();
                } else if (param.event === 'checkNoCvr') {
                    if(this.errorStatusLayer.showNextPlayLayer == true){
                        this.play(this.currentTime.valueOf());
                    }
                } else if (param.event === 'pressedFindCursorButton') {
                    this.timeline.pressedFindCursorButton();
                }
            },

            cvrPlaySecureEventHandler : function(param) {
                if (param.event === 'stopTimer') {
                    this.playTimer.stopTimer();
                } else if (param.event === 'goLiveByCancleCVR') {
                    this.timeline.cursorOn = false;
                    this.play();
                } else if (param.event === 'isIncorrectPlayPasswordChanged') {
                    this.playEventCb('isIncorrectPlayPasswordChanged', param.data);
                }
            },

            timlineDateSelectorEventHandler: function (param) {
                if (param.event === 'pressedCalendarDate') {
                    this.timeline.setData('lineMoveFlag', true);
                    this.timeline.setData('clickDateChange', true);
                    store.dispatch('TIME_RANGE_CHANGE', 1440);
                    this.timeline.setTimeRangeAtDateString(param.data, 1440);

                    setTimeout(() => {
                        this.timeline.setData('newTimelineDragCnt', 0);
                        var currentDomain = this.currentDomain;
                        this.timeline.setupDomain([currentDomain[0], currentDomain[1]]);
                        if(this.isPlaying == false){
                            var format = d3.time.format("%Y%m%d%H%M%S");
                            var startDate = format.parse(param.data + "000000");
                            var endDate = format.parse(param.data + "240000");
                            var startTime = startDate.getTime();
                            var endTime = endDate.getTime();
                            if(startTime < this.currentTime.valueOf() && endTime > this.currentTime.valueOf()){
                                this.timeline.updateCursor(this.currentTime);
                                this.timeline.setData('newTimelineDragCnt', 0);
                            }
                        }
                    },500);
                }
            },

            eventMoveBtnEventHandler: function (param) {
                if (param.event === 'checkCVRSeucre') {
                    this.cvrPlaySecureManager.checkCVRSeucre(param.data);
                } else if (param.event === 'updateCVRSecureStatus') {
                    this.cvrPlaySecureManager.setCVRSecureCallback(param.data);
                } else if (param.event === 'play') {
                    this.play(param.data);
                } else if (param.event === 'noPrevEvent') {
                    this.playEventCb('noPrevEvent');
                } else if (param.event === 'noNextEvent') {
                    this.playEventCb('noNextEvent');
                } else if (param.event === 'serviceDateTimeUpdate') {
                    this.timeline.setData('serviceDateTime', param.data);
                }
            },

            timelineTimeControllerEventHandler: function (param) {
                if (param.event === 'dblClickFlagChanged') {
                    this.timeline.setData('dblClickFlag', param.data);
                } else if (param.event === 'loadingDataAlert') {
                    this.playEventCb('loadingDataAlert');
                }
            },

            errorLayerEventHandler : function(param) {
                if (param.event === 'lastEvent') {
                    this.lastEvent = param.value;
                } else if (param.event === 'lastRec') {
                    this.lastRec = param.value;
                } else if (param.event === 'playCvr') {
                    this.play(param.value.time, param.value.status);
                }
            },

            zoomEventHandler : function(zoom) {
                this.playEventCb('zoomDragValChanged', 0);
                this.player.zoomUp(zoom);
            },

            fullscreenEventHandler : function(param) {
                if (param.event === 'changed') {
                    this.onFullscreenChanged(param.state);
                } else if (param.event === 'beforeChange') {
                    this.onBeforeFullscreenChange(param.state);
                } else if (param.event === 'dataLoading') {
                    this.playEventCb('loadingAlert');
                }
            },

            onBeforeFullscreenChange : function (fullscreenStatus) {
                if (fullscreenStatus) {
                    this.timeline.newTimelineDragCnt = 0;

                    if (this.player.getData('currentZoom') > 1) {
                        this.playInfoBar.setData('isShowTimelineToggleArea', false);
                    } else {
                        this.playInfoBar.setData('isShowTimelineToggleArea', true);
                    }
                    this.playInfoBar.setData('isToggleOn', true);
                    $("#controlNdTimeLine").hide();
                    $("#view_timeline_ctrl").hide();
                    $("#view_timeline_date").hide();
                    $("#view_btn_area").hide();
                    $("#view_camdtl_tab").hide();
                    $("#footer").hide();
                    $("#header").hide();
                    $("#timelinedesc").css("top",51);
                    $("#prevLineBtn").css("top",40);
                    $("#nextLineBtn").css("top",40);
                    $("#cursorLeftBtn").css("top",35);
                    $("#cursorRightBtn").css("top",35);
                    // $("#player").css("height","");
                    this.fullScreenMakeViewTimeout = setTimeout(() => {
                        $(".fs_time").show();
                        $("#controlNdTimeLine").css("position","relative");
                        $("#controlNdTimeLine").show();
                        // $("#controlNdTimeLine").css("top", $("#player").height() - $("#view_timeline_area").height() -10);
                        $("#showControl").show();
                        // $("#showControl").css("top", $("#player").height() - $("#controlNdTimeLine").height() + 91);
                        $("#timebar_area").children("svg").children("g").attr("transform", 'translate(0, -15)');
                        // $("#timebar_area").children("svg").height("105");
                        this.timeline.redrawWithWidth(parseInt($("#fullscreen").width()));
                    },1050);
                } else {
                    this.playInfoBar.setData('isShowTimelineToggleArea', true);
                    this.playInfoBar.setData('isToggleOn', false);
                    $("#view_timeline_ctrl").show();
                    $("#view_timeline_date").show();
                    $("#view_btn_area").show();
                    $("#view_camdtl_tab").show();
                    $("#footer").show();
                    $("#header").show();
                }
            },

            onFullscreenChanged : function(fullscreenStatus) {
                var topDefault = 96;
                this.timeline.newTimelineDragCnt = 0;
                this.playEventCb('isFullScreenChanged', fullscreenStatus);

                if (fullscreenStatus) {
                    $("#cloud_out_small").hide();
                    $("#cloud_out_full").show();

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
                    $("#view_timeline_area").removeAttr( 'style' );

                    clearTimeout(this.fullscreenTimer);
                    if (this.player) {
                        this.player.zoomZone(350, parseInt($("#player").css("width"))-20);
                    }
                    this.playEventCb('timelineVisibleChanged', true);

                    if (this.player.getData('currentZoom') > 1) {
                        this.player.setData('currentZoom', 1);	// 줌 상태일 경우 줌해제 처리
                        this.playEventCb('zoomDragValChanged', 0);
                        this.player.zoomUp(0);
                    }

                    this.playEventCb('isClickTimelineShowChanged', false);
                    this.playInfoBar.setData('isToggleOn', false);
                    this.playInfoBar.setData('isShowTimelineToggleArea', false);

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

                    clearTimeout(this.fullScreenMakeViewTimeout);

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

            play : function (time, status) {
                if (time) {
                    this.goCvr(time, status);
                } else {
                    this.goLive();
                }
            },

            goCvr : function(time, status) {
                this.playTimer.stopTimer();
                this.timeline.setData('dragThumCancle', false);
                var tmpX = 9999;

                if(time == undefined){
                    this.timeline.updateCursor(this.currentTime);
                    var cursorX = parseFloat($(".cursor").children("line").attr("x1"));
                    for(var i=0;i<this.timeline.cvrArray[0].length;i++){
                        if(cursorX < parseFloat(this.timeline.cvrArray[0].eq(i).attr("x"))){
                            var x = parseFloat(this.timeline.cvrArray[0].eq(i).attr("x"));
                            if(tmpX >= x){
                                tmpX = x;
                                time = this.timeline.getData('x').invert(x).getTime()+1000;
                            }
                        }
                    }
                }

                if(time == undefined){
                    this.timeline.updateCursor(this.currentTime);
                    if(this.timeline.cvrArray[0].length-1 > 0){
                        var x = parseFloat(this.timeline.cvrArray[0].eq(this.timeline.cvrArray[0].length-1).attr("x"));
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

                var timeRange = this.timeRange;
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
                        this.errorStatusLayer.cameraStatusAllOff();
                        store.dispatch('CURRENT_TIME_CHANGE', date);
                        this.timeline.zoomDomain(data.lastRectStartTime, timeRange);
                        this.goCvrStatus = true;
                        this.timeline.clickedCVRArea(date, status);
                    });
                }else{
                    var date = new Date(time);
                    this.timeline.setData('changeTimeRangeClick', true);
                    this.errorStatusLayer.cameraStatusAllOff();
                    store.dispatch('CURRENT_TIME_CHANGE', date);
                    this.timeline.zoomDomain(date.getTime(), timeRange);
                    this.goCvrStatus = true;
                    this.timeline.clickedCVRArea(date, status);
                }
            },

            goLive : function() {
                this.timeline.newTimelineDragCnt=0;
                store.dispatch('IS_LIVE_CHANGE', true);
                this.playInfoBar.camInfoBarChange();
                this.errorStatusLayer.cameraStatusAllOff();
                store.dispatch('CURRENT_TIME_CHANGE', new Date());
                this.timeline.setData('changeTimeRangeClick', true);

                this.timeline.lineMoveFlag = false;
                this.timeline.setData('dragThumCancle', false);
                this.timeline.zoomDomain(Date.now(), this.timeRange);
                this.playTimer.startLiveTimer(this.timeline);
                this.playEventCb('livePlay');
            },

            pauseBtn : function() {
                this.player.pause();
                store.dispatch('PLAY_BTN_STATUS_CHANGE', false);
            },

            playBtn : function() {
                this.player.resume();
                store.dispatch('PLAY_BTN_STATUS_CHANGE', true);

                this.errorStatusLayer.cameraStatusAllOff();
                if(this.isLive == false){
                    this.timeline.clickedCVRArea(new Date(this.timeline.x.invert($(".cursor").children("line").attr("x1")).getTime()));
                }else{
                    this.playEventCb('livePlay');
                }
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

            jumpToNextRecord : function() {
                var callbackFunc = function() {
                    if (this.cameraData.recordType == "event") {
                        var curTime = this.currentTime.getTime();
                        var currentDomain = this.currentDomain;
                        var cvrData = this.cvrData;
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
                                this.play(parseInt(cvrData.cvr.start, 10));
                            } else {
                                this.play();
                            }
                        }, (err) => {
                            this.play();
                        });
                    }
                };
                if (this.playserStop) {
                    clearTimeout(this.playserStop);
                    this.playserStop = null;
                }
                this.cvrPlaySecureManager.checkCVRSeucre((isSecureMode) => {
                    if(isSecureMode){
                        this.cvrPlaySecureManager.setCVRSecureCallback(callbackFunc.bind(this));
                    }else{
                        callbackFunc();
                    }
                });
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