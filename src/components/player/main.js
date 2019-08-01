import Vue from 'vue';
import { i18n } from '../../i18n/player/i18n';
import toastcamAPIs from './../../service/toastcamAPIs';
import store from '../../service/player/store';
import playContainer from './toastcam_player.vue';
import "ie-array-find-polyfill";

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        enumerable: false,
        value: function(obj) {
            var newArr = this.filter(function(el) {
                return el == obj;
            });
            return newArr.length > 0;
        }
    });
}

class player {
    constructor(param) {
        if (param.category === 'b2b') {
            toastcamAPIs.setConfig({
                prefix: '/json/biz/'
            });
        } else if (param.category === 'demo') {
            toastcamAPIs.setConfig({
                prefix: '/json/demo/'
            });
        } else {
            toastcamAPIs.setConfig({
                prefix: '/json/'
            });
        }
        this.setData('category', param.category);
        this.setData('cameraConfig', param.cameraConfig);
        this.setData('cameraData', param.cameraData);
        this.setData('shopId', param.shopId ? param.shopId : '');
        this.setData('isShared', param.isShared);

        let vExtendConstructor = Vue.extend(playContainer);
        this.control = new vExtendConstructor({
            i18n,
            propsData: {
                playEventCb: param.playEventCb,
                playTime: param.playTime,
                elementIdMap: param.elementIdMap
            }
        });
    }

    requestPlay(time) {
        this.control.timeline.requestPlay(time);
    }

    redrawEvents(events) {
        this.control.timeline.redrawEvents(events);
    }

    jumpToCvrWithSeconds(seconds) {
        if (seconds > 0) {
            this.control.playIndicator.showIndicator('forward');
        } else {
            this.control.playIndicator.showIndicator('backward');
        }
        this.control.timeline.jumpToCvrWithSeconds(seconds);
    }

    togglePlay() {
        if (store.state.isPlaying) {
            this.control.playIndicator.showIndicator('pause');
            this.control.playInfoBar.pauseBtn();
        } else {
            this.control.playIndicator.showIndicator('play');
            this.control.playInfoBar.playBtn();
        }
    }

    reloadPlayer() {
        this.control.reloadPlayer();
    }

    setData(key, value) {
        switch(key) {
            case 'cameraData':
                store.dispatch('CAMERA_DATA_CHANGE', value);
                break;
            case 'cameraConfig':
                store.dispatch('CAMERA_CONFIG_CHANGE', value);
                break;
            case 'shopId':
                store.dispatch('SHOP_ID_CHANGE', value);
                break;
            case 'isShared':
                store.dispatch('IS_SHARED_CHANGE', value);
                break;
            case 'isPlaying':
                store.dispatch('IS_PLAYING_CHANGE', value);
                break;
            case 'playBtnStatus':
                store.dispatch('PLAY_BTN_STATUS_CHANGE', value);
                break;
            case 'serviceDay':
                store.dispatch('SERVICE_DAY_CHANGE', value);
                break;
            case 'inoutFilter':
                store.dispatch('INOUT_FILTER_CHANGE', value);
                break;
            case 'sensorZones':
                store.dispatch('SENSOR_ZONES_CHANGE', value);
                break;
            case 'eventZones':
                store.dispatch('EVENT_ZONES_CHANGE', value);
                break;
            case 'motionZones':
                store.dispatch('MOTION_ZONES_CHANGE', value);
                break;
            case 'timeRange':
                store.dispatch('TIME_RANGE_CHANGE', value);
                break;
            case 'category':
                store.dispatch('CATEGORY_CHANGE', value);
                break;
            case 'ptzControlMode':
                store.dispatch('PTZ_CONTROL_CHANGE', value);
                break;
            default:
                break;
        }
    }

    destroy() {
        store.dispatch('INIT_ALL_DATA');
        if (this.control) {
            this.control.$destroy();
        }
        this.control = null;
    }
}

export default player;
