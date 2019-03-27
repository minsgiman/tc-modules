import player from './components/player/main';

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

