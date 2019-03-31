import toastcamAPIs from "toastcam-apis";

function toastAPICall (api, param, successCb, errorCb) {
    var isTest = false;

    if (!isTest) {
        toastcamAPIs.call(api, param, successCb, errorCb);
    } else {
        switch(api) {
            case toastcamAPIs.camera.GET_TOKEN:
                successCb({
                    cameraId: 'AAAAAACHHX',
                    cvrHostPort: "rtmps://devmedia011.toastcam.com:10082",
                    lifeTime: 30,
                    regDate: 1551154957190,
                    token: "b6e503e4-f47c-4238-baca-51cbdfc10032",
                    type: "camtoken",
                    userId: "05693e00-0c8f-11e8-9501-005056ac1497"
                });
                break;
            case toastcamAPIs.camera.CHECK_IS_LAST_RECORD:
                successCb({
                    lastEventStartTime: 0,
                    lastRectStartTime: 0
                });
                break;
            case toastcamAPIs.camera.GET_CAMERA_DETAIL:
                successCb({
                    "serviceType":"7d",
                    "isLanSupport":0,
                    "needUpgrade":"NO",
                    "controlStatus":"on",
                    "code":"ok",
                    "isPromotion":0,
                    "isCameraCfgSupport":1,
                    "mediaStreamURL":"rtmps://devmedia011.toastcam.com:10082/flvplayback/AAAAAACHHX",
                    "regDate":1549531741827,
                    "shopName":"IOT사업본부(변경X)",
                    "type":"result",
                    "ssid":"tc-iot-2-5g",
                    "sharedCount":0,
                    "vendorCode":"NHNENT",
                    "cloud":true,
                    "isBleSupport":1,
                    "id":"AAAAAACHHX",
                    "labelName":"근태용캠(1BB9)",
                    "firmwareVersion":"v1.1.0.23",
                    "hasConfigPermission":true,
                    "serviceEndDate":1612623599999,
                    "isAudioSupport":1,
                    "recordType":"24h",
                    "isNotifyCfgSupport":1,
                    "isEventSupport":1,
                    "isAlarmZoneCfgSupport":1,
                    "firmwareUpgradeStatus":0,
                    "serialNo":"BC8AA3001BB9",
                    "modelName":"NECAM-100",
                    "isClipSupport":1,
                    "hasClipPermission":true,
                    "eventStatus":"on",
                    "saveEndDate":1612796399999,
                    "isSensorSupport":0,
                    "streamStatus":"on",
                    "recorderType":"cvr"
                });
                break;
            case toastcamAPIs.camera.GET_CAMERA_CONFIG:
                successCb({
                    "cas":-100,
                    "name":"근태용캠(1BB9)",
                    "language":"ko",
                    "timezone":"268,Asia/Seoul,Asia/Seoul,+09:00",
                    "ssid":"tc-iot-2-5g",
                    "wifiAuthMethod":"WPA2",
                    "wifiPassword":"",
                    "firmwareVersion":"v1.1.0.23",
                    "cameraStatus":"on",
                    "ledLight":"on",
                    "nightvision":"auto",
                    "nvThreshold":"50",
                    "rotation":"off",
                    "mic":"off",
                    "micVolume":"0",
                    "motionDetect":"on",
                    "audioDetect":"on",
                    "motionDetectSensitivity":"6",
                    "audioDetectSensitivity":"3",
                    "resolution":"HD",
                    "controlStatus":"on",
                    "eventStatus":"on",
                    "streamStatus":"on",
                    "streamStatusLastUpdateDate":-100,
                    "cameraSchedule":{
                        "scheduleOn":"off",
                        "startAt":"",
                        "stopAt":"",
                        "repeatOn":""
                    },
                    "secureMode":"off",
                    "securePassword":"",
                    "secureEncryptPassword":null,
                    "recStopInHome":"off",
                    "usageRate":0,
                    "usageTime":232000,
                    "usageTotTime":86400000,
                    "live":"off",
                    "alertSound":"off",
                    "access":"on",
                    "netmode":"wireless",
                    "sharpness":"161",
                    "deNoise":"160",
                    "saturation":"75",
                    "exposureRatio":"135",
                    "exposureMode":"1",
                    "backlight":"0",
                    "whiteBalance":"0",
                    "localExposure":"0",
                    "brightness":"0",
                    "contrast":"64",
                    "framerate":"15",
                    "hue":"110",
                    "wdrMode":"0",
                    "bitrateAvg":"90",
                    "gopSize":"60",
                    "bitrate":"700",
                    "ifMin":"10",
                    "ifMax":"32",
                    "bfMin":"10",
                    "bfMax":"36",
                    "pfMin":"10",
                    "pfMax":"34",
                    "bcUUID":"9197e7d5-ec69-4ba6-8119-a64cf8e6ad26",
                    "bcMajorId":2,
                    "bcMinorId":2,
                    "isLanSupport":0,
                    "isSensorSupport":0,
                    "notifyOn":"on",
                    "recorderType":"cvr",
                    "hasSensor":false
                });
                break;
            case toastcamAPIs.camera.GET_EVENT_ZONES:
                successCb({
                    "cameraId":"AAAAAACHHX",
                    "zones":[
                        {"id":"1","uid":"1","labelName":"myZone","color":"#ff7900",
                            "status":"on","coordinate":"465,142,397,374","regDate":1551333927855,"modifyDate":1551333935158,
                            "type":"zone","filterMark":"on"
                        },
                        {"id":"9","uid":"9","labelName":"myZone9","color":"#929292",
                            "status":"off","coordinate":"1,1,1000,1000","regDate":1551333927855,"modifyDate":1551333927855,
                            "type":"zone","filterMark":"on"
                        }
                    ],
                    "eventZones":[
                        {"id":"0","uid":"1","labelName":"소리","color":"#18b57b",
                            "status":"on","coordinate":"100, 100, 200, 200","regDate":1551258918295,"modifyDate":1551258918295,
                            "type":"zone","filterMark":"on"
                        },
                        {"id":"10000","uid":"1","labelName":"입장","color":"#ff1e00",
                            "status":"on","coordinate":"100, 100, 200, 200","regDate":1551258918295,"modifyDate":1551258918295,
                            "type":"zone","filterMark":"on"
                        },
                        {"id":"20000","uid":"1","labelName":"퇴장","color":"#ff1e00",
                            "status":"on","coordinate":"100, 100, 200, 200","regDate":1551258918295,"modifyDate":1551258918295,
                            "type":"zone","filterMark":"on"
                        }
                    ]
                });
                break;
            case toastcamAPIs.camera.GET_TIMELINE:
                successCb({
                    recTimes:[{"startTime":"1553656500000","id":"1551312000000","endTime":"1553662725977"}],
                    events:[{"date":"20190228 03:05:37","playStartTime":"1551333933257","playEndTime":"1551333941790","zoneIdxs":"1","sgid":"AAAAAACHHX:1h:1551333600000:0","startTime":"1551333937257","id":"AAAAAACHHX:1h:1551333600000:0","endTime":"1551333941790"},{"date":"20190228 03:08:37","playStartTime":"1551334113659","playEndTime":"1551334130356","zoneIdxs":"1","sgid":"AAAAAACHHX:1h:1551333600000:1","startTime":"1551334117659","id":"AAAAAACHHX:1h:1551333600000:1","endTime":"1551334130356"},{"date":"20190228 03:09:17","playStartTime":"1551334153490","playEndTime":"1551334197556","zoneIdxs":"1","sgid":"AAAAAACHHX:1h:1551333600000:2","startTime":"1551334157490","id":"AAAAAACHHX:1h:1551333600000:2","endTime":"1551334197556"},{"date":"20190228 03:10:08","playStartTime":"1551334204658","playEndTime":"1551334322691","zoneIdxs":"1,2","sgid":"AAAAAACHHX:1h:1551334200000:0","startTime":"1551334208658","id":"AAAAAACHHX:1h:1551334200000:0","endTime":"1551334322691"},{"date":"20190228 03:12:55","playStartTime":"1551334371592","playEndTime":"1551334396590","zoneIdxs":"1","sgid":"AAAAAACHHX:1h:1551334200000:1","startTime":"1551334375592","id":"AAAAAACHHX:1h:1551334200000:1","endTime":"1551334396590"},{"date":"20190228 03:14:58","playStartTime":"1551334494026","playEndTime":"1551334502027","zoneIdxs":"1","sgid":"AAAAAACHHX:1h:1551334200000:2","startTime":"1551334498026","id":"AAAAAACHHX:1h:1551334200000:2","endTime":"1551334502027"},{"date":"20190228 03:15:35","playStartTime":"1551334531491","playEndTime":"1551334551290","zoneIdxs":"1","sgid":"AAAAAACHHX:1h:1551334200000:3","startTime":"1551334535491","id":"AAAAAACHHX:1h:1551334200000:3","endTime":"1551334551290"}]
                });
                break;
            case toastcamAPIs.camera.GET_SHARE_CAM_TIMELINE:
                successCb({
                    "recTimes":[
                        {
                            "startTime":"1552257300000",
                            "id":"1552176000000",
                            "endTime":"1552264074812"
                        }
                    ],
                    "events":[
                        {
                            "date":"20190311 08:13:55",
                            "playStartTime":"1552259631838",
                            "playEndTime":"1552259637838",
                            "zoneIdxs":"ACCESS_ENTER",
                            "sgid":"ACCESS_ENTER:5acc7cb1-9c7a-4193-a021-b04b6219c24c:3525dfac-fd98-405e-94c8-d421ed1fb106",
                            "startTime":"1552259635838",
                            "id":"ACCESS_ENTER:5acc7cb1-9c7a-4193-a021-b04b6219c24c:3525dfac-fd98-405e-94c8-d421ed1fb106",
                            "endTime":"1552259637838"
                        },
                        {
                            "date":"20190311 08:26:37",
                            "playStartTime":"1552260393319",
                            "playEndTime":"1552260399319",
                            "zoneIdxs":"ACCESS_ENTER",
                            "sgid":"ACCESS_ENTER:5acc7cb1-9c7a-4193-a021-b04b6219c24c:9f6cc71e-4020-416a-bde6-761bc21bfc77",
                            "startTime":"1552260397319",
                            "id":"ACCESS_ENTER:5acc7cb1-9c7a-4193-a021-b04b6219c24c:9f6cc71e-4020-416a-bde6-761bc21bfc77",
                            "endTime":"1552260399319"
                        },
                        {
                            "date":"20190311 09:07:21",
                            "playStartTime":"1552262837050",
                            "playEndTime":"1552262843050",
                            "zoneIdxs":"ACCESS_ENTER",
                            "sgid":"ACCESS_ENTER:5acc7cb1-9c7a-4193-a021-b04b6219c24c:7fd39c06-caf7-46fa-bba2-5925183fb78f",
                            "startTime":"1552262841050",
                            "id":"ACCESS_ENTER:5acc7cb1-9c7a-4193-a021-b04b6219c24c:7fd39c06-caf7-46fa-bba2-5925183fb78f",
                            "endTime":"1552262843050"
                        }
                    ]
                });
                break;
            default:
                break;
        }
    }
}

export default {
    call: toastAPICall,
    camera: toastcamAPIs.camera,
    account: toastcamAPIs.account,
    setConfig: toastcamAPIs.setConfig
};