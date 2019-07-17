import dlg from './components/dialog/main';
import toggle from './components/toggle/main';
import timeselect from './components/timeselect/main';
import daycheck from './components/daycheck/main';

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