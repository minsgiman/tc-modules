import Vue from 'vue';
import playContainer from './player_container/light_flash_container.vue';

class lightPlayer {
    constructor(param) {
        let vExtendConstructor = Vue.extend(playContainer);
        this.control = new vExtendConstructor({
            propsData: {
                serialNo: param.serialNo,
                elementId: param.elementId,
                startTime: param.startTime,
                endTime: param.endTime,
                loop: param.loop,
                showTime: param.showTime,
                coreSwfPath: param.coreSwfPath,
                skinSwfPath: param.skinSwfPath,
                getTokenUrl: param.getTokenUrl,
                playEventHandler: param.playEventHandler
            }
        }).$mount(param.elementId ? '#' + param.elementId : '#player');
    }

    destroy() {
        if (this.control) {
            this.control.$destroy();
        }
        this.control = null;
    }
}

export default lightPlayer;