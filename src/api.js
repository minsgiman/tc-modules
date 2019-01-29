import player from './components/player';
import timeline from './components/timeline';
import playManager from './comp_manager/play_manager';

(function (window) {
    const tCam = { player, timeline, playManager };

    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));