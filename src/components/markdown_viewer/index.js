import Vue from 'vue';
import viewer from './viewer.vue';

class markdownViewer {
    constructor(param) {
        let vExtendConstructor = Vue.extend(viewer);

        const parentEl = document.getElementById(param.elementId);
        if (!parentEl) {
            return;
        }
        this.viewer = new vExtendConstructor({
            propsData: {
                source: param.source
            }
        }).$mount();
        parentEl.appendChild(this.viewer.$el);
    }
}

export default markdownViewer;