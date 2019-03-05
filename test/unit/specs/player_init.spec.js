import { player } from '@/api.esm';

describe('Play Init', () => {
    let playerObj;

    beforeAll(async function (done) {
        playerObj = new player({
            cameraId : 'AAAABBAAC',
            videoElId : 'playerWrapId',
            timelineElId : 'timelineWrapId'
        });

        await playerObj.initialize();


        // playerObj = new player(playerType, 'playerWrapId');
        // timelineObj = new timeline('timelineWrapId');
        // playManagerObj = new playManager(playerObj, timelineObj);
        //
        // await playManagerObj.loadPlayData('AAAABBAAC');
        // playManagerObj.livePlay();
        done();
    });

    it ('Player Create', () => {
        expect(playerObj).toBeDefined();
        expect(typeof playerObj.play === 'function').toBeTruthy();
        expect(typeof playerObj.stop === 'function').toBeTruthy();
        expect(typeof playerObj.pause === 'function').toBeTruthy();
    });

    it('Play Start Check', async () => {
        // const currentPlayTime = playerObj.getCurrentTime();
        //
        // console.log('currentPlayTime : ' + currentPlayTime);
        // expect(currentPlayTime > 0).toBeTruthy();
    });
});