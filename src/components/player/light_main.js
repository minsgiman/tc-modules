import Vue from 'vue';
import playContainer from './player_container/light_flash_container.vue';

class lightPlayer {
    constructor(param) {
        let vExtendConstructor = Vue.extend(playContainer);
        this.wrapBaseId = 'toastcam_player_wrap';
        const wrapEl = document.createElement("div");
        wrapEl.id = this.getEmptyWrapId();

        const parentEl = document.getElementById(param.elementId);
        if (!parentEl) {
            return;
        }
        parentEl.appendChild(wrapEl);

        this.control = new vExtendConstructor({
            propsData: {
                serialNo: param.serialNo,
                elementId: wrapEl.id,
                startTime: param.startTime,
                endTime: param.endTime,
                loop: param.loop,
                showTime: param.showTime,
                coreSwfPath: param.coreSwfPath,
                skinSwfPath: param.skinSwfPath,
                getTokenUrl: param.getTokenUrl,
                playEventHandler: param.playEventHandler
            }
        }).$mount('#' + wrapEl.id);
    }

    getEmptyWrapId() {
        let subfixNum = 0;
        while(document.getElementById(this.wrapBaseId + subfixNum)) {
            subfixNum += 1;
        }
        return this.wrapBaseId + subfixNum;
    }

    destroy() {
        if (this.control) {
            this.control.$destroy();
        }
        this.control = null;
    }
}

export default lightPlayer;