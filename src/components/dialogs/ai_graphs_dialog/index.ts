import creator from './../creator';
import aiGraphsDialog from './ai_graphs_dialog.vue';
import { IAiGraphsDlgParam } from '../interface';

function createDlg(param: IAiGraphsDlgParam) {
    return creator(param.elId, aiGraphsDialog, {
        dlgStyle: param.dlgStyle,
        txtMap: param.txtMap,
        shopRegdate: param.shopRegdate,
        pRequestShopChart: param.pRequestShopChart,
        sundayFirst: param.sundayFirst
    }, param.eventHandler);
}

export default createDlg;