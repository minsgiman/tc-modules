import creator from './../creator';
import aiStatsDialog from './ai_stats_dialog.vue';
import { IAiStatsDlgParam } from '../interface';

function createDlg(param: IAiStatsDlgParam) {
    return creator(param.elId, aiStatsDialog, {
        dlgStyle: param.dlgStyle,
        txtMap: param.txtMap,
        pCameraSummaries: param.pCameraSummaries
    }, param.eventHandler);
}

export default createDlg;