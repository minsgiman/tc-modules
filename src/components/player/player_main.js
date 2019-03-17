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
        this.containerComp = null;
        store.dispatch('SET_CAMERA_ID', this.cameraId);
        store.dispatch('SET_SHOP_ID', this.shopId);
        store.dispatch('SET_IS_SHARED', this.isShared);
        if (param.category === 'b2b') {
            toastAPIs.setConfig({
                prefix: '/json/biz/'
            });
        }
    }

    initialize (callback) {
        toastAPIs.call(toastAPIs.camera.GET_CAMERA_DETAIL, {cameraId: this.cameraId}, (cameraData) => {
            toastAPIs.call(toastAPIs.camera.GET_CAMERA_CONFIG, {cameraId: this.cameraId}, (cameraConfig) => {
                toastAPIs.call(toastAPIs.camera.GET_EVENT_ZONES, {cameraId: this.cameraId}, (alarmZones) => {
                    store.dispatch('SET_CURRENT_TIME', new Date());
                    store.dispatch('SET_CAMERA_DATA', cameraData);
                    store.dispatch('SET_CAMERA_CONFIG', cameraConfig);
                    store.dispatch('SET_ALARM_ZONES', alarmZones);

                    let vExtendConstructor = Vue.extend(playContainer);
                    this.containerComp = new vExtendConstructor().$mount('#' + this.elementId);

                    if (cameraData.recorderType === 'recorder') {
                        vExtendConstructor = Vue.extend(webRTCPlayer);
                        this.containerComp.player = new vExtendConstructor().$mount('#player');
                        console.log('GET webrtcClient');
                    } else {
                        vExtendConstructor = Vue.extend(flashPlayer);
                        this.containerComp.player = new vExtendConstructor().$mount('#player');
                        console.log('GET flashBridge');
                    }

                    vExtendConstructor = Vue.extend(timeline);
                    this.containerComp.timeline = new vExtendConstructor().$mount('#timeline_area');
                    this.containerComp.drawTimeline();
                    this.containerComp.currentCameraDataSet();
                    if (callback) {
                        callback();
                    }
                }, err => console.log(err));
            }, err => console.log(err));
        }, err => console.log(err));
    }

    play(time) {
        if (this.containerComp) {
            this.containerComp.player.play(time);
        }
    }

    destroy() {
        store.dispatch('INIT_ALL_DATA');
        if (this.containerComp) {
            this.containerComp.$destroy();
        }
        this.elementId = null;
        this.cameraId = null;
        this.shopId = null;
        this.groupId = null;
        this.isShared = null;
        this.containerComp = null;
    }
}

export default player;
