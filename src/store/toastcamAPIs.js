function loadCameraData (cameraId) {
    const apiPromise = new Promise((resolve, reject) => {
        console.log('loadCameraData');
        resolve({
            id : cameraId,
            mediaStreamURL : 'rtmps://devmedia010.toastcam.com:10082/flvplayback/' + cameraId,
            recorderType: 'cvr'   //'recorder'
        });
    });

    return apiPromise;
}

function loadCameraConfig (cameraId) {
    const apiPromise = new Promise((resolve, reject) => {
        console.log('loadCameraConfig');
        resolve({
            cameraStatus: 'on',
            streamStatus: 'on',
            controlStatus: 'on'
        });
    });

    return apiPromise;
}

function loadTimelineData(cameraId, scale, start, end) {
    const apiPromise = new Promise((resolve, reject) => {
        console.log('loadTimelineData');
        resolve({
            recTimes:[{"startTime":"1551327900000","id":"1551312000000","endTime":"1551334617461"}],
            events:[{"date":"20190228 03:05:37","playStartTime":"1551333933257","playEndTime":"1551333941790","zoneIdxs":"1","sgid":"AAAAAACQGK:1h:1551333600000:0","startTime":"1551333937257","id":"AAAAAACQGK:1h:1551333600000:0","endTime":"1551333941790"},{"date":"20190228 03:08:37","playStartTime":"1551334113659","playEndTime":"1551334130356","zoneIdxs":"1","sgid":"AAAAAACQGK:1h:1551333600000:1","startTime":"1551334117659","id":"AAAAAACQGK:1h:1551333600000:1","endTime":"1551334130356"},{"date":"20190228 03:09:17","playStartTime":"1551334153490","playEndTime":"1551334197556","zoneIdxs":"1","sgid":"AAAAAACQGK:1h:1551333600000:2","startTime":"1551334157490","id":"AAAAAACQGK:1h:1551333600000:2","endTime":"1551334197556"},{"date":"20190228 03:10:08","playStartTime":"1551334204658","playEndTime":"1551334322691","zoneIdxs":"1,2","sgid":"AAAAAACQGK:1h:1551334200000:0","startTime":"1551334208658","id":"AAAAAACQGK:1h:1551334200000:0","endTime":"1551334322691"},{"date":"20190228 03:12:55","playStartTime":"1551334371592","playEndTime":"1551334396590","zoneIdxs":"1","sgid":"AAAAAACQGK:1h:1551334200000:1","startTime":"1551334375592","id":"AAAAAACQGK:1h:1551334200000:1","endTime":"1551334396590"},{"date":"20190228 03:14:58","playStartTime":"1551334494026","playEndTime":"1551334502027","zoneIdxs":"1","sgid":"AAAAAACQGK:1h:1551334200000:2","startTime":"1551334498026","id":"AAAAAACQGK:1h:1551334200000:2","endTime":"1551334502027"},{"date":"20190228 03:15:35","playStartTime":"1551334531491","playEndTime":"1551334551290","zoneIdxs":"1","sgid":"AAAAAACQGK:1h:1551334200000:3","startTime":"1551334535491","id":"AAAAAACQGK:1h:1551334200000:3","endTime":"1551334551290"}]
        });
    });

    return apiPromise;
}

function getToken (cameraId) {
    const apiPromise = new Promise((resolve, reject) => {
        console.log('getToken');
        resolve({
            cameraId: cameraId,
            cvrHostPort: "rtmps://devmedia010.toastcam.com:10082",
            lifeTime: 30,
            regDate: 1551154957190,
            token: "b6e503e4-f47c-4238-baca-51cbdfc10032",
            type: "camtoken",
            userId: "05693e00-0c8f-11e8-9501-005056ac1497"
        });
    });

    return apiPromise;
}

function getAlarmZones (cameraId) {
    const apiPromise = new Promise((resolve, reject) => {
        console.log('getAlarmZones');
        const res = {
            "cameraId":"AAAAAACQGK",
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
        };

        let eventZones = res.eventZones,
            motionZones = res.zones,
            soundZone = eventZones.filter((value) => {
                return value.id == "0"
            })[0],
            accessZone = eventZones.filter((value) => {
                return value.id == "10000";
            })[0];

        resolve({
            eventZones, motionZones, soundZone, accessZone
        });
    });

    return apiPromise;
}

export default {
    loadCameraData, loadCameraConfig, loadTimelineData, getToken, getAlarmZones
};