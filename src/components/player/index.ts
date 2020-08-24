import Vue from 'vue';
import { i18n } from '../../i18n/player/i18n';
import toastcamAPIs from './../../service/toastcamAPIs';
import store from '../../service/player/store';
import playContainer from './toastcam_player.vue';
import 'ie-array-find-polyfill';

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        enumerable: false,
        value: function(obj: any) {
            const newArr: any = this.filter((el: any) => {
                return el === obj;
            });
            return newArr.length > 0;
        }
    });
}

function browserCheck() {
    const userAgent = navigator.userAgent,
        match = userAgent.match(/(opera|chrome|crios|safari|ucbrowser|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [],
        result: any = {};
    let tem: any;

    if (/trident/i.test(match[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
        result.name = 'Internet Explorer';
    } else if (match[1] === 'Chrome') {
        tem = userAgent.match(/\b(OPR|Edge)\/(\d+)/);

        if (tem && tem[1]) {
            result.name = tem[0].indexOf('Edge') === 0 ? 'Edge' : 'Opera';
        }
    }
    if (!result.name) {
        tem = userAgent.match(/version\/(\d+)/i); // iOS support
        result.name = match[0].replace(/\/.*/, '');

        if (result.name.indexOf('MSIE') === 0) {
            result.name = 'Internet Explorer';
        }
        if (userAgent.match('CriOS')) {
            result.name = 'Chrome';
        }

    }
    if (tem && tem.length) {
        match[match.length - 1] = tem[tem.length - 1];
    }

    result.version = Number(match[match.length - 1]);

    return result;
}

class Player {
    control: any;

    constructor(param: any) {
        if (param.category === 'b2b' || param.category === 'b2bmonitor') {
            toastcamAPIs.setConfig({
                prefix: '/json/biz/'
            });
        } else if (param.category === 'demo') {
            toastcamAPIs.setConfig({
                prefix: '/json/demo/'
            });
        } else if (param.category === 'b2bdemo') {
            toastcamAPIs.setConfig({
                prefix: '/json/biz/demo/'
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
        this.setData('browserInfo', browserCheck());
        this.setData('playerType', param.playerType);
        this.setData('notShowDay', param.notShowDay);
        if (param.country) {
            this.setData('country', param.country);
        }
        if (param.mute) {
            this.setData('mute', param.mute);
        }

        const vExtendConstructor: any = Vue.extend(playContainer);
        this.control = new vExtendConstructor({
            i18n,
            propsData: {
                playEventCb: param.playEventCb,
                playTime: param.playTime,
                elementIdMap: param.elementIdMap
            }
        });
    }

    requestPlay(time: any) {
        this.control.timeline.requestPlay(time);
    }

    redrawEvents(events: any) {
        this.control.timeline.redrawEvents(events);
    }

    jumpToCvrWithSeconds(seconds: any) {
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

    setData(key: string, value: any) {
        switch (key) {
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
            case 'browserInfo':
                store.dispatch('BROWSER_INFO', value);
                break;
            case 'playerType':
                store.dispatch('PLAYER_TYPE_CHANGE', value);
                break;
            case 'country':
                store.dispatch('COUNTRY_CHANGE', value);
                break;
            case 'mute':
                store.dispatch('MUTE_CHANGE', value);
                break;
            case 'notShowDay':
                store.dispatch('NSHOWDAY_CHANGE', value);
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

export default Player;
