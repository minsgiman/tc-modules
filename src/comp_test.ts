//import clipplayer from './components/clipplayer';
//import playerTipDlg from './components/player_tip_dialog';
//import { checkbox, daycheck, dropdown, radiobtn, search, timeselect, toggle } from './components/uikit';

import checkbox from './components/uikit/checkbox';
import daycheck from './components/uikit/daycheck';
import dropdown from './components/uikit/dropdown';
import radiobtn from './components/uikit/radiobtn';
import search from './components/uikit/search';
import timeselect from './components/uikit/timeselect';
import toggle from './components/uikit/toggle';
import playerTipDlg from './components/player_tip_dialog';
import videoPlayDlg from './components/videoplay_dialog';

/* timeselect */
let timeselect1 = timeselect("timeselectId");
timeselect1.on("changed", function (event: any) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});
const date = new Date();
date.setHours(12);
date.setMinutes(24);
timeselect1.value = date;
/////////////////

/* toggle */
let toggleObj = toggle("toggleId");
toggleObj.on('changed', function (event: any) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});
toggleObj.value = false;
/////////////////

/* search */
let searchObj = search("searchId");
searchObj.on('changed', function (event: any) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});
searchObj.placeholder = '검색어를 입력하세요.';
searchObj.design = 'search';
/////////////////

/* radiogroup */
let radiobtnObj = radiobtn("radiobtnId");
radiobtnObj.on('changed', function (event: any) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});

radiobtnObj.items = [
    { value: 'qq1', text: 'radio1' },
    { value: 'qq2', text: 'radio2' },
    { value: 'qq3', text: 'radio3' },
    { value: 'qq4', text: 'radio4' }
];
radiobtnObj.value = 'qq2';
/////////////////

/* dropdown */
let dropdownObj = dropdown("dropdownId");
dropdownObj.on('changed', function (event: any) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});

dropdownObj.dropElementId = 'dropitem';
dropdownObj.dropPosition = 'right';
dropdownObj.value = true;
/////////////////

/* daycheck */
let daycheckObj = daycheck("daycheckId");
daycheckObj.on('changed', function (event: any) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});
daycheckObj.value = [true, false, true, false, true, false, true];
/////////////////

/* checkbox */
let checkboxObj = checkbox("checkboxId");
checkboxObj.on('changed', function (event: any) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});
checkboxObj.text = 'checklabel';
/////////////////

let dlgObj = playerTipDlg({
    elId: 'dlgId',
    dlgStyle : {
        width: '500px', height: '610px', padding: '24px', boxSizing: 'border-box', overflow: 'auto'
    },
    txtMap : {
        title : 'title',
        guideKeyFb : 'guideKeyFb',
        guideKeySpace : 'guideKeySpace',
        confirm : 'confirm'
    },
    eventHandler: function(event : any) {
        console.log(event);
    }
});

(window as any).playVideo = function () {
    let videoObj = videoPlayDlg({
        elId: 'dlgId2',
        dlgStyle : {
            width: '1180px', height: '730px', padding: '60px', boxSizing: 'border-box', overflow: 'auto'
        },
        webmUrl : "",
        mp4Url : "http://10.161.240.93:10000/3.mp4"
    });
}

/*
let clipplayerObj = clipplayer({
   elId: 'clipplayerId',
   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
   durationStr: "4:09",
   clipStatus: "4",
   thumbnailPath: "",
   startTime: 1564470720000,
   endTime: 1564470960000
});
*/