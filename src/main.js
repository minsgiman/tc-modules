import player from './components/player/light_webrtc_main';

let playerObj = new player({
    serialNo: 'AZZDSF21312A',
    elementId : 'playerwrap',
    startTime : 1571289300000,
    endTime : 1571289330000,
    usePauseResume: true,  //default: false
    loop : true,    //default : true
    showTime : true,  //default : false
    getTokenUrl : 'http://10.161.240.93:10000/biz/cameras/token/:serialNo',    //default : '/biz/cameras/token/:serialNo',
    playEventHandler : function (event) {
        console.log('playEventHandler - event.status : ' + event.status); //event.status : 'NetStream.Play.Start', 'NetConnection.Connect.Closed', 'finish'
    }
});
// setTimeout(function() {
//     playerObj.destroy();
//     playerObj = null;
// }, 5000);