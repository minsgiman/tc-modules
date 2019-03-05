<template>
    <div id="play_container">
        <event_bus_comp
                @stop-timer="onStopTimer"
                @start-timer="onStartTimer"
                @go-live="onGoLive"
                @go-cvr="onGoCvr"
                @play-start="play"
                @play-status-change="onPlayStatusChange">
        </event_bus_comp>
        <div class="camdtl_wrap nvr_hidden_right_none">
            <div>
                <div class="camdtl_view">
                    <div class="player_area" id="player_area">
                        <div>
                            <div id="fullscreen">
                                <div class="player_cam" id="play_area" style="width:100%;height:100%;"></div>
                                <div id="controlNdTimeLine">
                                    <div class="cam_ctrl" id="view_cam_ctrl">
                                        <div v-show="isShowControlButton">
                                            <div class="zoom">
                                                <button type="button" class="sp zoomout" @click="zoomUp(-1)"></button>
                                                <button type="button" class="sp zoomin" @click="zoomUp(1)"></button>
                                                <span class="zoom_bg">
                                                      <span class="bar" id="zoom_cursor_length" style="width: 0%">
                                                        <button type="button" class="bar_ctrl" id="zoomCursor"></button>
                                                      </span>
                                                </span>
                                            </div>
                                            <div class="cam_info" id="cam_info" :class="{toggle_on : isShowTimelineToggleArea && isToggleOn , toggle_off : isShowTimelineToggleArea && !isToggleOn }">
                                                <div class="cam_info_area cam_info_bg cam_info_bg_en_en_en">
                                                    <div class="time_area" id="time_area" style="position: relative;">
                                                        <button type="button" class="sp pause" v-show="isPlaying" @click="pauseBtn()" id="pause_btn"></button>
                                                        <button type="button" class="sp play" v-show="!isPlaying" @click="playBtn()" id="play_btn"></button>
                                                        <span class="date">{{formattedDateNotYo(currentTime)}}</span>
                                                        <span class="time">{{formattedTime(currentTime)}}</span>
                                                        <button type="button" class="golive" v-show="!isLive" @click="onGoLive()" id="golive_btn"><span>GO LIVE</span></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="event_move" v-show="isFullScreen && !cloudOut">
                                                <div class="event_move_box">
                                                    <li class="ar_L" @click="goPrevEvent()"><button></button></li>
                                                    <li class="txt"></li>
                                                    <li class="ar_R" @click="goNextEvent()"><button></button></li>
                                                </div>
                                            </div>
                                            <div class="menu">
                                                <button type="button" class="sp" :class="{
                                                    camera_on: config.streamStatus == 'on' && currentCamera.hasConfigPermission == true,
                                                    camera_off: config.streamStatus != 'on' && currentCamera.hasConfigPermission == true,
                                                    camera_on_non: config.streamStatus == 'on' && currentCamera.hasConfigPermission != true,
                                                    camera_off_non: config.streamStatus != 'on' && currentCamera.hasConfigPermission != true}" @click="showCameraOnOffConfirmLayer()">
                                                </button>
                                                <button type="button" class="sp full" v-show="!isFullScreen" @click="pressedFullScreenButton()"></button>
                                                <button type="button" class="sp small" v-show="isFullScreen" @click="pressedExitFullScreenButton()"></button>
                                            </div>
                                            <div class="cam_zoom">
                                                <div id="zoom_area" class="zoom_area hide"></div>
                                                <button type="button" class="btn_clse hide">
                                                    <span class="sp"></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="timeline_area"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import event_bus_comp from '../eventBus';
    import store from '../../store/player/store';
    import moment from 'moment';
    import $ from 'jquery';
    import pikaday from 'pikaday';

    export default {
        name: 'play_container',
        computed : {
            isLive: function () {
                return store.state.isLive;
            },
            config: function () {
                return store.state.cameraConfig;
            },
            clickedCvrTime: function () {
                return store.state.clickedCvrTime;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            currentCamera: function () {
                return store.state.cameraData;
            },
            isPlaying: function () {
                return store.state.isPlaying;
            },
            isFullscreen: function () {
                return store.state.isFullscreen;
            },
            isShared: function () {
                return store.state.isShared;
            },
            cloudOut: function () {
                return store.state.cloudOut;
            },
            isExpiredCloud: function () {
                return store.getters.isExpiredCloud;
            },
            serviceDay: function () {
                return store.state.serviceDay;
            },
        },
        data : function() {
            return {
                timeline: null,
                player: null,
                playTimer: null,
                beforeServerTime: 0,
                cursorNowTime: 0,
                currentZoom: 1.0,
                isToggleOn: false,
                lineMoveFlag: false,
                isShowControlButton: true,
                isShowTimelineToggleArea: false,
                isFullScreen: false
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
        },
        methods: {
            play: function(time) {
                this.player.play(time);
            },
            drawTimeline: function(timelineData) {
                this.timeline.draw(timelineData);
                this.timeline.drawTimelineData(timelineData);
            },

            startLiveTimer: function () {
                this.timeline.forceDomain = true;
                this.onStopTimer();
                this.playTimer = setInterval(() => {
                    let range, fixRange;
                    switch(this.timeline.timeRange){
                        case 10:
                            range = 600000;
                            fixRange = 0;
                            break;
                        case 60:
                            range = 600000 * 6;
                            fixRange = 200000;
                            break;
                        case 360:
                            range = 600000 * 6 * 6;
                            fixRange = 1245000;
                            break;
                        case 1440:
                            range = 600000 * 6 * 6 * 4;
                            fixRange = 3650000;
                            break;
                    }

                    store.dispatch('SET_CURRENT_TIME', new Date());
                    if(this.timeline.currentDomain == undefined){
                        return;
                    }

                    var domain = this.timeline.currentDomain;

                    if (domain[0]+range < this.currentTime.getTime() && domain[1]-range - fixRange > this.currentTime.getTime()) {
                        this.timeline.updateCursor();
                        this.lineMoveFlag = false;
                    }else{
                        if(this.lineMoveFlag == false){
                            //changeTimeRangeClick = true;
                            //$scope.pressedFindCursorButton();
                            this.lineMoveFlag = true;
                        }else{
                            // if($scope.cursorLineIn == true){
                            //     $scope.pressedFindCursorButton();
                            //     $scope.cursorLineIn = false;
                            // }
                        }
                    }
                }, 1000);
            },
            startRecTimer: function (time) {
                this.beforeServerTime = 0;
                store.dispatch('SET_CURRENT_TIME', new Date(time.valueOf()));
                this.cursorNowTime = time.valueOf();
                this.onStopTimer();

                this.playTimer = setInterval(() => {
                    this.timeline.cvrDrawCheck(this.currentTime);

                    if (this.currentCamera.recordType == "event") {
                        //$scope.jumpToNextRecord();
                    } else {
                    }

                    var addSec = (((this.player.getCurrentTime()[0] || 0 ) * 1000) - this.beforeServerTime);
                    if(addSec <= 0){
                        addSec = 1000;
                    }
                    this.cursorNowTime = this.cursorNowTime + addSec;
                    this.beforeServerTime = (this.player.getCurrentTime()[0] || 0 ) * 1000;
                    store.dispatch('SET_CURRENT_TIME', new Date(this.cursorNowTime));

                    if(this.timeline.currentDomain == undefined){
                        return;
                    }

                    var range, fixRange, domain = this.timeline.currentDomain;

                    switch(this.timeline.timeRange){
                        case 10:
                            range = 600000;
                            fixRange = 0;
                            break;
                        case 60:
                            range = 600000 * 6;
                            fixRange = 200000;
                            break;
                        case 360:
                            range = 600000 * 6 * 6;
                            fixRange = 1245000;
                            break;
                        case 1440:
                            range = 600000 * 6 * 6 * 4;
                            fixRange = 3650000;
                            break;
                    }

                    if (domain[0]+range < this.currentTime.valueOf() && domain[1]-range-fixRange > this.currentTime.valueOf()) {
                        this.lineMoveFlag = false;
                    }else{
                        if(this.lineMoveFlag == false){
                            // changeTimeRangeClick = true;
                            // $scope.pressedFindCursorButton();
                        }
                    }

                    if(this.lineMoveFlag == false){
                        if (domain[0] < this.cursorNowTime && domain[1] > this.cursorNowTime) {
                            this.timeline.updateCursor(new Date(this.cursorNowTime));
                        }else{
                            //changeTimeRangeClick = true;
                            this.timeline.nextDomain();
                        }
                    }
                }, 1000);
            },
            pauseBtn: function() {
                this.player.control.pause();
            },
            playBtn: function() {
                if(this.isLive == false){
                    //$scope.clickedCVRArea(new Date($scope.timeline.x.invert($(".cursor").children("line").attr("x1")).getTime()));
                }else{
                    this.player.play();
                }
            },
            showCameraOnOffConfirmLayer: function() {

            },

            currentCameraDataSet: function() {
                $("#timebar_area").children("svg").width()/2 - 75;
                setTimeout(function(){
                    $( "#timelinedesc" ).fadeIn(2500, function() {
                        $( "#timelinedesc" ).fadeOut(2000);
                    });
                }, 2000);

                if(this.currentCamera.mediaStreamURL != "" || this.currentCamera.mediaStreamURL != null){

                    if(this.isLive == false){
                        this.timeline.clickedCVRArea(this.currentTime);
                    }else{
                        this.onGoLive();
                    }
                    if(this.currentCamera.needUpgrade == "YES" && this.currentCamera.controlStatus == "on"){
                        if(this.isShared == false){
                            //TODO:
                            //$scope.cameraUpagradeAlert = true;
                        }
                    }
                }else{
                    //TODO:
                    //$scope.isNetwork = true;
                }

                if(this.currentCamera.saveEndDate < (new Date).valueOf()){
                    $("#timelinedesc").remove();
                    store.dispatch('SET_CLOUD_OUT', true);
                }else{
                    store.dispatch('SET_CLOUD_OUT', false);
                    var today = new Date();
                    var betweenDay = parseInt((this.currentCamera.saveEndDate - today.getTime())/1000/60/60/24);
                    if(betweenDay<=7){
                        //TODO:
                        // $scope.cloudEnd = betweenDay;
                        // $scope.showServiceEnd = true;f
                    }
                }

                if (this.currentCamera.controlStatus !== 'on') {
                    if(this.currentCamera.streamStatus !== 'off'){
                        //TODO:
                        // Camera.isLastRecord({ id: $stateParams.cameraId }, function (data) {
                        //     $scope.currentCameraIsLastRecordDataSet(data);
                        // });
                    }
                    store.dispatch('SET_IS_PLAYING', false);
                    //TODO:
                    // $scope.isShowFullscreenButton = true;
                    // $scope.isShowMike = false;
                } else {
                    store.dispatch('SET_IS_PLAYING', true);
                }

                if(this.currentCamera.streamStatus =="off" || this.currentCamera.controlStatus === 'CE'){
                    setTimeout(function(){
                        //TODO:
                        // Camera.isLastRecord({ id: $stateParams.cameraId }, function (data) {
                        //     $scope.currentCameraIsLastRecordDataSet(data);
                        //
                        // });
                    },1050);
                }

                if (!this.isExpiredCloud) {
                    var serviceDays = [];
                    if (this.currentCamera.recorderType === 'nvr') {
                        var now = moment();
                        var regDate = moment(this.currentCamera.regDate);
                        store.dispatch('SET_SERVICE_DAY', now.diff(regDate, 'days') + 1);
                    } else {
                        store.dispatch('SET_SERVICE_DAY', parseInt(this.currentCamera.serviceType));
                    }

                    if (this.serviceDay <= 7 && this.serviceDay>=1) {
                        setTimeout(function(){
                            $("#view_timeline_date").find("button").css("padding","0 12px");
                        },500);
                        //TODO:
                        // $scope.serviceCalendarDay = serviceCalendarDay($scope.serviceDay + 1);
                        // $scope.todayDate = $scope.serviceCalendarDay[$scope.serviceCalendarDay.length-1].date;
                    }else if(this.serviceDay >= 8){
                        if(this.serviceDay <= 10){
                            setTimeout(function(){
                                $("#view_timeline_date").find("button").css("padding","0 12px");
                            },500);
                        }
                        //TODO:
                        //$scope.serviceCalendarDate = serviceCalendarDate($scope.serviceDay);

                        var year = (new Date(this.currentCamera.regDate)).getFullYear();
                        var month = parseInt((new Date(this.currentCamera.regDate)).getMonth()+1);
                        var day = (new Date(this.currentCamera.regDate)).getDate();

                        if(month < 10){
                            month = "0"+month;
                        }
                        //TODO:
                        // var regDateString  = year+"-"+month+"-"+day;
                        // $scope.todayDate = $scope.serviceCalendarDate[$scope.serviceCalendarDate.length-1].date;
                    }else{
                        store.dispatch('SET_CLOUD_OUT', true);
                        $("#timelinedesc").remove();
                    }

                    if (this.currentCamera.recorderType === 'nvr') {
                        //TODO:
                        //setupClipCalendar($scope.serviceDay.toString());
                    } else {
                        //TODO:
                        //setupClipCalendar($scope.currentCamera.serviceType);
                    }
                } else {
                    store.dispatch('SET_CLOUD_OUT', true);
                    store.dispatch('SET_SERVICE_DAY', 0);
                }

                //TODO://
                // var eventListDateDate = eventListDate();
                // for(var i=0;i<eventListDateDate.length;i++){
                //     var dateObject = {};
                //     dateObject.date = eventListDateDate[i].date;
                //     dateObject.day = eventListDateDate[i].day;
                //     var dateO = eventListDateDate[i].day.split(" ");
                //     dateObject.month = dateObject.date.substring(4,6);
                //     dateObject.dates = dateObject.date.substring(6,8);
                //     var dayCheck = new Date(dateObject.date.substring(0,4)+"-"+dateObject.date.substring(4,6)+"-"+dateObject.date.substring(6,8)).getDay();
                //     dateObject.days = dayCheck;
                //     dateObject.today = dateO[3];
                //     $scope.eventListDate.push(dateObject);
                // }
                //$(".cvr").empty();
                //$scope.cameraStatusSet();

                // $scope.me = User.me(function () {
                //     if(userIdLoading == 0){
                //         userIdLoading++;
                //     }
                // });

                // $scope.selectedZones = [];
                // $scope.selectedAllZones = [];
                // $scope.zones = [];

                // if($scope.currentCamera.saveEndDate >= (new Date()).valueOf()){
                //     if($scope.eventListCheckFlag === false){
                //
                //         setTimeout(function(){
                //             $scope.pressedEventListDateButton(0);
                //         },10);
                //         eventListCheckFlag = true;
                //     }
                //
                //     if($scope.selectedEventDateIndex == 0){
                //         $scope.pressedEventListDateButton(0);
                //
                //         if($scope.pressedEventListTimeButtonFlag == true){
                //             setTimeout(function(){
                //                 $scope.pressedEventListTimeButton(pEventButtonIdx, pEventButtonDate , 1);
                //
                //             },1500);
                //         }
                //     }
                // }else{
                //     $scope.cloudServiceEnd = true;
                // }
            },

            pressedFullScreenButton: function () {
                if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                    var rv = 0;
                    var ua = navigator.userAgent;
                    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                    if (re.exec(ua) != null)
                        rv = parseFloat(RegExp.$1);
                    if(rv != 0 && rv <=10){
                        //showAlert($translate.instant("EXPLORE_UNDER10_SUBJECT"),$translate.instant("EXPLORE_UNDER10_CONTENT1")+"<br>"+$translate.instant("EXPLORE_UNDER10_CONTENT2")+"<br>"+$translate.instant("EXPLORE_UNDER10_CONTENT3"));
                        return;
                    }
                }

                // if(screenloading == 0){
                //     if ($scope.currentCamera.recorderType !== "recorder") {
                //         showAlert($translate.instant("DATA_LOADING_SUBJECT"),$translate.instant("DATA_LOADING_CONTENT"));
                //         return;
                //     }
                // }
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

                if (this.currentZoom > 1) {
                    this.isShowTimelineToggleArea = false;
                } else {
                    this.isShowTimelineToggleArea = true;
                }

                store.dispatch('SET_IS_FULLSCREEN', true);
                this.isShowFullscreenButton = false;
                this.isToggleOn = true;
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
                setTimeout(() => {
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
                store.dispatch('SET_IS_FULLSCREEN', false);
                this.isShowFullscreenButton = true;
                this.isShowTimelineToggleArea = true;
                this.isToggleOn = false;

                $("#view_timeline_ctrl").show();
                $("#view_timeline_date").show();
                $("#view_btn_area").show();
                $("#view_camdtl_tab").show();
                $("#footer").show();
                $("#header").show();
            },

            zoomUp: function(level) {
                // if(fullscreenFlag == true){
                //     flashBridge.control.zoomZone(260, parseInt($("#player").css("width"))-20);
                // }else{
                this.player.control.zoomZone(zoomZoneBottom, parseInt($("#player").css("width"))-20);
                //}

                var newZoom = this.currentZoom + level;
                if (newZoom > 5.0) {
                    newZoom = 5.0;
                }

                if (newZoom < 1.0) {
                    newZoom = 1.0;
                }

                $("#zoom_cursor_length").css("width",((newZoom-1) * 25)+"%");

                if(newZoom == 2){
                    $("#zoom_area").css("left", "0px");
                    $("#zoom_area").css("top", "0px");
                }
                this.currentZoom = newZoom;
                this.player.control.zoomVideo(newZoom);
            },

            formattedDateNotYo: function (date) {
                var md = moment(new Date(date));
                return md.locale('ko').format("MM. DD dd");
            },
            formattedTime: function (date) {
                return moment(new Date(date)).format("HH:mm:ss");
            },

            goPrevEvent: function() {
            },
            goNextEvent: function() {
            },

            /****** EVENT Listener *******/
            onStopTimer: function() {
                if (this.playTimer) {
                    clearInterval(this.playTimer);
                }
            },
            onStartTimer: function(time) {
                if (this.isLive) {
                    this.startLiveTimer();
                } else {
                    this.startRecTimer(time ? time : this.clickedCvrTime);
                }
            },
            onGoLive: function() {
                store.dispatch('SET_IS_LIVE', true);
                this.timeline.camInfoBarChange();
                //$scope.cameraStatusAllOff();
                store.dispatch('SET_CURRENT_TIME', new Date());
                //changeTimeRangeClick = true;

                // $scope.lineMoveFlag = false;
                // $scope.liveLinFlag = true;
                //dragThumCancle = false;
                this.timeline.zoomDomain(Date.now(), this.timeline.timeRange);
                this.timeline.updateCursor();
                this.startLiveTimer();
                this.player.play();
            },
            onGoCvr: function() {
                this.timeline.clickedCVRArea(this.clickedCvrTime);
            },
            onPlayStatusChange: function(status) {
                switch(status) {
                    case 'NetStream.Play.Start':
                        setTimeout(() => {
                            this.player.zoomZone();
                            this.timeline.resizeTimeline();
                        },100);
                        break;
                    default:
                        break;
                }
            }
        },
        components : {
            event_bus_comp
        }
    }
</script>

<style lang="less">
    #play_container {
        /* Common */
        button{overflow:visible;border:0;background:transparent;cursor:pointer;line-height:0;vertical-align: inherit; outline:none;}
        button::-moz-focus-inner{padding:0;border:0}
        button span{position:relative}

        .unselectable {
            /* For Opera and <= IE9, we need to add unselectable="on" attribute onto each element */
            /* Check this site for more details: http://help.dottoro.com/lhwdpnva.php */
            -moz-user-select: none; /* These user-select properties are inheritable, used to prevent text selection */
            -webkit-user-select: none;
            -ms-user-select: none; /* From IE10 only */
            user-select: none; /* Not valid CSS yet, as of July 2012 */

            -webkit-user-drag: none; /* Prevents dragging of images/divs etc */
            user-drag: none;
        }

        input.no-border {
            background: none;
            border: none;
            outline: none;
            box-sizing: border-box;
        }

        /* override /camera/view top_menu */
        .selection_laver {
            z-index: 1000;
        }

        /* override /camera/view video_player */

        .dt_media .player {
            width: 862px;
            height: 485px;
            box-sizing: border-box;
            margin-bottom: 5px;
        }

        .m_location .zoom-thumb {
            width: 187px;
            height: 104px;
        }



        .action:hover {
            cursor: pointer;
        }

        .move:hover {
            cursor: move;
        }

        .hide {
            display: none;
        }

        .no-select {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        .player.fullscreen {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
        /* zoom bar */

        div.zoom_bar .zoom_bar_inactive {
            background: #bde2f9;
            height: 100%;
        }

        .dt_media .cvr-thumbs-container {
            width: 952px;
            height: 168px;
            top: 380px;
            background: rgba(0,0,0,0.7);
            position: absolute;
            z-index: 950;
        }

        .dt_media .cvr-thumbs-container .main-thumb {
            position: absolute;
            z-index: 1050;
            left: 50%;
        }
        .dt_media .cvr-thumbs-container .inner {
            position: relative;
        }

        .dt_media .cvr-thumbs-container .main-thumb .image {
            width: 160px;
            height: 90px;
            margin-top: 12px;
            border: 3px solid white;
            z-index: 1000;
            margin-left: -50%;
            background-color: gray;
        }
        .image.index0 {
            background-position: 800px 0;
        }
        .image.index1 {
            background-position: 640px 0;
        }
        .image.index2 {
            background-position: 480px 0;
        }
        .image.index3 {
            background-position: 320px 0;
        }
        .image.index4 {
            background-position: 160px 0;
        }
        .image.index5 {
            background-position: 800px 90px;
        }
        .image.index6 {
            background-position: 640px 90px;
        }
        .image.index7 {
            background-position: 380px 90px;
        }
        .image.index8 {
            background-position: 320px 90px;
        }
        .image.index9 {
            background-position: 160px 90px;
        }

        .dt_media .cvr-thumbs-container .thumbs-container {
            overflow: hidden;
            top: 27px;
            position: absolute;
            width: 952px;
        }

        .dt_media .cvr-thumbs-container .thumbs {
            width: 1360px;
            margin-left: -136px;
        }
        .dt_media .cvr-thumbs-container .thumbs .image {
            width: 136px;
            height: 68px;
            border: 1px solid white;
            float: left;
            background-color: gray;
        }

        /* .m_location, .media_zoom {
            z-index: 1000;
        }
         */

        .m_location .selected {
            position: absolute;
            top: 0;
            left: 0;
            cursor: move;
            z-index: 1100;
        }

        .timebar .control {
            position: absolute;
            outline: none;
            border: none;
        }

        .timebar .find_cursor {
            position: relative
        }

        .timebar .find_cursor span {
            font-family: Arial;
            font-size: 9px;
            color: #ff0000;
            top: 19px;
            position: absolute;
            text-align: center;
            width: 44px;
            letter-spacing: -1px;
        }

        .timebar .wrap_control_prev {
            position: absolute;
            top: 17px;
            left: 3%;
        }

        .timebar .prev {
            background: url(./resources/img/icon_timebar_left.png) no-repeat;
            left: 14px;
            width: 17px;
            height: 28px;
        }

        .timebar .find_cursor.left {
            width: 60px;
            height: 32px;
            background: url(./resources/img/bg_time_cursor_ptL.png);
            top: -2px;
            left: 19px;
        }

        .timebar .wrap_control_next {
            position: absolute;
            top: 17px;
            left: 108%;
        }

        .timebar .next {
            background: url(./resources/img/icon_timebar_right.png) no-repeat;
            left: -35px;
            width: 17px;
            height: 28px;
        }

        .timebar .find_cursor.right {
            width: 60px;
            height: 32px;
            background: url(./resources/img/bg_time_cursor_pt.png);
            top: -2px;
            left: -78px;
        }

        .timebar .thumbnail-container {

            background-image: url("./resources/img/bg_thum_view_line.png");
            position: absolute;
        }

        .timebar .thumbnail-container .image {
            width: 160px;
            height: 90px;
            margin-top: 7px;
            margin-left: 9px;
        }

        .timebar .thumbnail-container div.time {
            text-align: center;
            color: #666666;
            margin-top: 10px;
            font-size: 12px;
        }

        .timebar .timeline_description {
            position: absolute;
            left: 0px;
            top: 88px;
            width: 100%;
        }

        .timebar .timezone {
            font-size: 11px;
            color: #999999;
            float: left;
            margin-left: 12px;
        }

        .timebar .description {
            font-size: 11px;
            color: #999999;
            float: right;
        }

        .timebar .description div {
            display: inline-block;
            width: 25px;
            height: 10px;
            box-sizing: border-box;
        }

        .timebar .description .rec {
            background: #bde2f9;
            border: 1px solid #86aebc;
        }

        .timebar .description .motion {
            background: #2d92d3;
        }

        .timebar .description .audio {
            background: #18b57b;
        }

        .timebar .description li {
            display: inline-block;
            margin-right: 10px;
        }

        .wrap_pop_cm_st {
            top:0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1050;
        }

        .outer_pop_cm_st {
            position: absolute;
            left: 50%;
            top: 50%;
            margin-top: -238px;
            z-index: 1100;
        }

        .outer_pop_cm_st_noti {
            top: 150px;
        }

        .outer_pop_cm_st_pay_cloud {
            top: 250px;
        }

        .pop_cm_st {
            position: relative;
            left: -50%;
            z-index: 1150;
            top: -40px;
        }

        .pop_mc_st {
            position: relative;
            left: -50%;
            z-index: 1150;
        }

        /* override /sigup */

        .m_right_mem div.terms_mem textarea {
            resize: none;
        }

        #controlNdTimeLine {margin-top: -40px; position: relative;}

        /* Full Screen */
        :-webkit-full-screen { width: 100%; height:100%; padding: 0; }
        :-webkit-full-screen #player { width: 100%; height: 100%; border: none; position: relative;}
        :-webkit-full-screen #controlNdTimeLine { margin-top: -159px;}
        :-webkit-full-screen .nofullscreen { display: none; }
        :-webkit-full-screen .dt_media { width: 100%; height: 100%; padding: 0; }
        :-webkit-full-screen .media_control_outer{ top:100%; text-align:center !important; margin-top: -162px !important; }
        :-webkit-full-screen .media_control {}
        :-webkit-full-screen .media_control.no-cloud { top: -60px !important; display: inline-block;  }
        :-webkit-full-screen .dt_media .m_location { top: -215px !important; }
        :-webkit-full-screen .timebar_outer { position: absolute; left: 0; top: 100%; }
        :-webkit-full-screen .timebar { position: absolute; top: -90px; background: rgba(255, 255, 255, 0.8); }
        :-webkit-full-screen .timebar_area { margin-left: 0 !important; margin-right: 0 !important; }
        :-webkit-full-screen .timebar .wrap_control_prev { top: 44px; }
        :-webkit-full-screen .timebar .wrap_control_next { top: 44px; }
        :-webkit-full-screen .timebar .prev { left: 10px; }
        :-webkit-full-screen .timebar .next { left: -25px; }
        :-webkit-full-screen .timebar .find_cursor.left { margin-top:3px;}
        :-webkit-full-screen .timebar .find_cursor.right { margin-top:3px;}

        :-moz-full-screen { width: 100%; height: 100%; padding: 0; }
        :-moz-full-screen #player { width: 100%; height: 100%; border: none; position: relative;}
        :-moz-full-screen #controlNdTimeLine { margin-top: -159px;}
        :-moz-full-screen .nofullscreen { display: none; }
        :-moz-full-screen .dt_media { width: 100%; height: 100%; padding: 0; }
        :-moz-full-screen .media_control_outer{ top:100%; text-align:center !important; margin-top: -175px !important;}
        :-moz-full-screen .media_control {}
        :-moz-full-screen .media_control.no-cloud { top: -60px !important; display: inline-block;  }
        :-moz-full-screen .dt_media .m_location { top: -215px !important; }
        :-moz-full-screen .timebar_outer { position: absolute; left: 0; top: 100%; }
        :-moz-full-screen .timebar { position: absolute; top: -90px; background: rgba(255, 255, 255, 0.8); }
        :-moz-full-screen .timebar_area { margin-left: 0 !important; margin-right: 0 !important; }
        :-moz-full-screen .timebar .wrap_control_prev { top: 44px; }
        :-moz-full-screen .timebar .wrap_control_next { top: 44px; }
        :-moz-full-screen .timebar .prev { left: 10px; background: url(./resources/img/icon_fs_timebar_left.png) no-repeat; }
        :-moz-full-screen .timebar .next { left: -25px; background: url(./resources/img/icon_fs_timebar_right.png) no-repeat; }
        :-moz-full-screen .timebar .find_cursor.left { background: url(./resources/img/bg_fs_time_cursor_ptL.png); width:60px; }
        :-moz-full-screen .timebar .find_cursor.right { background: url(./resources/img/bg_fs_time_cursor_ptR.png);  width:60px;}

        :-ms-fullscreen { width: 100% !important; height: 100%; padding: 0; }
        :-ms-fullscreen #player { width: 100%; height: 100%; border: none; position: relative;}
        :-ms-fullscreen #controlNdTimeLine { margin-top: -159px;}
        :-ms-fullscreen .nofullscreen { display: none; }
        :-ms-fullscreen .dt_media { width: 100%; height: 100%; padding: 0; }
        :-ms-fullscreen .media_control_outer{ }
        :-ms-fullscreen .media_control { top: -155px !important; display: inline-block;  }
        :-ms-fullscreen .media_control.no-cloud { top: -60px !important; display: inline-block;  }
        :-ms-fullscreen .dt_media .m_location { top: -212px !important; }
        :-ms-fullscreen .timebar_outer { position: absolute; left: 0; top: 100%; }
        :-ms-fullscreen .timebar { position: absolute; top: -90px; background: rgba(0, 0, 0, 0.5); }
        :-ms-fullscreen .timebar_area { margin-left: 0 !important; margin-right: 0 !important; }
        :-ms-fullscreen .timebar .wrap_control_prev { top: 44px; }
        :-ms-fullscreen .timebar .wrap_control_next { top: 44px; }
        :-ms-fullscreen .timebar .prev { left: 10px; background: url(./resources/img/icon_fs_timebar_left.png) no-repeat; }
        :-ms-fullscreen .timebar .next { left: -25px; background: url(./resources/img/icon_fs_timebar_right.png) no-repeat; }
        :-ms-fullscreen .timebar .find_cursor.left { background: url(./resources/img/bg_fs_time_cursor_ptL.png);  width:60px;}
        :-ms-fullscreen .timebar .find_cursor.right { background: url(./resources/img/bg_fs_time_cursor_ptR.png);  }

        /* event list */

        .event_list li.event_list_tit_s_bg div.event_list_dt_line div.color_point { padding:4px; margin-left:11px; margin-top:20px; }
        .event_col_sel div.color_pix_sel div.color_pix { float:left; margin-right:5px; border:1px solid #aaa;}
        .event_list_dt_media .image {
            display: inline-block;
            width: 109px;
            height: 59px;
            background-size: 550px 120px;
        }

        /* zone */
        .zone_edit {
            display: none;
        }
        .zone_list:hover .zone_edit {
            display: block;
        }
        .zone_list svg {
            vertical-align: middle;
            margin-right: 1px;
        }

        /* Clip */
        .pop_mc_mv_st {
            position: relative;
            left: -50%;
            z-index: 1150;
        }

        .clip_edit {
            display: none;
        }

        .make_list:hover .clip_edit {
            display: block;
        }

        .clip-player {
            width: 536px;
            height: 352px;
            border-top:2px solid #1d1d1d;
            border-left:2px solid #1d1d1d;
            border-right:2px solid #1d1d1d;
            border-bottom:1px solid #1d1d1d;
            margin-bottom:-4px;
        }

        .clip_calendar {
            float: right;
            margin-right: 15px;
        }

        .clip_date_input {
            float: left;
            margin-left: 15px;
            width: 100px;
        }

        /* Modal Dialog */

        .modal_dialog {
            top:0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            position: fixed;
            z-index: 1050;
        }

        .modal_dialog .dialog_outer {
            position: absolute;
            top: 30%;
            left: 50%;
        }

        .modal_dialog .pop_mc_st {
            position: relative;
            top: -50%;
            left: -50%;
        }

        /* full sreen mode timeline toggle area */
        .camdtl_view .player_area .toggle_area{position:absolute;top:0;left:0;right:0;bottom:0;}

        /* full screen mode timebar toggle animation */
        .cam_info.toggle_on {
            -webkit-transition: top 0.5s ease;
            transition: top 0.5s ease;
            top : 1px;
        }

        /* full screen mode timebar toggle animation */
        .cam_info.toggle_off {
            -webkit-transition: top 0.5s ease;
            transition: top 0.5s ease;
            top : -47px;
        }

        /* full screen mode timeline toggle animation */
        #controlNdTimeLine.toggle_on {
            -webkit-transition: margin-top 0.5s ease;
            transition: margin-top 0.5s ease;
            margin-top : -142px;
        }

        /* full screen mode timelinie toggle animation */
        #controlNdTimeLine.toggle_off {
            -webkit-transition: margin-top 0.5s ease;
            transition: margin-top 0.5s ease;
            margin-top : 0px;
        }

        #controlNdTimeLine.toggle_on2 {
            -webkit-transition: margin-top 0.5s ease;
            transition: margin-top 0.5s ease;
            margin-top : -155px;
        }

        /* full screen mode timelinie toggle animation */
        #controlNdTimeLine.toggle_off2 {
            -webkit-transition: margin-top 0.5s ease;
            transition: margin-top 0.5s ease;
            margin-top : 0px;
        }
        .gallery_on {
            -webkit-transition: margin-right 0.5s ease;
            transition: margin-right 0.5s ease;
            margin-right: 0px;
        }

        .gallery_off {
            -webkit-transition: margin-right 0.5s ease;
            transition: margin-right 0.5s ease;
            margin-right : -152px;
        }

        @media only screen and (max-width:1280px) {
            .buy_cam_btn {
                right: 55px;
                top: 16px;
            }
        }

        .clip_fade {
            opacity: 0;
        }

        .clip_fade-add-active {
            -webkit-animation: 1.5s opacity-bright-animation;
            animation: 1.5s opacity-bright-animation;
        }

        @keyframes opacity-bright-animation {
            from { opacity:1; }
            to { opacity:0; }
        }

        /* images */
        .sp,.sns_area a,.video_area.add:after,.btn .ic:before,.btn_w .ic:before,.evt_lst_wrap .evt_lst li button:after,.filter_bx.bd .chk input:checked+label,.filter_bx:first-child .chk input:checked+label:before,.ck_bx label:before,.ck_bx2 label:before,.rdo label:before,.rdo2 label:before,.zone,.time_info:after,.inp_box.calendar button,.inp_box.clock button,.evt_lst_wrap.v2 .open .set_modi .zone:after,.evt_lst_wrap.v2 .open .chk input:checked+label,.s_tit_area li:before {display:inline-block;overflow:hidden;background:url(./resources/img/sp.png) no-repeat;line-height:999px;vertical-align:top;}

        .camdtl_wrap{position:relative;margin:12px 0 70px;padding-right:282px}
        .camdtl_view .player_area{position:relative;height:100%;padding-top:56%;font-size:0;vertical-align:top;z-index:0}
        .camdtl_view .player_area .player_cam{position:absolute;top:0;left:0;right:0;bottom:178px;background:#222; content:''; width: 100%;  overflow: hidden;}
        .camdtl_view .player_area .player_cam_back{position:absolute;top:0;left:0;right:0;bottom:178px;background:#222;}
        .camdtl_view .player_area .player_cam_full{position:absolute;top:0;left:0;right:0;bottom:0px;background:#222; border:0; content:''}
        .camdtl_view .player_area .player_cam.off+.camoff{display:block}
        .camdtl_view .player_area .player_cam.none+.movieoff{display:block}
        .camdtl_view .player_area .player_cam.net+.network{display:block}
        .camdtl_view .player_area embed{display:block;height:100%; position: absolute; width: 100.05%;}
        @media screen and (min-width:0\0){
            .camdtl_view .player_area embed{display:block;height:100%; position: relative; width: 100%;}
        }
        .camdtl_view .monitor_detail_view .player_cam_full{position:absolute;top:0;left:0;right:0;bottom:0px;background:#222; border:0; content:''}
        .camdtl_view .monitor_detail_view .player_cam.off+.camoff{display:block}
        .camdtl_view .monitor_detail_view .player_cam.none+.movieoff{display:block}
        .camdtl_view .monitor_detail_view .player_cam.net+.network{display:block}

        .camdtl_view .cam_zoom{position:absolute;bottom:70px;right:20px}
        .camdtl_view .cam_zoom .zoom_area{position:relative;width:160px;height:90px;background:#000}
        .camdtl_view .cam_zoom .btn_clse{position:absolute;right:0;top:0;padding:5px}
        .camdtl_view .cam_zoom .btn_clse .sp{width:8px;height:8px;background-position:-539px -48px}
        .camdtl_view .cam_ctrl{position:relative;left:0;bottom:0;right:0;top:0px;height:50px;/*background:rgba(0,0,0,.7);*/text-align:center;z-index:500}
        .n_area{position:absolute;top:48%;left:50%;z-index:1;width: 100%;text-align:center;transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%)}
        .n_area p{font-size:36px;color:#fff;font-weight: 300; line-height: 72px;}
        .n_area p .sp{width:60px;height:60px;background-position:-374px -337px}
        .n_area .txt{font-size:16px;color:#fff;line-height:1.7}
        .n_area .btn{width:160px;height:40px;margin-top:13px;background:#4a95eb;font-size:14px;color:#fff;line-height:40px; border-radius: 20px;}
        .n_area .btn:lang(ja){width: 180px;}
        .n_area .btn:hover{background:#448ede;}
        .n_area .btn img{vertical-align: middle; margin-right: 10px;}
        .off_area{display:inline-block;padding-top:30px}
        .off_area li{display:inline-block;;position:relative;padding:0 45px;}
        .off_area li:after{position:absolute;top:50%;left:0;width:1px;height:75px;margin-top:-35px;background:#444;vertical-align:middle;content:''}
        .off_area li:first-child:after{background:none}
        .network p .sp{width:60px;height:60px;background-position:-437px -337px}
        .network p .s_tx{display:block;margin-top:-7px;font-size:16px}
        .cam_ctrl button.sp{width:34px;height:34px;vertical-align:middle}
        .cam_info{position:absolute;left:0;bottom:0;right:0;top:0px;height:36px;z-index:0; margin: 0 auto; padding: 0px;}
        .cam_info .cam_info_bg{position: relative; left: 50%; margin-left: -103px; width: 206px; background: rgba(0,0,0,.7); text-align:center;}
        .cam_info .cam_info_bg:lang(ja){width: 202px;}
        .cam_info .cam_info_bg_en{position: relative; left: 50%; margin-left: -109px; width: 218px; background: rgba(0,0,0,.7); text-align:center;}
        .cam_info .time_area{font-size:18px;line-height:36px; font-weight: normal; padding-right: 4px;}
        .cam_info .time_area .date{margin-right:6px;color:#fff; font-size: 15px;}
        .cam_info .time_area .date:lang(ja){font-size: 13px; margin-left: -4px;}
        .cam_info .time_area .time{padding:4px 9px; background:#e60012;color:#fff; font-size: 16px; position: relative;}
        .cam_info .time_area .time:lang(ja){font-size: 14px;}
        .cam_info .time_area .golive{display:inline-block; vertical-align:middle; margin-left: 1px; margin-top: -1px; padding:0px;}
        .cam_info .time_area .golive span{font-size:14px;color:#fff; border: 1px solid #fff; padding:4px 8px 5px;}
        .cam_info .time_area .golive span:lang(ja){font-size: 12px;}
        .cam_info .time_area .golive_disabled{display:inline-block; vertical-align:middle; margin-left: 1px; opacity: 0.3;}
        .cam_info .time_area .golive_disabled span{font-size:14px;color:#fff; border: 1px solid #999; padding:4px 8px 5px;}
        .cam_info .time_area .golive_disabled span:lang(ja){font-size: 12px;}
        .cam_info .time_area .sp{margin-right:8px;}

        .cam_info button.sp{width:36px;height:36px;vertical-align:middle}
        .cam_info .time_area .state{margin-right:10px}
        .cam_info .time_area .state.live{color:#e60012; font-weight: 400;}
        .cam_info .time_area .state.rec{color:#4a95eb}
        .cam_info .time_area .state:before{display:inline-block;width:16px;height:16px;margin:-2px 5px 0 0;border-radius:100%;vertical-align:middle;content:''}
        .cam_info .time_area .state.live:before{background:#e60012}
        .cam_info .time_area .state.rec:before{background:#4a95eb}
        .cam_info .time_area .sp.play{background-position:-246px -706px;}
        .cam_info .time_area .sp.play:active{background-position:-300px -706px;}
        .cam_info .time_area .sp.pause{background-position:-353px -706px;}
        .cam_info .time_area .sp.pause:active{background-position:-407px -706px;}
        .cam_info .time_area .sp.play_disabled{background-position:-246px -706px; opacity:0.3;}
        .cam_info .time_area .sp.pause_disabled{background-position:-353px -706px; opacity:0.3;}
        :root .cam_info .time_area .sp.play{margin-left: -2px;}
        :root .cam_info .time_area .sp.play:active{margin-left: -2px;}
        :root .cam_info .time_area .sp.pause{margin-left: -2px;}
        :root .cam_info .time_area .sp.pause:active{margin-left: -2px;}
        :root .cam_info .time_area .sp.play_disabled{margin-left: -2px;}
        :root .cam_info .time_area .sp.pause_disabled{margin-left: -2px;}

        .cam_ctrl .zoom{position:absolute;left:19px;top:0px;padding:0 38px;line-height:34px; background: rgba(0,0,0,.8); border-radius: 20px; z-index: 10;}
        .cam_ctrl .zoom .sp{position:absolute;}
        .cam_ctrl .zoom .zoomout{left:0;background-position:-182px -626px}
        .cam_ctrl .zoom .zoomin{right:0;background-position:-184px -664px}
        .cam_ctrl .zoom .zoom_bg,.cam_ctrl .zoom .bar{display:inline-block;width:60px;height:2px;background:#666;font-size:0;line-height:0;text-align:left}
        .cam_ctrl .zoom .zoom_bg{background:#666}
        .cam_ctrl .zoom .bar{position:relative;background:#fff;vertical-align:top}
        .cam_ctrl .zoom .bar_ctrl{position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:100%;background:#fff}
        .cam_ctrl .fs_time{position:absolute;top:0px;right:240px;padding:5px 18px 0;height:29px;line-height:29px;background: rgba(0,0,0,.8);border-radius: 2px;width: 149px;}
        .cam_ctrl .fs_time button{position: relative; font-size: 14px; color: #fff; line-height: 26px; margin-right: 25px; margin-top: -1px;}
        .cam_ctrl .fs_time button:lang(ja) {margin-right:18px;}
        .cam_ctrl .fs_time button.last{position: relative; font-size: 14px; color: #fff; line-height: 26px; margin-right: 0px; margin-left: 22px;}
        .cam_ctrl .fs_time button span.on{color: #4b96e6;}
        .cam_ctrl .fs_time button .calendar{background:url(./resources/img/sp.png) no-repeat; width: 16px; height: 18px; background-position:-227px -438px; position: absolute; top:1px; left: -22px;}
        .cam_ctrl .menu{position:absolute;top:-8px;right:19px;text-align:right;line-height:50px}
        .cam_ctrl .menu .sp{margin-left:10px}
        .cam_ctrl .menu .sp.mic_off{background-position:-20px -664px}
        .cam_ctrl .menu .sp.mic_on{background-position:-20px -626px}
        .cam_ctrl .menu .sp.mic_off_non{background-position:-100px -702px}
        .cam_ctrl .menu .sp.mic_on_non{background-position:-100px -778px}
        .cam_ctrl .menu .sp.acc_off{background-position:-20px -740px}
        .cam_ctrl .menu .sp.acc_on{background-position:-20px -702px}
        .cam_ctrl .menu .sp.acc_off_non{background-position:-100px -740px}
        .cam_ctrl .menu .sp.acc_on_non{background-position:-140px -778px}
        .cam_ctrl .menu .sp.camera_off{background-position:-60px -740px}
        .cam_ctrl .menu .sp.camera_on{background-position:-60px -702px}
        .cam_ctrl .menu .sp.camera_off_non{background-position:-140px -702px}
        .cam_ctrl .menu .sp.camera_on_non{background-position:-100px -778px}
        .cam_ctrl .menu .sp.vol_on{background-position:-60px -626px}
        .cam_ctrl .menu .sp.vol_off{background-position:-60px -664px}
        .cam_ctrl .menu .sp.scrnshot{background-position:-100px -626px}
        .cam_ctrl .menu .sp.full{background-position:-140px -626px}
        .cam_ctrl .menu .sp.small{background-position:-140px -664px}
        .cam_ctrl .menu .sp.vol_on_non{background-position:-140px -587px}
        .cam_ctrl .menu .sp.vol_off_non{background-position:-100px -664px}
        .cam_ctrl .menu .sp_flashing{margin-left:10px; vertical-align: middle;}
        .cam_ctrl .event_move{position: absolute; left: 250px; line-height: 44px; margin-top: 1px; margin-left: -80px; background: rgba(0,0,0,.8); border-radius: 22px;}
        .cam_ctrl .event_move .event_move_box{width: 160px; height: 34px; border-radius: 22px;}
        .cam_ctrl .event_move .event_move_box li{float: left; display: block; height: 34px;}
        .cam_ctrl .event_move .event_move_box li.ar_L{width: 32px; height: 34px; cursor: pointer;}
        .cam_ctrl .event_move .event_move_box li.ar_L:active{background: #333;}
        .cam_ctrl .event_move .event_move_box li.ar_L button{background:url(./resources/img/sp.png) no-repeat; width: 7px; height: 17px; background-position:0px -494px; margin-left: 3px; margin-top: 9px;}
        .cam_ctrl .event_move .event_move_box li.ar_R{width: 32px; height: 34px; cursor: pointer;}
        .cam_ctrl .event_move .event_move_box li.ar_R:active{background: #333;}
        .cam_ctrl .event_move .event_move_box li.ar_R button{background:url(./resources/img/sp.png) no-repeat; width: 7px; height: 17px; background-position:-11px -494px; margin-left: 0px; margin-top: 9px;}
        .cam_ctrl .event_move .event_move_box li.txt{font-size: 14px; color: #fff; line-height: 34px; text-align: center; width: 94px; position: relative; background: rgba(0,0,0,.7);}

        .timeline_ctrl{height:40px;padding:0 10px; border-bottom: 1px solid #f4f4f4; background: #fff; overflow: hidden;}
        .timeline_ctrl_pos{height: 46px; }
        .timeline_ctrl .time_unit{float:right; margin-right: -5px;}
        .timeline_ctrl .time_unit li{float:left;line-height:40px;}
        .timeline_ctrl .time_unit li.pos_h{line-height:46px;}
        .timeline_ctrl .time_unit li button{height:39px;padding:0 7px;font-size:14px;color:#555}
        .timeline_ctrl .time_unit li button:lang(ja){font-size: 13px;}
        .timeline_ctrl .time_unit li button.pos{padding: 0 15px; color: #777;}
        .timeline_ctrl .time_unit li.on button{color:#5cacff}
        .timeline_ctrl .time_unit li.calendar{width: 92px; line-height: 16px;}
        .timeline_ctrl .time_unit li.calendar button{display:inline-block; background:url(./resources/img/sp.png) no-repeat; width: 16px; height: 18px; background-position:-196px -411px; margin-top: 10px; margin-left: 10px;}
        .timeline_ctrl .time_unit li.calendar button span{position: absolute; margin-top: 1px; margin-left: 10px;}
        .timeline_ctrl .time_unit li.calendar button.on{display:inline-block; background:url(./resources/img/sp.png) no-repeat; width: 16px; height: 18px; background-position:-226px -411px; margin-top: 10px; margin-left: 10px;}
        .timeline_ctrl .time_unit li.calendar button.on span{position: absolute; margin-top: 1px; margin-left: 10px; color: #4b96e6;}
        .timeline_ctrl .time_btn{float:left;line-height:39px;margin-left: -2px;}
        .timeline_ctrl .time_btn .btn{display:inline-block;height:39px;padding:0 9px;color:#7c7c7c;line-height:39px; background: none;}
        .timeline_ctrl .time_btn .btn:lang(ja){letter-spacing: -1px; padding: 0 4px; font-size: 11px;}
        .timeline_ctrl .time_btn .btn .ic:before{height:18px;margin-right:8px;vertical-align:middle;content:''}
        .timeline_ctrl .time_btn .btn.clip .ic:before{width:18px;background-position:-235px -386px}
        .timeline_ctrl .time_btn .btn.clip_plus .ic:before{width:18px;background-position:-460px -420px}
        .timeline_ctrl .time_btn .btn.lapse .ic:before{width:16px;background-position:-14px -386px}
        .timeline_ctrl .time_btn .btn.cliplapse .ic:before{width:14px;background-position:-32px -386px}
        .timeline_ctrl .time_btn .btn.security .ic:before{width:13px;background-position:-212px -380px}
        .timeline_ctrl .time_btn .btn.security_open .ic:before{width:16px;background-position:-331px -394px}
        .timeline_ctrl .time_btn .btn.clip_plus .ic:before{width:18px;background-position:-460px -420px}
        .timeline_ctrl .time_btn span.on{color: #4b96e6;}
        .timeline_ctrl .event_move{position: absolute; left: 50%; line-height: 44px; margin-top: 6px; margin-left: -75px; border: 1px solid #ddd; border-radius: 22px;}
        .timeline_ctrl .event_move .event_move_box{width: 140px; height: 27px; background: #fff; border-radius: 22px;}
        .timeline_ctrl .event_move .event_move_box li{float: left; display: block; height: 27px;}
        .timeline_ctrl .event_move .event_move_box li.ar_L{width: 22px; height: 27px; cursor: pointer;}
        .timeline_ctrl .event_move .event_move_box li.ar_L:active{background: #ddd}
        .timeline_ctrl .event_move .event_move_box li.ar_L button{background:url(./resources/img/sp.png) no-repeat; width: 7px; height: 16px; background-position:0px -512px; margin-left: 8px; vertical-align: top; margin-top: 6px;}
        .timeline_ctrl .event_move .event_move_box li.ar_R{width: 22px; height: 27px; cursor: pointer;}
        .timeline_ctrl .event_move .event_move_box li.ar_R:active{background: #ddd}
        .timeline_ctrl .event_move .event_move_box li.ar_R button{background:url(./resources/img/sp.png) no-repeat; width: 7px; height: 16px; background-position:-11px -512px; margin-left: 7px; vertical-align: top; margin-top: 6px;}
        .timeline_ctrl .event_move .event_move_box li.txt{font-size: 13px; color: #666; line-height: 27px; text-align: center; width: 95px; background: #f8f8f8;}
        .timeline_ctrl .event_move:lang(ja){margin-left: -64px;}
        .timeline_ctrl .event_move .event_move_box:lang(ja){width: 130px;}
        .timeline_ctrl .event_move .event_move_box li.txt:lang(ja){width: 85px; font-size: 12px;}

        .calendar_select{position: absolute; right: 4px; width: 140px; height: 125px; border: 1px solid #d5d5d5; background: #fff; margin-top: -10px; z-index: 9800; padding:10px;}
        .calendar_select_full{right: 214px; margin-top: -160px;}
        .calendar_select button.btn_close{overflow:hidden;position:absolute;top:13px;right:9px;width:12px;height:12px;background-position:-535px -289px;line-height:999px}
        .calendar_select .calendar_ar{position: absolute; bottom:-12px; left:76px;  display:inline-block; background:url(./resources/img/sp.png) no-repeat; width: 18px; height: 12px; background-position:-529px -204px; }
        .calendar_select h3{font-size: 14px; color: #4b96e6; padding-bottom: 5px; font-weight: 400;}
        .calendar_select h3:lang(ja){padding-bottom: 0;}
        .calendar_select li{margin-top: 7px;}
        .calendar_select li input{font-size: 12px; color: #333333;}
        .calendar_select li button{margin: 0 2px;}
        .calendar_select li.cal_s_btn{text-align: center;}
        .calendar_select li.cal_s_btn button.btn_on{background: #4b96e6; width: 140px; text-align: center; line-height: 28px; color: #fff; border-radius: 2px; margin: 0px;}
        /*.calendar_select li.cal_s_btn button.btn_off{background: #777; width: 65px; text-align: center; line-height: 24px; color: #fff; border-radius: 2px; margin-left: 2px;}*/
        .calendar_open_area{position: absolute; right: 245px;}
        .calendar_open_area .pika-button{margin: 0;}
        .calendar_open_area .pika-single .pika-lendar .pika-title button.btn_close{top: 10px;}
        .calendar_pos_select{position: absolute; right: 4px; width: 140px; height: 125px; border: 1px solid #d5d5d5; background: #fff; margin-top: 5px; z-index: 9800; padding:10px;}
        .calendar_pos_select_full{right: 50px; margin-top: -160px;}
        .calendar_pos_select_pos{margin-top: 5px;}
        .calendar_pos_select_pos_full{right: 50px; margin-top: -160px;}
        .calendar_pos_select button.btn_close{overflow:hidden;position:absolute;top:13px;right:9px;width:12px;height:12px;background-position:-535px -289px;line-height:999px}
        .calendar_pos_select .calendar_ar{position: absolute; bottom:-12px; left:76px;  display:inline-block; background:url(./resources/img/sp.png) no-repeat; width: 18px; height: 12px; background-position:-529px -204px; }
        .calendar_pos_select h3{font-size: 14px; color: #4b96e6; padding-bottom: 5px; font-weight: 400;}
        .calendar_pos_select li{margin-top: 7px;}
        .calendar_pos_select li input{font-size: 12px; color: #333333;}
        .calendar_pos_select li button{margin: 0 2px;}
        .calendar_pos_select li.cal_s_btn{text-align: center;}
        .calendar_pos_select li.cal_s_btn button.btn_on{background: #4b96e6; width: 140px; text-align: center; line-height: 28px; color: #fff; border-radius: 2px; margin: 0px;}

        .timeline_guide{position: absolute; left: 50%; margin-left: -75px; color: black; z-index: 1500; margin-top:1px;}
        .timeline_area{border-bottom:1px solid #f4f4f4;}
        .timeline_date{border-bottom:0;}
        .timeline_area{position:relative;height:92px;padding:0px 74px 0;background:#fff;}
        .timeline_area_pos{height: 106px;}
        .timeline_area_full{background:rgba(0,0,0,.7); z-index: 500; height: 106px;}
        .timeline_area .time_bar{position:relative;height:90px;cursor:pointer;left:-72px;}
        .timeline_area .time_bar:hover .time_info{display:block;z-index:999;}
        .timeline_area .time_info{display:none;border:1px solid #bbb;background:#FFFFFF;text-align:center;}
        /*.timeline_area .time_info:after{position:absolute;bottom:-12px;left:50%;width:18px;height:12px;margin-left:-9px;background-position:-529px -204px;content:''}*/
        .timeline_area .time_info_tri{position:absolute;bottom:62px;width:18px;height:12px;background:url(./resources/img/thum_arrow.png) no-repeat;background-position:0px 0px;content:'';border:0px;}
        .timeline_area .time_detail{position:relative;width:100%;height:90px;margin-bottom:11px;background:#000}
        .timeline_area .time_detail:after{position:absolute;top:0;left:0;right:0;bottom:0;border:1px solid rgba(0,0,0,.5);content:''}
        .timeline_area .sp{position:absolute;top:36px;width:18px;height:28px}
        /*.timeline_area .sp{position:absolute;top:25px;width:33px;height:32px}*/
        .timeline_area .sp.prev{left:14px;background-position:-143px -410px;margin-top: -13px;}
        .timeline_area .sp.next{right:7px;background-position:-165px -410px;margin-top: -13px;}
        .timeline_area .sp_cursor{position:absolute;top:31px;width:48px;height:32px}
        /*.timeline_area .sp_cursor{position:absolute;top:15px;width:54px;height:32px}*/
        .timeline_area .sp_cursor.prev{left:30px;background:url(./resources/img/bg_time_cursor_ptL.png) no-repeat; margin-top: -8px;}
        .timeline_area .sp_cursor.next{right:-7px;background:url(./resources/img/bg_time_cursor_pt.png) no-repeat; margin-top: -8px;}
        .timeline_area .time_idx{font-size:13px;color:#7c7c7c;text-align:center}
        .timeline_area .time_idx dl,.timeline_area .time_idx dd{display:inline-block}
        .timeline_area .time_idx dd{margin-left:25px}
        .timeline_area .time_idx dt+dd{margin-left:20px}
        .timeline_area .time_idx dd:after{display:inline-block;width:12px;height:12px;margin:-2px 0 0 4px;border-radius:100%;background:#97caff;vertical-align:middle;content:''}
        .timeline_area .time_idx dd+dd:after{background:#7d66ff}
        .timeline_area .zone_info{position: absolute; width: 100%; right: 10px; height: 12px;}
        .timeline_area .zone_info .zone_sound{position: relative; height: 12px; float: right; font-size: 11px; color: #777;}
        .timeline_area .zone_info .zone_sound label{float: left; width: 12px; height: 12px; border-radius: 2px; margin-right: 3px;}
        .timeline_area .zone_info .zone_sound label.zone_sd{background-color: #18b57b;}
        .timeline_area .zone_info .zone_event{position: relative; height: 12px; float: right; font-size: 11px; color: #777; margin-right: 20px;}
        .timeline_area .zone_info .zone_event label{float: left; width: 12px; height: 12px; border-radius: 2px; margin-right: 3px;}
        .timeline_area .zone_info .zone_event label.zone01{background-color:#ff7900}
        .timeline_area .zone_info .zone_event label.zone02{background-color:#3ea1d4}
        .timeline_area .zone_info .zone_event label.zone03{background-color:#a4c800}
        .timeline_area .zone_info .zone_event label.zone04{background-color:#efd600}
        .timeline_area .zone_info .zone_event label.zone05{background-color:#767dff}
        .timeline_area .zone_info .zone_event label.zone06{background-color:#ca7af0}
        .timeline_area .zone_info .zone_event label.zone07{background-color:#ff76bd}
        .timeline_area .zone_info .zone_event label.zone08{background-color:#929292}
        .timeline_area .zone_info .zone_pos_area{position: relative; height: 12px; float: right; font-size: 11px; color: #777;}
        .timeline_area .zone_info .zone_pos_area label{float: left; width: 12px; height: 12px; border-radius: 6px; margin-right: 3px;}
        .timeline_area .zone_info .zone_cn_area{position: relative; height: 12px; float: right; font-size: 11px; color: #777; margin-right: 10px;}
        .timeline_area .zone_info .zone_cn_area label{float: left; width: 12px; height: 12px; border-radius: 6px; margin-right: 3px;}
        .timeline_area .zone_info .zone_pay_area{position: relative; height: 12px; float: right; font-size: 11px; color: #777; margin-right: 10px;}
        .timeline_area .zone_info .zone_pay_area label{float: left; width: 12px; height: 12px; border-radius: 6px; margin-right: 3px;}
        .timeline_area .zone_info .zone_pos_area label.zone_pos{background-color: #8ca828;}
        .timeline_area .zone_info .zone_pay_area label.zone_pay{background-color: #3ea1d4;}
        .timeline_area .zone_info .zone_cn_area label.zone_cn{background-color: #e94c58;}

        .camdtl_view .cam_name_area{position: relative; z-index: 105; margin-bottom: -20px; }
        .cam_name{text-align: center; position: relative; top: 20px;}
        .cam_name span{background: rgba(0,0,0,.7); color: #fff; font-size: 16px; padding: 7px 15px;}

        .timeline_date{background:#fcfcfc;text-align:center; line-height: 44px; height: 44px;}
        .timeline_date ul,.timeline_date li{display:inline-block; position: relative; top: 2px;}
        .timeline_date li button{height:24px;padding:0 7px;font-size:13px}
        .timeline_date li.on button{border-radius:12px;background:#4b96e6;color:#fff}

        .cloud_free{position: absolute; margin-top: -35px; right: 7px;}
        .cloud_free .tet_L{padding: 5px 9px; background:#4a95e6; line-height: 19px; text-align:center; color: #b8daff; font-size: 12px; border-radius: 2px 0 0 2px; }
        .cloud_free button{width: 50px; font-size: 12px; line-height: 24px; text-align: center; background: #3782d3; color: #fff; border-radius: 0 2px 2px 0;}

        .camdtl_tab{position:absolute;top:0;right:0;bottom:0;width:270px;}
        .camdtl_tab .tab_cam li{float:left;width:50%}
        .camdtl_tab .tab_cam li button{width:100%;height:50px;background:#c8c8c8;font-size:14px;color:#fff;}
        .camdtl_tab .tab_cam li.on button{background:#4b96e6; color:#fff;}
    }
</style>