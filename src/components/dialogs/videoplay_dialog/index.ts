import creator from './../creator';
import videoPlayDialog from './videoplay_dialog.vue';
import { IVideoDlgParam } from '../interface';

function createDlg(param: IVideoDlgParam) {
    return creator(param.elId, videoPlayDialog, {
        dlgStyle: param.dlgStyle,
        webmUrl: param.webmUrl,
        mp4Url: param.mp4Url
    }, param.eventHandler);
}

export default createDlg;
