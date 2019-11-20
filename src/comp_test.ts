// import clipplayer from './components/clipplayer';
// import playerTipDlg from './components/player_tip_dialog';
// import { checkbox, daycheck, dropdown, radiobtn, search, timeselect, toggle } from './components/uikit';

import checkbox from './components/uikit/checkbox';
import daycheck from './components/uikit/daycheck';
import dropdown from './components/uikit/dropdown';
import radiobtn from './components/uikit/radiobtn';
import search from './components/uikit/search';
import timeselect from './components/uikit/timeselect';
import toggle from './components/uikit/toggle';
import { playerTipDialog, videoPlayDialog, confirmDialog } from './components/dialogs';

/* timeselect */
const timeselect1 = timeselect('timeselectId');
timeselect1.on('changed', (event: any) => {
    console.log('event : ' + event.type);  // event : changed
    console.log('value : ' + event.value); // value : true
});
const date = new Date();
date.setHours(12);
date.setMinutes(24);
timeselect1.value = date;
/////////////////

/* toggle */
const toggleObj = toggle('toggleId');
toggleObj.on('changed', (event: any) => {
    console.log('event : ' + event.type);  // event : changed
    console.log('value : ' + event.value); // value : true
});
toggleObj.value = false;
/////////////////

/* search */
const searchObj = search('searchId');
searchObj.on('changed', (event: any) => {
    console.log('event : ' + event.type);  // event : changed
    console.log('value : ' + event.value); // value : true
});
searchObj.placeholder = '검색어를 입력하세요.';
searchObj.design = 'search';
/////////////////

/* radiogroup */
const radiobtnObj = radiobtn('radiobtnId');
radiobtnObj.on('changed', (event: any) => {
    console.log('event : ' + event.type);  // event : changed
    console.log('value : ' + event.value); // value : true
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
const dropdownObj = dropdown('dropdownId');
dropdownObj.on('changed', (event: any) => {
    console.log('event : ' + event.type);  // event : changed
    console.log('value : ' + event.value); // value : true
});

dropdownObj.dropElementId = 'dropitem';
dropdownObj.dropPosition = 'right';
dropdownObj.value = true;
/////////////////

/* daycheck */
const daycheckObj = daycheck('daycheckId');
daycheckObj.on('changed', (event: any) => {
    console.log('event : ' + event.type);  // event : changed
    console.log('value : ' + event.value); // value : true
});
daycheckObj.value = [true, false, true, false, true, false, true];
/////////////////

/* checkbox */
const checkboxObj = checkbox('checkboxId');
checkboxObj.on('changed', (event: any) => {
    console.log('event : ' + event.type);  // event : changed
    console.log('value : ' + event.value); // value : true
});
checkboxObj.text = 'checklabel';
/////////////////

const dlgObj = playerTipDialog({
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
    eventHandler: (event: any) => {
        console.log(event);
    }
});

(window as any).playVideo = () => {
    const videoObj = videoPlayDialog({
        elId: 'dlgId2',
        dlgStyle : {
            width: '1180px', height: '730px', padding: '60px', boxSizing: 'border-box', overflow: 'auto'
        },
        webmUrl : '',
        mp4Url : 'http://10.161.240.93:10000/3.mp4'
    });
}

(window as any).showConfirm = () => {
    const confirmObj = confirmDialog({
        elId: 'dlgId3',
        dlgStyle : {
            width: '450px', height: '208px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
        },
        title : '',
        description : '로그인이 만료되었거나, 비정상적인 접근입니다.<br>다시 로그인해주세요.',
        btns : [{name: 'conf', text: '확인', style: 'blue'}],
        eventHandler : (event: any) => {
            console.log(event)
        }
    })
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
