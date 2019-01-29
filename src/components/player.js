class Player {
    constructor(type, elId) {
        this.type = type;
        this.elId = elId;
    }

    async load () {
        if (this.type === 'webrtc') {
            this.webrtcClient = (await import('./../core_modules/webrtc_client')).default;
            this.webrtcClient.init(this.webrtcPlayStatusListener);
            console.log('GET webrtcClient');
        } else {
            this.flashBridge = (await import('./../core_modules/flash_bridge')).default;
            this.flashBridge.init(this.flashPlayStatusListener);
            console.log('GET flashBridge');
        }
    }

    play(playData) {
        this.playData = playData;

        if (this.type === 'webrtc') {
            const cameraId = '',
                  time = 0;
            this.webrtcClient.streamPlay(cameraId, time);
        } else {
            const path = '',
                  url = '';
            this.flashBridge.play(path, url);
        }
    }

    stop(){
    }

    pause() {
    }

    mute() {
    }

    getCurrentTime() {
        return this.playData && this.playData.time ? this.playData.time : 0;
    }

    getPlayStatus() {
    }

    setFullScreen(isFullscreen) {
    }

    destroy() {
    }

    onPlayStatusChange(status) {
        //TODO: DO Player job
        if (this.playStatusChangeListener) {
            this.playStatusChangeListener(status)
        }
    }

    setPlayStatusChangeListener(callback) {
        this.playStatusChangeListener = callback;
    }

    webrtcPlayStatusListener(status) {
    }

    flashPlayStatusListener(status) {
    }
}

export default Player;