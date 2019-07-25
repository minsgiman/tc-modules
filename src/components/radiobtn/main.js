import Vue from 'vue';
import radiobtn from './radiobtn.vue';

function createDlg(param) {
    const vConstructor = Vue.extend(radiobtn);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            name: param.name,
            items: param.items
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