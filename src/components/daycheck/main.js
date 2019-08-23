import Vue from 'vue';
import daycheck from './daycheck.vue';

function createDlg(param) {
    const parentEl = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(daycheck);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }
    return vComponent;
}

export default createDlg;