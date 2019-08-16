import Vue from 'vue';
import clipplayer from './clipplayer.vue';

function createDlg(param) {
    const vConstructor = Vue.extend(clipplayer);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            videoUrl: param.videoUrl,
            clipDetail: param.clipDetail
        }});
    if (param.elId) {
        vComponent.$mount('#' + param.elId);
    }
    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }

    return vComponent;
}

export default createDlg;