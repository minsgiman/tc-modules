import Vue from 'vue';
import radiobtn from './radiobtn.vue';

function createDlg(param) {
    const parentEl = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(radiobtn);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            name: param.name,
            items: param.items
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }
    return vComponent;
}

export default createDlg;