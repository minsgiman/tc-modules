import Vue from 'vue';
import dropdown from './dropdown.vue';

function createDlg(param) {
    const vConstructor = Vue.extend(dropdown);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            position: param.position,
            dropElId: param.dropElId
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