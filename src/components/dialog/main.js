import Vue from 'vue';
import { i18n } from '../../i18n/dialog/i18n';
import confirmDlg from './confirm_dlg.vue';

class dialog {
    constructor(param) {
        if (param.type === 'confirm') {
            this.control = this.createComponent(confirmDlg, param.elId, param.eventHandler, {
                title: param.title,
                message: param.message
            });
        }
    }

    createComponent(constructor, elementId, eventHandler, prop) {
        const vConstructor = Vue.extend(constructor);
        const vComponent = new vConstructor({i18n, propsData: prop});
        if (elementId) {
            vComponent.$mount('#' + elementId);
        }
        if (eventHandler) {
            vComponent.$on('event', eventHandler);
        }
        return vComponent;
    }

    destroy() {
        if (this.control) {
            this.control.$destroy();
        }
        this.control = null;
    }
}

export default dialog;
