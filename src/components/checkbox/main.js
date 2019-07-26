import Vue from 'vue';
import checkbox from './checkbox.vue';

function createDlg(param) {
    const vConstructor = Vue.extend(checkbox);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            name: param.name,
            text: param.text
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