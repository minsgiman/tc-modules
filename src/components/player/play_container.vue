<template>
</template>

<script>
    import Vue from 'vue';
    import { i18n } from '../../i18n/player/i18n';
    import flashPlayer from './flash_player.vue';
    import timeline from './timeline.vue';
    import fullscreenBtn from './fullscreen_btn.vue';
    import zoomBtn from './zoom_btn.vue';
    import playTimer from './play_timer.vue';
    import errorStatusLayer from './error_status_layer.vue';
    import * as d3 from "d3";
    import toastcamAPIs from './../../service/toastcamAPIs';
    import store from '../../service/player/store';
    import moment from 'moment';
    import 'moment-timezone';

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
            dataLoadingStatus: function () {
                return store.state.dataLoadingStatus;
            }
        },
        data : function() {
            return {
                timeline: null,
                player : null,
                zoomBtn : null,
                errorStatusLayer : null,
                fullscreenBtn : null,
                zoomZoneBottom : 149,
                config : {},
                plyBtnStatus : false,
                playerCheck : false,
                cvrReplay : 0,
                liveReloadCnt : 1,
                flashStatusFlush : false,
                playCheackCnt : 0,
                clickTime : 0,
                playserStop : null,
                timer : null,
                fullScreenMakeViewTimeout : null,
                statusCheck : 0,
                stopStatusCheck : 0,
                beforeServerTime : 0,
                RecTime : null,
                cvrCheck : false,
                cursorIdx : 0,
                cursorNowTime : 0,
                fixRange : 0,
                range : 0,
                cursorDragStatus : false,
                goCvrStatus : false,
                currentZoom : 1.0,
                isShowZoomLocation : true,
                isShowControlToggleArea : false,
                fullscreenTimer : null,
                timeRange : 60,
                cachedTimelineparams : null,
                lastRec : 0,
                lastEvent : 0,
                lineMoveFlag : false
            }
        },
        created : function() {
            const vFullscreenBtnConstructor = Vue.extend(fullscreenBtn);
            this.fullscreenBtn = new vFullscreenBtnConstructor().$mount('#fullscreen_btn_wrap');
            this.fullscreenBtn.$on('fullscreenEvent', this.fullscreenEventHandler.bind(this));

            const vZoomBtnConstructor = Vue.extend(zoomBtn);
            this.zoomBtn = new vZoomBtnConstructor().$mount('#zoom_btn_wrap');
            this.zoomBtn.$on('zoomEvent', this.zoomEventHandler.bind(this));

            const vErrorStatusLayerConstructor = Vue.extend(errorStatusLayer);
            this.errorStatusLayer = new vErrorStatusLayerConstructor({i18n}).$mount('#error_status_wrap');
            this.errorStatusLayer.$on('errorLayerEvent', this.errorLayerEventHandler.bind(this));

            const vPlayTimerConstructor = Vue.extend(playTimer);
            this.playTimer = new vPlayTimerConstructor().$mount('#cam_info');
            this.playTimer.$on('playTimerEvent', this.playTimerEventHandler.bind(this));
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
            if (this.fullscreenBtn) {
                this.fullscreenBtn.$destroy();
            }
            if (this.zoomBtn) {
                this.zoomBtn.$destroy();
            }
            if (this.errorStatusLayer) {
                this.errorStatusLayer.$destroy();
            }
            if (this.playTimer) {
                this.playTimer.$destroy();
            }
            this.stopTimer();
            this.stopFullscreenTimer();
            window.onresize = null;
        },
        methods : {
            play : function (time, status) {
                if (time) {
                    this.goCvr(time, status);
                } else {
                    this.goLive();
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

            flashEventCallback : function(status) {
                this.playerCheck = true;

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
                        this.startLiveTimer();
                    } else {
                        this.startRecTimer(this.clickTime);
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
                            if (status === "NetConnection.Connect.Closed" && this.config.streamStatus !== "off") {
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
                                this.player.zoomZone(this.zoomZoneBottom, parseInt($("#player").css("width"))-20);
                            }
                        }
                        this.playTimer.camInfoBarChange();
                        break;
                    case 'dragTimeLineStop':
                        this.playEventCb('changedSelectedZone');
                        this.playEventCb('thumnailDrawChanged', true);
                        break;
                    case 'timelineDataUpdated':
                        this.playEventCb('eventsChanged', this.timeline.arrEvents);
                        setTimeout(() => {
                            this.playEventCb('changedSelectedZone');
                        },200);
                        this.playEventCb('changedSelectedZone');
                        break;
                    case 'clickedCVRArea':
                        this.clickedCVRArea(param.data);
                        break;
                    case 'goLive':
                        this.play();
                        break;
                    case 'loadingDataAlert':
                        this.playEventCb('loadingDataAlert');
                        break;
                    case 'doubleClick':
                        this.playEventCb('dblClickFlagChanged', true);
                        break;
                    case 'dragStart':
                        this.playEventCb('timelineDragStart');
                        break;
                    case 'dragging':
                        this.playEventCb('timelineDragging');
                        break;
                    case 'dragEnd':
                        this.playEventCb('timelineDragEnd');
                        break;
                    case 'updateByDrag':
                        this.lineMoveFlag = true;
                        break;
                    case 'clickedCVRBg':
                        this.playEventCb('thumnailDrawChanged', true);
                        this.lineMoveFlag = false;
                        this.plyBtnStatus = true;
                        break;
                    case 'cursorChanged':
                        if (param.data === 'left') {
                            this.playEventCb('isCursorLeftChanged', true);
                            this.playEventCb('isCursorRightChanged', false);
                        } else if (param.data === 'right') {
                            this.playEventCb('isCursorLeftChanged', false);
                            this.playEventCb('isCursorRightChanged', true);
                        } else {
                            this.playEventCb('isCursorLeftChanged', false);
                            this.playEventCb('isCursorRightChanged', false);
                        }
                        break;
                    case 'cursorDragEnd':
                        this.plyBtnStatus = true;
                        this.cursorDragStatus = false;
                        this.liveReloadCnt = 0;
                        break;
                    case 'getAlarmZones':
                        this.playEventCb('getAlarmZones');
                        break;
                    case 'shareEnd':
                        this.playEventCb('shareEnd');
                        break;
                    case 'checkCVRSeucre':
                        this.playEventCb('checkCVRSeucre', param.data);
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
                    case 'cursorDragStatusChanged':
                        this.cursorDragStatus = param.data;
                        break;
                    case 'changeTimeRangeFlagUpdate':
                        this.playEventCb('changeTimeRangeFlagUpdate', param.data);
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
                    store.dispatch('DATA_LOADING_STATUS_CHANGE', false);
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

                return this.timeline;
            },

            startRecTimer : function(time) {
                this.beforeServerTime = 0;
                this.startRecTime = time;
                store.dispatch('CURRENT_TIME_CHANGE', new Date(this.startRecTime.valueOf()));
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
                                store.dispatch('IS_PLAYING_CHANGE', false);
                                this.errorStatusLayer.cameraNoSave();
                                clearInterval(this.timer);
                                if (this.player) {
                                    this.player.close();
                                }
                                return;
                            }
                        }
                    }else{
                        store.dispatch('IS_PLAYING_CHANGE', true);
                        if(this.errorStatusLayer.showNextPlayLayer == true){
                            this.play(this.currentTime.valueOf());
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
                            store.dispatch('CURRENT_TIME_CHANGE', new Date(this.cursorNowTime));
                        } else {
                            addSec = 1000;
                            this.cursorNowTime = this.cursorNowTime + addSec;
                            store.dispatch('CURRENT_TIME_CHANGE', new Date(this.cursorNowTime));
                        }
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
                this.timeline.newTimelineDragCnt=0;
                clearInterval(this.timer);
                if(this.isShared == true){
                    this.playEventCb('shareEnd');
                }

                var currentDomain = this.timeline.getData('currentDomain');
                this.timeline.setupDomain([currentDomain[0], currentDomain[1]]);
                if((new Date()).valueOf() < time.valueOf()){
                    this.play();
                    return;
                }

                if(this.cursorDragStatus == true){
                    return;
                }

                setTimeout(() => {
                    this.timeline.serviceDateTime = ((new Date()).valueOf() - (1000*60*60*24*(this.timeline.serviceDay)));
                    if(this.timeline.serviceDateTime > time){
                        //return;
                        time = new Date(this.timeline.serviceDateTime + 3000);
                    }

                    this.clickTime = time;
                    this.errorStatusLayer.cameraStatusAllOff();

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
                        store.dispatch('IS_LIVE_CHANGE', false);
                        this.playTimer.camInfoBarChange();
                        this.goCvrStatus = false;
                        this.errorStatusLayer.cameraStatusAllOff();
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

                if(this.isFullScreen == true){
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
                    this.playTimer.setData('isShowTimelineToggleArea', false);
                    this.isShowControlToggleArea = false;
                } else {
                    this.isShowZoomLocation = false;
                    if(this.isFullScreen){
                        this.playTimer.setData('isShowTimelineToggleArea', true);
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

            playTimerEventHandler : function(param) {
                if (param.event === 'pause') {
                    this.pauseBtn();
                } else if (param.event === 'play') {
                    this.playBtn();
                } else if (param.event === 'goLive') {
                    this.play();
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
                this.zoomUp(zoom);
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

                    if (this.currentZoom > 1) {
                        this.playTimer.setData('isShowTimelineToggleArea', false);
                    } else {
                        this.playTimer.setData('isShowTimelineToggleArea', true);
                    }
                    this.playTimer.setData('isToggleOn', true);
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
                    this.playTimer.setData('isShowTimelineToggleArea', true);
                    this.playTimer.setData('isToggleOn', false);
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

                    if (this.currentZoom > 1) {
                        this.currentZoom = 1;	// 줌 상태일 경우 줌해제 처리
                        this.playEventCb('currentZoomChanged', this.currentZoom);
                        this.zoomUp(0);
                    }

                    this.playEventCb('isClickTimelineShowChanged', false);
                    this.playTimer.setData('isToggleOn', false);
                    this.playTimer.setData('isShowTimelineToggleArea', false);

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

            cvrDrawCheck : function(time) {
                store.dispatch('IS_LIVE_CHANGE', false);
                this.playTimer.camInfoBarChange();
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
                            this.timeline.setupDomain([currentDomain[0], currentDomain[1]]);
                        }
                    }else{
                        if(parseInt(cvrData[cvrData.length-1].endTime) <= time.valueOf()+30000){
                            this.timeline.setupDomain([currentDomain[0],currentDomain[1]]);
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
                        this.play();
                        this.timeline.newTimelineDragCnt = 0;
                        return;
                    }

                    if((new Date).valueOf() - time.valueOf() < 15000){
                        this.cvrCheck = true;
                        this.timeline.newTimelineDragCnt=0;
                    }
                }

                if(this.cvrCheck == false){
                    if(this.lineMoveFlag == false && this.plyBtnStatus == true){
                        this.lineMoveFlag = false;
                        store.dispatch('IS_PLAYING_CHANGE', false);
                        this.errorStatusLayer.cameraNoSave();
                        clearInterval(this.timer);
                        var videoDateFormat = 'M월 D일 dddd';  //TODO: $translate.instant('CAMERA_DETAIL_EVENT_DATE_FORMAT');
                        var videoTimeFormat = 'HH:mm:ss';  //TODO: $translate.instant('CAMERA_DETAIL_EVENT_TIME_FORMAT');
                        if(checkNextTime == 1){
                            var lastRecMoment = moment(nextTime);
                            this.cameraData.lastRecDateString = lastRecMoment.locale($("html").attr("lang")).format(videoDateFormat);
                            this.cameraData.lastRecTimeString = lastRecMoment.locale($("html").attr("lang")).format(videoTimeFormat);
                            $("#camera_off_lastrec").show();
                            this.errorStatusLayer.setData('isCameraOffLastShowRec', true);

                            this.cameraData.lastRecDate = nextTime;
                        }else{
                            this.errorStatusLayer.setData('isCameraOffLastRec', true);
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
                    const currentTime = new Date();
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
                    store.dispatch('CURRENT_TIME_CHANGE', currentTime);
                    var currentDomain = this.timeline.getData('currentDomain');
                    if(currentDomain == undefined){
                        return;
                    }

                    var domain = currentDomain;

                    if (domain[0] + this.range < currentTime.getTime() && domain[1]- this.range - this.fixRange > currentTime.getTime()) {
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
                        this.errorStatusLayer.cameraStatusAllOff();
                        store.dispatch('CURRENT_TIME_CHANGE', date);
                        this.timeline.zoomDomain(data.lastRectStartTime, timeRange);
                        this.goCvrStatus = true;
                        this.clickedCVRArea(date, status);
                    });
                }else{
                    var date = new Date(time);
                    this.timeline.setData('changeTimeRangeClick', true);
                    this.errorStatusLayer.cameraStatusAllOff();
                    store.dispatch('CURRENT_TIME_CHANGE', date);
                    this.timeline.zoomDomain(date.getTime(), timeRange);
                    this.goCvrStatus = true;
                    this.clickedCVRArea(date, status);
                }
            },

            goLive : function() {
                this.timeline.newTimelineDragCnt=0;
                store.dispatch('IS_LIVE_CHANGE', true);
                this.playTimer.camInfoBarChange();
                this.errorStatusLayer.cameraStatusAllOff();
                store.dispatch('CURRENT_TIME_CHANGE', new Date());
                this.timeline.setData('changeTimeRangeClick', true);

                this.lineMoveFlag = false;
                this.timeline.setData('dragThumCancle', false);
                this.timeline.zoomDomain(Date.now(), this.timeline.getData('timeRange'));
                this.startLiveTimer();
                this.playEventCb('livePlay');
            },

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
                this.plyBtnStatus = true;

                this.errorStatusLayer.cameraStatusAllOff();
                if(this.isLive == false){
                    this.clickedCVRArea(new Date(this.timeline.x.invert($(".cursor").children("line").attr("x1")).getTime()));
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
                this.playEventCb('checkCVRSeucre', (isSecureMode) => {
                    if(isSecureMode){
                        this.playEventCb('updateCVRSecureStatus', callbackFunc.bind(this));
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