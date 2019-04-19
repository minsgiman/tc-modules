<template>
    <div>
        <ul v-show="!fullMode" class="time_unit" id="time_units">
            <li :class="{on: timeRange === 10}">
                <button type="button" @click="changeTimeRange(10)">
                    <span>{{$t('TIMELINE_10MIN')}}</span>
                </button></li>
            <li :class="{on: timeRange === 60}">
                <button type="button" @click="changeTimeRange(60)">
                    <span>{{$t('TIMELINE_1HOUR')}}</span>
                </button></li>
            <li :class="{on: timeRange === 360}">
                <button type="button" @click="changeTimeRange(360)">
                    <span>{{$t('TIMELINE_6HOUR')}}</span>
                </button></li>
            <li :class="{on: timeRange === 1440}">
                <button type="button" @click="changeTimeRange(1440)">
                    <span>{{$t('TIMELINE_24HOUR')}}</span>
                </button>
            </li>
        </ul>

        <div class="fs_time" v-show="isFullScreen && fullMode">
            <div class="range_select_wrap">
                <spanly_flash_player class="left_icon"></spanly_flash_player>
                <button type="button" @click="changeTimeRange(60)" v-show="timeRange == 10">
                    <span class="fs_time_range">{{$t('TIMELINE_10MIN')}}</span>
                </button>
                <button type="button" @click="changeTimeRange(360)" v-show="timeRange == 60">
                    <span class="fs_time_range">{{$t('TIMELINE_1HOUR')}}</span>
                </button>
                <button type="button" @click="changeTimeRange(1440)" v-show="timeRange == 360">
                    <span class="fs_time_range">{{$t('TIMELINE_6HOUR')}}</span>
                </button>
                <button type="button" @click="changeTimeRange(10)" v-show="timeRange == 1440">
                    <span class="fs_time_range">{{$t('TIMELINE_24HOUR')}}</span>
                </button>
                <span class="right_icon"></span>
            </div>
            <div class="calendar_btn_wrap">
                <calendar_btn
                        v-bind:fullMode="fullMode"
                        v-on:event="updateCalendarDate()">
                </calendar_btn>
            </div>
        </div>
    </div>
</template>
<script>
    import store from '../../service/player/store';
    import calendar_btn from './calendar_btn';

    export default {
        name: 'timelineTimeController',
        props: ['timeline', 'fullMode'],
        computed: {
            timeRange: function () {
                return store.state.timeRange;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            isShowTimelineCalendar: function () {
                return store.state.isShowTimelineCalendar;
            },
            isExpiredCloud: function () {
                return store.getters.isExpiredCloud;
            },
            isFullScreen: function () {
                return store.state.isFullScreen;
            }
        },
        data: function () {
            return {
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
        },
        methods : {
            changeTimeRange: function (minutes) {
                this.timeline.setData('newTimelineDragCnt', 0);
                this.$emit('event', {event: 'dblClickFlagChanged', data: false});
                this.timeline.setData('lineMoveFlag', true);
                this.timeline.setData('changeTimeRangeClick', true);
                this.timeline.setData('dragThumCancle', false);
                if(this.timeRange == minutes){
                    return;
                }

                if(this.timeline.changeTimeRangeFlag == true){
                    this.$emit('event', {event: 'loadingDataAlert'});
                    return;
                }

                this.timeline.changeTimeRangeFlag = true;

                setTimeout(() => {
                    this.timeline.changeTimeRangeFlag = false;
                    this.timeline.updateCursor(this.currentTime);
                    this.timeline.getData('svg').select('.cursor').classed('hide', false);
                },800);
                store.dispatch('TIME_RANGE_CHANGE', minutes);

                if (this.timeline.getData('forceDomain')) {
                    this.timeline.setTimeRange(minutes);
                } else {
                    this.timeline.zoomDomain(this.timeline.domainCenterTime(), minutes);
                }
            },
            updateCalendarDate: function() {
                this.$emit('event', {event: 'updateCalendarDate'});
            }
        },
        components : {
            calendar_btn
        }
    }
</script>