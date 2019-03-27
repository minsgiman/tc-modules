import player from './../test/player/player_main';

let playerObj = new player({
    cameraId : 'AAAAAACHHX',
    shopId : '',  //optional
    groupId : '', //optional
    isShared : false,
    elementId : 'videoWrap'
});
playerObj.initialize(() => {
    playerObj.play();
});

// setTimeout(function() {
//     playerObj.destroy();
//     playerObj = null;
// }, 10 * 1000);

