<template>
    <div id="error_status_wrap">
        <div class="player_cam player_off_black" :class="{player_cam_full: isFullScreen}" v-show="showCameraOffLayer" id="cameraOffLayer">
            <div class="n_area movieoff">
                <p>
                    <span class="sp"></span><br>
                    <span v-show="cameraData.recorderType != 'recorder'">{{$t('CAMERA_DETAIL_TURN_OFF_CAMERA_MESSAGE')}}</span>
                    <span v-show="cameraData.recorderType == 'recorder' && cameraData.controlStatus == 'RDE'">{{$t('STR_CONNECT_DVR')}}</span>
                    <span v-show="cameraData.recorderType == 'recorder' && cameraData.controlStatus == 'off'">{{$t('STR_CONNECT_CAM_TO_DVR')}}</span>
                    <span v-show="cameraData.recorderType == 'recorder' && (cameraData.controlStatus != 'RDE' && cameraData.controlStatus != 'off') && dvrConnectFail">{{$t('STR_CONNECT_DVR_FAIL')}}</span>
                </p>
                <ul class="off_area" v-if="!isExpiredCloud">
                    <li>
                        <p class="txt">
                            {{lastRecDateString}}<em class="red">{{lastRecTimeString}}</em>
                        </p>
                        <button v-if="cameraData.recordType != 'event'" type="button" class="btn" v-show="isCameraOffLastShowRec" @click="requestPlayCvr(lastRecDate,'f')">
                            <img src="/resources/im/ic_video_error_arrow_L.png">{{$t('CAMERA_DETAIL_LAST_REC')}}
                        </button>
                        <button v-if="cameraData.recordType == 'event'" type="button" class="btn" v-show="isCameraOffLastShowRec" @click="requestPlayCvr(lastRecDate,'f')">
                            <img src="/resources/im/ic_video_error_arrow_L.png">{{$t('CAMERA_DETAIL_LAST_EVENT')}}
                        </button>
                        <p class="txt" v-show="isCameraOffLastRec">{{$t('MY_CAMERA_LAST_NO_REC')}}</p>
                    </li>
                    <li v-if="cameraData.recordType != 'event'">
                        <p class="txt">
                            {{lastEventDateString}}<em class="red">{{lastEventTimeString}}</em>
                        </p>
                        <button type="button" class="btn" v-show="isCameraOffLastShowEvent" @click="requestPlayCvr(lastEventDate,'f')">
                            <img src="/resources/im/ic_video_error_arrow_L.png">{{$t('CAMERA_DETAIL_LAST_EVENT')}}
                        </button>
                        <p class="txt" v-show="isCameraOffLastEvent">{{$t('MY_CAMERA_LAST_NO_EVENT')}}</p>
                    </li>
                </ul>
            </div>
        </div>
        <div class="player_cam player_off_black" :class="{player_cam_full: isFullScreen}" v-show="showNoPlayLayer">
            <div class="n_area movieoff">
                <p>
                    <span class="sp"></span><br>{{$t('MY_CAMERA_DELAY')}}
                </p>
                <ul class="off_area" v-if="!isExpiredCloud">
                    <li>
                        <p class="txt">
                            {{lastRecDateString}} <em class="red">{{lastRecTimeString}}</em>
                        </p>
                        <button type="button" class="btn" v-show="isCameraOffLastShowRec" @click="requestPlayCvr(lastRecDate,'f')">
                            <img src="/resources/im/ic_video_error_arrow_L.png">{{$t('CAMERA_DETAIL_LAST_REC')}}
                        </button>
                        <p class="txt" v-show="isCameraOffLastRec">{{$t('MY_CAMERA_LAST_NO_REC')}}</p>
                    </li>
                    <li>
                        <p class="txt">
                            {{lastEventDateString}} <em class="red">{{lastEventTimeString}}</em>
                        </p>
                        <button type="button" class="btn" v-show="isCameraOffLastShowEvent" @click="requestPlayCvr(lastEventDate,'f')">
                            <img src="/resources/im/ic_video_error_arrow_L.png">{{$t('CAMERA_DETAIL_LAST_EVENT')}}
                        </button>
                        <p class="txt" v-show="isCameraOffLastEvent">{{$t('MY_CAMERA_LAST_NO_EVENT')}}</p>
                    </li>
                </ul>
            </div>
        </div>
        <div class="player_cam player_off_black" :class="{player_cam_full: isFullScreen}" v-show="(cameraData.recordType != 'event') && showNextPlayLayer">
            <div class="n_area movieoff">
                <p>
                    <span class="sp"></span><br>{{$t('CAMERA_DETAIL_NOT_AVAILABLE_MESSAGE')}}
                </p>
                <ul class="off_area" v-if="!isExpiredCloud">
                    <li>
                        <p class="txt"> {{lastRecDateString}} <em class="red">{{lastRecTimeString}}</em></p>
                        <a class="btn" @click="requestPlayCvr(lastRecDate,'f')">
                            <img src="/resources/im/ic_video_error_arrow_L.png">{{$t('CAMERA_DETAIL_NEXT_REC')}}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="player_cam off player_off_black" :class="{player_cam_full: isFullScreen}" v-show="showCameraStreamLayer" id="cameraStreamOffLayer"></div>
        <div class="player_cam off player_off_black" :class="{player_cam_full: isFullScreen}" v-show="showCameraStreamLayer" id="cameraStreamOffLayerIn">
            <div class="n_area movieoff">
                <p>
                    <span class="sp"></span> <br>{{$t('MY_CAMERA_STREAMING_OFF_MESSAGE')}}
                </p>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';
    import toastcamAPIs from './../../service/toastcamAPIs';
    //import moment from 'moment';

    const $: any = (window as any).$ as any;
    const moment: any = (window as any).moment as any;
    const browserLang = $("html").attr("lang");

    @Component
    export default class ErrorStatusLayer extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get cameraConfig() {
            return store.state.cameraConfig;
        }
        get isFullScreen() {
            return store.state.isFullScreen;
        }
        get isExpiredCloud() {
            return store.getters.isExpiredCloud;
        }

        showNoPlayLayer: boolean = false;
        showCameraOffLayer: boolean = false;
        showCameraStreamLayer: boolean = false;
        showNextPlayLayer: boolean = false;
        isCameraOffLastRec: boolean = false;
        isCameraOffLastEvent: boolean = false;
        isCameraOffLastShowRec: boolean = false;
        isCameraOffLastShowEvent: boolean = false;
        dvrConnectFail: boolean = false;
        lastEventDate: any = 0;
        lastRecDate: any = 0;
        lastEventDateString: string = '';
        lastEventTimeString: string = '';
        lastRecDateString: string = '';
        lastRecTimeString: string = '';
        lastCameraStatus: any = 0;

        cameraStatusChange(status: any) {
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
        }

        cameraRecDelay() { //녹화 지연
            this.showNoPlayLayer = true;
            this.showCameraOffLayer = false;
            this.showCameraStreamLayer = false;
            this.showNextPlayLayer = false;
        }

        cameraConnectOff() { //카메라 접속 끊김
            this.showNoPlayLayer = false;
            this.showCameraOffLayer = true;
            this.showCameraStreamLayer = false;
            this.showNextPlayLayer = false;
            toastcamAPIs.call(toastcamAPIs.camera.CHECK_IS_LAST_RECORD, {cameraId: this.cameraData.id}, (data: any) => {
                this.currentCameraIsLastRecordDataSet(data);
            });
        }

        cameraNoSave(){ //저장된 영상 없음
            this.showNoPlayLayer = false;
            this.showCameraOffLayer = false;
            this.showCameraStreamLayer = false;
            this.showNextPlayLayer = true;
        }

        cameraRecOff() { //녹화가 꺼져 있음
            this.showNoPlayLayer = false;
            this.showCameraOffLayer = false;
            this.showCameraStreamLayer = true;
            this.showNextPlayLayer = false;
            toastcamAPIs.call(toastcamAPIs.camera.CHECK_IS_LAST_RECORD, {cameraId: this.cameraData.id}, (data: any) => {
                this.currentCameraIsLastRecordDataSet(data);
            });
        }

        cameraStatusAllOff() { //정상 플레이
            this.showNoPlayLayer = false;
            this.showCameraOffLayer = false;
            this.showCameraStreamLayer = false;
            this.showNextPlayLayer = false;
            this.isCameraOffLastRec = false;
            this.isCameraOffLastEvent = false;
        }

        requestPlayCvr(time: any, status: any) {
            this.$emit('event', {event: 'playCvr', value: {time: parseInt(time, 10), status}});
        }

        currentCameraIsLastRecordDataSet(data: any){
            this.lastEventDate = data.lastEventStartTime;
            this.lastRecDate = data.lastRectStartTime;

            const videoDateFormat = (this as any).$i18n.t('CAMERA_DETAIL_EVENT_DATE_FORMAT');
            const videoTimeFormat = (this as any).$i18n.t('CAMERA_DETAIL_EVENT_TIME_FORMAT');

            if(this.lastEventDate != 0){
                const lastEventMoment = moment(this.lastEventDate);
                this.lastEventDateString = lastEventMoment.locale(browserLang).format(videoDateFormat);
                this.lastEventTimeString = lastEventMoment.locale(browserLang).format(videoTimeFormat);
                $("#camera_off_lastevnt").show();
                this.$emit('event', {event: 'lastEvent', value: lastEventMoment._i});
                this.isCameraOffLastShowEvent = true;
            }else{
                this.isCameraOffLastShowEvent = false;
                this.isCameraOffLastEvent = true;
            }

            if(this.lastRecDate != 0){
                const lastRecMoment = moment(this.lastRecDate);
                this.lastRecDateString = lastRecMoment.locale(browserLang).format(videoDateFormat);
                this.lastRecTimeString = lastRecMoment.locale(browserLang).format(videoTimeFormat);
                $("#camera_off_lastrec").show();
                this.$emit('event', {event: 'lastRec', value: lastRecMoment._i});
                this.isCameraOffLastShowRec = true;
            }else{
                this.isCameraOffLastShowRec = false;
                this.isCameraOffLastRec = true;
            }
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>

<style lang="less">
    #player {
    }
</style>