import Vue from 'vue';
import mgrid from './mgrid.vue';
import { IMonitorPlayInfo } from './interface';

function createComponent(param: IMonitorPlayInfo) {
    const parentEl: HTMLElement | null = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(mgrid);
    const vComponent: any = new vConstructor({propsData: {
            width: param.width,
            height: param.height,
            commonToken: param.commonToken,
            serverUrls: param.serverUrls,
            cameras: param.cameras,
            dimension: param.dimension
        }}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }

    return vComponent;
}

export default createComponent;
