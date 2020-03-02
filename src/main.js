import player from './components/player/light_webrtc_main';

let playerObj = new player({
    serialNo: 'BC8AA30000B1',
    elementId : 'playerwrap',
    //startTime : 1581925202062,
    //endTime : 1581925402062,
    cvrJumpInterval : 5000,
    useControl : true, //default: false
    showTime : true,  //default : false
    credentialUrl: 'https://devmedia010.toastcam.com:10090/rtc/credential', //default : /rtc/credential
    candidateUrl: 'https://devmedia010.toastcam.com:10090/rtc/candidate',  //default : /rtc/candidate
    offerUrl: 'https://devmedia010.toastcam.com:10090/rtc/offer',          //default : /rtc/offer
    getCameraUrl: 'http://10.161.240.93:10000/biz/cameras/:serialNo',
    getTokenUrl : 'http://10.161.240.93:10000/biz/cameras/token/:serialNo',    //default : '/biz/cameras/token/:serialNo',
    getTimelineUrl : 'http://10.161.240.93:10000/biz/cameras/:serialNo/video',
    requestHeaders : {
        "testheader": "123",
        "testheader2": "1234"
    },
    playEventHandler : function (event) {
        console.log('playEventHandler - event.status : ' + event.status); //event.status : 'stream_connected', 'webrtc_server_error', 'finish', 'webrtc_not_support_browser'
        if (event.status === 'finish') {
            //playerObj.replay(1571289306000, 1571289316000);
        }
    }
});


// setTimeout(function() {
//     playerObj.destroy();
//     playerObj = null;
// }, 5000);

// import markdownViewer from "./components/markdown_viewer";
//
// new markdownViewer({
//     elementId: 'app',
//     source: '/README.md'
// });