import lPlayer from './components/player/light_webrtc_main';

(function (window) {
    const toastcam = { lPlayer };
    if ( typeof window === "object" ) {
        window.toastcam = toastcam;
    }
}(window));