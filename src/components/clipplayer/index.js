import Vue from 'vue';
import clipplayer from './clipplayer.vue';

function createDlg(param) {
    const parentEl = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(clipplayer);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            videoUrl: param.videoUrl,
            durationStr: param.durationStr,
            clipStatus: param.clipStatus,
            thumbnailPath: param.thumbnailPath,
            startTime: param.startTime,
            endTime: param.endTime
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }
    vComponent.initialize();

    return vComponent;
}

export default createDlg;