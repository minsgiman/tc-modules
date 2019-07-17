import Vue from 'vue';
import daycheck from './daycheck.vue';

function createDlg(param) {
    const vConstructor = Vue.extend(daycheck);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme
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