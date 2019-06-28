import dlg from './components/dialog/main';

let mydlg = dlg({
    elId: 'dlgID',
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
        alert('event : ' + event.event);
    }
});

let mydlg2 = dlg({
    elId: 'dlgID2',
    theme: 'toast',
    header: '<span>title2</span>',
    contents: '<p>CONTENTS2</p>',
    footer: '',
    btn: {
        items: [
            {id: 'confirm', name: 'OK', type: 'confirm'},
            {id: 'close', name: 'NO', type: 'cancel'}
        ],
        align: 'bottom'
    },
    eventHandler: function (event) {
        alert('event : ' + event.event);
    }
});

setTimeout(function() {
    mydlg.destroy();
    mydlg = null;
}, 4000);