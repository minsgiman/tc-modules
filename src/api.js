//import player from './components/player/player_main';
//import timeline_t from './components/test/timeline';
//import flashPlayer from './components/test/flash_player';
//import playContainer from './components/test/play_container';
import player from './components/player/main';
import dialog from './components/dialog/main';
import toggle from './components/toggle/main';
import timeselect from './components/timeselect/main';
import daycheck from './components/daycheck/main';
import radiobtn from './components/radiobtn/main';
import checkbox from './components/checkbox/main';
import search from './components/search/main';
import dropdown from './components/dropdown/main';
import clipplayer from './components/clipplayer/main';

(function (window) {
    const tCam = { player, dialog, toggle, timeselect, daycheck, radiobtn, checkbox, search, dropdown, clipplayer };
    if ( typeof window === "object" ) {
        window.tCam = tCam;
    }
}(window));