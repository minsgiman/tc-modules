import Vue from 'vue';
import './webrtc_adaptor';
import playContainer from './player_container/light_webrtc_container.vue';

class lightPlayer {
    constructor(param) {
        let vExtendConstructor = Vue.extend(playContainer);
        this.wrapBaseId = 'toastcam_player_wrap';

        const parentEl = document.getElementById(param.elementId);
        if (!parentEl) {
            return;
        }
        this.control = new vExtendConstructor({
            propsData: {
                serialNo: param.serialNo,
                elementId: this.getEmptyWrapId(this.wrapBaseId),
                startTime: param.startTime,
                endTime: param.endTime,
                loop: param.loop,
                showTime: param.showTime,
                usePauseResume: param.usePauseResume,
                getTokenUrl: param.getTokenUrl,
                playEventHandler: param.playEventHandler
            }
        }).$mount();
        parentEl.appendChild(this.control.$el);
        this.control.initPlayer();
    }

    getEmptyWrapId(baseId) {
        let subfixNum = 0;
        while(document.getElementById(baseId + subfixNum)) {
            subfixNum += 1;
        }
        return baseId + subfixNum;
    }

    destroy() {
        if (this.control) {
            this.control.$destroy();
        }
        this.control = null;
    }
}

export default lightPlayer;