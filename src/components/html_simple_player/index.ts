import Vue from 'vue';
import player from './player.vue';
import { ISimplePlayerInfo } from './interface';

function createComponent(param: ISimplePlayerInfo) {
    const parentEl: HTMLElement | null = document.getElementById(param.elId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(player);
    const vComponent: any = new vConstructor().$mount();
    parentEl.appendChild(vComponent.$el);

    if (param.eventHandler) {
        vComponent.$on('event', param.eventHandler);
    }

    return vComponent;
}

export default createComponent;
