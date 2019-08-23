import Vue from 'vue';
import dropdown from './dropdown.vue';

function createDlg(param) {
    const parentEl = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(dropdown);
    const vComponent = new vConstructor({propsData: {
            theme: param.theme,
            position: param.position,
            dropElId: param.dropElId
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }
    vComponent.initialize();

    return vComponent;
}

export default createDlg;