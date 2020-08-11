<template>
    <div id="timeline_time_selector_wrap" class="calendar_select" :class="{calendar_select_full: isFullScreen || category === 'b2bmonitor'}" v-show="isShowTimelineCalendar">
        <button type="button" class="sp btn_close" @click="hideSelector()"></button>
        <h3>{{$t('CAMERA_DAY_DIRECT')}}</h3>
        <ul>
            <li>
                <span class="inp_box calendar" @click="toggleTimelineCalendar()" style="width: 140px;">
                    <input type="text" v-model="timelineDate.date" id="timelineDate" disabled="disabled">
                    <button type="button" id="cal_select_btn" style="right:4px;">{{$t('CALENDAR')}}</button>
                </span>
                <div id="calendarContainer" class="calendar_open_area"></div>
            </li>
            <li>
                <span class="inp_box clock" @click="toggleTimelineTimePicker()" style="width: 140px; margin:0;">
                    <input class="input_box" v-model="timelineDate.time" type="text" disabled="disabled" />
                    <button type="button" style="right:4px;">{{$t('HOUR')}}</button>
                </span>
                <div style="position:absolute; width: 200px;">
                    <div class="time_icker" v-show="isShowingTimelineTimePicker">
                        <div class="layer_time">
                            <div class="time_select_tit">{{$t('CLIP_CREATE_SELECT_CLIP')}}</div>
                            <button type="button" class="sp btn_close" @click="toggleTimelineTimePicker()"></button>
                            <div class="time_select_area" style="padding: 10px;">
                                <div class="time_select">
                                    <button type="button" class="action" @click="pressedTimelineHourUpButton()">
                                        <span class="sp up"></span>
                                    </button>
                                    <span class="ipt_txt"><input type="text" v-model="timelineDate.hour" maxlength="2" max-number="23"></span>
                                    <button type="button" class="action" @click="pressedTimelineHourDownButton()">
                                        <span class="sp down"></span>
                                    </button>
                                </div>
                                <span class="sp point"></span>
                                <div class="time_select">
                                    <button type="button" class="action" @click="pressedTimelineMinuteUpButton()">
                                        <span class="sp up"></span>
                                    </button>
                                    <span class="ipt_txt"><input type="text" v-model="timelineDate.minute" maxlength="2" max-number="59"></span>
                                    <button type="button" class="action" @click="pressedTimelineMinuteDownButton()">
                                        <span class="sp down"></span>
                                    </button>
                                </div>
                                <span class="sp point"></span>
                                <div class="time_select">
                                    <button type="button" class="action" @click="pressedTimelineSecondUpButton()">
                                        <span class="sp up"></span>
                                    </button>
                                    <span class="ipt_txt"><input type="text" v-model="timelineDate.second" maxlength="2" max-number="59"></span>
                                    <button type="button" class="action" @click="pressedTimelineSecondDownButton()">
                                        <span class="sp down"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="layer_btn" style="margin-bottom: 10px;">
                                <button type="button" class="btn_s btn_sb" @click="pressedTimelineTimeSelect()">{{$t('BUTTON_SELECT')}}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
        <ul>
            <li class="cal_s_btn">
                <button class="btn_on" @click="moveTimeline()">{{$t('BUTTON_CONFIRM')}}</button>
            </li>
        </ul>
        <div class="calendar_ar"></div>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';

    const $: any = (window as any).$ as any;
    const moment: any = (window as any).moment as any;
    const Pikaday: any = (window as any).Pikaday as any;

    var pressedTimeUpButton = function (val: any, max: any) {
        val = val.length < 1 ? 0 : val;
        var time = parseInt(val);
        time += 1;
        if (time > max) {
            time = 0;
        }

        if (time.toString().length == 1) {
            return "0" + time.toString();
        } else {
            return time.toString();
        }
    };

    var pressedTimeDownButton = function (val: any, max: any) {
        val = val.length < 1 ? 0 : val;
        var time = parseInt(val);
        time -= 1;
        if (time < 0) {
            time = max;
        }

        if (time.toString().length == 1) {
            return "0" + time.toString();
        } else {
            return time.toString();
        }
    };

    @Component
    export default class TimelineTimeSelector extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get currentTime() {
            return store.state.currentTime;
        }
        get isFullScreen() {
            return store.state.isFullScreen;
        }
        get isShowTimelineCalendar() {
            return store.state.isShowTimelineCalendar;
        }
        get category() {
            return store.state.category;
        }

        timelineDate: any = {
            date: '',
            time: '',
            hour: '',
            minute: '',
            second: ''
        };
        isShowingTimelineTimePicker: any = false;
        timelineDatePicker: any = null;

        private mounted() {
            if (this.cameraData.recorderType === 'nvr') {
                this.setupClipCalendar((this as any).serviceDay.toString());
            } else {
                this.setupClipCalendar(this.cameraData.serviceType);
            }
            $('#cal_select_btn').on('click', () => {
                this.toggleTimelineCalendar();
                return false;
            });
        }

        private beforeDestroy() {
            if (this.timelineDatePicker) {
                this.timelineDatePicker.destroy();
            }
        }

        setupClipCalendar(serviceType: any) {
            var minDate = moment().subtract(parseInt(serviceType), 'd');

            this.timelineDatePicker = new Pikaday({
                field: document.getElementById('timelineDate'),
                container: document.getElementById('calendarContainer'),
                format: (this as any).$i18n.t('CLIP_CREATE_CLIP_DATE_FORMAT'),
                minDate: minDate.toDate(),
                maxDate: new Date(),
                defaultDate: this.currentTime,
                position: 'bottom right'
            });
        }

        setTimelineTimeMoment(m: any) {
            this.timelineDate.time = m.format('HH : mm : ss');
            var token = this.timelineDate.time.split(' : ');
            if(token[0] == "Invalid date"){
                token[0] = "00";
                token[1] = "00";
                token[2] = "00";
            }
            this.timelineDate.hour = token[0];
            this.timelineDate.minute = token[1];
            this.timelineDate.second = token[2];
        }

        hideSelector() {
            this.isShowingTimelineTimePicker = false;
            store.dispatch('IS_SHOW_CALENDAR_CHANGE', false);
        }

        updateCalendarDate() {
            this.timelineDatePicker._d = this.currentTime;
            this.timelineDate.date = moment(parseInt(this.timelineDatePicker._d.getTime())).locale($("html").attr("lang")).format((this as any).$i18n.t('CLIP_CREATE_CLIP_DATE_FORMAT'));
            this.setTimelineTimeMoment(moment(parseInt(this.timelineDatePicker._d.getTime())));
        }

        toggleTimelineCalendar() {
            if (this.timelineDatePicker.isVisible()) {
                this.timelineDatePicker.hide();
            } else {
                this.timelineDatePicker.show();
            }
        }

        toggleTimelineTimePicker() {
            // if (this.isShowingTimelineTimePicker) {
            //     var timelineMoment = moment(this.timelineDate.time, 'HH : mm : ss');
            //     this.setTimelineTimeMoment(timelineMoment);
            // }
            this.isShowingTimelineTimePicker = !this.isShowingTimelineTimePicker;
        }

        pressedTimelineHourUpButton() {
            this.timelineDate.hour = pressedTimeUpButton(this.timelineDate.hour, 23);
        }

        pressedTimelineHourDownButton() {
            this.timelineDate.hour = pressedTimeDownButton(this.timelineDate.hour, 23);
        }

        pressedTimelineMinuteUpButton() {
            this.timelineDate.minute = pressedTimeUpButton(this.timelineDate.minute, 59);
        }

        pressedTimelineMinuteDownButton() {
            this.timelineDate.minute = pressedTimeDownButton(this.timelineDate.minute, 59);
        }

        pressedTimelineSecondUpButton() {
            this.timelineDate.second = pressedTimeUpButton(this.timelineDate.second, 59);
        }

        pressedTimelineSecondDownButton() {
            this.timelineDate.second = pressedTimeDownButton(this.timelineDate.second, 59);
        }

        pressedTimelineTimeSelect() {
            if (this.timelineDate.hour.length < 1) {
                this.$emit('event', {event: 'timeInputError', data: 'time'});
                return;
            }

            if (this.timelineDate.minute.length < 1) {
                this.$emit('event', {event: 'timeInputError', data: 'minute'});
                return;
            }

            if (this.timelineDate.second.length < 1) {
                this.$emit('event', {event: 'timeInputError', data: 'second'});
                return;
            }

            this.timelineDate.time = (parseInt(this.timelineDate.hour) < 10 && this.timelineDate.hour.length < 2 ? "0" + this.timelineDate.hour : this.timelineDate.hour) + " : "
                + (parseInt(this.timelineDate.minute) < 10 && this.timelineDate.minute.length < 2 ? "0" + this.timelineDate.minute : this.timelineDate.minute) + " : "
                + (parseInt(this.timelineDate.second) < 10 && this.timelineDate.second.length < 2 ? "0" + this.timelineDate.second : this.timelineDate.second);
            this.isShowingTimelineTimePicker = false;
        }

        moveTimeline() {
            const that: any = this;
            this.$emit('event', {event: 'checkCVRSeucre', data: (isSecureMode: any) => {
                if(isSecureMode){
                    that.$emit('event', {event: 'updateCVRSecureStatus', data: () => {
                            that.$emit('event', {event: 'playCvr', data: that.getTimelineMoment().toDate()});
                            store.dispatch('IS_SHOW_CALENDAR_CHANGE', false);
                            that.isShowingTimelineTimePicker = false;
                        }});
                }else{
                    that.$emit('event', {event: 'playCvr', data: that.getTimelineMoment().toDate()});
                    store.dispatch('IS_SHOW_CALENDAR_CHANGE', false);
                    that.isShowingTimelineTimePicker = false;
                }
            }});
        }

        getTimelineMoment() {
            var dateMoment = this.timelineDatePicker.getMoment();

            if(this.timelineDate.time == "Invalid date"){
                this.timelineDate.time="00 : 00 : 00";
            }

            var timeString = this.timelineDate.time;

            return moment(dateMoment.format("YYYYMMDD") + " " + timeString, "YYYYMMDD HH : mm : ss");
        }
    }
</script>