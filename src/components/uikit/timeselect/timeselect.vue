<template>
    <div class="tc_timeselect">
        <span class="date_lst">
            <div class="date_lst_sel">
                <select @change="timeChange" v-model="hour">
                    <option v-for="n in 24" :key="n">{{addZero(n - 1)}}</option>
                </select>
            </div>
            <span class="bar">{{hourStr}}</span>
            <div class="date_lst_sel">
                <select @change="timeChange" v-model="min">
                    <option v-for="n in 60" :key="n">{{addZero(n - 1)}}</option>
                </select>
            </div>
            <span class="bar">{{minStr}}</span>
        </span>
    </div>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class Timeselect extends Base {
        date: any = null;
        hour: string = '00';
        min: string = '00';
        hourStr: string = '';
        minStr: string = '';

        get value() {
            return this.date;
        }
        set value(newValue) {
            this.date = newValue;
            if (this.date) {
                this.hour = this.addZero(this.date.getHours());
                this.min = this.addZero(this.date.getMinutes());
            } else {
                this.hour = '00';
                this.min = '00';
            }
        }

        private created() {
            if (document.documentElement.getAttribute('lang') === 'ja') {
                this.hourStr = '時';
                this.minStr = '分';
            } else {
                this.hourStr = '시';
                this.minStr = '분';
            }
        }

        timeChange() {
            if (!(this.date)) {
                this.date = new Date();
            }
            this.date.setHours(parseInt(this.hour));
            this.date.setMinutes(parseInt(this.min));
            this.emitEvent('changed', this.date);
        }

        addZero(n: number) {
            return n < 10 ? '0' + n : '' + n
        }

        getTimeStr() {
            return this.hour + ':' + this.min;
        }
    }
</script>
<style lang="less">
    .tc_timeselect {
        .date_lst_sel {
            display: inline-block;
            width: 55px;
            select {
                width: 100%;
                height: 30px;
                padding: 0 8px;
            }
        }
        .bar {
            display:inline-block;
            margin: 0 7px;
            font-size: 14px;
        }
    }
</style>