<template>
    <div id="event_move_btn_wrap" class="event_move" v-show="(!fullMode || (fullMode && isFullScreen && !isExpiredCloud)) && cameraData.recorderType != 'nvr'">
        <div class="event_move_box">
            <li class="ar_L" @click="goPrevEvent()"><button></button></li>
            <li class="txt">{{$t('CAMERA_EVENT_MOVE')}}</li>
            <li class="ar_R" @click="goNextEvent()"><button></button></li>
        </div>
    </div>
</template>

<script>
    import store from '../../service/player/store';
    import toastcamAPIs from './../../service/toastcamAPIs';

    export default {
        name: 'eventMoveBtn',
        props: ['fullMode'],
        computed: {
            cameraData: function () {
                return store.state.cameraData;
            },
            isFullScreen: function () {
                return store.state.isFullScreen;
            },
            isExpiredCloud: function () {
                return store.getters.isExpiredCloud;
            },
            serviceDay: function () {
                return store.state.serviceDay;
            },
            cvrData: function () {
                return store.state.cvrData;
            },
            arrEvents: function () {
                return store.state.arrEvents;
            },
            currentTime: function () {
                return store.state.currentTime;
            }
        },
        data: function () {
            return {
                currentPrevTime: 1,
                currentNextTime: 1
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
        },
        methods : {
            goPrevEvent: function() {
                var that = this;
                var callbackFunc = function() {
                    if (that.cameraData.recordType == "event") {
                        var findTime = 0;
                        var cvrData = that.cvrData;
                        if (cvrData && cvrData.length) {
                            var i, len, curTime;
                            len = cvrData.length;
                            curTime = that.currentTime.getTime();
                            for (i = 0; i < len; i+=1) {
                                if (curTime > parseInt(cvrData[i].startTime, 10) && curTime <= parseInt(cvrData[i].endTime, 10)) {
                                    findTime = cvrData[i].startTime;
                                    break;
                                }
                            }
                            if (findTime === 0) {
                                findTime = that.currentTime.valueOf();
                            }
                        } else {
                            findTime = that.currentTime.valueOf();
                        }
                        toastcamAPIs.call(toastcamAPIs.camera.FIND_CVR, {cameraId: that.cameraData.id, cvrId: findTime, findDirection: 'previous'}, (cvrData) => {
                            if (cvrData && cvrData.cvr && cvrData.cvr.start && cvrData.cvr.end) {
                                that.$emit('event', {event: 'play', data: parseInt(cvrData.cvr.start, 10)});
                            } else {
                                that.$emit('event', {event: 'noPrevEvent'});
                            }
                        }, (err) => {
                            that.$emit('event', {event: 'noPrevEvent'});
                        });
                    } else {
                        var currentTime = parseInt(that.currentTime.valueOf());
                        var prevTime = 0;
                        var arrEvents = that.arrEvents;

                        if (arrEvents) {
                            arrEvents.filter(function(obj){
                                var allFilteredZoneIds = store.getters.getAllFilteredZonesIds(obj.zoneIdxs.split(","));
                                var isCheckFilter = allFilteredZoneIds.filter(item => obj.zoneIdxs.split(",").includes(item)).length;
                                if (isCheckFilter > 0) {
                                    var startTime = parseInt(obj.playStartTime || obj.startTime);
                                    if(startTime < currentTime && startTime > prevTime && that.currentPrevTime != startTime) {
                                        prevTime = startTime;
                                    }
                                }
                            });
                        }
                        if(prevTime != 0){
                            that.currentPrevTime = prevTime;
                            that.$emit('event', {event: 'play', data: parseInt(prevTime, 10)});
                        } else {
                            var regDate = that.cameraData.regDate;
                            var serviceDateTime = (new Date()).valueOf() - (1000*60*60*24*(that.serviceDay));
                            that.$emit('event', {event: 'serviceDateTimeUpdate', data: serviceDateTime});
                            var serviceStartDate = regDate > serviceDateTime ? regDate : serviceDateTime;
                            var goPrevEvent = function (queryTime){
                                var deleteZone = that.motionZones ? that.motionZones.find(item => item.id === 9) : null;
                                var isCheckedDeleteZoneId = (deleteZone && deleteZone.filterMark === 'on') ? true : false;
                                var allFilteredZoneIds = store.getters.getAllFilteredZonesIds();
                                if (isCheckedDeleteZoneId) {
                                    allFilteredZoneIds.push("d");
                                }

                                toastcamAPIs.call(toastcamAPIs.camera.GET_PREV_EVENT_WITH_RANGE, {
                                    cameraId: that.cameraData.id,
                                    scale: '1h',  //playerObj.control.timeline.getData('nowScale'), //TODO:
                                    queryTime: queryTime,
                                    range: 2,
                                    filters: allFilteredZoneIds.join(",")
                                }, (data) => {
                                    var startTime = data.playStartTime || data.startTime;
                                    if(startTime !== undefined && startTime > serviceStartDate){	// 이벤트가 있다면 이동
                                        var allFilteredZoneIds = store.getters.getAllFilteredZonesIds(data.zoneIdxs.split(","));
                                        var isCheckFilter = allFilteredZoneIds.filter(item => data.zoneIdxs.split(",").includes(item)).length;
                                        if (isCheckFilter > 0) {
                                            that.$emit('event', {event: 'play', data: parseInt(startTime, 10)});
                                        } else {
                                            goPrevEvent(queryTime - (1000*60*60*24*2));
                                        }
                                    } else if (startTime === undefined && serviceStartDate < (queryTime - (1000*60*60*24*2))){	// 서비스 기간내인데 range내에 이벤트가 없으면 2일전으로 재검색
                                        goPrevEvent(queryTime - (1000*60*60*24*2));
                                    } else {
                                        that.$emit('event', {event: 'noPrevEvent'});
                                    }
                                }, (err) => {});
                            }
                            goPrevEvent(that.currentTime.valueOf());
                        }
                    }
                };

                this.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode) => {
                    if(isSecureMode){
                        this.$emit('event', {event: 'updateCVRSecureStatus', data: callbackFunc});
                    }else{
                        callbackFunc();
                    }
                }});
            },

            goNextEvent: function() {
                var that = this;
                var callbackFunc = function() {
                    if (that.cameraData.recordType == "event") {
                        var findTime = 0;
                        var cvrData = that.cvrData;
                        if (cvrData && cvrData.length) {
                            var i, len, curTime;
                            len = cvrData.length;
                            curTime = that.currentTime.getTime();
                            for (i = 0; i < len; i+=1) {
                                if (curTime > parseInt(cvrData[i].startTime, 10) && curTime <= parseInt(cvrData[i].endTime, 10)) {
                                    findTime = cvrData[i].endTime;
                                    break;
                                }
                            }
                            if (findTime === 0) {
                                findTime = that.currentTime.valueOf();
                            }
                        } else {
                            findTime = that.currentTime.valueOf();
                        }

                        toastcamAPIs.call(toastcamAPIs.camera.FIND_CVR, {cameraId: that.cameraData.id, cvrId: findTime, findDirection: 'next'}, (cvrData) => {
                            if (cvrData && cvrData.cvr && cvrData.cvr.start && cvrData.cvr.end) {
                                that.$emit('event', {event: 'play', data: parseInt(cvrData.cvr.start, 10)});
                            } else {
                                that.$emit('event', {event: 'noNextEvent'});
                            }
                        }, (err) => {
                            that.$emit('event', {event: 'noNextEvent'});
                        });
                    } else {
                        var currentTime = parseInt(that.currentTime.valueOf());
                        var nextTime = 0;
                        var arrEvents = that.arrEvents;

                        if (arrEvents) {
                            arrEvents.filter(function(obj){
                                var allFilteredZoneIds = store.getters.getAllFilteredZonesIds(obj.zoneIdxs.split(","));
                                var isCheckFilter = allFilteredZoneIds.filter(item => obj.zoneIdxs.split(",").includes(item)).length;
                                if (isCheckFilter > 0) {
                                    var startTime = parseInt(obj.playStartTime || obj.startTime);
                                    if(startTime > currentTime && that.currentNextTime != startTime && ((startTime < nextTime && nextTime != 0) || (startTime > nextTime && nextTime == 0))) {
                                        nextTime = startTime;
                                    }
                                }
                            });
                        }

                        if(nextTime != 0){
                            that.currentNextTime = nextTime;
                            that.$emit('event', {event: 'play', data: parseInt(nextTime, 10)});
                        } else {
                            var goNextEvent = function(queryTime){
                                var deleteZone = that.motionZones ? that.motionZones.find(item => item.id === 9) : null;
                                var isCheckedDeleteZoneId = (deleteZone && deleteZone.filterMark === 'on') ? true : false;
                                var allFilteredZoneIds = store.getters.getAllFilteredZonesIds();
                                if (isCheckedDeleteZoneId) {
                                    allFilteredZoneIds.push("d");
                                }
                                toastcamAPIs.call(toastcamAPIs.camera.GET_NEXT_EVENT_WITH_RANGE, {
                                    cameraId: that.cameraData.id,
                                    scale: '1h', //playerObj.control.timeline.getData('nowScale'), //TODO:
                                    queryTime: queryTime,
                                    range: 2,
                                    filters: allFilteredZoneIds.join(",")
                                }, (data) => {
                                    var nowDate = Date.now();
                                    var startTime = data.playStartTime || data.startTime;
                                    if(startTime !== undefined){
                                        if (parseInt(that.currentTime.valueOf()) >= parseInt(startTime)) {
                                            that.$emit('event', {event: 'noNextEvent'});
                                            return;
                                        }
                                        var allFilteredZoneIds = store.getters.getAllFilteredZonesIds(data.zoneIdxs.split(","));
                                        var isCheckFilter = allFilteredZoneIds.filter(item => data.zoneIdxs.split(",").includes(item)).length;
                                        if (isCheckFilter > 0) {
                                            that.$emit('event', {event: 'play', data: parseInt(startTime, 10)});
                                        } else {
                                            goNextEvent(queryTime + (1000*60*60*24*2));
                                        }
                                    } else if (startTime === undefined && nowDate > queryTime + (1000*60*60*24*2)){
                                        goNextEvent(queryTime + (1000*60*60*24*2));
                                    } else {
                                        that.$emit('event', {event: 'noNextEvent'});
                                    }
                                }, (err) => {
                                });
                            }
                            goNextEvent(that.currentTime.valueOf());
                        }
                    }
                };

                this.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode) => {
                    if(isSecureMode){
                        this.$emit('event', {event: 'updateCVRSecureStatus', data: callbackFunc});
                    }else{
                        callbackFunc();
                    }
                }});
            },

            destroy : function() {
            }
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>