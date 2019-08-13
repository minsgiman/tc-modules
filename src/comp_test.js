import dlg from './components/dialog/main';
import toggle from './components/toggle/main';
import timeselect from './components/timeselect/main';
import daycheck from './components/daycheck/main';
import radiobtn from './components/radiobtn/main';
import checkbox from './components/checkbox/main';
import search from './components/search/main';

let timeselect1 = timeselect({
    elId: 'timeselectId',
    eventHandler: function (event) {
      debugger;
    }
});


let toggleObj = toggle({
  elId: 'toggleId',
  eventHandler: function (event) {
      debugger;
  }
});

let daycheckObj = daycheck({
    elId: 'daycheckId',
    eventHandler: function (event) {
        debugger;
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
        debugger;
    }
});
radiobtnObj.setValue('qq2');
console.log('getValue: ' + radiobtnObj.getValue());

let checkboxObj = checkbox({
    elId: 'checkboxId',
    name: 'checkboxtest',
    text: 'checklabel',
    eventHandler: function (event) {
        debugger;
    }
});

let searchObj = search({
    elId: 'searchId',
    placeholder: '검색',
    eventHandler: function (event) {
        console.log('search - event.event : ' + event.event + ', event.value : ' + event.value);
    }
});

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