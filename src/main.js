import player from './components/player/player_main';

function startPlayer () {
    const playerObj = new player({
        cameraId : 'AAAAAACHHX',
        shopId : '',  //optional
        groupId : '', //optional
        isShared : false,
        elementId : 'videoWrap'
    });
    playerObj.initialize(() => {
        playerObj.play();
    });
}

startPlayer();

