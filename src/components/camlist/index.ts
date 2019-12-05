import Vue from 'vue';
import camlist from './camlist.vue';
import { ICamListInfo } from './interface';

function createComponent(param: ICamListInfo) {
    const parentEl: HTMLElement | null = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(camlist);
    const vComponent: any = new vConstructor({propsData: {
            pList: param.list,
            pFocusId: param.focusId
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }

    return vComponent;
}

export default createComponent;
