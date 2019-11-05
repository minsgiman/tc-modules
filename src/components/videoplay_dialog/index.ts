import Vue from 'vue';
import videoPlayDialog from './videoplay_dialog.vue';

function createDlg(param: any) {
    const parentEl = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(videoPlayDialog);
    const vComponent = new vConstructor({propsData: {
            dlgStyle: param.dlgStyle,
            webmUrl: param.webmUrl,
            mp4Url: param.mp4Url
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }
    return vComponent;
}

export default createDlg;