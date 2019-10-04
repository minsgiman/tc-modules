<script>
    import store from '../../service/player/store';

    export default {
        name: 'playTimer',
        props: [],
        computed: {
            isPlaying: function () {
                return store.state.isPlaying;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            cameraData: function () {
                return store.state.cameraData;
            },
            isLive: function () {
                return store.state.isLive;
            },
            playBtnStatus: function () {
                return store.state.playBtnStatus;
            }
        },
        data: function () {
            return {
                beforeServerTime : 0,
                timer : null,
                playerCheck : false,
                cursorIdx : 0,
                cursorNowTime : 0
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            this.stopTimer();
        },
        methods : {
            startRecTimer : function(time, player, timeline) {
                this.beforeServerTime = 0;
                store.dispatch('CURRENT_TIME_CHANGE', new Date(time.valueOf()));
                clearInterval(this.timer);
                this.timer = setInterval(() => {

                    if(this.playBtnStatus == false){
                        return;
                    }

                    if(this.playerCheck == false){
                        return;
                    }

                    timeline.cvrDrawCheck(this.currentTime);

                    if(timeline.cvrCheck == false){
                        if (this.cameraData.recordType == "event") {
                            if (!timeline.isCursorLeft && !timeline.isCursorRight) {
                                this.$emit('event', {event: 'jumpToNextRecord'});
                            }
                        } else {
                            if(timeline.lineMoveFlag == false){
                                store.dispatch('IS_PLAYING_CHANGE', false);
                                this.$emit('event', {event: 'noCvrError'});
                                clearInterval(this.timer);
                                if (player) {
                                    player.close();
                                }
                                return;
                            }
                        }
                    }else{
                        store.dispatch('IS_PLAYING_CHANGE', true);
                        this.$emit('event', {event: 'checkNoCvr'});
                    }

                    if(this.cursorIdx == 0){
                        this.cursorNowTime = this.currentTime.valueOf();
                        this.cursorIdx++;
                    }else{
                        let currentTime = player.getCurrentTime();
                        if (currentTime) {
                            var addSec = (((currentTime[0] || 0 ) * 1000) - this.beforeServerTime);
                            if(addSec <= 0){
                                addSec = 1000;
                            }
                            this.cursorNowTime = this.cursorNowTime + addSec;
                            this.beforeServerTime = (currentTime[0] || 0 ) * 1000;
                            store.dispatch('CURRENT_TIME_CHANGE', new Date(this.cursorNowTime));
                        } else {
                            addSec = 1000;
                            this.cursorNowTime = this.cursorNowTime + addSec;
                            store.dispatch('CURRENT_TIME_CHANGE', new Date(this.cursorNowTime));
                        }
                    }

                    var currentDomain = timeline.getData('currentDomain');
                    if(currentDomain == undefined){
                        return;
                    }

                    var range = 0, fixRange = 0, domain = currentDomain;

                    switch(timeline.getData('timeRange')){
                        case 10:
                            range = 600000;
                            fixRange = 0;
                            break;
                        case 60:
                            range = 600000 * 6;
                            fixRange = 200000;
                            break;
                        case 360:
                            range = 600000 * 6 * 6;
                            fixRange = 1245000;
                            break;
                        case 1440:
                            range = 600000 * 6 * 6 * 4;
                            fixRange = 3650000;
                            break;
                    }

                    if (domain[0] + range < this.currentTime.valueOf() && domain[1] - range - fixRange > this.currentTime.valueOf()) {
                        timeline.lineMoveFlag = false;
                    }else{
                        if(timeline.lineMoveFlag == false){
                            timeline.setData('changeTimeRangeClick', true);
                            this.$emit('event', {event: 'pressedFindCursorButton'});
                        }
                    }

                    if(timeline.lineMoveFlag == false){
                        if (domain[0] < this.cursorNowTime && domain[1] > this.cursorNowTime) {
                            timeline.updateCursor(new Date(this.cursorNowTime));
                        }else{
                            timeline.setData('changeTimeRangeClick', true);
                            timeline.nextDomain();
                        }
                    }

                }, timeline.getData('cursorInterval'));
            },

            startLiveTimer : function(timeline) {
                var range = 0, fixRange = 0;

                timeline.setData('forceDomain', true);
                clearInterval(this.timer);
                this.timer = setInterval(() => {
                    const currentTime = new Date();
                    switch(timeline.getData('timeRange')){
                        case 10:
                            range = 600000;
                            fixRange = 0;
                            break;
                        case 60:
                            range = 600000 * 6;
                            fixRange = 200000;
                            break;
                        case 360:
                            range = 600000 * 6 * 6;
                            fixRange = 1245000;
                            break;
                        case 1440:
                            range = 600000 * 6 * 6 * 4;
                            fixRange = 3650000;
                            break;
                    }

                    if(this.playBtnStatus == false){
                        return;
                    }
                    store.dispatch('CURRENT_TIME_CHANGE', currentTime);
                    var currentDomain = timeline.getData('currentDomain');
                    if(currentDomain == undefined){
                        return;
                    }

                    var domain = currentDomain;

                    if (domain[0] + range < currentTime.getTime() && domain[1]- range - fixRange > currentTime.getTime()) {
                        timeline.updateCursor();
                        timeline.lineMoveFlag = false;
                    }else{
                        if(timeline.lineMoveFlag == false){
                            timeline.setData('changeTimeRangeClick', true);
                            this.$emit('event', {event: 'pressedFindCursorButton'});
                            timeline.lineMoveFlag = true;
                        }
                    }
                }, timeline.getData('cursorInterval'));
            },

            stopTimer : function() {
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            },

            setData : function(key, value) {
                this[key] = value;
            },

            getData : function(key) {
                return this[key];
            }
        }
    }
</script>