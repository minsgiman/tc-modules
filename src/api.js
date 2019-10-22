import player from './components/player';
import clipplayer from './components/clipplayer';
import { checkbox, daycheck, dialog, dropdown, radiobtn, search, timeselect, toggle } from './components/uikit';

(function (window) {
    const tCam = { player, dialog, toggle, timeselect, daycheck, radiobtn, checkbox, search, dropdown, clipplayer };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));