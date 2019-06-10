//import player from './components/player/player_main';
//import timeline_t from './components/test/timeline';
//import flashPlayer from './components/test/flash_player';
//import playContainer from './components/test/play_container';
import player from './components/player/main';
import dialog from './components/dialog/main';

(function (window) {
    const tCam = { player, dialog };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));