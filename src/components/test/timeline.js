import * as d3 from "d3";


d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

var nowWitdh = 0;

var dragX = 0;

var draging = 0;

var dblClickTime = 0;

var timelineClick = false;

var thumnailViewFlag = false;

var timelineDrawFlag = true;

var dragFlag = false;

var dragEndStatus = false;

var dblClicklive = false;

var changeTimeRangeClick = false;

var startTimeline = 0;

var serivceDayOver = false;

var thatEnd, thatStart;

var timelineColor = ['#18b57b','#ff7900','#3ea1d4','#a4c800','#efd600','#767dff','#ca7af0','#ff76bd','#929292', '#ff1e00']; //초록,주황,파랑,연두,노랑,진한보라,보라,핑크,회색

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

var removeWidth0 = true;

var removeWidth = 0;

var removeWidthStop = true;

var zoneId = 0;
var timelineSgidMap = new HashMap();

class timeline {
    constructor(param) {
        /** param : {elementId, width, height, timeRange, currentCamera, serviceDay, isLive, eventZones, motionZones, inoutFilter, sensorZones, eventCb}  **/
        var that = this;
        this.width = param.width;
        this.height = param.height;
        this.timeRange = param.timeRange;
        this.currentCamera = param.currentCamera;
        this.timelineEventCb = param.eventCb;
        this.serviceDay = param.serviceDay;
        this.isLive = param.isLive;
        this.eventZones = param.eventZones;
        this.motionZones = param.motionZones;
        this.inoutFilter = param.inoutFilter;
        this.sensorZones = param.sensorZones;

        this.serviceDateTime = 0;
        this.cursorDragStatus = false;
        this.firstDataLoadingFlag = false;
        this.clickDateChange = false;
        this.isPlaying = false;
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

        var currentSvg = d3.select("#" + param.elementId + " svg");
        if (currentSvg !== undefined) {
            currentSvg.remove();
        }
        this.svg = d3.select("#" + param.elementId).append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'no-select');

        this.mainContainer = this.svg.append('g').attr({
            'transform': 'translate(0, -19)'
        });

        var cvrBgDrag = this.setDragEvent();

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
        this.currentDomain = timeRange.currentDomain;

