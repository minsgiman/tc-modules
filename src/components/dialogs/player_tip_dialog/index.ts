import creator from './../creator';
import playerTipDialog from './player_tip_dialog.vue';
import { IPlayerTipDlgParam } from '../interface';

function createDlg(param: IPlayerTipDlgParam) {
    return creator(param.elId, playerTipDialog, {
        dlgStyle: param.dlgStyle,
        txtMap: param.txtMap,
    }, param.eventHandler);
}

export default createDlg;
