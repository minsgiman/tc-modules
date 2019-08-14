import player from './components/player/light_main';

let playerObj = new player({
    serialNo: 'AZZDSF21312A',
    elementId : 'playerwrap',
    startTime : 1563837900000,
    endTime : 1563837903000,
    loop : true,    //default : true
    showTime : true,  //default : false
    coreSwfPath : '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf',    //default : '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf'
    skinSwfPath : '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf',    //default : '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf'
    getTokenUrl : 'http://10.161.240.93:10000/biz/cameras/token/:serialNo',    //default : '/biz/cameras/token/:serialNo',
    playEventHandler : function (event) {
        console.log('playEventHandler - event.status : ' + event.status); //event.status : 'NetStream.Play.Start', 'NetConnection.Connect.Closed', 'finish'
    }
});
// setTimeout(function() {
//     playerObj.destroy();
//     playerObj = null;
// }, 5000);