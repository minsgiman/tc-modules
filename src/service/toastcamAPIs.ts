import toastcamAPIs from 'toastcam-apis';

function toastAPICall(api: any, param?: any, successCb?: any, errorCb?: any) {
    toastcamAPIs.call(api, param, successCb, errorCb);
}

export default {
    call: toastAPICall,
    camera: toastcamAPIs.camera,
    account: toastcamAPIs.account,
    setConfig: toastcamAPIs.setConfig
};