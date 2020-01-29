<template>
    <div class="ai_camera_graph_dlg">
        <modal_dialog @close="onCloseDialog" :dlgStyle="dlgStyle">
            <template slot="content">
                <div>
                    <h4>{{txtMap.title}}</h4>
                    <div class="ai_date_area">
                        <div class="ai_date_select_wrap">
                            <div class="calendar_wrap">
                                <button @click="toggleCalendar" id="calendarBtn" class="calendar_btn"></button>
                            </div>
                            <div id="calendarContainer" class="calendar_open_area"></div>
                            <span class="date_control_wrap">
                                <a @click="goPrev" class="prev_btn"></a>
                                <span class="select_day">{{periodStr}} {{(mode === 'hourly' || mode === 'min') && isToday ? txtMap.today : ''}}</span>
                                <a @click="goNext" class="next_btn" :class="{disabled: isToday}"></a>
                            </span>
                            <button class="date_mode_control" @click="toggleMode">{{(mode === 'hourly' || mode === 'min') ? txtMap.weekly : txtMap.daily}}</button>
                        </div>
                    </div>
                    <div v-show="!isLoading" class="graph_area">
                        <div class="graph_time_set_wrap" v-show="mode === 'min' || mode === 'hourly' ">
                            <span class="min" :class="{enable: mode === 'min'}" @click="setGraphTimeUnit(10)">10{{txtMap.min}}</span>
                            <span class="hour" :class="{enable: mode === 'hourly'}" @click="setGraphTimeUnit(60)">1{{txtMap.hour}}</span>
                        </div>
                        <div id="sum_graph" class="sum_graph_wrap" :style="{width: (GRAPH_WIDTH + 'px'), margin: '0 auto', marginTop: mode === 'daily' ? '50px' : '12px'}"></div>
                        <!--ul class="cam_graph_list" style="text-align:left;">
                            <li class="cam_graph" v-for="(camera, index) in aiCameraList">
                                <p class="cam_tit_wrap">
                                    <img src="/resources/img/ic-toast-camera.svg">
                                    <span class="cam_name">{{camera.labelName}}</span>
                                </p>
                                <div class="cam_graph_wrap">
                                    <div :id="'cam_graph_' + camera.id"></div>
                                </div>
                            </li>
                        </ul-->
                    </div>
                    <img v-show="isLoading" class="ai_load" src="/resources/img/progress_rolling_blue.svg">
                </div>
            </template>
        </modal_dialog>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import modal_dialog from '../../uikit/modal_dialog';
    import { getBrowserLanguage } from '../../../service/util';
    import { IAiChart } from '../interface';

    // import $ from 'jquery';
    // import moment from 'moment';
    // import chart from 'tui-chart';
    // const tui = { chart };
    // import Pikaday from 'pikaday';
    const $: any = (window as any).$ as any;
    const tui: any = (window as any).tui as any;
    const moment: any = (window as any).moment as any;
    const Pikaday: any = (window as any).Pikaday as any;

    function getGraphMaxIndex (array: string[]) {
        let counter, max = -1, hasSame = false;

        if (!array) {
            return max;
        }
        for (counter = 0; counter < array.length; counter+=1) {
            if (max === -1) {
                if (parseInt(array[counter]) > 0) {
                    max = counter;
                    hasSame = false;
                }
            } else {
                if (parseInt(array[max]) < parseInt(array[counter])){
                    max = counter;
                    hasSame = false;
                } else if (parseInt(array[max]) === parseInt(array[counter])) {
                    hasSame = true;
                }
            }
        }

        return hasSame ? -1 : max;
    }

    function getGraphMinIndex (array: string[]) {
        let counter, min = -1, hasSame = false;

        if (!array) {
            return min;
        }
        for (counter = 0; counter < array.length; counter+=1) {
            if (min === -1) {
                if (parseInt(array[counter]) > 0) {
                    min = counter;
                    hasSame = false;
                }
            } else {
                if (parseInt(array[counter]) > 0) {
                    if (parseInt(array[min]) > parseInt(array[counter])){
                        min = counter;
                        hasSame = false;
                    } else if (parseInt(array[min]) === parseInt(array[counter])) {
                        hasSame = true;
                    }
                }
            }
        }
        return hasSame ? -1 : min;
    }

    function applyTuiChartMaxMinColor (id: string, maxColor: string, minColor: string, maxIdx: number, minIdx: number) {
        const svgRects = document.querySelectorAll('#' + id + ' .tui-chart-series-area svg rect'),
            maxRect = svgRects[maxIdx], minRect = svgRects[minIdx];
        if (maxRect) {
            maxRect.setAttribute('fill', maxColor);
        }
        if (maxIdx !== minIdx && minRect) {
            minRect.setAttribute('fill', minColor);
        }
    }

    @Component({
        components: {
            modal_dialog
        }
    })
    export default class AiGraphsDialog extends Vue {
        @Prop() dlgStyle!: any;
        @Prop() txtMap!: any;
        //@Prop() aiCameraList!: ICameraInfo[];
        //@Prop() pRequestCamCharts!: any;
        @Prop() pRequestShopChart!: any;

        startDate: Date = new Date();
        endDate: Date = new Date();
        mode: string = 'hourly';
        //camChartPromiseMap: any = {};
        isToday: boolean = true;
        periodStr: string = '';
        isLoading: boolean = false;
        datePicker: any = null;
        GRAPH_WIDTH: number = 970;
        GRAPH_HEIGHT: number = 400;

        private created() {
            this.periodStr = this.dateFormat(this.endDate, "YYYY.MM.DD (ddd)");
        }

        private mounted() {
            this.requestShopChart();
            //this.requestCamCharts();
            setTimeout(() => {
                this.initCalendar();
            }, 500);
        }

        private beforeDestroy() {
            if (this.datePicker) {
                this.datePicker.destroy();
            }
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        checkIsToday(): boolean {
            const today = new Date();

            if (today <= this.endDate || (today.getFullYear() === this.endDate.getFullYear() && today.getMonth() === this.endDate.getMonth() && today.getDate() === this.endDate.getDate())) {
                return true;
            } else {
                return false;
            }
        }

        toggleCalendar() {
            if (this.datePicker) {
                if (this.datePicker.isVisible()) {
                    this.datePicker.hide();
                } else {
                    this.datePicker.show();
                }
            }
        }

        initCalendar() {
            const that = this;
            const lang = document.documentElement.getAttribute('lang');
            const format = lang === 'ja' ? 'YYYY年MM月DD日' : 'YYYY년 MM월 DD일';
            this.datePicker = new Pikaday({
                field: document.getElementById('calendarBtn'),
                container: document.getElementById('calendarContainer'),
                format: format,
                maxDate: new Date(),
                defaultDate: that.endDate ? that.endDate : new Date(),
                position: 'bottom right',
                onSelect: function(date: Date) {
                    if (that.mode === 'hourly' || that.mode === 'min') {
                        that.startDate = new Date(date.valueOf());
                        that.endDate = new Date(date.valueOf());
                        that.periodStr = that.dateFormat(that.endDate, "YYYY.MM.DD (ddd)");
                    } else {
                        that.startDate = new Date(date.valueOf());
                        while (that.startDate.getDay() != 1) {
                            that.startDate.setDate(that.startDate.getDate() - 1);
                        }
                        that.endDate = new Date(that.startDate.valueOf());
                        that.endDate.setDate(that.endDate.getDate() + 6);
                        that.periodStr = that.weeklyFormat(that.startDate, that.endDate);
                    }
                    that.isToday = that.checkIsToday();
                    that.requestShopChart();
                }
            });
        }

        requestShopChart() {
            this.isLoading = true;
            this.pRequestShopChart(this.mode, this.startDate, this.endDate).then((response: any) => {
                    if (this.mode === 'min') {
                        if (response.peopleArea) {
                            this.makeAICamLineChart(response.peopleArea, 'sum');
                        } else {
                            this.makeAICamLineChart({data: [],
                                yAxis: {min: 0, max: 0},
                                xAxis: {items: []}
                            }, 'sum');
                        }
                    } else {
                        if (response.peopleArea) {
                            this.makeAICamGraph(response.peopleArea, 'sum');
                        } else {
                            this.makeAICamGraph({data: [],
                                yAxis: {min: 0, max: 0},
                                xAxis: {items: []}
                            }, 'sum');
                        }
                    }
                }, (err: any) => {
                }).finally(() => {
                    this.isLoading = false;
                });
        }

        goPrev() {
            if (this.mode === 'daily') {
                this.startDate.setDate(this.startDate.getDate() - 7);
                this.endDate.setDate(this.endDate.getDate() - 7);
                this.periodStr = this.weeklyFormat(this.startDate, this.endDate);
            } else {
                this.startDate.setDate(this.startDate.getDate() - 1);
                this.endDate.setDate(this.endDate.getDate() - 1);
                this.periodStr = this.dateFormat(this.endDate, "YYYY.MM.DD (ddd)");
            }
            this.isToday = this.checkIsToday();
            this.requestShopChart();
            //this.requestCamCharts();
        }

        goNext() {
            if (this.isToday) {
                return;
            }
            if (this.mode === 'daily') {
                this.startDate.setDate(this.startDate.getDate() + 7);
                this.endDate.setDate(this.endDate.getDate() + 7);
                this.periodStr = this.weeklyFormat(this.startDate, this.endDate);
            } else {
                this.startDate.setDate(this.startDate.getDate() + 1);
                this.endDate.setDate(this.endDate.getDate() + 1);
                this.periodStr = this.dateFormat(this.endDate, "YYYY.MM.DD (ddd)");
            }
            this.isToday = this.checkIsToday();
            this.requestShopChart();
            //this.requestCamCharts();
        }

        // requestCamCharts() {
        //     if (!this.aiCameraList.length) {
        //         return;
        //     }
        //     const cameraIds = this.aiCameraList.map((camera) => camera.id);
        //     let key: string;
        //
        //     this.camChartPromiseMap = this.pRequestCamCharts(cameraIds, this.mode, this.startDate, this.endDate);
        //     for (key in this.camChartPromiseMap) {
        //         this.handleCamChartRequest(this.camChartPromiseMap[key], key);
        //     }
        // }

        // handleCamChartRequest(promise: any, id: string) {
        //     promise.then((response: IAiChart) => {
        //             if (this.mode === 'min') {
        //                 this.makeAICamLineChart(response, 'cam', id);
        //             } else {
        //                 this.makeAICamGraph(response, 'cam', id);
        //             }
        //         }, (err: any) => {
        //         });
        // }

        // cancelCamCharts() {
        //     if (!this.camChartPromiseMap) {
        //         return;
        //     }
        //     let key: string;
        //     for (key in this.camChartPromiseMap) {
        //         this.camChartPromiseMap[key].abort();
        //     }
        // }

        dateFormat(date: Date, format: string): any {
            const md = moment(date);
            return md.locale(getBrowserLanguage()).format(format);
        }

        weeklyFormat(startDate: Date, endDate: Date): string {
            let startMonth: string | number = 1 + startDate.getMonth(),
                startDay: string | number = startDate.getDate(),
                endMonth: string | number = 1 + endDate.getMonth(),
                endDay: string | number = endDate.getDate();

            startMonth = startMonth >= 10 ? startMonth : '0' + startMonth;
            startDay = startDay >= 10 ? startDay : '0' + startDay;
            endMonth = endMonth >= 10 ? endMonth : '0' + endMonth;
            endDay = endDay >= 10 ? endDay : '0' + endDay;
            return startMonth + '.' + startDay + ' ~ ' + endMonth + '.' + endDay;
        }

        setGraphTimeUnit(unit: number) {
            if (unit === 10) {
                this.mode = 'min';
            } else {
                this.mode = 'hourly';
            }
            this.requestShopChart();
            //this.requestCamCharts();
        }

        toggleMode() {
            if (this.mode === 'daily') {
                this.mode = 'hourly';
                if (this.startDate) {
                    this.startDate = new Date(this.startDate.valueOf());
                    this.endDate = new Date(this.startDate.valueOf());
                } else {
                    this.startDate = new Date();
                    this.endDate = new Date();
                }
                this.periodStr = this.dateFormat(this.endDate, "YYYY.MM.DD (ddd)");
                this.isToday = this.checkIsToday();
            } else {
                this.mode = 'daily';
                if (this.startDate) {
                    this.startDate = new Date(this.startDate.valueOf());
                } else {
                    this.startDate = new Date();
                }
                while (this.startDate.getDay() != 1) {
                    this.startDate.setDate(this.startDate.getDate() - 1);
                }
                this.endDate = new Date(this.startDate.valueOf());
                this.endDate.setDate(this.endDate.getDate() + 6);
                this.periodStr = this.weeklyFormat(this.startDate, this.endDate);
            }
            this.requestShopChart();
            //this.requestCamCharts();
        }

        makeAICamGraph(chartData: IAiChart, type: string, id?: string) {
            const lang = document.documentElement.getAttribute('lang');
            let elementId, $aiGraphEl, chartWidth, data: any = {}, color: string = '#4a96e6', weekDay: any = this.txtMap.dayMap;
            if (type === 'sum') {
                elementId = 'sum_graph';
            } else {
                elementId = 'cam_graph_' + id;
            }
            $aiGraphEl = $('#' + elementId);
            if (!$aiGraphEl.length) {
                return;
            }
            $aiGraphEl.html('');

            if (chartData) {
                if (chartData.data) {
                    chartData.data = chartData.data.map((data: any) => {
                        return data ? Math.ceil(data) : null;
                    });
                }
                data.categories = chartData.xAxis ? chartData.xAxis.items : [0];
                data.series = [{name: this.txtMap.man, data: chartData.data ? chartData.data : [0], color}];
                //const maxIdx = getGraphMaxIndex(data.series[0].data);
                //const minIdx = getGraphMinIndex(data.series[0].data);
                const options: any = {
                    theme: "newTheme",
                    chart: {
                        "width": this.GRAPH_WIDTH,
                        "height": this.GRAPH_HEIGHT,
                        "title": "",
                        "format": '1,000'
                    },
                    yAxis: {
                        title: '(' + this.txtMap.manCount + ')',
                        max: chartData.yAxis ? chartData.yAxis.max : 0,
                        min: chartData.yAxis ? chartData.yAxis.min : 0
                    },
                    tooltip: {
                        "suffix": this.txtMap.manCount
                    },
                    xAxis: {
                        "title": '(' + (this.mode === 'daily' ? this.txtMap.dayCount : this.txtMap.hourCount) + ')',
                        "labelInterval": this.mode === 'daily' ? 1 : 2
                    },
                    series: {
                        "hasDot": false,
                        "hasSelection": true
                    },
                    legend: {
                        "visible": false
                    },
                    chartExportMenu: {
                        "visible": false
                    }
                };
                tui.chart.registerTheme('newTheme', {
                    series: {
                        colors: [color]
                    }
                });
                tui.chart.columnChart(document.getElementById(elementId), data, options);
                $aiGraphEl.children('.tui-chart').css('margin', "auto");
                $('#' + elementId + ' .tui-chart-series-custom-event-area').hide();
                //applyTuiChartMaxMinColor(elementId, '#eb4e61', '#cae01c', maxIdx, minIdx);
            }
        }

        makeAICamLineChart(chartData: IAiChart, type: string, id?: string) {
            let categories: any, format: string, yTitle: string, data: any, options: any, elementId: string, container: HTMLElement | null;

            if (type === 'sum') {
                elementId = 'sum_graph';
            } else {
                elementId = 'cam_graph_' + id;
            }
            container = document.getElementById(elementId);
            if (container) {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }
            if (chartData.xAxis) {
                categories = chartData.xAxis.items.filter((item) => {
                    return !!item;
                });
            }
            yTitle = '(' + this.txtMap.manCount + ')';
            format = '0';
            data = {
                categories: categories ? categories : [0],
                series: [
                    {
                        name: '',
                        data: chartData.data ? chartData.data : [0]
                    }
                ]
            };
            options = {
                chart: {
                    width: this.GRAPH_WIDTH,
                    height: this.GRAPH_HEIGHT,
                    format: format
                },
                yAxis: {
                    title: yTitle,
                    max: chartData.yAxis ? chartData.yAxis.max : 0,
                    min: chartData.yAxis ? chartData.yAxis.min : 0
                },
                xAxis: {
                    title: '(' + this.txtMap.hourCount + ')'
                },
                legend: {
                    visible: false
                },
                chartExportMenu: {
                    visible: false
                }
            };
            tui.chart.registerTheme('theme', {
                series: {
                    colors: ['#4b96e6']
                }
            });
            options.theme = 'theme';
            tui.chart.lineChart(container, data, options);
            $('#' + elementId + ' .tui-chart-series-custom-event-area').hide();
        }

        onCloseDialog () {
            this.$emit('event', {event: 'close'});
            this.$destroy();
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    .ai_camera_graph_dlg {
        h4 {
            font-size: 24px; text-align: left; font-weight:bold; padding:32px 0 20px 32px;
        }
        #sum_graph {
            width: 100%; height:414px;
        }
        .tui-chart {
            margin: 0 auto;
        }
        .ai_date_area {
            background-color: #e6e6e6;
            border-top: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
        }
        .graph_area {
            height:528px; overflow-y:auto; overflow-x:hidden;
            .graph_time_set_wrap {
                span {
                    cursor: pointer;
                }
            }
        }
        .ai_date_select_wrap {
            position:relative; background-color: #fafafa; height:52px;
            .calendar_wrap {
                float: left;
                height: 100%;
                width: 60px;
                padding: 13px 0;
                box-sizing: border-box;
                border-right: 1px solid #e0e0e0;
                .calendar_btn {
                    background: url(/resources/img/ic-camera-calendar.svg) no-repeat; width: 28px; height: 28px;
                }
            }
            .calendar_open_area {
                position:absolute; right:0; left:22px; top:54px;
            }
            .date_control_wrap {
                display:inline-block; width:242px; margin-top:10px; margin-left:-65px;
            }
            .select_day {
                font-size:16px; color:#333333; font-weight:bold; margin-top:7px; display:inline-block;
                &:lang(ja) {
                    margin-top:3px;
                }
            }
            .prev_btn {
                display:inline-block; background: url(/resources/img/btn-arrow-gay-prev.png) no-repeat; width:30px; height:30px; float:left;
            }
            .next_btn {
                display:inline-block; background: url(/resources/img/btn-arrow-gay-next.png) no-repeat; width:30px; height:30px; float:right;
                &.disabled {
                    background-image: url(/resources/img/btn-arrow-gray-next-disabled.png);
                }
            }
        }
        .cam_graph {
            display:inline-block; box-sizing:border-box; border:1px solid #dddddd; width:calc(50% - 4px); height:316px;
            .cam_tit_wrap {
                height:52px; text-align:left; padding:9px 0 0 22px; box-sizing:border-box;
                img {
                    display:inline-block; margin:10px 8px 0 0;
                }
                span {
                    font-size:16px; color:#333333;
                }
            }
        }
        .ai_load {
            position:absolute; width:60px; height:60px; top:350px; left:calc(50% - 30px);
        }
        .date_mode_control {
            border: 1px solid #b2b2b2; width:60px; height:32px; position:absolute; right:24px; top:10px; color:#333333; font-size:13px;
        }
    }
</style>