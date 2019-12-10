import player from './components/player';
import clipplayer from './components/clipplayer';
import camlist from './components/camlist';
import playerTipDialog from './components/dialogs/player_tip_dialog';
import confirmDialog from './components/dialogs/confirm_dialog';
import checkbox from './components/uikit/checkbox';
import daycheck from './components/uikit/daycheck';
import radiobtn from './components/uikit/radiobtn';
import timeselect from './components/uikit/timeselect';
import toggle from './components/uikit/toggle';

(function (window) {
    const tCam = { player, toggle, timeselect, daycheck, radiobtn, checkbox, clipplayer, camlist, playerTipDialog, confirmDialog };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));