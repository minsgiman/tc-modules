import player from './components/player';
import clipplayer from './components/clipplayer';
import playerTipDialog from './components/player_tip_dialog';
import videoPlayDialog from './components/videoplay_dialog';
import { checkbox, daycheck, dropdown, radiobtn, search, timeselect, toggle } from './components/uikit';

(function (window) {
    const tCam = { player, toggle, timeselect, daycheck, radiobtn, checkbox, search, dropdown, clipplayer, playerTipDialog, videoPlayDialog };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));