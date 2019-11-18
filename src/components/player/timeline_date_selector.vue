<template>
    <div class="timeline_date" id="view_timeline_date">
        <!-- [D] 클릭시 li에 class on 추가 -->
        <ul v-show="cameraData.recorderType == 'nvr'">
            <li class="action">
                <button type="button">
                    <span></span>
                </button>
            </li>
        </ul>
        <ul v-show="!isExpiredCloud && serviceDay == 60 && cameraData.recorderType != 'nvr'">
            <li v-show="fristIndex != 0">
                <button @click="moveServiceDate('prev')" ><b> < </b></button>
            </li>
            <li :id="'timeline_date_' + item.date" v-show="index <= lastIndex && fristIndex < index" v-for="(item, index) in serviceCalendarDate" class="action"
                :class="{ 'on': item.date === formattedCalendarDate() }" @click="pressedCalendarDateButton(item.date)">
                <button type="button">
                    <span>{{item.day}}</span>
                </button>
            </li>
            <li v-show="lastIndex < 60">
                <button @click="moveServiceDate('next')" ><b> > </b></button>
            </li>
        </ul>
        <ul v-show="!isExpiredCloud && serviceDay > 7 && serviceDay < 60 && (cameraData.recorderType != 'nvr' && cameraData.recorderType != 'recorder')">
            <li :id="'timeline_date_' + item.date" v-for="(item, index) in serviceCalendarDate" class="action" :class="{ 'on': item.date===formattedCalendarDate() }" @click="pressedCalendarDateButton(item.date)">
                <button type="button">
                    <span>{{item.day}}</span>
                </button>
            </li>
        </ul>
        <ul v-show="!isExpiredCloud && serviceDay <= 7 && serviceDay > 0 && (cameraData.recorderType != 'nvr' && cameraData.recorderType != 'recorder')">
            <li :id="'timeline_date_' + item.date" v-for="(item, index) in serviceCalendarDay" class="action" :class="{ 'on': item.date===formattedCalendarDate() }" @click="pressedCalendarDateButton(item.date)">
                <button type="button">
                    <span>{{item.day}}</span>
                </button>
            </li>
        </ul>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';

    const $: any = (window as any).$ as any;
    const moment: any = (window as any).moment as any;
    const d3: any = (window as any).d3 as any;

    @Component
    export default class TimelineDateSelector extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get currentDomain() {
            return store.state.currentDomain;
        }
        get serviceDay() {
            return store.state.serviceDay;
        }
        get serviceCalendarDate() {
            return this.getServiceCalendarDate(store.state.serviceDay);
        }
        get serviceCalendarDay() {
            return this.getServiceCalendarDay(store.state.serviceDay + 1);
        }
        get timezone() {
            return store.state.timezone;
        }
        get isExpiredCloud() {
            return store.getters.isExpiredCloud;
        }

        fristIndex: number = 30;
        lastIndex: number = 60;

        moveServiceDate(type: any) {
            if(type=='prev'){
                this.lastIndex = this.lastIndex - 30;
                this.fristIndex = this.fristIndex - 30;
            }else{
                this.lastIndex = this.lastIndex +30;
                this.fristIndex = this.fristIndex + 30;
            }
        }

        pressedCalendarDateButton(dateString: any) {
            this.$emit('event', {event: 'pressedCalendarDate', data: dateString});
        }

        getServiceCalendarDate(num: any) {
            var dates = [];
            var now = Date.now();
            for (var i = num ; i >= 0 ; i--) {
                var past = now - (i * 24 * 60 * 60 * 1000);
                var date: any = { date: this.formattedInternalDate(new Date(past))};
                if (i === 0) {
                    date.day = (this as any).$i18n.t('TIMELINE_TODAY');
                } else {
                    date.day = moment(new Date(past)).locale($("html").attr("lang")).format("dddd");
                    var md;
                    if (this.timezone) {
                        md = moment(new Date(past)).tz(this.timezone);
                    } else {
                        md = moment(new Date(past));
                    }

                    if (i === 29 || md.format("D") === "1") {
                        date.day = md.format("M/D");
                    } else {
                        date.day = md.format("D");
                    }
                }
                dates.push(date);
            }
            return dates;
        }

        getServiceCalendarDay(num: any) {
            var days = [];
            var now = Date.now();
            for (var i = num-1 ; i >= 0 ; i--) {
                var past = now - (i * 24 * 60 * 60 * 1000);
                var day: any = { date: this.formattedInternalDate(new Date(past))};
                if (i === 0) {
                    day.day = (this as any).$i18n.t('TIMELINE_TODAY');
                } else {
                    day.day = moment(new Date(past)).locale($("html").attr("lang")).format("dddd");
                }
                days.push(day);
            }
            return days;
        }

        formattedInternalDate(date: any) {
            var md;
            if (this.timezone) {
                md = moment(new Date(date)).tz(this.timezone);
            } else {
                md = moment(new Date(date));
            }

            return md.format("YYYYMMDD");
        }

        formattedCalendarDate(date: any) {
            var dateString = '';
            var format = d3.time.format("%Y%m%d");

            var calendarTime = this.domainCenterTime();
            if (calendarTime) {
                dateString = format(new Date(calendarTime));
            }

            return dateString;
        }

        domainCenterTime() {
            if (this.currentDomain) {
                return (this.currentDomain[0] + this.currentDomain[1])/2 + (this.currentDomain[1] - this.currentDomain[0])/8;
            }

            return null;
        }
    }
</script>