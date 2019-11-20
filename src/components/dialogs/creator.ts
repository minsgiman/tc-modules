import Vue from 'vue';

function createDlg(parentId: string, module: any, propsData?: any, eventHandler?: any) {
    const parentEl: HTMLElement | null = document.getElementById(parentId);
    if (!parentEl) {
        return;
    }
    const vConstructor = Vue.extend(module);
    const vComponent = new vConstructor({propsData}).$mount();
    parentEl.appendChild(vComponent.$el);

    if (eventHandler) {
        vComponent.$on('event', eventHandler);
    }
    return vComponent;
}

export default createDlg;
