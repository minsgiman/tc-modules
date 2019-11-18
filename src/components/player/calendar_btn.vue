<template>
    <span>
        <span v-show="!fullMode" class="calendar">
            <button type="button" :class="{on: isShowTimelineCalendar}" @click="pressedShowTimelineCalendarButton()">
                <span>{{$t('CAMERA_DAY_DIRECT')}}</span>
            </button>
        </span>

        <span v-show="fullMode">
            <button type="button" :class="{on: isShowTimelineCalendar}" @click="pressedShowTimelineCalendarButton()" class="last">
                <span class="fs_time_range"><div class="calendar"></div>{{$t('CAMERA_DAY_TIME')}}</span>
            </button>
        </span>
    </span>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';

    @Component
    export default class CalendarBtn extends Vue {
        @Prop() fullMode!: any;

        get isShowTimelineCalendar() {
            return store.state.isShowTimelineCalendar;
        }

        pressedShowTimelineCalendarButton() {
            const isShowTimelineCalendar = !this.isShowTimelineCalendar;
            store.dispatch('IS_SHOW_CALENDAR_CHANGE', isShowTimelineCalendar);
            if (isShowTimelineCalendar) {
                this.$emit('event', {event: 'updateCalendarDate'});
            }
        }
    }
</script>