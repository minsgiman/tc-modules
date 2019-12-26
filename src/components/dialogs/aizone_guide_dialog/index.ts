import creator from './../creator';
import aizoneGuideDialog from './aizone_guide_dialog.vue';
import { IAiZoneGuideDlgParam } from '../interface';

function createDlg(param: IAiZoneGuideDlgParam) {
    return creator(param.elId, aizoneGuideDialog, {
        dlgStyle: param.dlgStyle,
        txtMap: param.txtMap,
        noCloseBtn: param.noCloseBtn
    }, param.eventHandler);
}

export default createDlg;