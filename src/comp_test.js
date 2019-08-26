import dlg from './components/dialog/main';
import toggle from './components/toggle/main';
import timeselect from './components/timeselect/main';
import daycheck from './components/daycheck/main';
import radiobtn from './components/radiobtn/main';
import checkbox from './components/checkbox/main';
import search from './components/search/main';
import dropdown from './components/dropdown/main';
import clipplayer from './components/clipplayer/main';

let timeselect1 = timeselect({
    elId: 'timeselectId',
    eventHandler: function (event) {
        console.log('timeselect - event.event : ' + event.event + ', event.value : ' + event.value);
    }
});


let toggleObj = toggle({
  elId: 'toggleId',
  eventHandler: function (event) {
      console.log('toggle - event.event : ' + event.event + ', event.value : ' + event.value);
  }
});

let daycheckObj = daycheck({
    elId: 'daycheckId',
    eventHandler: function (event) {
        console.log('daycheck - event.event : ' + event.event + ', event.value : ' + event.value);
    }
});

let radiobtnObj = radiobtn({
    elId: 'radiobtnId',
    name: 'radiotest',
    items: [
        {
            value: 'qq1',
            text: 'radio1'
        },
        {
            value: 'qq2',
            text: 'radio2'
        },
        {
            value: 'qq3',
            text: 'radio3'
        },
        {
            value: 'qq4',
            text: 'radio4'
        }
    ],
    eventHandler: function (event) {
        console.log('radiobtn - event.event : ' + event.event + ', event.value : ' + event.value);
    }
});
radiobtnObj.setValue('qq2');
console.log('getValue: ' + radiobtnObj.getValue());

let checkboxObj = checkbox({
    elId: 'checkboxId',
    name: 'checkboxtest',
    text: 'checklabel',
    eventHandler: function (event) {
        console.log('checkbox - event.event : ' + event.event + ', event.value : ' + event.value);
    }
});

let searchObj = search({
    elId: 'searchId',
    placeholder: '검색',
    eventHandler: function (event) {
        console.log('search - event.event : ' + event.event + ', event.value : ' + event.value);
    }
});

let dropdownObj = dropdown({
    elId: 'dropdownId',
    dropElId: 'dropitem',
    position: 'right',
    eventHandler: function (event) {
        console.log('dropdown - event.event : ' + event.event + ', event.value : ' + event.value);
    }
});

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

/*
let mydlg = dlg({
    elId: 'dlgId',
    theme: 'toast',
    header: '<span>title</span>',
    contents: '<p>CONTENTS</p>',
    footer: '',
    btn: {
        items: [
            {id: 'confirm', name: 'OK', type: 'confirm'},
            {id: 'close', name: 'NO', type: 'cancel'}
        ],
        align: 'bottom'
    },
    eventHandler: function (event) {
        mydlg.destroy();
        mydlg = null;
    }
});
*/