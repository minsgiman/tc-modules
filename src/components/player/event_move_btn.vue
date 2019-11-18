<template>
    <div id="event_move_btn_wrap" class="event_move" v-show="(!fullMode || (fullMode && isFullScreen && !isExpiredCloud)) && cameraData.recorderType != 'nvr'">
        <div class="event_move_box">
            <li class="ar_L" @click="goPrevEvent()"><button></button></li>
            <li class="txt">{{$t('CAMERA_EVENT_MOVE')}}</li>
            <li class="ar_R" @click="goNextEvent()"><button></button></li>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';
    import toastcamAPIs from './../../service/toastcamAPIs';

    @Component
    export default class EventMoveBtn extends Vue {
        @Prop() timeline!: any;
        @Prop() fullMode!: any;

        get cameraData() {
            return store.state.cameraData;
        }
        get isFullScreen() {
            return store.state.isFullScreen;
        }
        get isExpiredCloud() {
            return store.getters.isExpiredCloud;
        }
        get serviceDay() {
            return store.state.serviceDay;
        }
        get cvrData() {
            return store.state.cvrData;
        }
        get arrEvents() {
            return store.state.arrEvents;
        }
        get currentTime() {
            return store.state.currentTime;
        }

        currentPrevTime: any = 1;
        currentNextTime: any = 1;

        goPrevEvent() {
            const that: any = this;
            const callbackFunc = function() {
                if (that.cameraData.recordType == "event") {
                    let findTime = 0;
                    const cvrData = that.cvrData;
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
                    toastcamAPIs.call(toastcamAPIs.camera.FIND_CVR, {cameraId: that.cameraData.id, cvrId: findTime, find: 'previous'}, (cvrData: any) => {
                        if (cvrData && cvrData.cvr && cvrData.cvr.start && cvrData.cvr.end) {
                            that.$emit('event', {event: 'play', data: parseInt(cvrData.cvr.start, 10)});
                        } else {
                            that.$emit('event', {event: 'noPrevEvent'});
                        }
                    }, (err: any) => {
                        that.$emit('event', {event: 'noPrevEvent'});
                    });
                } else {
                    const currentTime = parseInt(that.currentTime.valueOf() as any, 10);
                    let prevTime = 0;
                    let arrEvents = that.arrEvents;

                    if (arrEvents) {
                        arrEvents.filter((obj: any) => {
                            const allFilteredZoneIds = store.getters.getAllFilteredZonesIds(obj.zoneIdxs.split(","));
                            const isCheckFilter = allFilteredZoneIds.filter((item: any) => obj.zoneIdxs.split(",").includes(item)).length;
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
                        that.$emit('event', {event: 'play', data: parseInt(prevTime as any, 10)});
                    } else {
                        const regDate = that.cameraData.regDate;
                        const serviceDateTime = (new Date()).valueOf() - (1000*60*60*24*(that.serviceDay));
                        that.$emit('event', {event: 'serviceDateTimeUpdate', data: serviceDateTime});
                        const serviceStartDate = regDate > serviceDateTime ? regDate : serviceDateTime;
                        const goPrevEvent = (queryTime: any) => {
                            var deleteZone = that.motionZones ? that.motionZones.find((item: any) => item.id === 9) : null;
                            var isCheckedDeleteZoneId = (deleteZone && deleteZone.filterMark === 'on') ? true : false;
                            var allFilteredZoneIds = store.getters.getAllFilteredZonesIds();
                            if (isCheckedDeleteZoneId) {
                                allFilteredZoneIds.push("d");
                            }

                            toastcamAPIs.call(toastcamAPIs.camera.GET_PREV_EVENT_WITH_RANGE, {
                                cameraId: that.cameraData.id,
                                scale: that.timeline.getData('nowScale'),
                                queryTime: queryTime,
                                range: 2,
                                filters: allFilteredZoneIds.join(",")
                            }, (data: any) => {
                                var startTime = data.playStartTime || data.startTime;
                                if(startTime !== undefined && startTime > serviceStartDate){	// 이벤트가 있다면 이동
                                    var allFilteredZoneIds = store.getters.getAllFilteredZonesIds(data.zoneIdxs.split(","));
                                    var isCheckFilter = allFilteredZoneIds.filter((item: any) => data.zoneIdxs.split(",").includes(item)).length;
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
                            }, (err: any) => {});
                        }
                        goPrevEvent(that.currentTime.valueOf());
                    }
                }
            };

            this.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode: any) => {
                if(isSecureMode){
                    this.$emit('event', {event: 'updateCVRSecureStatus', data: callbackFunc});
                }else{
                    callbackFunc();
                }
            }});
        }

        goNextEvent() {
            const that: any = this;
            const callbackFunc = function() {
                if (that.cameraData.recordType == "event") {
                    let findTime = 0;
                    const cvrData = that.cvrData;
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

                    toastcamAPIs.call(toastcamAPIs.camera.FIND_CVR, {cameraId: that.cameraData.id, cvrId: findTime, find: 'next'}, (cvrData: any) => {
                        if (cvrData && cvrData.cvr && cvrData.cvr.start && cvrData.cvr.end) {
                            that.$emit('event', {event: 'play', data: parseInt(cvrData.cvr.start, 10)});
                        } else {
                            that.$emit('event', {event: 'noNextEvent'});
                        }
                    }, (err: any) => {
                        that.$emit('event', {event: 'noNextEvent'});
                    });
                } else {
                    const currentTime = parseInt(that.currentTime.valueOf() as any, 10);
                    let nextTime = 0;
                    const arrEvents = that.arrEvents;

                    if (arrEvents) {
                        arrEvents.filter((obj: any) => {
                            const allFilteredZoneIds = store.getters.getAllFilteredZonesIds(obj.zoneIdxs.split(","));
                            const isCheckFilter = allFilteredZoneIds.filter((item: any) => obj.zoneIdxs.split(",").includes(item)).length;
                            if (isCheckFilter > 0) {
                                const startTime = parseInt(obj.playStartTime || obj.startTime);
                                if(startTime > currentTime && that.currentNextTime != startTime && ((startTime < nextTime && nextTime != 0) || (startTime > nextTime && nextTime == 0))) {
                                    nextTime = startTime;
                                }
                            }
                        });
                    }

                    if(nextTime != 0){
                        that.currentNextTime = nextTime;
                        that.$emit('event', {event: 'play', data: parseInt(nextTime as any, 10)});
                    } else {
                        const goNextEvent = (queryTime: any) => {
                            var deleteZone = that.motionZones ? that.motionZones.find((item: any) => item.id === 9) : null;
                            var isCheckedDeleteZoneId = (deleteZone && deleteZone.filterMark === 'on') ? true : false;
                            var allFilteredZoneIds = store.getters.getAllFilteredZonesIds();
                            if (isCheckedDeleteZoneId) {
                                allFilteredZoneIds.push("d");
                            }
                            toastcamAPIs.call(toastcamAPIs.camera.GET_NEXT_EVENT_WITH_RANGE, {
                                cameraId: that.cameraData.id,
                                scale: that.timeline.getData('nowScale'),
                                queryTime: queryTime,
                                range: 2,
                                filters: allFilteredZoneIds.join(",")
                            }, (data: any) => {
                                var nowDate = Date.now();
                                var startTime = data.playStartTime || data.startTime;
                                if(startTime !== undefined){
                                    if (parseInt(that.currentTime.valueOf()) >= parseInt(startTime)) {
                                        that.$emit('event', {event: 'noNextEvent'});
                                        return;
                                    }
                                    var allFilteredZoneIds = store.getters.getAllFilteredZonesIds(data.zoneIdxs.split(","));
                                    var isCheckFilter = allFilteredZoneIds.filter((item: any) => data.zoneIdxs.split(",").includes(item)).length;
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
                            }, (err: any) => {
                            });
                        }
                        goNextEvent(that.currentTime.valueOf());
                    }
                }
            };

            this.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode: any) => {
                if(isSecureMode){
                    this.$emit('event', {event: 'updateCVRSecureStatus', data: callbackFunc});
                }else{
                    callbackFunc();
                }
            }});
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>