import Vue from 'vue';
import 'es6-promise/auto';
import store from '../../store/player/store';
import playContainer from './play_container';
import flashPlayer from "./flash_player";
import webRTCPlayer from "./webrtc_player";
import timeline from "./timeline";
import toastAPIs from '../../store/toastcamAPIs';

class player {
    constructor(param) {
        this.elementId = param.elementId;
        this.cameraId = param.cameraId;
        this.shopId = param.shopId ? param.shopId : '';
        this.groupId = param.groupId ? param.groupId : '';
        this.isShared = param.isShared;
        store.dispatch('SET_CAMERA_ID', this.cameraId);
        store.dispatch('SET_SHOP_ID', this.shopId);
        store.dispatch('SET_IS_SHARED', this.isShared);
    }

    initialize (callback) {
        Promise.all([toastAPIs.loadCameraData(this.cameraId), toastAPIs.loadCameraConfig(this.cameraId),
            toastAPIs.loadTimelineData({id: this.cameraId, scale: '10m', start: 1548727100000, end: 1548729000000}), toastAPIs.getAlarmZones(this.cameraId)]).then((values) => {
            const cameraData = values[0],
                  cameraConfig = values[1],
                  timelineData = values[2],
                  alarmZones = values[3];

            store.dispatch('SET_CAMERA_DATA', cameraData);
            store.dispatch('SET_CAMERA_CONFIG', cameraConfig);
            store.dispatch('SET_TIMELINE_DATA', timelineData);
            store.dispatch('SET_ALARM_ZONES', alarmZones);

            let vExtendConstructor = Vue.extend(playContainer);
            this.containerComp = new vExtendConstructor().$mount('#' + this.elementId);

            if (cameraData.recorderType === 'recorder') {
                vExtendConstructor = Vue.extend(webRTCPlayer);
                this.containerComp.player = new vExtendConstructor().$mount('#play_area');
                console.log('GET webrtcClient');
            } else {
                vExtendConstructor = Vue.extend(flashPlayer);
                this.containerComp.player = new vExtendConstructor().$mount('#play_area');
                console.log('GET flashBridge');
            }

            vExtendConstructor = Vue.extend(timeline);
            this.containerComp.timeline = new vExtendConstructor().$mount('#timeline_area');
            this.containerComp.drawTimeline(timelineData);
            this.containerComp.currentCameraDataSet();
            if (callback) {
                callback();
            }
        });
    }

    play(time) {
        if (this.containerComp) {
            this.containerComp.player.play(time);
        }
    }
}

export default player;
