import Vue from 'vue';
import dlg from './dlg.vue';

class dlgManager {
    constructor() {
        this._dialogMap = {};
    }

    createDlg(param) {
        const parentEl = document.getElementById(param.elId);
        if (!parentEl) {
            return;
        }
        const vConstructor = Vue.extend(dlg);
        const vComponent = new vConstructor({propsData: {
                theme: param.theme,
                header: param.header,
                contents: param.contents,
                footer: param.footer,
                btn: param.btn
            }}).$mount();
        parentEl.appendChild(vComponent.$el);

        if (param.eventHandler) {
            vComponent.$on('event', param.eventHandler);
        }
        this._dialogMap[vComponent._uid] = vComponent;
        return vComponent;
    }


    destroyDlg(uid) {
        if (this._dialogMap[uid]) {
            this._dialogMap[uid].$destroy();
            this._dialogMap[uid] = null;
        }
    }
}

export default new dlgManager();
