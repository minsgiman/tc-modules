import Vue from 'vue';

function createComponent(parentId, vueComp) {
    const parentEl = document.getElementById(parentId);
    if (!parentEl) {
        return null;
    }
    const vConstructor = Vue.extend(vueComp);
    const vComponent = new vConstructor({propsData: {parentId}}).$mount();
    parentEl.appendChild(vComponent.$el);

    return vComponent;
}

export default createComponent;