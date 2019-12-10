import creator from './../creator';
import aiGraphsDialog from './ai_graphs_dialog.vue';
import { IAiGraphsDlgParam } from '../interface';

function createDlg(param: IAiGraphsDlgParam) {
    return creator(param.elId, aiGraphsDialog, {
        dlgStyle: param.dlgStyle,
        txtMap: param.txtMap,
        pShopStats: param.pShopStats,
        pAiGraphObject: param.pAiGraphObject,
        pRequestCamStats: param.pRequestCamStats,
        pRequestShopStats: param.pRequestShopStats,
        pGetCameraName: param.pGetCameraName,
        pAiStartTime: param.pAiStartTime,
        pAiEndTime: param.pAiEndTime,
        pAiIs24Hours: param.pAiIs24Hours
    }, param.eventHandler);
}

export default createDlg;