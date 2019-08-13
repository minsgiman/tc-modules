import Vue from 'vue';
import search from './search.vue';

function createDlg(param) {
    const vConstructor = Vue.extend(search);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            placeholder: param.placeholder
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