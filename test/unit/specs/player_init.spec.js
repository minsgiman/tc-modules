import { player, timeline, playManager } from '@/api.esm';

describe('Play Init', () => {
    const playerType = 'flash';
    let playerObj, timelineObj, playManagerObj;

    beforeAll(async function (done) {
        playerObj = new player(playerType, 'playerWrapId');
        timelineObj = new timeline('timelineWrapId');
        playManagerObj = new playManager(playerObj, timelineObj);

        await playManagerObj.loadPlayData('AAAABBAAC');
        playManagerObj.livePlay();
        done();
    });

    it ('Player Create', () => {
        expect(playerObj).toBeDefined();
        expect(playerObj.type === playerType).toBeTruthy();
        expect(typeof playerObj.load === 'function').toBeTruthy();
        expect(typeof playerObj.play === 'function').toBeTruthy();
        expect(typeof playerObj.pause === 'function').toBeTruthy();
        expect(typeof playerObj.mute === 'function').toBeTruthy();
        expect(typeof playerObj.stop === 'function').toBeTruthy();
        expect(typeof playerObj.getCurrentTime === 'function').toBeTruthy();
        expect(typeof playerObj.setFullScreen === 'function').toBeTruthy();
        expect(typeof playerObj.setPlayStatusChangeListener === 'function').toBeTruthy();
        expect(typeof playerObj.destroy === 'function').toBeTruthy();
    });

    it ('Timeline Create', () => {
        expect(timelineObj).toBeDefined();
        expect(typeof timelineObj.draw === 'function').toBeTruthy();
        expect(typeof timelineObj.updateCvrArea === 'function').toBeTruthy();
        expect(typeof timelineObj.updateEvents === 'function').toBeTruthy();
        expect(typeof timelineObj.updateTimeRange === 'function').toBeTruthy();
        expect(typeof timelineObj.updatePositionCursor === 'function').toBeTruthy();
        expect(typeof timelineObj.setClickCvrAreaListener === 'function').toBeTruthy();
        expect(typeof timelineObj.setCvrAreaDragEndListener === 'function').toBeTruthy();
        expect(typeof timelineObj.destroy === 'function').toBeTruthy();
    });

    it('PlayManager Create', () => {
        expect(playManagerObj).toBeDefined();
        expect(typeof playManagerObj.loadPlayData === 'function').toBeTruthy();
        expect(typeof playManagerObj.livePlay === 'function').toBeTruthy();
        expect(typeof playManagerObj.cvrPlay === 'function').toBeTruthy();
        expect(typeof playManagerObj.playStop === 'function').toBeTruthy();
        expect(typeof playManagerObj.onPlayTimeInterval === 'function').toBeTruthy();
        expect(typeof playManagerObj.destroy === 'function').toBeTruthy();
    });

    it('PlayManager Load Data', async () => {
        expect(!!playManagerObj.cameraData).toBeTruthy();
        expect(!!playManagerObj.timelineData).toBeTruthy();
    });

    it('Play Start Check', async () => {
        const currentPlayTime = playerObj.getCurrentTime();

        console.log('currentPlayTime : ' + currentPlayTime);
        expect(currentPlayTime > 0).toBeTruthy();
    });
});