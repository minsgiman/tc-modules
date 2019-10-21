import player from './components/player/light_webrtc_main';

let playerObj = new player({
    serialNo: 'AZZDSF21312A',
    elementId : 'playerwrap',
    startTime : 1571289300000,
    endTime : 1571289306000,
    usePauseResume: true,  //default: false
    loop : true,    //default : true
    showTime : true,  //default : false
    credentialUrl: 'https://mediartc.toast.com:8080/rtc/credential', //default : /rtc/credential
    candidateUrl: 'https://mediartc.toast.com:8080/rtc/candidate',  //default : /rtc/candidate
    offerUrl: 'https://mediartc.toast.com:8080/rtc/offer',          //default : /rtc/offer
    getTokenUrl : 'http://10.161.240.93:10000/biz/cameras/token/:serialNo',    //default : '/biz/cameras/token/:serialNo',
    playEventHandler : function (event) {
        console.log('playEventHandler - event.status : ' + event.status); //event.status : 'stream_connected', 'webrtc_server_error', 'finish', 'webrtc_not_support_browser'
    }
});
// setTimeout(function() {
//     playerObj.destroy();
//     playerObj = null;
// }, 5000);