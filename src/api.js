import player from './components/player';
import clipplayer from './components/clipplayer';
import camlist from './components/camlist';
import { playerTipDialog, videoPlayDialog, confirmDialog } from './components/dialogs';
import { checkbox, daycheck, dropdown, radiobtn, search, timeselect, toggle } from './components/uikit';

(function (window) {
    const tCam = { player, toggle, timeselect, daycheck, radiobtn, checkbox, search, dropdown, clipplayer, camlist, playerTipDialog, videoPlayDialog, confirmDialog };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));