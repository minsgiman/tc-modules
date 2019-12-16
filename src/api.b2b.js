import player from './components/player';
import clipplayer from './components/clipplayer';
import camlist from './components/camlist';
import playerTipDialog from './components/dialogs/player_tip_dialog';
import videoPlayDialog from './components/dialogs/videoplay_dialog';
import confirmDialog from './components/dialogs/confirm_dialog';
import aiStatsDialog from './components/dialogs/ai_stats_dialog';
import aiGraphsDialog from './components/dialogs/ai_graphs_dialog';
import checkbox from './components/uikit/checkbox';
import daycheck from './components/uikit/daycheck';
import radiobtn from './components/uikit/radiobtn';
import timeselect from './components/uikit/timeselect';
import toggle from './components/uikit/toggle';
import dropdown from './components/uikit/dropdown';
import search from './components/uikit/search';

(function (window) {
    const tCam = { player, toggle, timeselect, daycheck, radiobtn, checkbox, search, dropdown, clipplayer, camlist,
        playerTipDialog, videoPlayDialog, confirmDialog, aiStatsDialog, aiGraphsDialog };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));