<template>
    <div id="view_timeline_area" class="timeline_area" :class="{timeline_area_full: isFullScreen}">
        <div class="time_bar" id="view_time_bar">
            <div class="timebar_outer toggle">
                <div class="timebar">
                    <div class="thumbnail-container time_info time_info_tri" id="time_info_tri" style="display: none;"></div>
                    <div class="timebar_area" id="timebar_area" style="z-index: 1000; position: relative;"></div>
                </div>
            </div>
        </div>
        <button type="button" id="prevLineBtn" class="sp prev" @click="prevLine()" style="z-index: 1002;"></button>
        <button type="button" id="cursorLeftBtn" class="sp_cursor prev" v-show="isCursorLeft" @click="pressedFindCursorButton('click')" style="z-index: 1000;"></button>
        <button type="button" id="nextLineBtn" class="sp next" @click="nextLine()" style="z-index: 1002;"></button>
        <button type="button" id="cursorRightBtn" class="sp_cursor next" v-show="isCursorRight" @click="pressedFindCursorButton()" style="z-index: 1000;"></button>
    </div>
</template>

<script>
    //import * as d3 from "d3";
    //import {event as currentEvent} from 'd3';
    import toastcamAPIs from './../../service/toastcamAPIs';
    import store from '../../service/player/store';
    //import moment from 'moment';
    //import 'moment-timezone';

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    var nowWitdh = 0, dragX = 0, draging = 0, dblClickTime = 0, timelineClick = false,
        timelineDrawFlag = true, dragFlag = false, dragEndStatus = false, dblClicklive = false, startTimeline = 0,
        serivceDayOver = false, thatEnd, thatStart, browserLang = $("html").attr("lang"), removeWidthStop = true,
        zoneId = 0, timelineSgidMap = new HashMap(), timelineSgidWidthMap = new HashMap(), boundDateFormat = browserLang === 'ja' ? 'M月D日(ddd)' : 'M월 D일(ddd)';

    var getMaxDragX = function(){
        return parseInt($(".cvrBG").attr("width"));
    };

    var getDateTickWidth = function(index) {
        var tick = $('.date-tick-axis .tick text')[index];
        if (tick) {
            return tick.getBoundingClientRect().width;
        }
    };

    var adjustDateLocation = function(d, index) {
        var currentTranslateX = this.x(d.getTime());
        var textWidth = getDateTickWidth(index);
        var margin = 27;
        var adjustedTranslateX = currentTranslateX - (textWidth/2) - margin;
        return 'translate(' + adjustedTranslateX + ', 0)';
    };

    var imageBackgroundLocation = function (index, width, height) {
        if (width === undefined) {
            width = 160;
        }

        if (height === undefined) {
            height = 90;
        }

        var top = 0;
        if (index / 5 >= 1) {
            top = -height;
        }

        var left = (index % 5) * width;

        return { top: top, left: left };
    };

    export default {
        name : 'timeline',
        props : ['elementId', 'playEventCallback'],
        computed : {
            cameraData: function () {
                return store.state.cameraData;
            },
            isPlaying: function () {
                return store.state.isPlaying;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            isLive: function () {
                return store.state.isLive;
            },
            isFullScreen: function () {
                return store.state.isFullScreen;
            },
            isShared: function () {
                return store.state.isShared;
            },
            shopId: function () {
                return store.state.shopId;
            },
            serviceDay: function () {
                return store.state.serviceDay;
            },
            timezone: function () {
                return store.state.timezone;
            },
            currentDomain: function () {
                return store.state.currentDomain;
            },
            cvrData: function () {
                return store.state.cvrData;
            },
            arrEvents: function () {
                return store.state.arrEvents;
            },
            inoutFilter: function () {
                return store.state.inoutFilter;
            },
            sensorZones: function () {
                return store.state.sensorZones;
            },
            eventZones: function () {
                return store.state.eventZones;
            },
            motionZones: function () {
                return store.state.motionZones;
            },
            timeRange: function () {
                return store.state.timeRange;
            }
        },
        data : function() {
            return {
                width: 0,
                height: 0,
                cursorInterval: 1000,
                serviceDateTime: 0,

                dblClickFlag: false,
                cursorOn: false,
                sgid: '',
                beforeSgid: '',
                beforeCheckedLength: 0,
                lastTimestamp: 0,
                isCursorLeft : false,
                isCursorRight : false,
                changeTimeRangeFlag: false,
                timeLineMap: null,
                lastRec : 0,
                lastEvent : 0,
                goCvrStatus : false,
                liveReplayCheck: 0,

                firstDataLoadingFlag: false,
                clickDateChange: false,
                eventData: [],
                cvrArray : [],
                cvrCheck : false,
                forceDomain: true,
                dragTimeLine : false,
                cursorDragStatus : false,
                isLoading: false,
                nowScale : "1h",
                newTimelineDragCnt : 0,
                clickTime : 0,
                cachedTimelineparams : null,
                lineMoveFlag : false,
                timelineColorObj: {0: "#18b57b", 1: "#ff7900", 2: "#3ea1d4", 3: "#a4c800", 4: "#efd600", 5: "#767dff", 6: "#ca7af0",
                    7: "#ff76bd", 9: "#f0f0f0", 10000: "#ff1e00", 20000: "#ff1e00"}
            }
        },
        created : function() {
            this.timeLineMap = new HashMap();
            window.onresize = this.resizeTimline.bind(this);
        },
        mounted : function() {
            this.width = $("#timeline_table").width();
            this.height = $("#timebar_area").height();

            var currentSvg = d3.select("#" + this.elementId + " svg");
            if (currentSvg) {
                currentSvg.remove();
            }
            this.svg = d3.select("#" + this.elementId).append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .attr('class', 'no-select');

            this.mainContainer = this.svg.append('g').attr({
                'transform': 'translate(0, -33)'
            });

            var cvrBgDrag = this.setDragEvent();

            this.accessIcons = this.mainContainer.append('g').attr('class', 'accessIcons');
            this.motionEvents = this.mainContainer.append('g').attr('class', 'motions').attr("transform", "translate(0, -3)");
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
            store.dispatch('CURRENT_DOMAIN_CHANGE', this.timeRange.currentDomain);

            this.initSizeTimline();
            this.draw();

            this.svg.on('dblclick', () => {
                this.dblClickFlag = true;
                this.newTimelineDragCnt = 0;
                var now = new Date();
                $("#time_info_tri").hide();
                if (now.getTime() - this.previousDblClickTime < 500) return;
                this.previousDblClickTime = now.getTime();
                if (this.isLoading) return;

                var cursorTime = this.currentTime.getTime();

                if (cursorTime <= this.currentDomain[0] || cursorTime >= this.currentDomain[1]) {
                    return
                }

                var timeRanges = [10, 60, 360, 1440];

                var current = timeRanges.indexOf(this.timeRange);
                if (current === 0) {
                    this.isDblZooming = true;
                } else if (current === 3) {
                    this.isDblZooming = false;
                }
                var newTimeRange;
                if (this.isDblZooming) {
                    newTimeRange = timeRanges[current + 1];
                } else {
                    newTimeRange = timeRanges[current - 1];
                }

                this.dblZoomDomain(cursorTime, newTimeRange);
            });
        },
        beforeDestroy : function() {
        },
        methods : {
            resizeTimline : function() {
                if(this.isFullScreen === false){
                    this.redrawWithWidth(parseInt($("#view_timeline_ctrl").width()));
                }

                this.$emit('event', {event: 'resize'});
            },

            clickedCVRArea : function(time, status) {
                this.newTimelineDragCnt=0;
                this.$emit('event', {event: 'stopPlayTimer'});
                if(this.isShared == true){
                    this.playEventCallback('shareEnd');
                }

                var currentDomain = this.currentDomain;
                this.setupDomain([currentDomain[0], currentDomain[1]]);
                if(!time || (new Date()).valueOf() < time.valueOf()){
                    this.goLive();
                    return;
                }

                if(this.cursorDragStatus == true){
                    return;
                }

                this.playEventCallback('clickedCVRArea', time);
                setTimeout(() => {
                    this.$emit('event', {event: 'cvrPlayRequest', data: {time, status}});
                },800);
            },

            cvrDrawCheck : function(time) {
                store.dispatch('IS_LIVE_CHANGE', false);
                this.$emit('event', {event: 'camInfoBarChange'});
                var trueCnt = 0;
                this.cvrCheck = false;

                var nextTime = null;
                var cvrData = this.cvrData;
                var currentDomain = this.currentDomain;
                var timeRange = this.timeRange;

                for(var i=0;i<cvrData.length;i++){
                    var startX = parseInt(cvrData[i].startTime);
                    var endX = parseInt(cvrData[i].endTime);

                    if(startX > time.valueOf() && !nextTime){
                        nextTime = startX;
                        this.$emit('event', {event: 'clearPlayerStopTimeout'});
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
                    this.$emit('event', {event: 'noCvr', data: nextTime});
                }
            },

            setupDomain : function(domain) {
                if(this.isShared == true){
                    this.playEventCallback('shareEnd');
                }

                this.cachedTimelineparams = {
                    cameraId: this.cameraData.id,
                    start: domain[0],
                    end: domain[1],
                    shopId: this.shopId
                };

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
                this.isLoading = true;
                if(this.serviceDay != 0){
                    this.serviceDateTime = ((new Date()).valueOf() - (1000*60*60*24*(this.serviceDay)));
                }else{
                    this.serviceDateTime = 0;
                }

                if(this.cachedTimelineparams.start < this.serviceDateTime){
                    this.cachedTimelineparams.start = this.serviceDateTime;
                }

                this.playEventCallback('getAlarmZones');

                var removedBufferDomain = this.removeBufferCursorCheckDomain(domain , this.timeRange);
                if (this.currentTime && (removedBufferDomain[0] > this.currentTime.valueOf())) {
                    this.isCursorLeft = true;
                    this.isCursorRight = false;
                } else if (this.currentTime && (removedBufferDomain[1] < this.currentTime.valueOf())) {
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

            getTimeline : function() {
                const timelineParams = {
                    cameraId: this.cachedTimelineparams.cameraId,
                    scale: this.cachedTimelineparams.scale,
                    start: this.cachedTimelineparams.start,
                    end: this.cachedTimelineparams.end,
                    shopId: this.cachedTimelineparams.shopId,
                };

                if(this.isShared == false){
                    toastcamAPIs.call(toastcamAPIs.camera.GET_TIMELINE, timelineParams, (res) => {
                        this.getRecTimes(res);
                    }, (err) => {
                        this.isLoading = false;
                    });
                }else{
                    toastcamAPIs.call(toastcamAPIs.camera.GET_SHARE_CAM_TIMELINE, timelineParams, (res) => {
                        this.getRecTimes(res);
                    }, (err) => {
                        this.isLoading = false;
                    });
                }
            },

            getRecTimes : function(d) {
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
                this.firstDataLoadingFlag = true;
                this.setTimelineData(d);
            },

            setTimelineData : function(data) {
                if(this.dragTimeLine == true){
                    this.dragTimeLine = false;
                    if (this.isFullScreen) {
                        $("#timebar_area").children("svg").children("g").attr("transform","translate(0, -34)");
                    }else{
                        $("#timebar_area").children("svg").children("g").attr("transform","translate(0, -33)");
                    }
                    $(".cvr").attr("transform","");
                    $(".cursor").attr("transform","");
                    this.playEventCallback('changedSelectedZone');
                }
                store.dispatch('EVENTS_CHANGE', data.events);
                store.dispatch('CVR_DATA_CHANGE', data.recTimes);
                this.drawRecordBar();
                this.updateBar(500);
                this.cvrArray = [];
                this.cvrArray.push($(".cvr").children("rect"));
                this.redrawEvents(data.events, data.avg);
                this.isLoading = false;
                this.playEventCallback('eventsChanged', data.events);
                setTimeout(() => {
                    this.playEventCallback('changedSelectedZone');
                },200);
                this.playEventCallback('changedSelectedZone');
            },

            initSizeTimline : function() {
                var timelineWidth = this.isFullScreen ? $('#fullscreen').width() : $("#view_timeline_ctrl").width();
                this.svg.select('.cursor').classed('hide', true);
                this.redrawWithWidth(parseInt(timelineWidth));
            },

            setDragEvent : function() {
                var that = this;

                return d3.behavior.drag()
                    .on('dragstart', () => {
                        that.changeTimeRangeFlag = true;
                    })
                    .on('drag', () => {
                        if(timelineDrawFlag == false){
                            return;
                        }
                        that.beforeSgid = '';
                        $("#time_info_tri").hide();
                        removeWidthStop = true;
                        draging++;

                        dragFlag = true;
                        var x = d3.event.dx;
                        // if (currentEvent) {
                        //     x = currentEvent.dx;
                        // }

                        serivceDayOver = true;

                        var nowTime = (new Date()).valueOf();

                        var overTime = -0.9870;
                        if(that.timeRange == 60){
                            overTime = -0.918;
                        }else if(that.timeRange == 360){
                            overTime = -0.59;
                        }else if(that.timeRange == 1440){
                            overTime = 0.9;
                        }
                        var serviceTime = 0;
                        if (that.cameraData.recorderType == "nvr") {

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
                            serviceTime = (that.cameraData.regDate > serviceTime) ? that.cameraData.regDate - overTime : serviceTime - overTime;
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
                    .on('dragend', () => {
                        that.beforeSgid = '';
                        that.newTimelineDragCnt = 0;
                        if(dragX < -10){
                        }else if(dragX > 10){
                        }else{
                            dragFlag = false;
                        }

                        setTimeout(() => {
                            dragFlag = false;
                            if(timelineClick == false){
                                that.lineMoveFlag = true;
                                that.dragTimeLine = true;
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

                        setTimeout(() => {
                            that.changeTimeRangeFlag = false;
                            timelineDrawFlag = true;
                        },1410);
                    });
            },

            bufferDomain : function(minutes) {
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

            removeBufferDomain : function(domain, timeRange) {
                var buffer = this.bufferDomain(timeRange);
                var originStart = domain[0] + buffer;
                var originEnd = domain[1] - buffer;

                return [originStart, originEnd];
            },

            bufferCursorCheckDomain : function(minutes) {
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

            removeBufferCursorCheckDomain : function(domain, timeRange) {
                var buffer = this.bufferCursorCheckDomain(timeRange);
                var originStart = domain[0] + buffer;
                var originEnd = domain[1] - buffer;

                return [originStart, originEnd];
            },

            dateDomain : function(minutes, ratio) {
                var now = Date.now();

                if (ratio === undefined) {
                    ratio = 0.8;
                }

                var ms = minutes * 60 * 1000;
                var start = now - parseInt(ms * (ratio));
                var end = now + parseInt(ms * (1- ratio));

                return this.bufferedDomain([start, end], minutes);
            },

            bufferedDomain : function(domain, minutes) {
                var ticks = {
                    1: 0.2,
                    5: 1,
                    10: 2,
                    60: 10,
                    360: 60,
                    1440: 180
                };

                var ms = ticks[minutes] * 60 * 1000;
                var buffer = this.bufferDomain(minutes);
                var newStart = Math.ceil(domain[0] / ms) * ms - buffer;
                var newEnd = (Math.ceil(domain[1] / ms)) * ms + buffer;
                startTimeline = newStart;
                return [newStart, newEnd];
            },

            zoomDomain : function(time, timeRange) {
                store.dispatch('TIME_RANGE_CHANGE', timeRange);

                var range = 1000*60 * timeRange;
                var diff = timeRange / 2 * 60 * 1000;

                var start = time - diff - diff  *0.8;
                var end = time + diff- diff * 0.8;

                return this.changeDomain(this.bufferedDomain([start-range, end+range], timeRange), 500, time);
            },

            dblZoomDomain : function(time, timeRange) {
                store.dispatch('TIME_RANGE_CHANGE', timeRange);

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
                    this.goLive();
                }

                return this.changeDomain(newDomain);
            },

            prevDomain : function() {
                this.$emit('event', {event: 'moveDomain'});
                this.newTimelineDragCnt = 0;
                var diff = this.timeRange * 60 * 1000;
                var newDomain = [this.currentDomain[0] - diff, this.currentDomain[1] - diff];
                return this.changeDomain(newDomain);
            },

            nextDomain : function() {
                this.$emit('event', {event: 'moveDomain'});
                this.newTimelineDragCnt = 0;
                var diff = this.timeRange * 60 * 1000;
                var newDomain = [this.currentDomain[0] + diff, this.currentDomain[1] + diff];
                return this.changeDomain(newDomain);
            },

            dragDomain : function() {
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

                return this.changeDragDomain(newDomain);
            },

            setTimeRange : function(minutes, callback) {
                store.dispatch('TIME_RANGE_CHANGE', parseInt(minutes));

                var x = this.svg.select('.cursor').select(".line").attr('x');
                var cursorTime = this.x.invert(x).getTime();

                return this.zoomDomain(cursorTime, minutes);
            },

            domainCenterTime : function() {
                if (this.currentDomain) {
                    return (this.currentDomain[0] + this.currentDomain[1])/2 + (this.currentDomain[1] - this.currentDomain[0])/8;
                }

                return undefined;
            },

            setTimeRangeAtDateString : function(dateString, timeRange) {
                store.dispatch('TIME_RANGE_CHANGE', 1440);

                var format = d3.time.format("%Y%m%d%H%M%S");

                var startDate = format.parse(dateString + "000000");
                var endDate = format.parse(dateString + "240000");

                var range = 1000*60 * timeRange;

                var startTime = startDate.getTime();
                var endTime = endDate.getTime();
                var newDomain = this.bufferedDomain([startTime-range, endTime+range], 1440);

                return this.changeDomain(newDomain);
            },

            changeDomain : function(domain, duration, time) {
                var range, fixRange, currentDomain;

                this.svg.select('.cursor').classed('hide', true);

                currentDomain = domain;
                store.dispatch('CURRENT_DOMAIN_CHANGE', currentDomain);
                this.removedBufferDomain = this.removeBufferDomain(currentDomain , this.timeRange);
                setTimeout(() => {
                    this.setupDomain(currentDomain);
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
                switch(this.timeRange){
                    case 10:
                        range = 600000;
                        fixRange = 0;
                        break;
                    case 60:
                        range = 600000 * 6;
                        fixRange = 0;
                        break;
                    case 360:
                        range = 600000 * 6 * 6;
                        fixRange = 1055000;
                        break;
                    case 1440:
                        range = 600000 * 6 * 6 * 4;
                        fixRange = 3120000
                        break;
                }

                if(domain[0]+range <= this.currentTime.valueOf() && domain[1]-range >= this.currentTime.valueOf()){
                    if(this.isPlaying == false){
                        $(".cursor").hide();
                        this.svg.select('.cursor').classed('hide', false);
                        $(".cursor").fadeIn(500);
                    }
                }

                if(this.clickDateChange == true){
                    this.clickDateChange = false;
                    setTimeout(function(){
                        $(".motions").empty();
                        $(".audios").empty();
                        $(".inouts").empty();
                        $(".sensors").empty();
                        $(".motions").fadeIn(200);
                    },280);
                }
            },

            changeDragDomain : function(domain, duration, time) {
                var currentDomain;
                this.svg.select('.cursor').classed('hide', true);

                currentDomain = domain;
                store.dispatch('CURRENT_DOMAIN_CHANGE', currentDomain);
                this.removedBufferDomain = this.removeBufferDomain(currentDomain , this.timeRange);
                this.setupDomain(currentDomain);

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
                    this.updateCursor(this.currentTime);
                    this.svg.select('.cursor').classed('hide', false);
                }
            },

            draw : function() {
                this.drawAxis();
                this.drawCursor();
                this.drawEvents();
            },

            redrawWithWidth : function(width) {

                if(width <= 0){
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

            getDateTicks : function() {
                var todayWord = browserLang === 'ja' ? '今日' : '오늘';
                var yesterdayWord = browserLang === 'ja' ? '昨日' : '어제';
                var tick = d3.svg.axis().scale(this.x).orient("bottom")
                    .tickSize(11, 0)
                    .tickPadding(3)
                    .tickFormat((d, i) => {
                        var md;

                        if (this.timezone) {
                            md = moment(d).tz(this.timezone).locale(browserLang);
                        } else {
                            md = moment(d).locale(browserLang);
                        }

                        var now = new Date();
                        var todayCheck = new Date(md.year(), md.month(), md.date());
                        var todayFlag = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                        var dateFormat = boundDateFormat;

                        if(dateFormat === undefined) {
                            dateFormat = "HH:mm";
                        } else if (todayCheck.getTime() == todayFlag.getTime()) {
                            dateFormat = todayWord + "(ddd)";
                        } else if ((todayFlag - todayCheck)/(1000 * 60 * 60 * 24) == 1) {
                            dateFormat = yesterdayWord + "(ddd)";
                        } else {
                            dateFormat = boundDateFormat;
                        }

                        if(this.timeRange == 10){
                            if (parseInt(md.minutes()) % 10 == 0) {
                                return md.format(dateFormat);
                            }else{
                                return "";
                            }
                        }else if(this.timeRange == 60){
                            if (md.minutes() == "00") {
                                return md.format(dateFormat);
                            }else{
                                return "";
                            }
                        }else if(this.timeRange == 360){
                            var formatArr = [2,6,10,14,18,22];
                            if (formatArr.indexOf(md.hours()) > -1)  {
                                return md.format(dateFormat);
                            }else{
                                return "";
                            }
                        }else if(this.timeRange == 1440){
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

            getBigTicks : function() {
                var dayWord = browserLang === 'ja' ? '昼' : '낮';
                var nightWord = browserLang === 'ja' ? '夜' : '밤';
                var that = this;
                var tick = d3.svg.axis().scale(this.x).orient("bottom")
                    .tickSize(11, 0)
                    .tickPadding(3)
                    .tickFormat(function (d, i) {
                        var md;

                        if (that.timezone) {
                            md = moment(d).tz(that.timezone).locale(browserLang);
                        } else {
                            md = moment(d).locale(browserLang);
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

            getTicks : function() {
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

            getSmallTicks : function() {
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

            drawAxis : function(domain) {
                var that = this, currentDomain = this.currentDomain;

                if (domain === undefined) {
                    currentDomain = this.dateDomain(this.timeRange);
                    currentDomain[0] = currentDomain[0] - 1000*60*60;
                    currentDomain[1] = currentDomain[1] + 1000*60*60;
                    store.dispatch('CURRENT_DOMAIN_CHANGE', currentDomain);
                }

                this.removedBufferDomain = this.removeBufferDomain(currentDomain , this.timeRange);
                this.setupDomain(currentDomain);

                this.x = d3.time.scale()
                    .domain(currentDomain)
                    .range([-this.width, this.width*2]);

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
                    .attr('transform', adjustDateLocation.bind(that));

                var bigTickAxis = this.axisContainer.append("g")
                    .attr('class', 'big-tick-axis')
                    .call(that.getBigTicks());

                var tickAxis = this.axisContainer.append("g")
                    .attr('class', 'tick-axis')
                    .call(that.getTicks());

                var smallTickAxis = this.axisContainer.append("g")
                    .attr('class', 'small-tick-axis')
                    .call(that.getSmallTicks());
                var cvrBG = this.svg.select('.cvrBG').attr('width', this.width).attr("height","50px");
                var cvrBG2 = this.svg.select('.cvrBG2').attr('width', this.width).attr("height","50px").attr("z-index","999");

                cvrBG.on('click', function () {
                    that.newTimelineDragCnt = 0;
                    if(that.firstDataLoadingFlag == false){
                        that.playEventCallback('loadingDataAlert');
                        return;
                    }
                    if(dragFlag == false){
                        that.$emit('event', {event: 'liveReloadCntUpdate', data: 0});
                        var mouseLocation = d3.mouse(this);
                        var selectedTime = that.x.invert(mouseLocation[0]);
                        if(that.serviceDateTime > selectedTime.valueOf()){
                            return;
                        }
                        dblClicklive = that.isLive;
                        dblClickTime = that.currentTime.valueOf();
                        that.lineMoveFlag = false;
                        store.dispatch('PLAY_BTN_STATUS_CHANGE', true);
                        timelineClick = true;
                        if ((new Date().getTime()) - that.previousDblClickTime < 500) return; // animating caused by dbl click.

                        var callbackFunc = function() {
                            that.forceDomain = true;
                            that.clickedCVRArea(selectedTime);
                            that.updateCursor(selectedTime);
                            if (that.currentTime.getTime() - Date.now() >= 0) { // 미래를 선택한 경우
                                that.goLive();
                                return;
                            }

                        };

                        that.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode) => {
                            if(isSecureMode){
                                that.$emit('event', {event: 'updateCVRSecureStatus', data: callbackFunc});
                            }else{
                                callbackFunc();
                            }
                        }});
                    }
                }).on('mousemove', function () {
                    var mouseLocation = d3.mouse(this);
                    var selectedTime = that.x.invert(mouseLocation[0]);
                }).on('mouseout', function () {
                });

                cvrBG2.on('mousemove', function () {
                    $("#time_info_tri").hide();
                });
            },

            drawCursor : function() {
                var that = this;
                var drag = d3.behavior.drag()
                    .on('dragstart', () => {
                        that.cursorDragStatus = true;
                        if(that.firstDataLoadingFlag == false){
                            return;
                        }
                        $("#time_info_tri").hide();
                        that.cursorOn = true;
                        that.$emit('event', {event: 'stopPlayTimer'});
                    })
                    .on('drag', () => {
                        that.cursorDragStatus = true;
                        if(that.firstDataLoadingFlag == false){
                            that.playEventCallback('loadingDataAlert');
                            return;
                        }
                        var x = d3.event.x;
                        var time = that.x.invert(x);
                        if(that.serviceDateTime > time){
                            return;
                        }
                        that.cursor.selectAll('.line').attr({x: x});
                        store.dispatch('CURRENT_TIME_CHANGE', time);
                    })
                    .on('dragend', () => {
                        store.dispatch('PLAY_BTN_STATUS_CHANGE', true);
                        that.cursorDragStatus = false;
                        that.$emit('event', {event: 'liveReloadCntUpdate', data: 0});
                        that.$emit('event', {event: 'checkCVRSeucre', data: function(isSecureMode){
                                if(isSecureMode){
                                    that.$emit('event', {event: 'updateCVRSecureStatus', data: function() {that.cursorDragEnd();}});
                                }else{
                                    that.cursorDragEnd();
                                }
                            }});
                    });
                this.cursor = this.mainContainer.append('g').attr('class', 'cursor').call(drag);
                //$(".cursor").css("width","10px");
                var currentX = this.x(Date.now())

                this.cursor.append('svg:image').attr({
                    class: function(d) { return "line"},
                    x: currentX,
                    y: 34,
                    width : 14,
                    height : 40
                }).attr("xlink:href", function (d) {
                    return "/resources/img/ic-detail-indicator.png";
                });
                $(".line").attr("z-index","1500");
            },

            updateCursor : function(time) {
                var now = Date.now()
                if (time) {
                    now = time.valueOf();
                }
                this.cursorTime = now;

                this.svg.select('.cursor').classed('hide', this.nowAnimationg);

                if (typeof(this.x) === 'function') {
                    var currentX = parseInt(this.x(now));
                    this.svg.select('.cursor').selectAll(".line")
                        .attr({
                            x: currentX
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
                        this.isCursorLeft = false;
                        this.isCursorRight = false;
                    }
                }
            },

            drawRecordBar : function() {
                var that = this;
                if(this.changeTimeRangeClick == true){
                    $(".cvr").empty();
                }
                this.changeTimeRangeClick = false;
                if(this.cvrData != undefined){
                    var bars = this.cvrs.selectAll('.record-bar').data(this.cvrData).enter()
                        .append('rect').attr({
                            class: 'record-bar',
                            x: function(d) {
                                if(that.x(d.startTime).toString == "NaN"){

                                }

                                if(parseInt(d.startTime) < that.serviceDateTime){
                                    d.startTime = that.serviceDateTime;
                                }

                                if(parseInt(d.startTime) < that.serviceDateTime){
                                    d.startTime = that.serviceDateTime;
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

            drawEvents : function() {
                var that = this;
                var filteredData = [];
                var t = 0;
                var accessData = [];
                zoneId = 0;
                this.timeLineMap = new HashMap();
                timelineSgidMap = new HashMap();
                timelineSgidWidthMap = new HashMap();

                if(this.eventData != undefined){
                    this.eventData.forEach(function (d) {
                        var allFilteredZoneIds = store.getters.getAllFilteredZonesIds(d.zoneIdxs.split(","));
                        var isCheckedEvent = d.zoneIdxs.split(",").filter(item => allFilteredZoneIds.includes(item));

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

                            if (that.eventZones.map(item => item.id).indexOf(isCheckedEvent[0]) > -1) {
                                // 가족 출입, 소리 이벤트 인 경우 id 그대로
                                zoneIdx = isCheckedEvent[0];
                            } else {
                                // 모션존인 경우 uid로 id 찾기
                                var findZone = that.motionZones.find(item => item.uid === isCheckedEvent[0] && item.id !== '9');
                                zoneIdx = findZone && findZone.id ? findZone.id : 0;
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
                            if(thatWidthCheck >= 0 ){
                                filteredData.push(obj);
                            }
                            zoneId++;
                        }
                    });
                }

                this.accessIcons.selectAll("image.accessIcons").data(accessData).enter()
                    .append("svg:image")
                    .attr("xlink:href", "/resources/im/ic_timeline_color07_N.png")
                    .attr({
                        x: function(d) {
                            return (that.x(d.startTime) + that.x(d.endTime)) / 2 - 7;
                        },
                        y: 20,
                        width: 14,
                        height: 18
                    });

                var motions = this.motionEvents.selectAll('.event-bar').data(filteredData.filter(function (d){
                    return (d.endTime && d.detectType !== "inout" && d.detectType !== "sensor")
                })).enter()
                    .append('rect').attr({
                        class: function(d) { return ['event-bar', d.detectType, d.idx].join(' '); },
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }
                            if(parseInt(d.startTime) < that.serviceDateTime){
                                d.startTime = that.serviceDateTime;
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
                            timelineSgidWidthMap.put([thatX,thatX + (thatWidth)], d.sgid);
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
                            if(parseInt(d.startTime) < that.serviceDateTime){
                                d.startTime = that.serviceDateTime;
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
                            timelineSgidWidthMap.put([thatX,thatX + (thatWidth)], d.sgid);
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
                            if(parseInt(d.startTime) < that.serviceDateTime){
                                d.startTime = that.serviceDateTime;
                            }
                            return that.x(d.startTime) - 16;
                        },
                        y: 68,
                        width : 32,
                        height : 15
                    }).attr("xlink:href", function (d) {
                        if (d.index === "ACCESS_ENTER") {
                            return "/resources/img/ic-timeline-in.png";
                        } else if (d.index === "ACCESS_EXIT") {
                            return "/resources/img/ic-event-out.png";
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
                            if(parseInt(d.startTime) < that.serviceDateTime){
                                d.startTime = that.serviceDateTime;
                            }
                            return that.x(d.startTime) - 12;
                        },
                        y: 42,
                        width : 24,
                        height : 24
                    }).attr("xlink:href", function (d) {
                        if (d.index === "SENSOR_TEMP") {
                            return "/resources/img/ic-timeline-temp.png";
                        } else if (d.index === "SENSOR_HUMID") {
                            return "/resources/img/ic-timeline-hum.png";
                        } else if (d.index === "SENSOR_MOTION") {
                            return "/resources/img/ic-timeline-motion.png";
                        } else if (d.index === "SENSOR_MAGNETIC") {
                            return "/resources/img/ic-timeline-magnet.png";
                        } else if (d.index === "DOORLOCK_EVENT") {
                            return "/resources/img/ic-timeline-doorlock.png";
                        } else if (d.index === "SENSOR_GAS") {
                            return "/resources/img/ic-timeline-gas.png";
                        } else if (d.index === "SENSOR_SMOKE") {
                            return "/resources/img/ic-timeline-smoke.png";
                        } else if (d.index === "SENSOR_PLUG") {
                            return "/resources/img/ic-timeline-plug.png";
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
                            if(parseInt(d.startTime) < that.serviceDateTime){
                                d.startTime = that.serviceDateTime;
                            }

                            if (d.count  < that.scaleAvg * 0.5) {
                                return that.x(d.startTime) + 3;
                            } else if (d.count < that.scaleAvg * 0.9) {
                                return that.x(d.startTime) + 2.5;
                            } else if (d.count >= that.scaleAvg * 0.9 && d.count <= that.scaleAvg * 1.1) {
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
                            } else if (d.count >= that.scaleAvg * 0.9 && d.count <= that.scaleAvg * 1.1) {
                                return that.x(d.endTime) - that.x(d.startTime) - 4;
                            } else if (d.count > that.scaleAvg * 1.5) {
                                return that.x(d.endTime) - that.x(d.startTime) - 2;
                            } else {
                                return that.x(d.endTime) - that.x(d.startTime) - 3;
                            }
                        },
                        height: 38,
                    });
            },

            updateAccessIcons : function(duration) {
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

            updateEvents : function(duration) {
                var that = this;

                if (duration === undefined) {
                    duration = 500;
                }
                duration = duration * 2;

                if (this.eventData) {
                    var filteredData = this.eventData.filter(function (d) {

                        var checkData = checkFilters.get(d.index);
                        if(checkData != undefined){
                            return d.startTime > that.removedBufferDomain[0] && d.endTime < that.removedBufferDomain[1];
                        }
                    });
                }

                this.svg.selectAll('.event-bar')
                    .transition()
                    .duration(duration)
                    .attr({
                        x: function(d) {
                            if(that.x(d.startTime).toString == "NaN"){

                            }

                            if(parseInt(d.startTime) < that.serviceDateTime){
                                d.startTime = that.serviceDateTime;
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
                            timelineSgidWidthMap.put([thatX,thatX + (thatWidth)], d.sgid);

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
                })
                    .each('end', function () {
                    });
            },

            redrawEvents : function(events, avg) {
                if(this.changeTimeRangeClick == true){
                    this.scaleAvg = avg;
                    this.eventData = events;

                    setTimeout(() => {
                        $(".accessIcons").empty();
                        $(".motions").empty();
                        $(".inouts").empty();
                        $(".sensors").empty();
                        $(".audios").empty();
                        $(".motions").fadeIn(200);
                        this.drawEvents();
                        this.changeTimeRangeClick = false;
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
                    this.changeTimeRangeClick = false;

                    setTimeout(function(){
                        $(".motions").fadeIn(200);
                    },180);
                }
            },

            emptyData : function() {
                this.accessIcons.selectAll('img').remove();
                this.motionEvents.selectAll('rect').remove();
                this.audioEvents.selectAll('rect').remove();
                this.inoutEvents.selectAll('img').remove();
                this.sensorEvents.selectAll('img').remove();
                this.scaleEvents.selectAll('rect').remove();
                this.cvrs.selectAll('.record-bar').remove();
            },

            updateAxis : function(duration, flag) {
                var that = this;

                if (duration === undefined) {
                    duration = 500;
                }

                this.axisContainer.selectAll(".date-tick-axis .tick rect").remove();

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
                        .each('end', function () {
                        });

                    that.svg.select(".small-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getSmallTicks());

                    if(dragEndStatus == true){
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
                }else{
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
                        .each('end', function () {
                        });

                    that.svg.select(".small-tick-axis")
                        .transition()
                        .duration(duration)
                        .call(that.getSmallTicks())
                        .each('end', function () {
                        });
                }
            },

            updateBar : function(duration) {
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

                            if(parseInt(d.startTime) < that.serviceDateTime){
                                d.startTime = that.serviceDateTime;
                            }

                            var thatX = that.x(d.startTime);

                            return thatX;
                        },
                        width: function(d) {
                            thatEnd = that.x(d.endTime);
                            thatStart = that.x(d.startTime);

                            var thatWidth = thatEnd - thatStart;

                            if(thatWidth < 0){
                                thatWidth = 0;
                            }

                            return thatWidth;
                        }
                    })
                    .each('end', function () {
                    });
            },

            hideCursor : function() {
                this.svg.select('.cursor').classed('hide', true);
            },

            showCursor : function() {
                this.svg.select('.cursor').classed('hide', false);
            },

            requestPlay : function (time, status) {
                if (time) {
                    this.goCvr(time, status);
                } else {
                    this.goLive();
                }
            },

            goCvr : function(time, status) {
                this.$emit('event', {event: 'stopPlayTimer'});
                var tmpX = 9999;

                if(time == undefined){
                    this.updateCursor(this.currentTime);
                    var cursorX = parseFloat($(".cursor").children(".line").attr("x1"));
                    for(var i=0; i<this.cvrArray[0].length; i++){
                        if(cursorX < parseFloat(this.cvrArray[0].eq(i).attr("x"))){
                            var x = parseFloat(this.cvrArray[0].eq(i).attr("x"));
                            if(tmpX >= x){
                                tmpX = x;
                                time = this.x.invert(x).getTime()+1000;
                            }
                        }
                    }
                }

                if(time == undefined){
                    this.updateCursor(this.currentTime);
                    if(this.cvrArray[0].length-1 > 0){
                        var x = parseFloat(this.cvrArray[0].eq(this.cvrArray[0].length-1).attr("x"));
                        if(tmpX >= x){
                            tmpX = x;
                            time = this.getData('x').invert(x).getTime()+1000;
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
                        //this.cameraData.lastEventDate = data.lastEventStartTime;
                        //this.cameraData.lastRecDate = data.lastRectStartTime;

                        var videoDateFormat = this.$i18n.t('CAMERA_DETAIL_EVENT_DATE_FORMAT');
                        var videoTimeFormat = this.$i18n.t('CAMERA_DETAIL_EVENT_TIME_FORMAT');

                        var lastRecMoment = moment(this.cameraData.lastRecDate);
                        //this.cameraData.lastRecDateString = lastRecMoment.locale($("html").attr("lang")).format(videoDateFormat);
                        //this.cameraData.lastRecTimeString = lastRecMoment.locale($("html").attr("lang")).format(videoTimeFormat);

                        var date = new Date(data.lastRectStartTime);
                        this.changeTimeRangeClick = true;
                        this.$emit('event', {event: 'cameraStatusAllOff'});
                        store.dispatch('CURRENT_TIME_CHANGE', date);
                        this.zoomDomain(data.lastRectStartTime, timeRange);
                        this.goCvrStatus = true;
                        this.clickedCVRArea(date, status);
                    });
                }else{
                    var date = new Date(time);
                    this.changeTimeRangeClick = true;
                    this.$emit('event', {event: 'cameraStatusAllOff'});
                    store.dispatch('CURRENT_TIME_CHANGE', date);
                    this.zoomDomain(date.getTime(), timeRange);
                    this.goCvrStatus = true;
                    this.clickedCVRArea(date, status);
                }
            },

            goLive : function() {
                this.newTimelineDragCnt=0;
                store.dispatch('IS_LIVE_CHANGE', true);
                this.$emit('event', {event: 'camInfoBarChange'});
                this.$emit('event', {event: 'cameraStatusAllOff'});
                store.dispatch('CURRENT_TIME_CHANGE', new Date());
                this.changeTimeRangeClick = true;

                this.lineMoveFlag = false;
                this.zoomDomain(Date.now(), this.timeRange);
                this.$emit('event', {event: 'startLiveTimer'});
                this.livePlayDataSet();
            },

            livePlayDataSet : function(check){
                this.$emit('event', {event: 'cameraStatusAllOff'});
                store.dispatch('PLAY_BTN_STATUS_CHANGE', true);

                toastcamAPIs.call(this.isShared ? toastcamAPIs.camera.GET_SHARE_CAMERA_DETAIL : toastcamAPIs.camera.GET_CAMERA_DETAIL, {cameraId: this.cameraData.id}, (cameraData) => {
                    store.dispatch('CAMERA_DATA_CHANGE', cameraData);
                    this.$emit('event', {event: 'livePlayRequest'});
                    this.livePlayConfigDataSet(check);
                });
            },

            livePlayConfigDataSet : function(check){
                var cameraStatus = true;
                this.$emit('event', {event: 'updateErrorStatus', data: check});

                if(this.cameraData.controlStatus === "CS" || this.cameraData.controlStatus === "on") {
                    if (this.cameraData.recordType != "event") {
                        if (this.cameraData.streamStatus == "off" && check != 'NetStream.Play.Stop') {
                            cameraStatus = false;
                        } else {
                            cameraStatus = true;
                        }
                    }
                } else if(this.cameraData.controlStatus === "CE" || this.cameraData.controlStatus === "off"){
                    if(this.cameraData.streamStatus == "off"){
                        cameraStatus = false;
                    } else {
                        cameraStatus = true;
                    }
                }

                if(check == 'NetStream.Play.Stop' || check=="changeRec"){
                    this.liveReplayCheck+=1;
                    if(check == 'NetStream.Play.Stop'){
                        setTimeout(() => {
                            this.$emit('event', {event: 'livePlayRequest'});
                        }, 2000);
                    }else{
                        setTimeout(() => {
                            if(this.liveReplayCheck < 20 && cameraStatus == false){
                                this.livePlayDataSet();
                            }else{
                                cameraStatus = true;
                                this.liveReplayCheck = 0;
                                store.dispatch('IS_PLAYING_CHANGE', true);
                                this.$emit('event', {event: 'startLiveTimer'});
                            }
                        }, 5000);
                    }
                }
            },

            jumpToCvrWithSeconds : function(seconds) {
                if (seconds > 0 && this.isLive) {
                    return;
                }

                var findTime = this.currentTime.valueOf() + seconds * 1000;
                if (findTime > new Date()) {
                    this.goLive();
                } else {
                    var that = this;
                    var callbackFunc = function() {
                        var findTime = that.currentTime.valueOf() + seconds * 1000;
                        //var direction = seconds > 0 ? 'next' : 'previous';
                        that.$emit('event', {event: 'cvrPlayRequest', data: {time : new Date(findTime)}});

                        // toastcamAPIs.call(toastcamAPIs.camera.FIND_CVR, {cameraId: that.cameraData.id, cvrId: findTime, findDirection: direction}, (cvrData) => {
                        //     if (cvrData && cvrData.cvr && cvrData.cvr.start && cvrData.cvr.end) {
                        //         that.$emit('event', {event: 'cvrPlayRequest', data: {time : parseInt(cvrData.cvr.start, 10)}});
                        //     } else {
                        //         return;
                        //     }
                        // }, (err) => {
                        //     return;
                        // });
                    };
                    this.$emit('event', {event: 'clearPlayerStop'});
                    this.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode) => {
                        if(isSecureMode){
                            that.$emit('event', {event: 'updateCVRSecureStatus', data: callbackFunc});
                        }else{
                            callbackFunc();
                        }
                    }});
                }
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
                                this.$emit('event', {event: 'cvrPlayRequest', data: {time : parseInt(cvrData.cvr.start, 10)}});
                            } else {
                                this.goLive();
                            }
                        }, (err) => {
                            this.goLive();
                        });
                    }
                };
                this.$emit('event', {event: 'clearPlayerStop'});
                this.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode) => {
                    if(isSecureMode){
                        this.$emit('event', {event: 'updateCVRSecureStatus', data: callbackFunc.bind(this)});
                    }else{
                        callbackFunc();
                    }
                }});
            },

            cursorDragEnd : function () {
                var curosEmptyData = 0;
                this.cursorOn = false;
                this.lineMoveFlag = false;

                this.$emit('event', {event: 'cameraStatusAllOff'});
                if (this.currentTime.getTime() - Date.now() >= 0) {
                    this.goLive();
                    return;
                }

                this.clickedCVRArea(this.currentTime);

                var now = Date.now();
                var removedBufferDomain = this.removedBufferDomain;
                var right = parseInt(removedBufferDomain[1]);
                var left =  parseInt(removedBufferDomain[0]);
                var x = this.svg.select('.cursor').select(".line").attr('x');
                var cursorTime = this.x.invert(x).getTime();
                var timeRange = this.timeRange;
                if(timeRange == 60){
                    curosEmptyData = 200000;
                }else if(timeRange == 360){
                    curosEmptyData = 1200000;
                }else if(timeRange == 1440){
                    curosEmptyData = 4800000;
                }

                if(cursorTime < left-curosEmptyData){
                    this.prevDomain();
                }

                if(cursorTime > right+curosEmptyData){
                    this.nextDomain();
                }
            },

            pressedFindCursorButton : function (check) {
                this.isCursorRight = false;
                this.isCursorLeft = false;
                this.newTimelineDragCnt = 0;
                if(check=="click"){
                    this.dblClickFlag = false;
                }
                this.$emit('event', {event: 'timerCursorIdxChange', data: 0});
                this.lineMoveFlag = true;
                this.changeTimeRangeClick = true;
                if(this.dblClickFlag == false){
                    this.zoomDomain(this.currentTime.valueOf(), this.timeRange);
                }
            },

            prevLine : function(click){
                var nowTime = (new Date()).valueOf();
                var overTime = -0.9870;
                var timeRange = this.timeRange;
                if(timeRange == 60){
                    overTime = -0.918;
                }else if(timeRange == 360){
                    overTime = -0.59;
                }else if(timeRange == 1440){
                    overTime = 0.9;
                }
                var serviceTime = (nowTime - (1000*60*60*24*(this.serviceDay+overTime)));
                if(serviceTime > this.removedBufferDomain[0]){
                    return;
                }
                this.dblClickFlag = false;
                this.changeTimeRangeClick = true;
                this.lineMoveFlag = true;
                this.prevDomain();
                if(this.isPlaying == true){
                    setTimeout(() => {
                        if(this.isLive == false){
                            this.$emit('event', {event: 'startRecTimer', data: this.currentTime.valueOf()});
                        }
                    },1050);
                }
            },

            nextLine : function(click){
                this.dblClickFlag = false;
                this.changeTimeRangeClick = true;
                this.lineMoveFlag = true;
                this.nextDomain();
                if(this.isPlaying == true){
                    setTimeout(() => {
                        if(this.isLive == false){
                            this.$emit('event', {event: 'startRecTimer', data: this.currentTime.valueOf()});
                        }
                    },1050);
                }
            },

            setData : function(key, value) {
                this[key] = value;
            },

            getData : function(key) {
                return this[key];
            },

            destroy : function() {
                window.onresize = null;
            }
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>
