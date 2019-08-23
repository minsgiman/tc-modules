import Vue from 'vue';
import checkbox from './checkbox.vue';

function createDlg(param) {
    const parentEl = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(checkbox);
    const vComponent = new vConstructor({propsData: {
        theme: param.theme,
        name: param.name,
        text: param.text
    }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }
    return vComponent;
}

export default createDlg;