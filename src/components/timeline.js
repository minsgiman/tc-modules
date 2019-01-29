class Timeline {
    constructor(elId) {
        this.elId = elId;
    }

    draw() {
        console.log('Timeline draw');
    }

    updateCvrArea() {
    }

    updateEvents() {
    }

    updateTimeRange() {
    }

    updatePositionCursor() {
    }

    destroy() {
    }

    onClickCvrArea(time) {
        //TODO: DO Timeline job
        if (this.clickCvrAreaListener) {
            this.clickCvrAreaListener(status)
        }
    }

    setClickCvrAreaListener(callback) {
        this.clickCvrAreaListener = callback;
    }

    onDrag() {
    }

    onDragEnd() {
        //TODO: Do Timeline job
        if (this.cvrAreaDragEndListener) {
            this.cvrAreaDragEndListener(status)
        }
    }

    setCvrAreaDragEndListener(callback) {
        this.cvrAreaDragEndListener = callback;
    }
}

export default Timeline;