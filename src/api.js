import player from './components/player/player_main';

(function (window) {
    const tCam = { player };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));