        this.svg.on('dblclick', function (){
            that.timelineEventCb('newTimelineDragCntUpdate', 0);
            that.timelineEventCb('dblClickFlagUpdate', true);
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
    }

    setDragEvent () {
        var that = this;

        return d3.behavior.drag()
            .on('dragstart', function () {
                that.timelineEventCb('changeTimeRangeFlagUpdate', true);
                that.timelineEventCb('dragThumCancleUpdate', true);
                that.timelineEventCb('thumnailDrawUpdate', false);
            })
            .on('drag', function () {
                if(timelineDrawFlag == false){
                    return;
                }
                that.timelineEventCb('beforeSgidUpdate', "");
                $("#time_info_tri").hide();
                $("#showThumbnailListNew").hide();
                removeWidthStop = true;
                draging++;

                dragFlag = true;
                var x = 0;
                if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                    x = d3.event.dx;// *2.22;
                }else{
                    x = d3.event.dx;// *1.91;
                }

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
                if (that.currentCamera.recorderType == "nvr") {

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
                    serviceTime = (that.currentCamera.regDate > serviceTime) ? that.currentCamera.regDate - overTime : serviceTime - overTime;
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
                that.timelineEventCb('newTimelineDragCntUpdate', 0);
                that.timelineEventCb('beforeSgidUpdate', "");
                if(dragX < -10){
                }else if(dragX > 10){
                }else{
                    dragFlag = false;
                }

                setTimeout(function(){
                    dragFlag = false;
                    if(timelineClick == false){
                        that.timelineEventCb('lineMoveFlagChanged', true);
                        that.timelineEventCb('dragTimeLineUpdate', true);
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
                    that.timelineEventCb('changeTimeRangeFlagUpdate', false);
                    timelineDrawFlag = true;
                },1410);

                that.timelineEventCb('dragThumCancleUpdate', false);
            });
    }

    setBoundDateFormat (format) {
        this.boundDateFormat = format;
    }

    setTimezone (timezone) {
        if (timezone !== undefined && timezone !== "") {
            var tokens = timezone.split(',');
            this.tz = tokens[2];
        }
    }

    bufferDomain (minutes) {
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
    }

    removeBufferDomain (domain, timeRange) {
        var buffer = NewTimeline.bufferDomain(timeRange);
        var originStart = domain[0] + buffer;
        var originEnd = domain[1] - buffer;

        return [originStart, originEnd];
    }

    bufferCursorCheckDomain (minutes) {
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
    }

    removeBufferCursorCheckDomain (domain, timeRange) {
        var buffer = NewTimeline.bufferCursorCheckDomain(timeRange);
        var originStart = domain[0] + buffer;
        var originEnd = domain[1] - buffer;

        return [originStart, originEnd];
    }

    dateDomain (minutes, ratio) {
        var now = Date.now();

        if (ratio === undefined) {
            ratio = 0.8;
        }

        var ms = minutes * 60 * 1000;
        var start = now - parseInt(ms * (ratio));
        var end = now + parseInt(ms * (1- ratio));

        return NewTimeline.bufferedDomain([start, end], minutes);
    }

    bufferedDomain (domain, minutes) {
        var ticks = {
            1: 0.2,
            5: 1,
            10: 2,
            60: 10,
            360: 60,
            1440: 180
        }

        var ms = ticks[minutes] * 60 * 1000;
        var buffer = NewTimeline.bufferDomain(minutes);
        var newStart = Math.ceil(domain[0] / ms) * ms - buffer;
        var newEnd = (Math.ceil(domain[1] / ms)) * ms + buffer;
        startTimeline = newStart;
        return [newStart, newEnd];
    }

    zoomDomain (time, timeRange) {
        thumnailViewFlag = false;
        this.timeRange = timeRange;
        this.timelineEventCb('timeRangeChanged', this.timeRange);

        var range = 1000*60 * timeRange;
        var diff = timeRange / 2 * 60 * 1000;

        var start = time - diff - diff  *0.8;
        var end = time + diff- diff * 0.8;

        return this.changeDomain(NewTimeline.bufferedDomain([start-range, end+range], timeRange), 500, time);
    }

    dblZoomDomain (time, timeRange) {
        this.timeRange = timeRange;
        this.timelineEventCb('timeRangeChanged', this.timeRange);

        var range = 1000*60 * timeRange;
        var diff = timeRange / 2 * 60 * 1000;

        var start = time - diff - diff  *0.8;
        var end = time + diff- diff * 0.8;

        var newDomain = NewTimeline.bufferedDomain([start-range, end+range], timeRange);
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
            this.timelineEventCb('clickedCVRArea', new Date(dblClickTime));
        }else{
            this.timelineEventCb('goLive');
        }

        return this.changeDomain(newDomain);
    }
//사용안함
    moveDomain (ratio) {
        var diff = parseInt((this.currentDomain[1] - this.currentDomain[0]) * ratio);
        var start = this.currentDomain[0] + diff;
        var end = this.currentDomain[1] + diff;

        return this.changeDomain([start, end]);
    }

//사용안함
    dragDrawDomain (value) {
        this.timelineEventCb('dragThumCancleUpdate', false);
        var diff = 10000 * value;
        var newDomain = [this.currentDomain[0] - diff, this.currentDomain[1] - diff];
        return this.changeDomain(newDomain);
    }

    prevDomain () {
        this.timelineEventCb('newTimelineDragCntUpdate', 0);
        this.timelineEventCb('dragThumCancleUpdate', false);
        var diff = this.timeRange * 60 * 1000;
        var newDomain = [this.currentDomain[0] - diff, this.currentDomain[1] - diff];
        return this.changeDomain(newDomain);
    }

    nextDomain () {
        this.timelineEventCb('newTimelineDragCntUpdate', 0);
        this.timelineEventCb('dragThumCancleUpdate', false);
        var diff = this.timeRange * 60 * 1000;
        var newDomain = [this.currentDomain[0] + diff, this.currentDomain[1] + diff];
        return this.changeDomain(newDomain);
    }

    dragDomain () {
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
    }

    setTimeRange (minutes, callback) {
        this.timeRange = parseInt(minutes);
        this.timelineEventCb('timeRangeChanged', this.timeRange);

        var x = this.svg.select('.cursor').select("line").attr('x1');
        var cursorTime = this.x.invert(x).getTime();

        return this.zoomDomain(cursorTime, minutes);
    }
//사용안함
    domainCenterTime () {
        if (this.currentDomain !== undefined) {
            return (this.currentDomain[0] + this.currentDomain[1])/2 + (this.currentDomain[1] - this.currentDomain[0])/8;
        }

        return undefined;
    }

    setTimeRangeAtDateString (dateString, timeRange) {
        this.timeRange = 1440;
        this.timelineEventCb('timeRangeChanged', this.timeRange);

        var format = d3.time.format("%Y%m%d%H%M%S");

        var startDate = format.parse(dateString + "000000");
        var endDate = format.parse(dateString + "240000");

        var range = 1000*60 * timeRange;

        var startTime = startDate.getTime();
        var endTime = endDate.getTime();
        var newDomain = NewTimeline.bufferedDomain([startTime-range, endTime+range], this.timeRange);

        return this.changeDomain(newDomain);
    }

    changeDomain (domain, duration, time) {
        var $q = this.$q;
        var that = this;
        var deferred = $q.defer();

        this.svg.select('.cursor').classed('hide', true);

        this.currentDomain = domain;
        this.removedBufferDomain = NewTimeline.removeBufferDomain(this.currentDomain , this.timeRange);
        setTimeout(function(){
            that.timelineEventCb('setupDomain', that.currentDomain);
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
        this.updateBar(duration)
        this.updateEvents(duration);
        this.updateAccessIcons(duration);
        setTimeout(function(){

        },500);
        this.nowAnimating = false;

        deferred.resolve();

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

        return deferred.promise;
    }

    changeDragDomain (domain, duration, time) {
        var $q = this.$q;
        var that = this;
        var deferred = $q.defer();

        this.svg.select('.cursor').classed('hide', true);

        this.currentDomain = domain;
        this.removedBufferDomain = NewTimeline.removeBufferDomain(this.currentDomain , this.timeRange);
        this.timelineEventCb('setupDomain', this.currentDomain);

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

        return deferred.promise;
    }
//사용안함
    realAddTimeLine (duration,events,time) {

        this.updateBar(duration);

        if(events != undefined){
            var that = this;
            var $q = this.$q;
            var deferred = $q.defer();

            if (duration === undefined) {
                duration = 0;
            }

            var sortMap = new HashMap();

            for(var i=events.length-1;i>=0;i--){

                if(events[i].detectType == "audio"){
                    return;
                }

                var drawX = 0;
                var drawWidth = 0;
                if(time.startTime >= events[i].startTime){
                    drawX = that.x(time.startTime);
                    drawWidth = that.x(events[i].endTime) - that.x(time.startTime);
                }

                if(time.startTime < events[i].startTime){
                    drawX = that.x(events[i].startTime);
                    drawWidth = that.x(events[i].endTime) - that.x(events[i].startTime);
                }

                d3.select(".motions").append("rect").transition().duration(duration).attr("class", "tempClass")
                    .attr("width", drawWidth)
                    .attr("x", drawX)
                    .attr("i", events[i].index)
                    .attr("y", 27)
                    .attr("height", 36)
                    .style("fill", events[i].color);

                sortMap.put(i,drawWidth);
            }

        }
    }
//사용안함
    addEventData (message) {
        this.eventData.push(message);

        return this.drawEvents();
    }
//사용안함
    addCvrData (message) {
        this.cvrData.push(message);

        return this.drawRecordBar();
    }

    draw () {
        this.drawAxis();
        this.drawCursor();
        this.drawEvents();
    }

    redrawWithWidth (width) {

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
    }

    getDateTicks () {
        var todayWord = this.$translate.instant("EVENT_LIST_DATE_TODAY");
        var yesterdayWord = this.$translate.instant("EVENT_LIST_DATE_YESTERDAY");
        var that = this;
        var tick = d3.svg.axis().scale(this.x).orient("bottom")
            .tickSize(11, 0)
            .tickPadding(3)
            .tickFormat(function (d, i) {
                var md;

                if (that.tz !== undefined) {
                    md = moment(d).tz(that.tz).locale(Util.getBrowserLanguage());
                } else {
                    md = moment(d).locale(Util.getBrowserLanguage());
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
    }

    getBigTicks () {
        var dayWord = this.$translate.instant("EVENT_LIST_DATE_DAY");
        var nightWord = this.$translate.instant("EVENT_LIST_DATE_NIGHT");
        var that = this;
        var tick = d3.svg.axis().scale(this.x).orient("bottom")
            .tickSize(11, 0)
            .tickPadding(3)
            .tickFormat(function (d, i) {
                var md;

                if (that.tz !== undefined) {
                    md = moment(d).tz(that.tz).locale(Util.getBrowserLanguage());
                } else {
                    md = moment(d).locale(Util.getBrowserLanguage());
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
    }

    getTicks () {
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
    }

    getSmallTicks () {
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
    }
//사용안함
    getNextDateTicks () {
        var tick = d3.svg.axis().scale(this.x).orient('top')
            .tickSize(10, 0)
            .tickFormat(d3.time.format("%m월 %d일"));

        tick.ticks(d3.time.hours, 24);

        return tick;
    }

    drawAxis (domain) {
        var that = this;
        if (domain === undefined) {
            this.currentDomain = NewTimeline.dateDomain(this.timeRange);
            this.currentDomain[0] = this.currentDomain[0] - 1000*60*60;
            this.currentDomain[1] = this.currentDomain[1] + 1000*60*60;
        }

        this.removedBufferDomain = NewTimeline.removeBufferDomain(this.currentDomain , this.timeRange);
        this.timelineEventCb('setupDomain', this.currentDomain);

        this.x = d3.time.scale()
            .domain(this.currentDomain)
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
            that.timelineEventCb('newTimelineDragCntUpdate', 0);
            if(that.firstDataLoadingFlag == false){
                that.timelineEventCb('loadingDataAlert');
                return;
            }
            if(dragFlag == false){
                that.timelineEventCb('liveReloadCntUpdate', 0);
                var mouseLocation = d3.mouse(this);
                var selectedTime = that.x.invert(mouseLocation[0]);
                if(that.serviceDateTime > selectedTime.valueOf()){
                    return;
                }
                dblClicklive = that.isLive;
                dblClickTime = that.currentTime.valueOf();
                that.timelineEventCb('thumnailDrawUpdate', true);
                that.timelineEventCb('lineMoveFlagChanged', false);
                that.timelineEventCb('dragThumCancleUpdate', false);
                timelineClick = true;
                that.timelineEventCb('plyBtnStatusChanged', true);
                if ((new Date().getTime()) - that.previousDblClickTime < 500) return; // animating caused by dbl click.


                var callbackFunc = function() {
                    that.forceDomain = true;
                    that.timelineEventCb('clickedCVRArea', selectedTime);

                    that.updateCursor(selectedTime);
                    if (that.currentTime.getTime() - Date.now() >= 0) { // 미래를 선택한 경우
                        that.timelineEventCb('goLive');
                        return;
                    }

                };
                that.timelineEventCb('checkCVRSeucre', function(isSecureMode){
                    if(isSecureMode){
                        if(document.msFullscreenElement) {
                            that.timelineEventCb('pressedExitFullScreenButton');
                        }
                        that.timelineEventCb('updateCVRSecureStatus', callbackFunc);
                        /*  TODO: 사용하는 쪽에서 모두 처리
                        that.delegate.play.securePassword = '';
                        that.delegate.isShowCVRPlayPasswordConfirm = !that.delegate.isShowCVRPlayPasswordConfirm;
                        that.delegate.cvrPasswordSuccess = callbackFunc;
                        */
                    }else{
                        callbackFunc();
                    }
                });
            }

        })
            .on('mousemove', function () {
                var mouseLocation = d3.mouse(this);
                var selectedTime = that.x.invert(mouseLocation[0]);
                that.timelineEventCb('cvrMouseoverEventsNew', {position: mouseLocation[0], time: selectedTime});
            })
            .on('mouseout', function () {
                that.timelineEventCb('mouseoutEvents');
            });

        cvrBG2.on('mousemove', function () {
            $("#time_info_tri").hide();
            $("#showThumbnailListNew").hide();
        });
    }

    drawCursor () {
        var that = this;
        var drag = d3.behavior.drag()
            .on('dragstart', function () {
                that.cursorDragStatus = true;
                if(that.firstDataLoadingFlag == false){
                    return;
                }
                $("#showThumbnailListNew").hide();
                $("#time_info_tri").hide();
                that.timelineEventCb('cursorDragStart');
            })
            .on('drag', function () {
                that.cursorDragStatus = true;
                if(that.firstDataLoadingFlag == false){
                    that.timelineEventCb('loadingDataAlert');
                    return;
                }
                var x = d3.event.x;
                var time = that.x.invert(x);
                if(that.serviceDateTime > time){
                    return;
                }

                that.cursor.selectAll('line').attr({x1: x, x2: x});
                that.cursor.selectAll('cursor').attr({x1: x, x2: x});
                that.cursor.selectAll('circle').attr({cx: x});
                that.timelineEventCb('cursorDragging', time);
            })
            .on('dragend', function () {
                that.timelineEventCb('plyBtnStatusChanged', true);
                that.cursorDragStatus = false;
                that.timelineEventCb('liveReloadCntUpdate', 0);
                that.timelineEventCb('dragThumCancleUpdate', false);
                that.timelineEventCb('checkCVRSeucre', function(isSecureMode){
                    if(isSecureMode){
                        if(document.msFullscreenElement) {
                            that.timelineEventCb('pressedExitFullScreenButton');
                        }
                        that.timelineEventCb('updateCVRSecureStatus');
                        /* TODO: 사용하는 쪽에서 처리
                        that.delegate.play.securePassword = '';
                        that.delegate.isShowCVRPlayPasswordConfirm = !that.delegate.isShowCVRPlayPasswordConfirm;
                        that.delegate.cvrPasswordSuccess = that.delegate.cursorDragEnd;
                        */
                    }else{
                        that.timelineEventCb('cursorDragEnd');
                    }
                });
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
    }

    updateCursor (time) {
        var deferred = this.$q.defer();
        var now = Date.now()
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

            deferred.resolve();
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
                this.timelineEventCb('hideCursorNavigation');
            }
        }

        return deferred.promise;
    }

//사용 안함
    removeWidthZero () {
        removeWidth = setInterval(function(){
            if(removeWidth0 == true && removeWidthStop == false){
                removeWidth0 = false;
                for(var i=0;i<$(".cvr").children("rect").length;i++){
                    if(parseInt($(".cvr").children("rect").eq(i).attr("width")) == 0){
                        $(".cvr").children("rect").eq(i).remove();
                    }
                }
                for(var i=0;i<$(".motions").children("rect").length;i++){
                    if(parseInt($(".motions").children("rect").eq(i).attr("width")) == 0){
                        $(".motions").children("rect").eq(i).remove();
                    }
                }
                removeWidth0 = true;
            }

        },2000);
    }

    drawRecordBar () {
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
    }

    getAllFilteredZonesIds (zoneData) {
        var that = this;
        // 현재 이벤트 data의 zoneIdxs중 check 된 zoneIndex 여부 확인
        var filteredEventZoneIdsArr = _.map(_.filter(that.eventZones, ['filterMark', 'on']), 'id');
        var filteredMotionZoneIdsArr = _.map(_.filter(that.motionZones, function (o) { return o.filterMark === 'on' && o.id !== '9'; }), 'uid');
        var allFilteredZoneIdsArr = _.concat(filteredEventZoneIdsArr, filteredMotionZoneIdsArr);	// 체크 처리된 모든 zoneId
        var isCheckedDeleteZoneId = _.get(_.find(that.motionZones, ['id', '9']), 'filterMark') === 'on' ? true : false;

        // 삭제된 이벤트가 체크된 경우 이벤트에서 alarmzone으로 설정된 zoneId가 아닌 zoneId 모두를 추출.
        if (isCheckedDeleteZoneId) {
            var allZoneIdsArr = _.concat(_.map(that.eventZones, 'id'), _.map(_.filter(that.motionZones, function (o) { return o.id !== '9'; }), 'uid'));
            var deletedZoneIdsArr = _.difference(zoneData, allZoneIdsArr);	// 0, 10000, 20000, motion zoneId를 제외한 존 데이터는 삭제된 이벤트 zone id
            allFilteredZoneIdsArr = _.concat(allFilteredZoneIdsArr, _.map(_.filter(deletedZoneIdsArr, function (o) {
                return (o !== "ACCESS_ENTER" && o !== "ACCESS_EXIT" && o !== "SENSOR_TEMP" && o !== "SENSOR_HUMID" && o !== "SENSOR_MOTION" && o !== "SENSOR_MAGNETIC" && o !== "SENSOR_SMOKE" && o !== "SENSOR_GAS" && o !== "SENSOR_PLUG" && o !== "DOORLOCK_EVENT");
            })));
        }

        if (this.inoutFilter) {
            allFilteredZoneIdsArr = _.concat(allFilteredZoneIdsArr, ["ACCESS_ENTER", "ACCESS_EXIT"]);
        }
        var i, len = this.sensorZones.length;
        for (i = 0; i < len; i+=1) {
            if (this.sensorZones[i].filterMark === "on") {
                allFilteredZoneIdsArr.push(this.sensorZones[i].id);
            }
        }
        return allFilteredZoneIdsArr;
    }

    drawEvents () {
        var that = this;
        var filteredData = [];
        var t = 0;
        var accessData = [];
        zoneId = 0;
        this.timelineEventCb('timelineMapChanged', new HashMap());
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

                    if (_.map(that.eventZones, 'id').indexOf(isCheckedEvent[0]) > -1) {
                        // 가족 출입, 소리 이벤트 인 경우 id 그대로
                        zoneIdx = isCheckedEvent[0];
                    } else {
                        // 모션존인 경우 uid로 id 찾기
                        zoneIdx = _.get(_.find(that.motionZones, function (o) { return o.uid === isCheckedEvent[0] && o.id !== '9'; }), 'id');
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

                    if(fullscreenFlag == true){
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
            return (d.endTime !== undefined && d.detectType !== "inout" && d.detectType !== "sensor")
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
    }

    updateAccessIcons (duration) {
        var that = this;
        var $q = this.$q;
        var deferred = $q.defer();

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
                deferred.resolve();
            });

        return deferred.promise;
    }

    updateEvents (duration) {
        var that = this;
        var $q = this.$q;
        var deferred = $q.defer();

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
        })
            .each('end', function () {
                deferred.resolve();
            });

        return deferred.promise;
    }

    redrawEvents (events, avg) {
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
    }

    emptyData () {
        this.accessIcons.selectAll('img').remove();
        this.motionEvents.selectAll('rect').remove();
        this.audioEvents.selectAll('rect').remove();
        this.inoutEvents.selectAll('img').remove();
        this.sensorEvents.selectAll('img').remove();
        this.scaleEvents.selectAll('rect').remove();
        this.cvrs.selectAll('.record-bar').remove();
    }

    updateAxis (duration, flag) {
        var $q = this.$q;
        var that = this;

        var deferred = $q.defer();

        if (duration === undefined) {
            duration = 500;
        }

        this.axisContainer.selectAll(".date-tick-axis .tick rect").remove()

        if(flag == "drag"){
            var dateTickPromise = $q(function (resolve, reject) {
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
            });

            var bigTickPromise = $q(function (resolve, reject) {
                that.svg.select(".big-tick-axis")
                    .transition()
                    .duration(duration)
                    .call(that.getBigTicks())
            });

            var tickPromise = $q(function (resolve, reject) {
                that.svg.select(".tick-axis")
                    .transition()
                    .duration(duration)
                    .call(that.getTicks())
                    .each('end', function () {
                        resolve();
                    });
            });

            var smallTickPromise = $q(function (resolve, reject) {
                that.svg.select(".small-tick-axis")
                    .transition()
                    .duration(duration)
                    .call(that.getSmallTicks())
            });

            $q.all([dateTickPromise, bigTickPromise, tickPromise, smallTickPromise]).then(function () {
                deferred.resolve();
            });

            if(dragEndStatus == true){
                setTimeout(function(){
                    that.timelineEventCb('dragThumCancleUpdate', false);
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

            return deferred.promise;
        }else{
            var dateTickPromise = $q(function (resolve, reject) {
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
            });

            var bigTickPromise = $q(function (resolve, reject) {
                that.svg.select(".big-tick-axis")
                    .transition()
                    .duration(duration)
                    .call(that.getBigTicks())
            });

            var tickPromise = $q(function (resolve, reject) {
                that.svg.select(".tick-axis")
                    .transition()
                    .duration(duration)
                    .call(that.getTicks())
                    .each('end', function () {
                        resolve();
                    });
            });
            var smallTickPromise = $q(function (resolve, reject) {
                that.svg.select(".small-tick-axis")
                    .transition()
                    .duration(duration)
                    .call(that.getSmallTicks())
                    .each('end', function () {
                        resolve();
                    });
            });
            $q.all([dateTickPromise, bigTickPromise, tickPromise, smallTickPromise]).then(function (a, b) {
                deferred.resolve();
            });

            return deferred.promise;
        }
    }

    updateBar (duration) {
        var that = this;
        var $q = this.$q;
        var deferred = $q.defer();

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

                    thatWidth = thatEnd - thatStart;

                    if(thatWidth < 0){
                        thatWidth = 0;
                    }

                    return thatWidth;
                }
            })
            .each('end', function () {
                deferred.resolve();
            });
        return deferred.promise;
    }
//사용안함
    resetAxis () {
        this.svg.select('.axis').selectAll('g').remove();
        this.drawAxis();
    }
//사용안함
    startBrush () {
        var that = this;

        var brushed = function () {

        }

        var brushend = function () {

        }

        this.brush = d3.svg.brush()
            .x(this.x)
            .on("brush", brushed);
        var now = Date.now();
        this.brush.extent([now - 100000, now]);
        this.mainContainer.append('g').attr('class', 'brush')
            .call(this.brush)
            .selectAll('rect')
            .attr('y', 25)
            .attr('height', 50);
    }

    hideCursor () {
        this.svg.select('.cursor').classed('hide', true);
    }

    showCursor () {
        this.svg.select('.cursor').classed('hide', false);
    }

    setData (key, value) {
        this[key] = value;
    }

    getData (key) {
        return this[key];
    }
}







/*************** Legacy ******************/


