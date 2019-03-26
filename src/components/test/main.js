import Vue from 'vue';
//import 'es6-promise/auto';
import toastcamAPIs from './../../service/toastcamAPIs';
import store from '../../service/test/store';
import playContainer from './play_container.vue';

class player {
    constructor(param) {
        if (param.category === 'b2b') {
            toastcamAPIs.setConfig({
                prefix: '/json/biz/'
            });
        }
        this.setData('shopId', param.shopId ? param.shopId : '');
        this.setData('isShared', param.isShared);

        let vExtendConstructor = Vue.extend(playContainer);
        this.control = new vExtendConstructor({
            propsData: {
                playEventCb: param.playEventCb
            }
        });
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
