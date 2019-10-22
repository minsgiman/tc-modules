import Vue from 'vue';
import playerTipDialog from './player_tip_dialog';

function createDlg(param) {
    const parentEl = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(playerTipDialog);
    const vComponent = new vConstructor({propsData: {
            dlgStyle: param.dlgStyle,
            txtMap: param.txtMap,
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }
    return vComponent;
}

export default createDlg;