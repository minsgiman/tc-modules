async function loadCameraData (cameraId) {
    console.log('loadCameraData');
    return {id : cameraId};
}

async function loadTimelineData (cameraId, scale, start, end) {
    console.log('loadTimelineData');
    return {start: 0, end: 0};
}

class PlayManager {
    constructor(player, timeline) {
        this.cameraData = null;
        this.timelineData = null;
        this.player = player;
        this.timeline = timeline;
        this.player.setPlayStatusChangeListener(this.playStatusChangeListener);
        this.timeline.setClickCvrAreaListener(this.clickCvrAreaListener);
        this.timeline.setCvrAreaDragEndListener(this.cvrAreaDragEndListener);
    }

    async loadPlayData (cameraId) {
        this.cameraData = await loadCameraData(cameraId);
        this.timelineData = await loadTimelineData(cameraId, '10m', 1548727100000, 1548729000000);
        this.timeline.draw();
        await this.player.load();
    }

    livePlay() {
        this.timeline.updateTimeRange(this.timelineData.range);
        this.timeline.updateCvrArea(this.timelineData.cvrData);
        this.timeline.updateEvents(this.timelineData.events);
        this.timeline.updatePositionCursor(Date.now());
        this.player.play({
            path: this.cameraData.path,
            url: this.cameraData.url,
            time: Date.now()
        });
    }

    cvrPlay(time) {
        this.timeline.updateTimeRange(this.timelineData.range);
        this.timeline.updateCvrArea(this.timelineData.cvrData);
        this.timeline.updateEvents(this.timelineData.events);
        this.timeline.updatePositionCursor(time);
        this.player.play({
            path: this.cameraData.path,
            url: this.cameraData.url,
            time: time
        });
    }

    playStop() {
    }

    destroy() {
    }

    async onPlayTimeInterval() {
        const currentTime = this.cameraData.getCurrentTime();

        if (this.timelineData.range[0] < currentTime && this.timelineData.range[1] > currentTime) {
            this.timeline.setData({
                time: currentTime
            });
        } else {
            this.timelineData = await loadTimelineData(cameraId, '10m', 1548727100000, 1548729000000);
            this.timeline.setData({
                time: currentTime,
                range: this.timelineData.range,
                events: this.timelineData.events,
                cvrData: this.timelineData.cvrData
            });
        }
    }

    playStatusChangeListener(status) {
    }

    clickCvrAreaListener(time) {
    }

    cvrAreaDragEndListener(time) {
    }
}

export default PlayManager;