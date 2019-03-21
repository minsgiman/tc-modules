<template>
    <div id="timeline_table">
        <!--div id="timelinedesc" class="timeline_guide" v-if="!cloud_out">
            <img src="/resources/img/icon_timeline_drag.png">
        </div-->
        <div class="timeline_area" :class="{timeline_area_full: isFullScreen}" id="view_timeline_area">
            <div class="time_bar" id="view_time_bar">
                <div class="timebar_outer toggle">
                    <div class="timebar">
                        <div class="thumbnail-container time_info"
                             id="showThumbnailListNew"
                             style="left: 0px; top: 0px; z-index: 800;">
                            <div id="thumnail_prev" style="float: left; font-size: 10px; display: none; position: absolute; z-index: 1;">
                                <button type="button" id="thumnail_prev_btn" @click="showThum(-1)" style="background: url(./resources/img/icon_fs_timebar_left_N.png) no-repeat; width: 20px; height: 20px; margin-top: 44px; margin-left: 8px;"></button>
                            </div>
                            <div id="thumbnailList"></div>
                            <div id="thumnail_next" style="float: right; font-size: 10px; display: none; position: absolute; left: 573px;">
                                <button type="button" id="thumnail_next_btn" @click="showThum(1)" style="background: url(./resources/img/icon_fs_timebar_right_N.png) no-repeat; width: 20px; height: 20px; display: none; margin-top: 44px; margin-left: -4px;"></button>
                            </div>
                        </div>
                        <div class="thumbnail-container time_info time_info_tri" id="time_info_tri" style="display: none;"></div>
                        <div class="timebar_area" id="timebar_area" style="z-index: 1000; position: relative;"></div>
                    </div>
                </div>
            </div>
            <button type="button" id="prevLineBtn" class="sp prev" @click="prevLine()" style="z-index: 1002;">PREVIOUS</button>
            <button type="button" id="cursorLeftBtn" class="sp_cursor prev" v-show="isCursorLeft" @click="pressedFindCursorButton('click')" style="z-index: 1000;"></button>
            <button type="button" id="nextLineBtn" class="sp next" @click="nextLine()" style="z-index: 1002;">NEXT</button>
            <button type="button" id="cursorRightBtn" class="sp_cursor next" v-show="isCursorRight" @click="pressedFindCursorButton()" style="z-index: 1000;"></button>
        </div>
        <div class="timeline_ctrl" id="view_timeline_ctrl">
            <ul class="time_unit" id="time_units">
                <li :class="{on: timeRange === 10}">
                    <button type="button" @click="changeTimeRange(10)">
                        <span>10분</span>
                    </button></li>
                <li :class="{on: timeRange === 60}">
                    <button type="button" @click="changeTimeRange(60)">
                        <span>1시간</span>
                    </button></li>
                <li :class="{on: timeRange === 360}">
                    <button type="button" @click="changeTimeRange(360)">
                        <span>6시간</span>
                    </button></li>
                <li :class="{on: timeRange === 1440}">
                    <button type="button" @click="changeTimeRange(1440)">
                        <span>24시간</span>
                    </button>
                </li>
                <li class="calendar">
                    <button type="button" :class="{on: isShowTimelineCalendar}" @click="pressedShowTimelineCalendarButton()">
                        <span>날짜/시간</span>
                    </button>
                </li>
            </ul>
            <!--div class="time_btn" v-if="currentCamera.recorderType !== 'nvr'">
                <button type="button" class="btn" :class="{security: config.secureMode == 'on', security_open: config.secureMode == 'off'}" v-show="!isShared" @click="pressedShowSecureModeButton();">
                    <span class="ic" :class="{on: config.secureMode == 'on'}">CAMERA_RECORD_PASSWORD</span>
                </button>
                <button type="button" class="btn" :class="{security: config.secureMode == 'on', security_open: config.secureMode == 'off'}" v-show="isShared" @click="showCVRSecureModeInfoLayer();">
                    <span class="ic" :class="{on: config.secureMode == 'on'}">CAMERA_RECORD_PASSWORD</span>
                </button>
                <button type="button" v-if="currentCamera.recorderType !== 'recorder' && currentCamera.hasClipPermission" class="btn clip_plus" @click="pressedShowTimelapseButton()">
                    <span class="ic">CAMERA_CLIP_MAKE</span>
                </button>
            </div-->
            <div class="event_move" v-if="currentCamera.recorderType !== 'nvr'">
                <div class="event_move_box">
                    <li class="ar_L" @click="goPrevEvent()"><button></button></li>
                    <li class="txt">이벤트 이동</li>
                    <li class="ar_R" @click="goNextEvent()"><button></button></li>
                </div>
            </div>
        </div>
        <div class="timeline_date" id="view_timeline_date">
            <!-- [D] 클릭시 li에 class on 추가 -->
            <ul v-if="currentCamera.recorderType == 'nvr'">
                <li class="action">
                    <button type="button">
                        <span></span>
                    </button>
                </li>
            </ul>
            <ul v-if="!isExpiredCloud && serviceDay == 60 && currentCamera.recorderType != 'nvr'">
                <li v-show="fristIndex != 0">
                    <button @click="moveServiceDate('prev')" ><b> < </b></button>
                </li>
                <li v-if="d" :id="'timeline_date_' + d.date" v-show="$index <= lastIndex && fristIndex < $index" v-repeat="d in serviceCalendarDate" class="action" :class="{ 'on': d.date===formattedCalendarDate() }" @click="pressedCalendarDateButton(d.date)">
                    <button type="button">
                        <span>{{d.day}}</span>
                    </button>
                </li>
                <li v-show="lastIndex < 60">
                    <button @click="moveServiceDate('next')" ><b> > </b></button>
                </li>
            </ul>
            <ul v-if="!isExpiredCloud && serviceDay > 7 && serviceDay <60 && (currentCamera.recorderType != 'nvr' && currentCamera.recorderType != 'recorder')">
                <li v-if="d" :id="'timeline_date_' + d.date" v-repeat="d in serviceCalendarDate" class="action" :class="{ 'on': d.date===formattedCalendarDate() }" @click="pressedCalendarDateButton(d.date)">
                    <button type="button">
                        <span>{{d.day}}</span>
                    </button>
                </li>
            </ul>
            <ul v-if="!isExpiredCloud && serviceDay <= 7 && serviceDay >0 && (currentCamera.recorderType != 'nvr' && currentCamera.recorderType != 'recorder')">
                <li v-if="d" :id="'timeline_date_' + d.date" v-repeat="d in serviceCalendarDay" class="action" :class="{ 'on': d.date===formattedCalendarDate() }" @click="pressedCalendarDateButton(d.date)">
                    <button type="button">
                        <span>{{d.day}}</span>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import * as d3 from "d3";
    import {event as currentEvent} from 'd3';
    import $ from 'jquery';
    import _ from 'lodash';
    import store from '../../service/player/store';
    import HashMap from '../../service/hashMap';
    import moment from 'moment';
    import toastAPIs from '../../service/toastcamAPIs';
    import gEventBus from '../../service/gEventBus';

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    var nowWitdh = 0;

    var dragX = 0;

    var draging = 0;

    var dblClickTime = 0;

    var newTimelineDragCnt = 0;

    var dragTimeLine = false;

    var timelineClick = false;

    var thumnailViewFlag = false;

    var dragThumCancle = false;

    var timelineDrawFlag = true;

    var clickDateChange = false;

    var dblClickFlag = false;

    var dragFlag = false;

    var dragEndStatus = false;

    var dblClicklive = false;

    var changeTimeRangeClick = false;

    var firstDataLoadingFlag = false;

    var cursorDragStatus = false;

    var startTimeline = 0;

    var serviceDateTime = 0;

    var serivceDayOver = false;

    var changeTimeRangeFlag = false;

    var thumnailDraw = false;

    var updateCursorState = false;

    var removeWidth0 = true;

    var removeWidth = 0;

    var removeWidthStop = true;

    var zoneId = 0;

    var cvrArray = new Array();

    var timelineMap = new HashMap();
    var timelineSgidWidthMap = new HashMap();

    var timelineSgidMap = new HashMap();
    var showThumbnail = new HashMap();
    var recheck = 0;

    var liveReloadCnt = 0;
    var statusCheck = 0;

    var thatEnd;
    var thatStart;
    var thatWidth;

    var cvrCheck = false;

    var goCvrStatus = false;

    var currentPrevTime = 1;

    var timelineColor = ['#18b57b','#ff7900','#3ea1d4','#a4c800','#efd600','#767dff','#ca7af0','#ff76bd','#929292', '#ff1e00']; //초록,주황,파랑,연두,노랑,진한보라,보라,핑크,회색

    function getMaxDragX (){
        return parseInt($(".cvrBG").attr("width"));
    }

    function getDateTickWidth (index) {
        var tick = $('.date-tick-axis .tick text')[index];
        if (tick) {
            return tick.getBoundingClientRect().width;
        }
    }

    function adjustDateLocation (d, index) {
        var currentTranslateX = this.x(d.getTime());
        var textWidth = getDateTickWidth(index);
        var margin = 27;
        var adjustedTranslateX = currentTranslateX - (textWidth/2) - margin;
        return 'translate(' + adjustedTranslateX + ', 0)';
    }

    export default {
        name: 'timeline',
        computed : {
            cameraId: function () {
                return store.state.cameraId;
            },
            shopId: function () {
                return store.state.shopId;
            },
            clickedCvrTime: function () {
                return store.state.clickedCvrTime;
            },
            timelineData: function () {
                return store.state.timelineData;
            },
            config: function () {
                return store.state.cameraConfig;
            },
            currentCamera: function () {
                return store.state.cameraData;
            },
            cloud_out: function () {
                return (store.state.cameraData.saveEndDate < (new Date).valueOf()) ? true : false;
            },
            isFullScreen: function () {
                return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
            },
            isShared: function () {
                return store.state.isShared;
            },
            isExpiredCloud: function () {
                return store.getters.isExpiredCloud;
            },
            serviceDay: function () {
                return store.state.serviceDay;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            isPlaying: function () {
                return store.state.isPlaying;
            },
            isLive: function () {
                return store.state.isLive;
            },
            alarmZones: function () {
                return store.state.alarmZones;
            },
            serviceCalendarDate: function () {
                return store.state.serviceCalendarDate;
            },
            serviceCalendarDay: function () {
                return store.state.serviceCalendarDay;
            }
        },
        data : function() {
            return {
                timeRange : 60,
                isCursorLeft : false,
                isCursorRight : false,
                isShowTimelineCalendar : false
            }
        },
        created : function() {
        },
        mounted : function() {
            var that = this;
            this.width = $("#timeline_table").width();
            this.height = $("#timebar_area").height();
            this.eventData = [];
            this.cvrData = [];
            this.forceDomain = true;
            this.isLoading = false;
            this.timelineColorObj = {
                0: "#18b57b",
                1: "#ff7900",
                2: "#3ea1d4",
                3: "#a4c800",
                4: "#efd600",
                5: "#767dff",
                6: "#ca7af0",
                7: "#ff76bd",
                9: "#f0f0f0",
                10000: "#ff1e00",
                20000: "#ff1e00"
            };
            var currentSvg = d3.select(".timebar .timebar_area svg");
            if (currentSvg !== undefined) {
                currentSvg.remove();
            }
            this.svg = d3.select(".timebar .timebar_area").append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .attr('class', 'no-select');
            this.mainContainer = this.svg.append('g').attr({
                'transform': 'translate(0, -19)'
            });

            var cvrBgDrag = d3.behavior.drag()
                .on('dragstart', function () {
                    changeTimeRangeFlag = true;
                    dragThumCancle = true;
                    thumnailDraw = false;
                })
                .on('drag', function () {
                    if(timelineDrawFlag == false){
                        return;
                    }
                    $("#time_info_tri").hide();
                    $("#showThumbnailListNew").hide();
                    removeWidthStop = true;
                    draging++;

                    dragFlag = true;
                    var x = 0;
                    if (currentEvent) {
                        x = currentEvent.dx;
                    }
                    serivceDayOver = true;

                    var nowTime = (new Date()).valueOf();

                    var overTime = -0.9870;
                    if(that.timeRange){
                        overTime = -0.918;
                    }else if(that.timeRange == 360){
                        overTime = -0.59;
                    }else if(that.timeRange == 1440){
                        overTime = 0.9;
                    }
                    var serviceTime = 0;
                    if (store.state.cameraData.recorderType == "nvr") {

                        if(that.timeRange == 10){
                            overTime = 1000 * 60 * 6;
                        }else if(that.timeRange == 360){
                            overTime = 1000 * 60 * 60 * 5;
                        }else if(that.timeRange == 1440){
                            overTime = 1000 * 60 * 60 * 24;
                        } else {
                            // 1시간
                            overTime = 1000 * 60 * 30;
                        }

                        serviceTime = (nowTime - (1000*60*60*24*(that.serviceDay)));
                        serviceTime = (store.state.cameraData.regDate > serviceTime) ? store.state.cameraData.regDate - overTime : serviceTime - overTime;
                    } else {
                        serviceTime = (nowTime - (1000*60*60*24*(that.serviceDay+overTime)));
                    }

                    if(serviceTime > that.removedBufferDomain[0]){
                        serivceDayOver = false;
                    }else{
                        serivceDayOver = true;
                    }


                    dragX += x;
                    if(dragX > getMaxDragX()){
                        return;
                    }else if(dragX < -getMaxDragX()){
                        return;
                    }

                    if(serivceDayOver == false && dragX > 0){
                        return;
                    }

                    that.updateCursor(that.currentTime);
                    $(".accessIcons").children("image.accessIcons").attr("transform", "translate(" + dragX + ", 0)");
                    $(".motion").attr("transform","translate("+dragX+", 0)");
                    $(".inout").attr("transform","translate("+dragX+", 0)");
                    $(".sensor").attr("transform","translate("+dragX+", 0)");
                    $(".audios").attr("transform","translate("+dragX+", 0)");
                    $(".cvr").attr("transform","translate("+dragX+", 0)");
                    $(".axis").attr("transform","translate("+dragX+", 75)");
                    $(".cursor").attr("transform","translate("+dragX+", 0)");
                    $(".cvrBG").attr("x",dragX*-1);
                    $(".cvrBG2").attr("x",dragX*-1);
                })
                .on('dragend', function () {
                    newTimelineDragCnt=0;
                    if(dragX < -10){
                    }else if(dragX > 10){
                    }else{
                        dragFlag = false;
                    }

                    setTimeout(function(){
                        dragFlag = false;
                        if(timelineClick == false){
                            dragTimeLine = true;
                            dragEndStatus = true;
                            that.dragDomain();
                            $(".axis").attr("transform","translate(0, 75)");
                            $(".cvr").attr("transform","translate(0, 0)");
                            $(".cursor").attr("transform","translate(0, 0)");
                            $(".cvrBG").attr("x","0");
                            $(".cvrBG2").attr("x","0");
                            if(that.isPlaying == false){
                                that.updateCursor(that.currentTime);
                            }
                        }
                        timelineClick = false;
                    },150);

                    setTimeout(function(){
                        changeTimeRangeFlag = false;
                        timelineDrawFlag = true;
                    },1410);

                    dragThumCancle = false;
                });

            this.accessIcons = this.mainContainer.append('g').attr('class', 'accessIcons');
            this.motionEvents = this.mainContainer.append('g').attr('class', 'motions');
            this.audioEvents = this.mainContainer.append('g').attr('class', 'audios');
            this.scaleEvents = this.mainContainer.append('g').attr('class', 'scales');
            this.sensorEvents = this.mainContainer.append('g').attr('class', 'sensors');

            this.mainContainer.append('g').append('rect').attr({
                x: 0, y: 25, width: this.width, height: 48, class: 'cvrBG'
            }).call(cvrBgDrag);

            this.mainContainer.append('g').append('rect').attr({
                x: 0, y: 70, width: this.width, height: 48, class: 'cvrBG2'
            }).call(cvrBgDrag);

            this.cvrs = this.mainContainer.append('g').attr('class', 'cvr');
            this.inoutEvents = this.mainContainer.append('g').attr('class', 'inouts');
            this.isDblZooming = false;
            this.previousDblClickTime = 0;
            this.currentDomain = this.timeRange.currentDomain;

            this.svg.on('dblclick', function (){
                newTimelineDragCnt=0;
                dblClickFlag = true;
                var now = new Date();
                $("#showThumbnailListNew").hide();
                $("#time_info_tri").hide();
                if (now.getTime() - that.previousDblClickTime < 500) return;
                that.previousDblClickTime = now.getTime();
                if (that.isLoading) return;

                var cursorTime = that.currentTime.getTime();

                if (cursorTime <= that.currentDomain[0] || cursorTime >= that.currentDomain[1]) {
                    return
                }

                var timeRanges = [10, 60, 360, 1440];

                var current = timeRanges.indexOf(that.timeRange);
                if (current === 0) {
                    that.isDblZooming = true;
                } else if (current === 3) {
                    that.isDblZooming = false;
                }
                var newTimeRange;
                if (that.isDblZooming) {
                    newTimeRange = timeRanges[current + 1];
                } else {
                    newTimeRange = timeRanges[current - 1];
                }

                that.dblZoomDomain(cursorTime, newTimeRange);
            });
        },
        beforeDestroy : function() {
        },
        methods: {
            // draw: function(d) {
            //     var check = 0;
            //     var eventTime = d.recTimes;
            //     /*if(eventTime == undefined && !this.isShared){
            //         $scope.shareEnd();
            //         return;
            //     }*/
            //     d.recTimes = [];
            //
            //     if (eventTime) {
            //         for(var i=0;i<eventTime.length;i++){
            //             if(i< eventTime.length){
            //                 if(eventTime[i+1] != undefined){
            //                     if(eventTime[i].endTime == eventTime[i+1].startTime){
            //                         check++;
            //                     }else{
            //                         var recTime = {};
            //                         recTime.startTime = eventTime[i-check].startTime;
            //                         recTime.endTime = eventTime[i].endTime;
            //                         d.recTimes.push(recTime);
            //                         check = 0;
            //                     }
            //                 }else{
            //                     var recTime = {};
            //                     recTime.startTime = eventTime[i-check].startTime;
            //                     recTime.endTime = eventTime[i].endTime;
            //                     d.recTimes.push(recTime);
            //                     check = 0;
            //                 }
            //             }
            //         }
            //     }
            //
            //     firstDataLoadingFlag = true;
            //     $scope.timelineDataSet(d);
            // },

            pressedShowTimelineCalendarButton: function() {
                gEventBus.$emit('show-calendar');
                this.isShowTimelineCalendar = !this.isShowTimelineCalendar;
            },
            resizeTimeline: function () {
                if(this.isFullScreen === false){
                    this.redrawWithWidth(parseInt($("#view_timeline_ctrl").width()));
                }

                //TODO:
                if(this.zonearea !== undefined){
                    //$scope.zonearea.setCanvasSize($("#player").width(), $("#player").height(), $scope.zones, $scope.selectedZones);
                }

                this.camInfoBarChange();

                //TODO:
                //this.resizePlayer();
            },

            changeTimeRange: function (minutes) {
                newTimelineDragCnt = 0;
                dblClickFlag = false;
                //$scope.lineMoveFlag = true;
                //changeTimeRangeClick = true;
                //dragThumCancle = false;
                if(this.timeRange == minutes){
                    return;
                }

                if(changeTimeRangeFlag == true){
                    //$scope.loadingDataAlert();
                    return;
                }

                changeTimeRangeFlag = true;

                setTimeout(() => {
                    changeTimeRangeFlag = false;
                    this.updateCursor(this.currentTime);
                    this.svg.select('.cursor').classed('hide', false);
                },800);

                this.timeRange = minutes;

                if (this.forceDomain) {
                    this.setTimeRange(minutes);
                } else {
                    this.zoomDomain(this.domainCenterTime(), minutes);
                }
            },

            drawTimelineData: function(d){
                var check = 0;
                var eventTime = d.recTimes;
                /*if(eventTime == undefined && !this.isShared){
                    $scope.shareEnd();
                    return;
                }*/
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

                firstDataLoadingFlag = true;
                this.timelineDataSet(d);
            },
            timelineDataSet: function (d) {
                if(dragTimeLine == true){
                    dragTimeLine = false;
                    if (this.isFullScreen) {
                        $("#timebar_area").children("svg").children("g").attr("transform","translate(0, -15)");
                    }else{
                        $("#timebar_area").children("svg").children("g").attr("transform","translate(0, -19)");
                    }
                    //changedSelectedZone();
                    $(".cvr").attr("transform","");
                    $(".cursor").attr("transform","");
                    thumnailDraw = true;
                }

                this.cvrData = d.recTimes;
                this.drawRecordBar();
                this.updateBar(500);
                cvrArray = new Array();
                cvrArray.push($(".cvr").children("rect"));
                this.redrawEvents(d.events, d.avg);
                this.isLoading = false;
                // setTimeout(function(){
                //     if (changedSelectedZone) {
                //         changedSelectedZone();
                //     }
                // },200);

                //changedSelectedZone();
            },

            showThum: function (check) {
            },
            prevLine: function () {
                var nowTime = (new Date()).valueOf();
                var overTime = -0.9870;
                if(this.timeRange == 60){
                    overTime = -0.918;
                }else if(this.timeRange == 360){
                    overTime = -0.59;
                }else if(this.timeRange == 1440){
                    overTime = 0.9;
                }
                var serviceTime = (nowTime - (1000*60*60*24*(this.serviceDay+overTime)));
                if(serviceTime > this.removedBufferDomain[0]){
                    return;
                }
                dblClickFlag = false;
                changeTimeRangeClick = true;
                this.lineMoveFlag = true;
                this.prevDomain();
                if(this.isPlaying == true){
                    setTimeout(() => {
                        if(this.isLive == false){
                            gEventBus.$emit('start-timer', this.currentTime.valueOf());
                        }
                    },1050);
                }
            },
            nextLine: function () {
                dblClickFlag = false;
                changeTimeRangeClick = true;
                this.lineMoveFlag = true;
                this.nextDomain();
                if(this.isPlaying == true){
                    setTimeout(() => {
                        if(this.isLive == false){
                            gEventBus.$emit('start-timer', this.currentTime.valueOf());
                        }
                    },1050);
                }
            },
            pressedFindCursorButton: function (check) {
                this.isCursorRight = false;
                this.isCursorLeft = false;
                newTimelineDragCnt = 0;
                if(check=="click"){
                    dblClickFlag = false;
                }
                //cursorIdx = 0;
                this.lineMoveFlag = true;
                changeTimeRangeClick = true;
                if(dblClickFlag == false){
                    this.zoomDomain(this.currentTime.valueOf(), this.timeRange);
                }
            },

            goPrevEvent: function() {
                var that = this;
                var callbackFunc = function() {
                    if (that.currentCamera.recordType == "event") {
                        var findTime = 0;
                        if (that.cvrData && that.cvrData.length) {
                            var i, len, curTime;
                            len = that.cvrData.length;
                            curTime = that.currentTime.getTime();
                            for (i = 0; i < len; i+=1) {
                                if (curTime > parseInt(that.cvrData[i].startTime, 10) && curTime <= parseInt(that.cvrData[i].endTime, 10)) {
                                    findTime = that.cvrData[i].startTime;
                                    break;
                                }
                            }
                            if (findTime === 0) {
                                findTime = that.currentTime.valueOf();
                            }
                        } else {
                            findTime = that.currentTime.valueOf();
                        }
                        //TODO:
                        // Camera.findCVR({ cameraId: $scope.currentCamera.id, cvrId: findTime, find: 'previous'}, function (cvrData) {
                        //     if (cvrData && cvrData.cvr && cvrData.cvr.start && cvrData.cvr.end) {
                        //         $scope.goCvr(parseInt(cvrData.cvr.start, 10));
                        //     } else {
                        //         showAlert($translate.instant("CAMERA_EVENT_MOVE"), $translate.instant("CAMERA_NO_PREV_EVENT"));
                        //     }
                        // },function (err) {
                        //     showAlert($translate.instant("CAMERA_EVENT_MOVE"), $translate.instant("CAMERA_NO_PREV_EVENT"));
                        // });
                    } else {
                        var currentTime = parseInt(that.currentTime.valueOf());
                        var prevTime = 0;

                        //TODO:
                        // arrEvents.filter(function(obj){
                        //     var allFilteredZoneIds = $scope.getAllFilteredZonesIds(obj.zoneIdxs.split(","));
                        //     var isCheckFilter = _.intersection(allFilteredZoneIds, obj.zoneIdxs.split(",")).length;
                        //     if (isCheckFilter > 0) {
                        //         var startTime = parseInt(obj.playStartTime || obj.startTime);
                        //         if(startTime < currentTime && startTime > prevTime && currentPrevTime != startTime) {
                        //             prevTime = startTime;
                        //         }
                        //     }
                        // });
                        if(prevTime != 0){
                            currentPrevTime = prevTime;
                            that.goCvr(prevTime);
                        } else {
                            var regDate = that.currentCamera.regDate;
                            var serviceDateTime = (new Date()).valueOf() - (1000*60*60*24*(that.serviceDay));
                            var serviceStartDate = regDate > serviceDateTime ? regDate : serviceDateTime;
                            var goPrevEvent = function (queryTime){
                                var isCheckedDeleteZoneId = _.get(_.find(that.alarmZones.motionZones, ['id', '9']), 'filterMark') === 'on' ? true : false;
                                var allFilteredZoneIds = that.getAllFilteredZonesIds();
                                if (isCheckedDeleteZoneId) {
                                    allFilteredZoneIds.push("d");
                                }
                                //TODO:
                                // Camera.prevEventWithRange({id: $stateParams.cameraId, scale: $scope.nowScale, queryTime: queryTime, range: 2, filters: allFilteredZoneIds.join(",")}, function(data){
                                //     var startTime = data.playStartTime || data.startTime;
                                //     if(startTime !== undefined && startTime > serviceStartDate){	// 이벤트가 있다면 이동
                                //         var allFilteredZoneIds = $scope.getAllFilteredZonesIds(data.zoneIdxs.split(","));
                                //         var isCheckFilter = _.intersection(allFilteredZoneIds, data.zoneIdxs.split(",")).length;
                                //
                                //         if (isCheckFilter > 0) {
                                //             $scope.goCvr(parseInt(startTime));
                                //         } else {
                                //             goPrevEvent(queryTime - (1000*60*60*24*2));
                                //         }
                                //     } else if (startTime === undefined && serviceStartDate < (queryTime - (1000*60*60*24*2))){	// 서비스 기간내인데 range내에 이벤트가 없으면 2일전으로 재검색
                                //         goPrevEvent(queryTime - (1000*60*60*24*2));
                                //     } else {
                                //         showAlert($translate.instant("CAMERA_EVENT_MOVE"), $translate.instant("CAMERA_NO_PREV_EVENT"));
                                //     }
                                // }, function(err){
                                //     location.href = "/error";
                                // });
                            }
                            goPrevEvent(that.currentTime.valueOf());
                        }
                    }
                };

                if (this.checkCVRSeucre()) {
                    if(document.msFullscreenElement) {
                        //$scope.pressedExitFullScreenButton();
                    }

                    // $scope.play.securePassword = '';
                    // $scope.isShowCVRPlayPasswordConfirm = !$scope.isShowCVRPlayPasswordConfirm;
                    // $scope.cvrPasswordSuccess = callbackFunc;
                }else{
                    callbackFunc();
                }
            },

            goNextEvent: function () {

            },

            //TODO:
            goCvr: function (time, status) {
                gEventBus.$emit('stop-timer');
                dragThumCancle = false;
                var tmpX = 9999;

                if(time == undefined){
                    this.updateCursor(this.currentTime);
                    var cursorX = parseFloat($(".cursor").children("line").attr("x1"));
                    for(var i=0;i<cvrArray[0].length;i++){
                        if(cursorX < parseFloat(cvrArray[0].eq(i).attr("x"))){
                            var x = parseFloat(cvrArray[0].eq(i).attr("x"));
                            if(tmpX >= x){
                                tmpX = x;
                                time = this.x.invert(x).getTime()+1000;
                            }
                        }
                    }
                }

                if(time == undefined){
                    this.updateCursor(this.currentTime);
                    if(cvrArray[0].length-1 > 0){
                        var x = parseFloat(cvrArray[0].eq(cvrArray[0].length-1).attr("x"));
                        if(tmpX >= x){
                            tmpX = x;
                            time = this.x.invert(x).getTime()+1000;
                        }
                    }
                }

                if(time == undefined){
                    time = this.lastRec;
                    if(time == 0){
                        time = this.lastEvent;
                    }
                }

                if(time == 0){
                    //TODO:
                    // Camera.isLastRecord({ id: $stateParams.cameraId }, function (data) {
                    //     $scope.currentCamera.lastEventDate = data.lastEventStartTime;
                    //     $scope.currentCamera.lastRecDate = data.lastRectStartTime;
                    //
                    //     var videoDateFormat = $translate.instant('CAMERA_DETAIL_EVENT_DATE_FORMAT');
                    //     var videoTimeFormat = $translate.instant('CAMERA_DETAIL_EVENT_TIME_FORMAT');
                    //
                    //     var lastRecMoment = moment($scope.currentCamera.lastRecDate);
                    //     $scope.currentCamera.lastRecDateString = lastRecMoment.locale(Util.getBrowserLanguage()).format(videoDateFormat);
                    //     $scope.currentCamera.lastRecTimeString = lastRecMoment.locale(Util.getBrowserLanguage()).format(videoTimeFormat);
                    //
                    //     var date = new Date(data.lastRectStartTime);
                    //     changeTimeRangeClick = true;
                    //     $scope.cameraStatusAllOff();
                    //     $scope.currentTime = date;
                    //     $scope.timeline.zoomDomain(data.lastRectStartTime, $scope.timeRange);
                    //     goCvrStatus = true;
                    //     $scope.clickedCVRArea(date, status);
                    //
                    // });
                }else{
                    var date = new Date(time);
                    changeTimeRangeClick = true;
                    store.dispatch('CAMERA_STATUS_NORMAL');
                    this.currentTime = date;
                    this.zoomDomain(date.getTime(), this.timeRange);
                    goCvrStatus = true;
                    this.clickedCVRArea(date, status);
                }
            },

            /********** Timeline Control ***********/
            setBoundDateFormat: function (format) {
                this.boundDateFormat = format;
            },
            setTimezone: function (timezone) {
                if (timezone !== undefined && timezone !== "") {
                    var tokens = timezone.split(',');
                    this.tz = tokens[2];
                }
            },

            checkCVRSeucre: function() {
                if(this.config.secureMode == "on"){
                    gEventBus.$emit('stop-timer');
                    // var passCVRSecure = sessionStorage.getItem("passCVRSecureCameraIds");
                    // if(passCVRSecure == null || passCVRSecure === "undefined"){
                    //     callback(true);
                    // } else {
                    //     if(passCVRSecure.indexOf($stateParams.cameraId) > -1){
                    //         callback(false);
                    //     }else{
                    //         callback(true);
                    //     }
                    // }
                    return false;
                } else {
                    return false;
                }
            },

            camInfoBarChange: function(){
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

            cvrDrawCheck: function(time){
                store.dispatch('SET_IS_LIVE', false);
                this.camInfoBarChange();
                var trueCnt = 0;
                var cursorX = parseFloat(this.x(time));

                cvrCheck = false;

                var nextTime = (new Date).valueOf();
                var checkNextTime = 0;
                for(var i=0;i<this.cvrData.length;i++){
                    var startX = parseInt(this.cvrData[i].startTime)
                    var endX = parseInt(this.cvrData[i].endTime)

                    if(startX > time.valueOf() && checkNextTime == 0){
                        nextTime = startX;
                        checkNextTime++;
                        //clearTimeout(playserStop);
                    }

                    if(this.timeRange == 10){
                        if(parseInt(this.cvrData[this.cvrData.length-1].endTime) <= time.valueOf()+3000){
                            this.setupDomain([this.currentDomain[0],this.currentDomain[1]]);
                        }
                    }else{
                        if(parseInt(this.cvrData[this.cvrData.length-1].endTime) <= time.valueOf()+30000){
                            this.setupDomain([this.currentDomain[0], this.currentDomain[1]]);
                        }
                    }

                    if(startX <= time.valueOf()  && endX >= time.valueOf()){
                        cvrCheck = true;
                        trueCnt++;
                    }else{
                        if(trueCnt == 0){
                            cvrCheck = false;
                        }
                    }
                }
                if(cvrCheck == false){

                    if((new Date).valueOf() - time.valueOf() < 8000){
                        gEventBus.$emit('go-live');
                        newTimelineDragCnt=0;
                        return;
                    }

                    if((new Date).valueOf() - time.valueOf() < 15000){
                        cvrCheck = true;
                        newTimelineDragCnt=0;
                    }
                }

                if(cvrCheck == false){
                    //if(this.lineMoveFlag == false && this.plyBtnStatus == true){
                        this.lineMoveFlag = false;
                        this.liveLinFlag = false;
                        store.dispatch('SET_IS_PLAYING', false);
                        store.dispatch('CAMERA_NO_CVR');
                        gEventBus.$emit('stop-timer');
                        var videoDateFormat = "M월 D일 dddd";
                        var videoTimeFormat = "HH:mm:ss";
                        if(checkNextTime == 1){
                            var lastRecMoment = moment(nextTime);
                            this.currentCamera.lastRecDateString = lastRecMoment.locale('ko').format(videoDateFormat);
                            this.currentCamera.lastRecTimeString = lastRecMoment.locale('ko').format(videoTimeFormat);
                            $("#camera_off_lastrec").show();
                            store.dispatch('SET_IS_CAMERA_OFF_LAST_SHOW_REC', true);
                            this.currentCamera.lastRecDate = nextTime;
                        }else{
                            store.dispatch('SET_IS_CAMERA_OFF_LAST_REC', true);
                        }
                        return;
                    //}
                }
            },

            clickedCVRArea: function (time, status) {
                newTimelineDragCnt=0;
                gEventBus.$emit('stop-timer');
                if(this.isShared){
                    this.shareEnd();
                }
                this.setupDomain([this.currentDomain[0],this.currentDomain[1]]);
                if((new Date()).valueOf() < time.valueOf()){
                    gEventBus.$emit('go-live');
                    return;
                }

                if(cursorDragStatus == true){
                    return;
                }

                serviceDateTime = ((new Date()).valueOf() - (1000*60*60*24*(this.serviceDay)));
                if(serviceDateTime > time){
                    //return;
                    time = new Date(serviceDateTime + 3000);
                }
                store.dispatch('SET_CLICKED_CVR_TIME', time);
                store.dispatch('CAMERA_STATUS_NORMAL');

                //cursorIdx = 0;
                if(status != 'f'){
                    this.cvrDrawCheck(time);
                }
                if(cursorDragStatus == true){
                    return;
                }

                //playerCheck = false;
                var tokenPromise = {};

                gEventBus.$emit('start-timer', time);

                store.dispatch('SET_IS_LIVE', false);
                this.camInfoBarChange();
                //goCvrStatus = false;
                //$scope.cameraStatusAllOff();
                gEventBus.$emit('play-start', time);

                this.updateCursor(new Date(time));
                this.isCursorLeft = false;
                this.isCursorRight = false;
            },
            bufferDomain: function (minutes) {
                var buffer = 0;
                switch (minutes) {
                    case 5:
                        buffer = 30000;
                        break;
                    case 60:
                        buffer = 5 * 60 * 1000;
                        break;
                    case 360:
                        buffer = 30 * 60 * 1000;
                        break;
                    case 1440:
                        buffer = 90 * 60 * 1000;
                        break;
                    default:
                        break;
                }

                return buffer;
            },
            removeBufferDomain: function (domain, timeRange) {
                var buffer = this.bufferDomain(timeRange);
                var originStart = domain[0] + buffer;
                var originEnd = domain[1] - buffer;

                return [originStart, originEnd];
            },
            bufferCursorCheckDomain: function (minutes) {
                var buffer = 0;
                switch (minutes) {
                    case 5:
                        buffer = 5 * 60 * 1000;
                        break;
                    case 10:
                        buffer = 10 * 60 * 1000;
                        break;
                    case 60:
                        buffer = (60 * 60 * 1000)+150000;
                        break;
                    case 360:
                        buffer = (60 * 60 * 1000 * 6)+650000;
                        break;
                    case 1440:
                        buffer = (60 * 60 * 1000 * 24)+650000;
                        break;
                    default:
                        break;
                }

                return buffer;
            },
            removeBufferCursorCheckDomain: function (domain, timeRange) {
                var buffer = this.bufferCursorCheckDomain(timeRange);
                var originStart = domain[0] + buffer;
                var originEnd = domain[1] - buffer;

                return [originStart, originEnd];
            },
            dateDomain: function (minutes, ratio) {
                var now = Date.now();

                if (ratio === undefined) {
                    ratio = 0.8;
                }

                var ms = minutes * 60 * 1000;
                var start = now - parseInt(ms * (ratio));
                var end = now + parseInt(ms * (1- ratio));

                return this.bufferedDomain([start, end], minutes);
            },
            bufferedDomain: function (domain, minutes) {
                var ticks = {
                    1: 0.2,
                    5: 1,
                    10: 2,
                    60: 10,
                    360: 60,
                    1440: 180
                }

                var ms = ticks[minutes] * 60 * 1000;
                var buffer = this.bufferDomain(minutes);
                var newStart = Math.ceil(domain[0] / ms) * ms - buffer;
                var newEnd = (Math.ceil(domain[1] / ms)) * ms + buffer;
                startTimeline = newStart;
                return [newStart, newEnd];
            },
            zoomDomain: function (time, timeRange) {
                thumnailViewFlag = false;
                this.timeRange = timeRange;

                var range = 1000*60 * timeRange;
                var diff = timeRange / 2 * 60 * 1000;

                var start = time - diff - diff  *0.8;
                var end = time + diff- diff * 0.8;

                this.changeDomain(this.bufferedDomain([start-range, end+range], timeRange), 500, time);
            },
            dblZoomDomain: function (time, timeRange) {
                this.timeRange = timeRange;

                var range = 1000*60 * timeRange;
                var diff = timeRange / 2 * 60 * 1000;

                var start = time - diff - diff  *0.8;
                var end = time + diff- diff * 0.8;

                var newDomain = this.bufferedDomain([start-range, end+range], timeRange);
                while (time < newDomain[0] || time > newDomain[1]) {
                    var ms = timeRange * 60 * 1000;
                    if (time < newDomain[0]) {
                        newDomain = [newDomain[0] + ms, newDomain[1] + ms];
                    }
                    if (time > newDomain[1]) {
                        newDomain = [newDomain[0] - ms, newDomain[1] - ms];
                    }
                }

                if(dblClicklive == false){
                    this.clickedCVRArea(new Date(dblClickTime));
                }else{
                    gEventBus.$emit('go-live');
                }

                this.changeDomain(newDomain);
            },
            moveDomain: function (ratio) {
                var diff = parseInt((this.currentDomain[1] - this.currentDomain[0]) * ratio);
                var start = this.currentDomain[0] + diff;
                var end = this.currentDomain[1] + diff;

                this.changeDomain([start, end]);
            },
            dragDrawDomain: function (value) {
                dragThumCancle = false;
                var diff = 10000 * value;
                var newDomain = [this.currentDomain[0] - diff, this.currentDomain[1] - diff];
                this.changeDomain(newDomain);
            },
            prevDomain: function () {
                newTimelineDragCnt=0;
                dragThumCancle = false;
                var diff = this.timeRange * 60 * 1000;
                var newDomain = [this.currentDomain[0] - diff, this.currentDomain[1] - diff];
                this.changeDomain(newDomain);
            },
            nextDomain: function () {
                newTimelineDragCnt=0;
                dragThumCancle = false;
                var diff = this.timeRange * 60 * 1000;
                var newDomain = [this.currentDomain[0] + diff, this.currentDomain[1] + diff];
                this.changeDomain(newDomain);
            },
            dragDomain: function () {
                var diff = this.timeRange * 60 * 1000;
                var newDomain = [this.currentDomain[0] + diff, this.currentDomain[1] + diff];

                dragX = 0;
                var range = 0;
                var timelineFix = 0;
                switch(this.timeRange){
                    case 10:
                        range = 1800000;
                        break;
                    case 60:
                        range = 11400000;
                        timelineFix = 200000;
                        break;
                    case 360:
                        range = 68400000;
                        timelineFix = 1200000;
                        break;
                    case 1440:
                        range = 270000000;
                        timelineFix = 3600000;
                        break;
                }

                var startDo = this.x.invert(parseInt($(".cvrBG").attr("x"))).getTime() - this.timeRange * 60 * 1000 - timelineFix;
                var endDo = startDo + range;
                var newDomain = [startDo, endDo];

                this.changeDragDomain(newDomain);
            },
            setTimeRange: function (minutes, callback) {
                this.timeRange = parseInt(minutes);

                var x = this.svg.select('.cursor').select("line").attr('x1');
                var cursorTime = this.x.invert(x).getTime();

                return this.zoomDomain(cursorTime, minutes);
            },
            domainCenterTime: function () {
                if (this.currentDomain !== undefined) {
                    return (this.currentDomain[0] + this.currentDomain[1])/2 + (this.currentDomain[1] - this.currentDomain[0])/8;
                }

                return undefined;
            },
            setTimeRangeAtDateString: function (dateString, timeRange) {
                this.timeRange = 1440;

                var format = d3.time.format("%Y%m%d%H%M%S");

                var startDate = format.parse(dateString + "000000");
                var endDate = format.parse(dateString + "240000");

                var range = 1000*60 * timeRange;

                var startTime = startDate.getTime();
                var endTime = endDate.getTime();
                var newDomain = this.bufferedDomain([startTime-range, endTime+range], this.timeRange);

                this.changeDomain(newDomain);
            },

            shareEnd: function(){
                // Share.get({id: $stateParams.cameraId}, function(res){}, function(err) {
                //     if (err.status === 401) {
                //         $scope.shareEndCheckErr();
                //     }
                // });
            },

            getAlarmZones: function (callback) {
                /*
                Camera.zones({ id: $stateParams.cameraId }, function (res) {
                    $scope.eventZones = res.eventZones;
                    $scope.motionZones = res.zones;
                    var allSensorZonesActive = true, i, len = $scope.sensorZones.length;
                    for (i = 0; i < len; i+=1) {
                        if ($scope.sensorZones[i].filterMark !== "on") {
                            allSensorZonesActive = false;
                        }
                    }
                    $scope.allMotionCheck = (!_.includes(_.map($scope.motionZones, 'filterMark'), 'off')) && $scope.inoutFilter && allSensorZonesActive;
                    $scope.soundZone = $scope.eventZones.filter(function (value) {
                        return value.id == "0"
                    })[0];

                    $scope.accessZone =  $scope.eventZones.filter(function (value) {
                        return value.id == "10000";
                    })[0];
                    callback(true);
                }, function (err) {
                    //showAlert($translate.instant("ACCESS_NET_FAIL"), $translate.instant("ACCESS_NET_FAIL_DESC"));
                    callback(false);
                });
                */
            },

            setupDomain: function (domain) {
                if(this.isShared){
                    this.shareEnd();
                }
                this.dataCallStatus = false;
                if(dragThumCancle == true){
                    return;
                }

                var params = {
                    cameraId: this.cameraId,
                    shopId: this.shopId,
                    start: domain[0],
                    end: domain[1]
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
                    params.scale = "10m";
                    this.nowScale = "10m";
                    params.start = params.start - 100000;
                }else if(this.timeRange == 60){
                    params.scale = "1h";
                    this.nowScale = "1h";
                    // params.start = params.start - 10000000;
                    if(newTimelineDragCnt > 0 && newTimelineDragCnt < 6){
                        newTimelineDragCnt++;
                        return;
                    }else if(newTimelineDragCnt==6){
                        newTimelineDragCnt=0;
                    }
                }else if(this.timeRange == 360){
                    params.scale = "6h";
                    this.nowScale = "6h";
                    if(newTimelineDragCnt > 0 && newTimelineDragCnt < 30){
                        newTimelineDragCnt++;
                        return;
                    }else if(newTimelineDragCnt==30){
                        newTimelineDragCnt=0;
                    }
                }else if(this.timeRange == 1440){
                    params.scale = "24h";
                    this.nowScale = "24h";
                    if(newTimelineDragCnt > 0 && newTimelineDragCnt < 60){
                        newTimelineDragCnt++;
                        return;
                    }else if(newTimelineDragCnt==60){
                        newTimelineDragCnt=0;
                    }
                }

                newTimelineDragCnt++;
                this.isLoading = true;
                if(this.serviceDay != 0){
                    serviceDateTime = ((new Date()).valueOf() - (1000*60*60*24*(this.serviceDay)));
                }else{
                    serviceDateTime = 0;
                }

                // $scope.getCameraZones();
                //var alarmZonePromise = this.getAlarmZones();
                if(params.start < serviceDateTime){
                    params.start = serviceDateTime;
                }

                if (!this.isShared) {
                    toastAPIs.call(toastAPIs.camera.GET_TIMELINE, params, (res) => {
                        store.dispatch('SET_TIMELINE_DATA', res);
                        if (res) {
                            this.drawTimelineData(res);
                        } else {
                            this.isLoading = false;
                        }
                    }, (err) => {
                        this.isLoading = false;
                    });
                } else {
                    toastAPIs.call(toastAPIs.camera.GET_SHARE_CAM_TIMELINE, params, (res) => {
                        store.dispatch('SET_TIMELINE_DATA', res);
                        if (res) {
                            this.drawTimelineData(res);
                        } else {
                            this.isLoading = false;
                        }
                    }, (err) => {
                        this.isLoading = false;
                    });
                }

                var removedBufferDomain = this.removeBufferCursorCheckDomain(domain , this.timeRange);

                if (removedBufferDomain[0] > this.currentTime.valueOf()) {
                    this.isCursorLeft = true;
                    this.isCursorRight = false;
                } else if (removedBufferDomain[1] < this.currentTime.valueOf()) {
                    this.isCursorLeft = false;
                    this.isCursorRight = true;
                } else {
                    this.isCursorLeft = false;
                    this.isCursorRight = false;
                    if(this.isPlaying == false){
                        this.updateCursor(this.currentTime);
                    }
                }
            },
            changeDomain: function (domain, duration, time) {
                var that = this;

                this.svg.select('.cursor').classed('hide', true);

                this.currentDomain = domain;
                this.removedBufferDomain = this.removeBufferDomain(this.currentDomain , this.timeRange);
                setTimeout(function(){
                    that.setupDomain(that.currentDomain);
                },1000);

                var extent;
                if (this.brush !== undefined) {
                    extent = this.brush.extent();
                }

                this.x.domain(domain);
                if (this.brush !== undefined && extent !== undefined) {
                    this.brush.extent(extent);
                    this.brush(d3.select('.brush').transition().duration(500));
                }

                if (duration === undefined) {
                    duration = 500;
                }

                if (this.cursorTime >= this.removedBufferDomain[0] && this.cursorTime <= this.removedBufferDomain[1]) {
                    this.forceDomain = true;
                } else {
                    this.forceDomain = false;
                }

                this.nowAnimating = true;
                this.updateAxis(duration);
                this.updateBar(duration);
                this.updateEvents(duration);
                this.updateAccessIcons(duration);
                this.nowAnimating = false;

                let range;
                switch(this.timeRange){
                    case 10:
                        range = 600000;
                        break;
                    case 60:
                        range = 600000 * 6;
                        break;
                    case 360:
                        range = 600000 * 6 * 6;
                        break;
                    case 1440:
                        range = 600000 * 6 * 6 * 4;
                        break;
                }

                if(domain[0]+range <= this.currentTime.valueOf() && domain[1]-range >= this.currentTime.valueOf()){
                    if(this.isPlaying == false){
                        $(".cursor").hide();
                        this.svg.select('.cursor').classed('hide', false);
                        $(".cursor").fadeIn(500);
                    }
                }

                if(clickDateChange == true){
                    clickDateChange = false;
                    setTimeout(function(){
                        $(".motions").empty();
                        $(".audios").empty();
                        $(".inouts").empty();
                        $(".sensors").empty();
                        $(".motions").fadeIn(200);
                    },280);
                }
            },
            changeDragDomain: function (domain, duration, time) {
                var that = this;

                this.svg.select('.cursor').classed('hide', true);

                this.currentDomain = domain;
                this.removedBufferDomain = this.removeBufferDomain(this.currentDomain , this.timeRange);
                this.setupDomain(this.currentDomain);

                var extent;
                if (this.brush !== undefined) {
                    extent = this.brush.extent();
                }

                this.x.domain(domain);
                if (this.brush !== undefined && extent !== undefined) {
                    this.brush.extent(extent);
                }

                if (duration === undefined) {
                    duration = 500;
                }

                if (this.cursorTime >= this.removedBufferDomain[0] && this.cursorTime <= this.removedBufferDomain[1]) {
                    this.forceDomain = true;
                } else {
                    this.forceDomain = false;
                }

                this.nowAnimating = true;
                this.updateAxis(-100,"drag");
                this.updateBar(0);

                this.nowAnimating = false;

                if($(".cursor").attr("class").indexOf("hide") != -1){
                    that.updateCursor(that.currentTime);
                    this.svg.select('.cursor').classed('hide', false);
                }
            },
            draw: function () {
                this.drawAxis();
                this.drawCursor();
                this.drawEvents();
            },

            redrawWithWidth: function (width) {

                if(width == 0){
                    width = nowWitdh;
                }

                this.width = width;
                this.svg.attr({ width: width });
                if(this.axisContainer != undefined){
                    this.axisContainer.remove();
                    this.axisContainer = undefined;
                    this.drawAxis(this.currentDomain);
                    this.cursor.moveToFront();
                    this.updateBar(0);
                    nowWitdh = width;
                }
            },

            getDateTicks: function () {
                var todayWord = "오늘";
                var yesterdayWord = "어제";
                var that = this;
                var tick = d3.svg.axis().scale(this.x).orient("bottom")
                    .tickSize(11, 0)
                    .tickPadding(3)
                    .tickFormat(function (d, i) {
                        var md;

                        if (that.tz !== undefined) {
                            md = moment(d).tz(that.tz).locale('ko');
                        } else {
                            md = moment(d).locale('ko');
                        }

                        var now = new Date();
                        var todayCheck = new Date(md.year(), md.month(), md.date());
                        var todayFlag = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                        var dateFormat = that.boundDateFormat;

                        if(dateFormat === undefined) {
                            dateFormat = "HH:mm";
                        } else if (todayCheck.getTime() == todayFlag.getTime()) {
                            dateFormat = todayWord + "(ddd)";
                        } else if ((todayFlag - todayCheck)/(1000 * 60 * 60 * 24) == 1) {
                            dateFormat = yesterdayWord + "(ddd)";
                        } else {
                            dateFormat = that.boundDateFormat;
                        }

                        if(that.timeRange == 10){
                            if (parseInt(md.minutes()) % 10 == 0) {
                                return md.format(dateFormat);
                            }else{
                                return "";
                            }
                        }else if(that.timeRange == 60){
                            if (md.minutes() == "00") {
                                return md.format(dateFormat);
                            }else{
                                return "";
                            }
                        }else if(that.timeRange == 360){
                            var formatArr = [2,6,10,14,18,22];
                            if (formatArr.indexOf(md.hours()) > -1)  {
                                return md.format(dateFormat);
                            }else{
                                return "";
                            }
                        }else if(that.timeRange == 1440){
                            var formatArr = [4,16];
                            if (formatArr.indexOf(md.hours()) > -1)  {
                                return md.format(dateFormat);
                            }else{
                                return "";
                            }
                        }
                    });

                switch (this.timeRange) {
                    case 5:
                        tick.ticks(d3.time.minutes, 1);
                        break;
                    case 10:
                        tick.ticks(d3.time.minutes, 10);
                        break;
                    case 60:
                        tick.ticks(d3.time.hours, 1);
                        break;
                    case 360:
                        tick.ticks(d3.time.hours, 2);
                        break;
                    case 1440:
                        tick.ticks(d3.time.hours, 4);
                        break;
                }

                return tick;
            },

            getBigTicks: function () {
                var dayWord = '낮';
                var nightWord = '밤';
                var that = this;
                var tick = d3.svg.axis().scale(this.x).orient("bottom")
                    .tickSize(11, 0)
                    .tickPadding(3)
                    .tickFormat(function (d, i) {
                        var md;

                        if (that.tz !== undefined) {
                            md = moment(d).tz(that.tz).locale('ko');
                        } else {
                            md = moment(d).locale('ko');
                        }

                        var timeFormat = "HH:mm";
                        if(md.hours() >= 6 && md.hours() < 18) {
                            timeFormat = timeFormat + " " + dayWord;
                        } else {
                            timeFormat = timeFormat + " " + nightWord;
                        }

                        if(that.timeRange == 10){
                            if (parseInt(md.minutes()) % 10 == 0) {
                                return md.format(timeFormat);
                            }else{
                                return md.format("HH:mm");
                            }
                        }else if(that.timeRange == 60){
                            if (md.minutes() == "00") {
                                return md.format(timeFormat);
                            }else{
                                return md.format("HH:mm");
                            }
                        }else if(that.timeRange == 360){
                            var formatArr = [2,6,10,14,18,22];
                            if (formatArr.indexOf(md.hours()) > -1)  {
                                return md.format(timeFormat);
                            }else{
                                return md.format("HH:mm");
                            }
                        }else if(that.timeRange == 1440){
                            var formatArr = [4,16];
                            if (formatArr.indexOf(md.hours()) > -1)  {
                                return md.format(timeFormat);
                            }else{
                                return md.format("HH:mm");
                            }
                        }
                    });

                switch (this.timeRange) {
                    case 5:
                        tick.ticks(d3.time.minutes, 1);
                        break;
                    case 10:
                        tick.ticks(d3.time.minutes, 2);
                        break;
                    case 60:
                        tick.ticks(d3.time.minutes, 10);
                        break;
                    case 360:
                        tick.ticks(d3.time.hours, 1);
                        break;
                    case 1440:
                        tick.ticks(d3.time.hours, 4);
                        break;
                }

                return tick;
            },

            getTicks: function () {
                var tick = d3.svg.axis().scale(this.x).orient("bottom")
                    .tickSize(10, 0)

                switch (this.timeRange) {
                    case 5:
                        tick.ticks(d3.time.seconds, 15);
                        break;
                    case 10:
                        tick.ticks(d3.time.seconds, 30);
                        break;
                    case 60:
                        tick.ticks(d3.time.minutes, 5);
                        break;
                    case 360:
                        tick.ticks(d3.time.minutes, 30);
                        break;
                    case 1440:
                        tick.ticks(d3.time.hours, 1);
                        break;
                }

                return tick;
            },

            getSmallTicks: function () {
                var tick = d3.svg.axis().scale(this.x).orient('bottom')
                    .tickSize(5, 0)

                switch (this.timeRange) {
                    case 5:
                        tick.ticks(d3.time.seconds, 5)
                        break;
                    case 10:
                        tick.ticks(d3.time.seconds, 5)
                        break;
                    case 60:
                        tick.ticks(d3.time.minutes, 1);
                        break;
                    case 360:
                        tick.ticks(d3.time.minutes, 5);
                        break;
                    case 1440:
                        tick.ticks(d3.time.minutes, 20);
                        break;
                }

                return tick;
            },

            drawAxis: function (domain) {
                var that = this;
                if (domain === undefined) {
                    this.currentDomain = this.dateDomain(this.timeRange);
                    this.currentDomain[0] = this.currentDomain[0] - 1000*60*60;
                    this.currentDomain[1] = this.currentDomain[1] + 1000*60*60;
                }

                this.removedBufferDomain = this.removeBufferDomain(this.currentDomain , this.timeRange);
                this.x = d3.time.scale()
                    .domain(this.currentDomain)
                    .range([-this.width, this.width*2]);
                this.setupDomain(this.currentDomain);

                if (this.axisContainer === undefined) {
                    this.axisContainer = this.mainContainer.append("g")
                        .attr('transform', 'translate(0, 75)')
                        .attr('class', 'axis');

                    var $parentEl, $inoutEl = $(".inouts");
                    if ($inoutEl.length) {
                        $parentEl = $inoutEl.parent();
                        $parentEl.append($inoutEl.detach());
                    }
                }

                var dateTickAxis = this.axisContainer.append("g")
                    .attr('class', 'date-tick-axis')
                    .call(this.getDateTicks())
                    .call(function(){
                        var ticks = this.selectAll(".tick")[0];
                        ticks.forEach(function (tick) {
                            var textNode = $(tick).find('text');
                            var text = textNode.text();
                            var textWidth, locationX;
                            if (textNode && textNode[0]) {
                                textWidth = textNode[0].getBoundingClientRect().width + 6;
                            } else {
                                textWidth = 0;
                            }
                            locationX = -(textWidth / 2);

                            if(text.length > 0){
                                d3.select(tick).insert('rect', 'text').attr({ x: locationX, y: 12, width: textWidth, height: 14, fill: "#555"});
                            }
                        });
                    });

                this.axisContainer.selectAll(".date-tick-axis .tick")
                    .attr('transform', adjustDateLocation.bind(this));

                var bigTickAxis = this.axisContainer.append("g")
                    .attr('class', 'big-tick-axis')
                    .call(this.getBigTicks());

                var tickAxis = this.axisContainer.append("g")
                    .attr('class', 'tick-axis')
                    .call(this.getTicks());

                var smallTickAxis = this.axisContainer.append("g")
                    .attr('class', 'small-tick-axis')
                    .call(this.getSmallTicks());
                var cvrBG = this.svg.select('.cvrBG').attr('width', this.width).attr("height","50px");
                var cvrBG2 = this.svg.select('.cvrBG2').attr('width', this.width).attr("height","50px").attr("z-index","999");
                var that = this;

                cvrBG.on('click', function (){
                    newTimelineDragCnt=0;
                    if(firstDataLoadingFlag == false){
                        alert("타임라인 데이터를 불러오고 있습니다.");
                        return;
                    }
                    if(dragFlag == false){
                        liveReloadCnt = 0;
                        statusCheck = 0;
                        var mouseLocation = d3.mouse(this);
                        var selectedTime = that.x.invert(mouseLocation[0]);
                        if(serviceDateTime > selectedTime.valueOf()){
                            return;
                        }
                        dblClicklive = that.isLive;
                        dblClickTime = that.currentTime.valueOf();
                        thumnailDraw = true;
                        dragThumCancle = false;
                        timelineClick = true;
                        if ((new Date().getTime()) - that.previousDblClickTime < 500) return; // animating caused by dbl click.


                        var callbackFunc = function() {
                            that.forceDomain = true;
                            that.updateCursor(selectedTime);
                            that.clickedCVRArea(selectedTime);

                            if (that.currentTime.getTime() - Date.now() >= 0) { // 미래를 선택한 경우
                                gEventBus.$emit('go-live');
                                return;
                            }

                        };

                        if (that.checkCVRSeucre()) {
                            if(document.msFullscreenElement) {
                                //that.delegate.pressedExitFullScreenButton();
                            }
                            // that.delegate.play.securePassword = '';
                            // that.delegate.isShowCVRPlayPasswordConfirm = !that.delegate.isShowCVRPlayPasswordConfirm;
                            // that.delegate.cvrPasswordSuccess = callbackFunc;
                        } else {
                            callbackFunc();
                        }
                    }
                }).on('mousemove', function () {
                    var mouseLocation = d3.mouse(this);
                    var selectedTime = that.x.invert(mouseLocation[0]);

                    // if (that.delegate != undefined && typeof(that.delegate.cvrMouseoverEventsNew) === 'function') {
                    //     that.delegate.cvrMouseoverEventsNew(mouseLocation[0], selectedTime);
                    // }
                }).on('mouseout', function () {
                    // if (that.delegate != undefined && typeof(that.delegate.mouseoutEvents) === 'function') {
                    //     that.delegate.mouseoutEvents();
                    // }
                });

                cvrBG2.on('mousemove', function () {
                    $("#time_info_tri").hide();
                    $("#showThumbnailListNew").hide();
                });
            },

            drawCursor: function () {
                var that = this;
                var drag = d3.behavior.drag()
                    .on('dragstart', function () {
                        cursorDragStatus = true;
                        if(firstDataLoadingFlag == false){
                            return;
                        }
                        $("#showThumbnailListNew").hide();
                        $("#time_info_tri").hide();
                        // if (that.delegate !== undefined && that.delegate.cursorDragStart !== undefined) {
                        //     that.delegate.cursorDragStart();
                        // }
                    })
                    .on('drag', function () {
                        cursorDragStatus = true;
                        if(firstDataLoadingFlag == false){
                            alert("타임라인 데이터를 불러오고 있습니다.");
                            return;
                        }
                        var x = currentEvent.x;
                        var time = that.x.invert(x);
                        if(serviceDateTime > time){
                            return;
                        }

                        that.cursor.selectAll('line').attr({x1: x, x2: x});
                        that.cursor.selectAll('cursor').attr({x1: x, x2: x});
                        that.cursor.selectAll('circle').attr({cx: x});

                        // if (that.delegate !== undefined && that.delegate.cursorDragging !== undefined) {
                        //     that.delegate.cursorDragging(time);
                        // }
                    })
                    .on('dragend', function () {
                        cursorDragStatus = false;
                        liveReloadCnt = 0;
                        statusCheck = 0;
                        dragThumCancle = false;
                        if (that.checkCVRSeucre()) {
                            if(document.msFullscreenElement) {
                                //that.delegate.pressedExitFullScreenButton();
                            }
                            // that.delegate.play.securePassword = '';
                            // that.delegate.isShowCVRPlayPasswordConfirm = !that.delegate.isShowCVRPlayPasswordConfirm;
                            // that.delegate.cvrPasswordSuccess = that.delegate.cursorDragEnd;
                        } else {
                            //that.delegate.cursorDragEnd();
                        }
                    });

                this.cursor = this.mainContainer.append('g').attr('class', 'cursor').call(drag);
                //$(".cursor").css("width","10px");
                var currentX = this.x(Date.now())

                this.cursor.append('line')
                    .attr({
                        class: 'mainBack',
                        x1: currentX,
                        x2: currentX,
                        y1: 29,
                        y2: 74,
                    });

                this.cursor.append('line')
                    .attr({
                        class: 'main',
                        x1: currentX,
                        x2: currentX,
                        y1: 29,
                        y2: 74
                    });
                this.cursor.append('circle')
                    .attr({
                        class: 'circle',
                        cx: currentX,
                        cy: 29,
                        r: 6,
                        fill:'white'
                    });
                $(".circle").attr("stroke","red");
                $(".circle").attr("stroke-width","3");
                $(".circle").attr("z-index","1500");
                $(".line").attr("z-index","1500");
            },

            getAllFilteredZonesIds: function(zoneData) {
                // 현재 이벤트 data의 zoneIdxs중 check 된 zoneIndex 여부 확인
                var filteredEventZoneIdsArr = _.map(_.filter(this.alarmZones.eventZones, ['filterMark', 'on']), 'id');
                var filteredMotionZoneIdsArr = _.map(_.filter(this.alarmZones.motionZones, function (o) { return o.filterMark === 'on' && o.id !== '9'; }), 'uid');
                var allFilteredZoneIdsArr = _.concat(filteredEventZoneIdsArr, filteredMotionZoneIdsArr);	// 체크 처리된 모든 zoneId
                var isCheckedDeleteZoneId = _.get(_.find(this.alarmZones.motionZones, ['id', '9']), 'filterMark') === 'on' ? true : false;

                // 삭제된 이벤트가 체크된 경우 이벤트에서 alarmzone으로 설정된 zoneId가 아닌 zoneId 모두를 추출.
                if (isCheckedDeleteZoneId) {
                    var allZoneIdsArr = _.concat(_.map(this.alarmZones.eventZones, 'id'), _.map(_.filter(this.alarmZones.motionZones, function (o) { return o.id !== '9'; }), 'uid'));
                    var deletedZoneIdsArr = _.difference(zoneData, allZoneIdsArr);	// 0, 10000, 20000, motion zoneId를 제외한 존 데이터는 삭제된 이벤트 zone id
                    allFilteredZoneIdsArr = _.concat(allFilteredZoneIdsArr, _.map(_.filter(deletedZoneIdsArr, function (o) {
                        return (o !== "ACCESS_ENTER" && o !== "ACCESS_EXIT" && o !== "SENSOR_TEMP" && o !== "SENSOR_HUMID" && o !== "SENSOR_MOTION" && o !== "SENSOR_MAGNETIC" && o !== "SENSOR_SMOKE" && o !== "SENSOR_GAS" && o !== "SENSOR_PLUG" && o !== "DOORLOCK_EVENT");
                    })));
                }

                if (true) { //TODO: this.inoutFilter
                    allFilteredZoneIdsArr = _.concat(allFilteredZoneIdsArr, ["ACCESS_ENTER", "ACCESS_EXIT"]);
                }
                //TODO: Sensor Zones
                // var i, len = this.sensorZones.length;
                // for (i = 0; i < len; i+=1) {
                //     if (this.sensorZones[i].filterMark === "on") {
                //         allFilteredZoneIdsArr.push(this.sensorZones[i].id);
                //     }
                // }
                return allFilteredZoneIdsArr;
            },

            updateCursor: function (time) {
                var now = Date.now();
                if (time !== undefined) {
                    now = time.valueOf();
                }
                this.cursorTime = now;

                this.svg.select('.cursor').classed('hide', this.nowAnimationg);

                if (typeof(this.x) === 'function') {
                    var currentX = parseInt(this.x(now));

                    this.svg.select('.cursor').selectAll("circle")
                        .attr({
                            cx: currentX
                        });

                    this.svg.select('.cursor').selectAll("line")
                        .attr({
                            x1: currentX,
                            x2: currentX
                        });

                    this.svg.select('.cursor').selectAll("line")
                        .attr({
                            x1: currentX,
                            x2: currentX
                        });

                    var curosEmptyData = 0;

                    if(this.timeRange == 60){
                        curosEmptyData = 200000;
                    }else if(this.timeRange == 360){
                        curosEmptyData = 1200000;
                    }else if(this.timeRange == 1440){
                        curosEmptyData = 4800000;
                    }

                    if (now > this.removedBufferDomain[1]+curosEmptyData) { // 커서가 타임라인 우측에 도착했을때
                        if (this.forceDomain === true) {
                            return this.nextDomain();
                        }
                        this.svg.select('.cursor').classed('hide', true);
                    } else if (now < this.removedBufferDomain[0]-curosEmptyData) { // 커서가 타임라인 좌측에 도착했을때
                        if (this.forceDomain === true) {
                            return this.prevDomain();
                        }
                        this.svg.select('.cursor').classed('hide', true);
                    } else {
                        // if (this.delagate !== undefined && this.delegate.hideCursorNavigation !== undefined) {
                        //     this.delegate.hideCursorNavigation();
                        // }
                    }
                }
            },

            drawRecordBar: function () {
                var that = this;
                if(changeTimeRangeClick == true){
                    $(".cvr").empty();
                }
                changeTimeRangeClick = false;
                if(this.cvrData != undefined){
                    var bars = this.cvrs.selectAll('.record-bar').data(this.cvrData).enter()
                        .append('rect').attr({
                            class: 'record-bar',
                            x: function(d) {
                                if(parseInt(d.startTime) < serviceDateTime){
                                    d.startTime = serviceDateTime;
                                }

                                if(parseInt(d.startTime) < serviceDateTime){
                                    d.startTime = serviceDateTime;
                                }

                                var thatX = that.x(d.startTime);
                                //serviceDateTime
                                return thatX;
                            },
                            y: 69,
                            width: function(d) {
                                thatEnd = that.x(d.endTime);
                                thatStart = that.x(d.startTime);

                                var thatWidth = that.x(d.endTime) - that.x(d.startTime);

                                if(thatWidth.toString == "NaN"){
                                    return 0;
                                }

                                if(thatWidth < 0){
                                    thatWidth = 0;
                                }
                                return thatWidth;
                            },
                            height: 5
                        });
                }
            },

            drawEvents: function () {
                var that = this;
                var filteredData = [];
                var t = 0;
                var accessData = [];
                zoneId = 0;
                timelineMap = new HashMap();
                timelineSgidMap = new HashMap();
                timelineSgidWidthMap = new HashMap();

                if(this.eventData != undefined){
                    this.eventData.forEach(function (d) {
                        var allFilteredZoneIds = that.getAllFilteredZonesIds(d.zoneIdxs.split(","));
                        var isCheckedEvent = _.intersection(d.zoneIdxs.split(","), allFilteredZoneIds);	// 필터 체크된 이벤트 데이터인지 확인

                        if (parseInt(d.endTime) <= parseInt(Date.now()) && isCheckedEvent.length > 0) {
                            // var zons = d.zoneIdxs.split(",");
                            timelineSgidMap.put("zone" + zoneId, d.sgid);
                            var idx = 0;
                            // var timelineZoneUid = 0;
                            var zoneIdx = 0;
                            // for(var i=zons.length-1;i>=0;i--){

                            var obj = {};

                            obj.detectType= "motion";
                            obj.id = d.id;
                            obj.startTime = d.startTime;

                            if(parseInt(d.endTime) == 0){
                                d.endTime = Date.now().toString();
                                obj.sgid = "1";
                            }else{
                                obj.endTime =  d.endTime;
                                obj.sgid = d.sgid;
                            }

                            // timelineZoneUid = isCheckedEvent[0];

                            // if(timelineZoneUid.toString() =="NaN"){
                            // 	timelineZoneUid = 9;
                            // }

                            if (_.map(that.alarmZones.eventZones, 'id').indexOf(isCheckedEvent[0]) > -1) {
                                // 가족 출입, 소리 이벤트 인 경우 id 그대로
                                zoneIdx = isCheckedEvent[0];
                            } else {
                                // 모션존인 경우 uid로 id 찾기
                                zoneIdx = _.get(_.find(that.alarmZones.motionZones, function (o) { return o.uid === isCheckedEvent[0] && o.id !== '9'; }), 'id');
                            }

                            if (isCheckedEvent[0] && isCheckedEvent[0].indexOf) {
                                if (isCheckedEvent[0].indexOf("ACCESS") > -1) {
                                    obj.detectType = "inout";
                                } else if (isCheckedEvent[0].indexOf("SENSOR") > -1 || isCheckedEvent[0].indexOf("DOORLOCK") > -1) {
                                    obj.detectType = "sensor";
                                }
                            }

                            // obj.color = timelineColor[zoneIdx];
                            obj.color = that.timelineColorObj[zoneIdx];
                            obj.index = isCheckedEvent[0];
                            // obj.index = d.zoneIdxs[0];
                            obj.idx = "zone" + zoneId + " num" + zoneIdx;

                            // if (isCheckedEvent.indexOf("10000") > -1 || isCheckedEvent.indexOf("20000") > -1) {
                            // 	accessData.push(obj);
                            // }
                            var thatXCheck = that.x(d.startTime);
                            var thatWidthCheck = that.x(d.endTime) - that.x(d.startTime);

                            if(that.isFullScreen){
                                if(thatWidthCheck >= 0 ){
                                    filteredData.push(obj);
                                }
                            }else{
                                if(thatWidthCheck >= 0 ){
                                    filteredData.push(obj);
                                }
                            }
                            // }
                            zoneId++;
                        }
                    });
                }

                this.accessIcons.selectAll("image.accessIcons").data(accessData).enter()
                    .append("svg:image")
                    .attr("xlink:href", "./resources/im/ic_timeline_color07_N.png")
                    .attr({
                        x: function(d) {
                            return (that.x(d.startTime) + that.x(d.endTime)) / 2 - 7;
                        },
                        y: 20,
                        width: 14,
                        height: 18
                    });

                var motions = this.motionEvents.selectAll('.event-bar').data(filteredData.filter(function (d){
                    return (d.endTime !== undefined && d.detectType !== "inout" && d.detectType !== "sensor")
                })).enter()
                    .append('rect').attr({
                        class: function(d) { return ['event-bar', d.detectType, d.idx].join(' '); },
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }
                            if(parseInt(d.startTime) < serviceDateTime){
                                d.startTime = serviceDateTime;
                            }
                            return that.x(d.startTime);
                        },
                        y: 40,
                        i: function (d) { return d.index },
                        fill: function (d) {
                            if(d.color == null || d.color == "null"){
                                // return "#929292";
                                return "#f0f0f0";
                            }
                            return d.color
                        },
                        width: function(d) {
                            var thatX = that.x(d.startTime);
                            var thatWidth = that.x(d.endTime) - that.x(d.startTime);

                            timelineSgidWidthMap.put([thatX,thatX + (thatWidth)],d.sgid);

                            return thatWidth;
                        },
                        height: 28
                    }).style({
                        'stroke' : function (d) {
                            if(d.color == null || d.color == "null"){
                                return "#999999";
                            }
                        },
                        'stroke-dasharray' : function (d) {
                            if(d.color == null || d.color == "null"){
                                return "1, 3";
                            }
                        },
                        'stroke-width' : function (d) {
                            if(d.color == null || d.color == "null"){
                                return "1";
                            }
                        }
                    });

                var audios = this.audioEvents.selectAll('.event-bar').data(filteredData.filter(function (d){
                    return d.detectType === 'audio'
                })).enter()
                    .append('rect').attr({
                        class: function(d) { return "event-bar audio"},
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }
                            if(parseInt(d.startTime) < serviceDateTime){
                                d.startTime = serviceDateTime;
                            }
                            if(that.x(d.startTime) < 40){
                                return 40;
                            }
                            return that.x(d.startTime);
                        },
                        y: 27,
                        i: function (d) { return d.index },
                        fill: function (d) {
                            if(d.color == null || d.color == "null"){
                                return "#929292";
                            }
                            return d.color
                        },
                        width: function(d) {
                            var thatX = that.x(d.startTime);
                            var thatWidth = that.x(d.endTime) - that.x(d.startTime);
                            timelineSgidWidthMap.put([thatX,thatX + (thatWidth)],d.sgid);
                            return thatWidth;
                        },
                        height: 36,
                    });

                var inouts = this.inoutEvents.selectAll('image').data(filteredData.filter(function(d) {
                    return d.detectType === 'inout';
                })).enter()
                    .append('svg:image').attr({
                        class: function(d) { return "event-bar inout"},
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }
                            if(parseInt(d.startTime) < serviceDateTime){
                                d.startTime = serviceDateTime;
                            }
                            return that.x(d.startTime) - 16;
                        },
                        y: 68,
                        width : 32,
                        height : 15
                    }).attr("xlink:href", function (d) {
                        if (d.index === "ACCESS_ENTER") {
                            return "./resources/img/ic-timeline-in.png";
                        } else if (d.index === "ACCESS_EXIT") {
                            return "./resources/img/ic-event-out.png";
                        }
                    });

                var sensors = this.sensorEvents.selectAll('image').data(filteredData.filter(function(d) {
                    return d.detectType === 'sensor';
                })).enter()
                    .append('svg:image').attr({
                        class: function(d) { return "event-bar sensor"},
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }
                            if(parseInt(d.startTime) < serviceDateTime){
                                d.startTime = serviceDateTime;
                            }
                            return that.x(d.startTime) - 12;
                        },
                        y: 42,
                        width : 24,
                        height : 24
                    }).attr("xlink:href", function (d) {
                        if (d.index === "SENSOR_TEMP") {
                            return "./resources/img/ic-timeline-temp.png";
                        } else if (d.index === "SENSOR_HUMID") {
                            return "./resources/img/ic-timeline-hum.png";
                        } else if (d.index === "SENSOR_MOTION") {
                            return "./resources/img/ic-timeline-motion.png";
                        } else if (d.index === "SENSOR_MAGNETIC") {
                            return "./resources/img/ic-timeline-magnet.png";
                        } else if (d.index === "DOORLOCK_EVENT") {
                            return "./resources/img/ic-timeline-doorlock.png";
                        } else if (d.index === "SENSOR_GAS") {
                            return "./resources/img/ic-timeline-gas.png";
                        } else if (d.index === "SENSOR_SMOKE") {
                            return "./resources/img/ic-timeline-smoke.png";
                        } else if (d.index === "SENSOR_PLUG") {
                            return "./resources/img/ic-timeline-plug.png";
                        }
                    });

                var scales = this.motionEvents.selectAll('.event-bar').data(filteredData.filter(function (d){ return d.detectType === 'scale' })).enter()
                    .append('rect').attr({
                        class: function(d) {
                            return "event-bar " + d.detectType;
                        },
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }
                            if(parseInt(d.startTime) < serviceDateTime){
                                d.startTime = serviceDateTime;
                            }

                            if (d.count  < that.scaleAvg * 0.5) {
                                return that.x(d.startTime) + 3;
                            } else if (d.count < that.scaleAvg * 0.9) {
                                return that.x(d.startTime) + 2.5;
                            } else if (d.count >= that.scaleAvg * 0.9 && d.count <= this.scaleAvg * 1.1) {
                                return that.x(d.startTime) + 2;
                            } else if (d.count > that.scaleAvg * 1.5) {
                                return that.x(d.startTime) + 1;
                            } else {
                                return that.x(d.startTime) + 1.5;
                            }

                        },
                        y: 27,
                        width: function(d) {
                            if (d.count  < that.scaleAvg * 0.5) {
                                return that.x(d.endTime) - that.x(d.startTime) - 6;
                            } else if (d.count < that.scaleAvg * 0.9) {
                                return that.x(d.endTime) - that.x(d.startTime) - 5;
                            } else if (d.count >= that.scaleAvg * 0.9 && d.count <= this.scaleAvg * 1.1) {
                                return that.x(d.endTime) - that.x(d.startTime) - 4;
                            } else if (d.count > that.scaleAvg * 1.5) {
                                return that.x(d.endTime) - that.x(d.startTime) - 2;
                            } else {
                                return that.x(d.endTime) - that.x(d.startTime) - 3;
                            }
                        },
                        height: 38,
                    });

                var eventMouseover = function (d) {
                    // if (that.delegate != undefined && typeof(that.delegate.cvrMouseoverEventsNew) === 'function') {
                    //     that.delegate.cvrMouseoverEventsNew(d, this);
                    // }
                };

                var eventMouseout = function (d) {
                    // if (that.delegate != undefined && typeof(that.delegate.mouseoutEvents) === 'function') {
                    //     that.delegate.mouseoutEvents();
                    // }
                };

                var imageDraw = function(d){};

                var eventClick = function (d) {
                    if ((new Date().getTime()) - that.previousDblClickTime < 500) return; // animating caused by dbl click.

                    var selectedTime = new Date(parseInt(d.startTime));
                    that.forceDomain = true;
                    that.clickedCVRArea(selectedTime);
                    that.updateCursor(selectedTime);
                };
            },

            updateAccessIcons: function (duration) {
                var that = this;

                if (duration === undefined) {
                    duration = 500;
                }
                duration = duration * 2;

                this.svg.selectAll("image.accessIcons")
                    .transition()
                    .duration(duration)
                    .attr({
                        x: function(d) {
                            return (that.x(d.startTime) + that.x(d.endTime)) / 2;
                        },
                        y: 20,
                        width: 14,
                        height: 18
                    })
                    .each('end', function () {
                    });
            },

            updateEvents: function (duration) {
                var that = this;

                if (duration === undefined) {
                    duration = 500;
                }
                duration = duration * 2;

                this.svg.selectAll('.event-bar')
                    .transition()
                    .duration(duration)
                    .attr({
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }

                            if(parseInt(d.startTime) < serviceDateTime){
                                d.startTime = serviceDateTime;
                            }

                            return that.x(d.startTime);
                        },
                        y: 40,
                        i: function (d) { return d.index },
                        fill: function (d) {
                            if(d.color == null || d.color == "null"){
                                return "#f0f0f0";
                            }
                            return d.color
                        },
                        width: function(d) {
                            var thatX = that.x(d.startTime);
                            var thatWidth = that.x(d.endTime) - that.x(d.startTime);

                            timelineSgidWidthMap.put([thatX,thatX + (thatWidth)],d.sgid);

                            return thatWidth;
                        },
                        height: 28,
                    }).style({
                    'stroke' : function (d) {
                        if(d.color == null || d.color == "null"){
                            return "#999999";
                        }
                    },
                    'stroke-dasharray' : function (d) {
                        if(d.color == null || d.color == "null"){
                            return "1, 3";
                        }
                    },
                    'stroke-width' : function (d) {
                        if(d.color == null || d.color == "null"){
                            return "1";
                        }
                    }
                }).each('end', function () {
                });
            },

            redrawEvents: function (events, avg) {
                if(changeTimeRangeClick == true){
                    var that = this;
                    this.scaleAvg = avg;
                    this.eventData = events;

                    setTimeout(function(){
                        $(".accessIcons").empty();
                        $(".motions").empty();
                        $(".inouts").empty();
                        $(".sensors").empty();
                        $(".audios").empty();
                        $(".motions").fadeIn(200);
                        that.drawEvents();
                        changeTimeRangeClick = false;
                        thumnailViewFlag = true;
                        removeWidthStop = false;
                    },180);
                }else{
                    this.scaleAvg = avg;
                    this.eventData = events;

                    $(".accessIcons").empty();
                    $(".motions").empty();
                    $(".inouts").empty();
                    $(".sensors").empty();
                    $(".audios").empty();
                    this.drawEvents();
                    removeWidthStop = false;
                    changeTimeRangeClick = false;

                    setTimeout(function(){
                        $(".motions").fadeIn(200);
                    },180);
                }
            },

            emptyData: function () {
                this.accessIcons.selectAll('img').remove();
                this.motionEvents.selectAll('rect').remove();
                this.audioEvents.selectAll('rect').remove();
                this.inoutEvents.selectAll('img').remove();
                this.sensorEvents.selectAll('img').remove();
                this.scaleEvents.selectAll('rect').remove();
                this.cvrs.selectAll('.record-bar').remove();
            },

            updateAxis: function (duration, flag) {
                var that = this;

                if (duration === undefined) {
                    duration = 500;
                }
                this.axisContainer.selectAll(".date-tick-axis .tick rect").remove()

                if(flag == "drag"){
                    that.svg.select(".date-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getDateTicks())
                        .call(function(){
                            var ticks = this.selectAll(".tick")[0];
                            ticks.forEach(function (tick) {
                                var textNode = $(tick).find('text');
                                var text = textNode.text();
                                var textWidth, locationX;
                                if (textNode && textNode[0]) {
                                    textWidth = textNode[0].getBoundingClientRect().width + 6;
                                } else {
                                    textWidth = 0;
                                }
                                locationX = -(textWidth / 2);
                                if(text.length > 0){
                                    d3.select(tick).insert('rect', 'text').attr({ x: locationX, y: 12, width: textWidth, height: 14, fill: "#555"});
                                }
                            });

                            this.selectAll(".date-tick-axis .tick").attr('transform', adjustDateLocation.bind(that));
                        });

                    that.svg.select(".big-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getBigTicks());

                    that.svg.select(".tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getTicks())
                        .each('end', function () {});

                    that.svg.select(".small-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getSmallTicks());

                    if(dragEndStatus == true){
                        setTimeout(function(){
                            dragThumCancle = false;
                        },380);

                        dragEndStatus = false;
                    }else{
                        $(".motions").fadeOut(150);
                        $(".accessIcons").empty();
                        $(".motions").empty();
                        $(".inouts").empty();
                        $(".sensors").empty();
                        $(".audios").empty();
                        setTimeout(function(){
                            $(".motions").fadeIn(200);
                        },380);

                        $("#timebar_area").hide();
                        setTimeout(function(){
                            $("#timebar_area").show();
                        },90);
                    }
                } else{
                    that.svg.select(".date-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getDateTicks())
                        .call(function(){
                            var ticks = this.selectAll(".tick")[0];
                            ticks.forEach(function (tick) {
                                var textNode = $(tick).find('text');
                                var text = textNode.text();
                                var textWidth, locationX;
                                if (textNode && textNode[0]) {
                                    textWidth = textNode[0].getBoundingClientRect().width + 6;
                                } else {
                                    textWidth = 0;
                                }
                                locationX = -(textWidth / 2);
                                if(text.length > 0){
                                    d3.select(tick).insert('rect', 'text').attr({ x: locationX, y: 12, width: textWidth, height: 14, fill: "#555"});
                                }
                            });

                            this.selectAll(".date-tick-axis .tick").attr('transform', adjustDateLocation.bind(that));
                        });

                    that.svg.select(".big-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getBigTicks());

                    that.svg.select(".tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getTicks())
                        .each('end', function () {});

                    that.svg.select(".small-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getSmallTicks())
                        .each('end', function () {});
                }
            },

            updateBar: function (duration) {
                var that = this;

                if (duration === undefined) {
                    duration = 0;
                }

                this.svg.selectAll('.record-bar')
                    .transition()
                    .duration(duration)
                    .attr({
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }

                            if(parseInt(d.startTime) < serviceDateTime){
                                d.startTime = serviceDateTime;
                            }

                            var thatX = that.x(d.startTime);

                            return thatX;
                        },
                        width: function(d) {
                            thatEnd = that.x(d.endTime);
                            thatStart = that.x(d.startTime);

                            thatWidth = thatEnd - thatStart;

                            if(thatWidth < 0){
                                thatWidth = 0;
                            }

                            return thatWidth;
                        }
                    })
                    .each('end', function () {
                    });
            },

            hideCursor: function () {
                this.svg.select('.cursor').classed('hide', true);
            },

            showCursor: function () {
                this.svg.select('.cursor').classed('hide', false);
            }
        }
    }
</script>

<style lang="less">
    #timeline_table {
        .timebar{width:100%; padding-top: 2px;}
        .timebar div.timebar_area{height:85px; margin-left:12px; margin-right:12px; text-align:center !important; margin-bottom:15px;}/*11-24*/
        .timebar div.timebar_area_cloud{background:#f6f6f6; height:130px; margin-left:12px; margin-right:12px; text-align:center !important; margin-bottom:15px;}
        .timebar div.timebar_area_cloud img{margin-top:34px;}

        svg {
            overflow: hidden;
        }

        .cvrBG {
            fill: transparent;
        }

        .cvrBG2 {
            fill: transparent;
        }

        .big-tick-axis path {
            fill: none;
        }

        .axis-bottom-line {
            stroke: none;
            stroke-width: 2px;
        }

        .date-tick-axis line {
            display: none;
        }

        .date-tick-axis text {
            font-family: Dotum,Apple SD Gothic Neo,AppleGothic,Apple Gothic,Malgun Gothic,NanumGothic,Arial,sans-serif;
            font-size: 12px;
            fill: #ffffff;
        }

        .big-tick-axis line {
            fill: none;
            stroke: #4a94eb;
            stroke-width: 2px;
            shape-rendering: crispEdges;
        }

        .big-tick-axis text {
            font-family: Dotum,Apple SD Gothic Neo,AppleGothic,Apple Gothic,Malgun Gothic,NanumGothic,Arial,sans-serif;
            font-size: 12px;
            fill: #777;
        }

        .prev-date-tick-axis path, .prev-date-tick-axis line, .next-date-tick-axis path, .next-date-tick-axis line {
            fill: none;
        }

        .tick-axis path, .tick-axis line, .small-tick-axis line {
            fill: none;
            stroke: #4a94eb;
            stroke-width: 1px;
            shape-rendering: crispEdges;
        }

        .tick-axis path {
            stroke-width: 2px;
        }

        .tick-axis text, .small-tick-axis text {
            display: none;
        }

        svg .cursor line {
            fill: none;
            shape-rendering: crispEdges;

        }

        svn .cursor circle{
            border-radius: 50%;
            width: 200px;
            height: 200px;
            stroke: red;
            fill: none;
        }



        svg .cursor .main {
            fill: red;
            stroke: red;
            cursor: ew-resize;
            stroke-width: 4px;
        }

        svg .mainBack {
            cursor: ew-resize;
            stroke: rgba(255, 0, 0, 0);
            stroke-width: 13px;
        }



        svg .cursor .bounds {
            fill: red;
            opacity: 0.2;
        }



        svg .record-bar {
            fill: #97caff;
            cursor: pointer;
        }

        svg .record-back {
            fill: transparent;
            cursor: pointer;
        }

        svg .event-bar {
            pointer-events: all;
            cursor: pointer;

        }

        svg .event-bar.scale {
            fill: #7d66ff;
        }

        svg .event-bar.scale1 {
            fill: #a6d7e4;
        }

        svg .event-bar.scale2 {
            fill: rgb(99, 191, 218);
        }

        svg .event-bar.scale3 {
            fill: rgb(13, 176, 227);
        }

        svg .event-bar.scale4 {
            fill: rgb(0, 152, 199);
        }

        svg .event-bar.scale5 {
            fill: rgb(0, 123, 161);
        }

        svg .event-bar.audio {
            fill: rgb(24, 181, 123);
        }

        /* full screen */
        /*:-webkit-full-screen .cvrBG { fill: rgba(255, 255, 255, 0.7); }*/
        :-webkit-full-screen .axis-bottom-line { stroke: #5d767f; }
        :-webkit-full-screen .record-bar { fill: #97caff; }

        /*:-moz-full-screen .cvrBG { fill: rgba(255, 255, 255, 0.7); }*/
        :-moz-full-screen .axis-bottom-line { stroke: #5d767f; }
        :-moz-full-screen .record-bar { fill: #97caff; }

        /*:-ms-fullscreen .cvrBG { fill: rgba(255, 255, 255, 0.7); }*/
        :-ms-fullscreen .axis-bottom-line { stroke: #5d767f; }
        :-ms-fullscreen .record-bar { fill: #97caff; }


        /* 직원 출입관리 타임라인 영역 시작 */
        .access-axis .x-big-axis line,.access-axis .x-big-axis path {
            stroke: #777;
            stroke-width: 2px;
            shape-rendering: crispEdges;
        }

        .access-axis .x-axis,.access-axis .x-small-axis line {
            stroke: #777;
            stroke-width: 1px;
            shape-rendering: crispEdges;
        }

        .access-axis .x-big-axis text {
            font-family: roboto,Dotum,Apple SD Gothic Neo,AppleGothic,Apple Gothic,Malgun Gothic,NanumGothic,Arial,sans-serif;
            font-size: 12px;
            fill: #999;
            letter-spacing: -0.5px;
            font-weight: normal;
        }

        .access-axis .x-axis text, .access-axis .x-small-axis text {
            display: none;
        }

        .access-event .access-bar {
            fill: #a2c7ef; height: 8px; y: 91;
        }
    }
</style>