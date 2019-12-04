import creator from './../creator';
import confirmDialog from './confirm_dialog.vue';
import { IConfDlgParam } from '../interface';

function createDlg(param: IConfDlgParam) {
    return creator(param.elId, confirmDialog, {
        dlgStyle: param.dlgStyle,
        title: param.title,
        theme: param.theme,
        pCheckList: param.pCheckList,
        btns: param.btns,
        noCloseBtn: param.noCloseBtn,
        description: param.description
    }, param.eventHandler);
}

export default createDlg;