<template>
    <div class="ai_camera_graph_dlg">
        <modal_dialog @close="onCloseDialog" :dlgStyle="dlgStyle">
            <template slot="content">
                <div>
                    <h4>{{txtMap.title}}</h4>
                    <div class="ai_date_area">
                        <div class="ai_date_select_wrap">
                        <span class="date_control_wrap">
                            <a @click="goPrev" class="prev_btn"></a>
                            <span class="select_day">{{periodStr}} {{(aiGraphObject.mode === 'hourly' || aiGraphObject.mode === 'min') && isToday ? txtMap.today : ''}}</span>
                            <a @click="goNext" class="next_btn"></a>
                        </span>
                            <button class="date_mode_control" @click="toggleMode">{{(aiGraphObject.mode === 'hourly' || aiGraphObject.mode === 'min') ? txtMap.weekly : txtMap.daily}}</button>
                        </div>
                    </div>
                    <div class="graph_area">
                        <div class="graph_time_set_wrap" v-show="aiGraphObject.mode === 'min' || aiGraphObject.mode === 'hourly' ">
                            <span class="min" :class="{enable: aiGraphObject.mode === 'min'}" @click="setGraphTimeUnit(10)">10{{txtMap.min}}</span>
                            <span class="hour" :class="{enable: aiGraphObject.mode === 'hourly'}" @click="setGraphTimeUnit(60)">1{{txtMap.hour}}</span>
                        </div>
                        <div class="sum_graph_wrap">
                            <div id="sum_graph"></div>
                        </div>
                        <ul class="cam_graph_list" style="text-align:left;">
                            <li class="cam_graph" v-for="(camera, index) in cameraStats">
                                <p class="cam_tit_wrap">
                                    <img src="/resources/img/ic-toast-camera.png">
                                    <span class="cam_name">{{pGetCameraName(index)}}</span>
                                </p>
                                <div class="cam_graph_wrap">
                                    <div :id="'cam_graph_' + index"></div>
                                </div>
                                <!--img class="cam_stat_load_img" v-show="!camera" src="/resources/img/loading.svg"-->
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
        </modal_dialog>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import modal_dialog from '../../uikit/modal_dialog';
    import { getBrowserLanguage } from '../../../service/util';

    // import $ from 'jquery';
    // import moment from 'moment';
    // import chart from 'tui-chart';
    // const tui = { chart };
    const $: any = (window as any).$ as any;
    const tui: any = (window as any).tui as any;
    const moment: any = (window as any).moment as any;

    @Component({
        components: {
            modal_dialog
        }
    })
    export default class AiGraphsDialog extends Vue {
        @Prop() dlgStyle!: any;
        @Prop() txtMap!: any;
        @Prop() pShopStats!: any;
        @Prop() pAiGraphObject!: any;
        @Prop() pRequestCamStats!: any;
        @Prop() pRequestShopStats!: any;
        @Prop() pGetCameraName!: any;
        @Prop() pAiStartTime!: any;
        @Prop() pAiEndTime!: any;
        @Prop() pAiIs24Hours!: any;

        shopStats: any = null;
        aiGraphObject: any = null;
        dateStr: string = '';
        cameraStats: any = {};
        camStatsPromiseMap: any = {};
        cameraIds: string[] = [];
        isToday: boolean = true;
        periodStr: string = '';

        private created() {
            let i, len;
            this.aiGraphObject = this.pAiGraphObject;
            this.shopStats = this.pShopStats;
            this.cameraIds = this.shopStats[0].cameraId.split(',');
            for (i = 0, len = this.cameraIds.length; i < len; i+=1) {
                this.cameraStats[this.cameraIds[i]] = null;
            }
            this.isToday = this.checkIsToday();
            this.periodStr = this.dateFormat(this.aiGraphObject.endDate, "YY.MM.DD (ddd)");
        }

        private mounted() {
            this.requestCamStats();
            this.makeAICamGraph(this.shopStats, 'sum');
        }

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        checkIsToday(): boolean {
            if (!this.aiGraphObject) {
                return false;
            }
            const today = new Date();

            if (today <= this.aiGraphObject.endDate || (today.getFullYear() === this.aiGraphObject.endDate.getFullYear() && today.getMonth() === this.aiGraphObject.endDate.getMonth() && today.getDate() === this.aiGraphObject.endDate.getDate())) {
                return true;
            } else {
                return false;
            }
        }

        setShopStats(stats: any[]) {
            if (!stats || !stats.length) {
                return;
            }

            let i, len;
            this.shopStats = stats;
            this.cameraIds = this.shopStats[0].cameraId.split(',');
            for (i = 0, len = this.cameraIds.length; i < len; i+=1) {
                this.cameraStats[this.cameraIds[i]] = null;
            }
            this.isToday = this.checkIsToday();
            if (this.aiGraphObject.mode === 'daily') {
                this.periodStr = this.weeklyFormat(this.aiGraphObject.startDate, this.aiGraphObject.endDate);
            } else {
                this.periodStr = this.dateFormat(this.aiGraphObject.endDate, "YY.MM.DD (ddd)");
            }
            this.requestCamStats();
            if (this.aiGraphObject.mode === 'min') {
                this.makeAICamLineChart(stats, 'sum');
            } else {
                this.makeAICamGraph(this.shopStats, 'sum');
            }
        }

        goPrev() {
            if (this.aiGraphObject.mode === 'daily') {
                this.aiGraphObject.startDate.setDate(this.aiGraphObject.startDate.getDate() - 7);
                this.aiGraphObject.endDate.setDate(this.aiGraphObject.endDate.getDate() - 7);
            } else {
                this.aiGraphObject.startDate.setDate(this.aiGraphObject.startDate.getDate() - 1);
                this.aiGraphObject.endDate.setDate(this.aiGraphObject.endDate.getDate() - 1);
            }
            this.pRequestShopStats(this.aiGraphObject.mode, this.aiGraphObject.startDate, this.aiGraphObject.endDate).then((res: any) => {
                this.setShopStats(res.aiStatList);
            });
        }

        goNext() {
            if (this.isToday) {
                return;
            }
            if (this.aiGraphObject.mode === 'daily') {
                this.aiGraphObject.startDate.setDate(this.aiGraphObject.startDate.getDate() + 7);
                this.aiGraphObject.endDate.setDate(this.aiGraphObject.endDate.getDate() + 7);
            } else {
                this.aiGraphObject.startDate.setDate(this.aiGraphObject.startDate.getDate() + 1);
                this.aiGraphObject.endDate.setDate(this.aiGraphObject.endDate.getDate() + 1);
            }
            this.pRequestShopStats(this.aiGraphObject.mode, this.aiGraphObject.startDate, this.aiGraphObject.endDate).then((res: any) => {
                this.setShopStats(res.aiStatList);
            });
        }

        requestCamStats() {
            if (!this.cameraIds.length) {
                return;
            }
            let key: string;
            this.camStatsPromiseMap = this.pRequestCamStats(this.cameraIds, this.aiGraphObject.mode, this.aiGraphObject.startDate, this.aiGraphObject.endDate);
            for (key in this.camStatsPromiseMap) {
                this.camStatsPromiseMap[key].then((res: any) => {
                    this.cameraStats[key] = res.aiStatList;
                    if (this.aiGraphObject.mode === 'min') {
                        this.makeAICamLineChart(this.cameraStats[key], 'cam');
                    } else {
                        this.makeAICamGraph(this.cameraStats[key], 'cam');
                    }
                });
            }
        }

        cancelCamStats() {
            if (!this.camStatsPromiseMap) {
                return;
            }
            let key: string;
            for (key in this.camStatsPromiseMap) {
                this.camStatsPromiseMap[key].abort();
            }
            this.cameraStats = {};
        }

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

        aiDataTimeConverter(timestamp: number): string {
            const date = new Date(timestamp);
            let month: string | number = (1 + date.getMonth()),
                day: string | number = date.getDate(),
                hour: string | number = date.getHours(),
                min: string | number = date.getMinutes(),
                seconds: string | number = date.getSeconds();

            month = month >= 10 ? month : '0' + month;
            day = day >= 10 ? day : '0' + day;
            hour = hour >= 10 ? hour : '0' + hour;
            min = min >= 10 ? min : '0' + min;
            seconds = seconds >= 10 ? seconds : '0' + seconds;
            return  month + '.' + day + ' ' + hour + ':' + min + ':' + seconds;
        }

        setGraphTimeUnit(unit: number) {
            if (unit === 10) {
                this.aiGraphObject.mode = 'min';
            } else {
                this.aiGraphObject.mode = 'hourly';
            }
            this.pRequestShopStats(this.aiGraphObject.mode, this.aiGraphObject.startDate, this.aiGraphObject.endDate).then((res: any) => {
                this.setShopStats(res.aiStatList);
            });
        }

        toggleMode() {
            if (this.aiGraphObject.mode === 'daily') {
                this.aiGraphObject.mode = 'hourly';
                this.aiGraphObject.startDate = new Date();
                this.aiGraphObject.endDate = new Date();
            } else {
                this.aiGraphObject.mode = 'daily';
                this.aiGraphObject.startDate = new Date();
                while (this.aiGraphObject.startDate.getDay() != 0) {
                    this.aiGraphObject.startDate.setDate(this.aiGraphObject.startDate.getDate() - 1);
                }
                this.aiGraphObject.endDate = new Date(this.aiGraphObject.startDate.valueOf());
                this.aiGraphObject.endDate.setDate(this.aiGraphObject.endDate.getDate() + 6);
            }
            this.pRequestShopStats(this.aiGraphObject.mode, this.aiGraphObject.startDate, this.aiGraphObject.endDate).then((res: any) => {
                this.setShopStats(res.aiStatList);
            });
        }

        makeAICamGraph(stats: any, type: string) {
            if (!stats || !stats.length) {
                return;
            }

            let elementId, $aiGraphEl, chartWidth, key: string, data: any = {},
                weekDay: any = this.txtMap.dayMap;
            if (type === 'sum') {
                elementId = 'sum_graph';
            } else {
                elementId = 'cam_graph_' + stats[0].cameraId;
            }
            $aiGraphEl = $('#' + elementId);
            if (!$aiGraphEl.length) {
                return;
            }
            $aiGraphEl.html('');

            chartWidth = $aiGraphEl.width();
            if (stats) {
                let i: number;
                data.categories = [];
                data.series = [{name: this.txtMap.man, data: [], color: "#81b5ee"}];
                if (this.aiGraphObject.mode === 'daily') {
                    for (key in weekDay) {
                        data.categories.push(weekDay[key]);
                        data.series[0].data.push(stats[key] ? stats[key].peopleMax : 0);
                    }
                } else {
                    let left: number = 0;
                    for (key in stats) {
                        if (!this.pAiIs24Hours) {
                            if (this.pAiStartTime <= parseInt(key) && this.pAiEndTime >= parseInt(key)) {
                                data.categories.push(key);
                                data.series[0].data.push(stats[key].peopleMax);
                            }
                        } else {
                            data.categories.push(key);
                            data.series[0].data.push(stats[key].peopleMax);
                        }
                    }
                    if (this.pAiIs24Hours) {
                        left = 24 - data.categories.length;
                        for (i = 0; i < left; i+=1) {
                            data.categories.push('' + (24 - left + i));
                            data.series[0].data.push(0);
                        }
                    } else {
                        left = (this.pAiEndTime - this.pAiStartTime) + 1 - data.categories.length;
                        const lastTime: number = parseInt(data.categories[data.categories.length - 1]);
                        for (i = 0; i < left; i+=1) {
                            var time = lastTime + (i + 1);
                            data.categories.push('' + time);
                            data.series[0].data.push(0);
                        }
                    }
                }
                // option 설정
                const options: any = {
                    theme: "newTheme",
                    chart: {
                        "width": (chartWidth),
                        "height": type === 'sum' ? 400 : 260,
                        "title": "",
                        "format": '1,000'
                    },
                    yAxis: {
                        "title": "",
                        "min": 0
                    },
                    tooltip: {
                        "suffix": this.txtMap.manCount
                    },
                    xAxis: {
                        "title": "",
                        "labelInterval": this.aiGraphObject.mode === 'daily' ? 1 : 2
                    },
                    series: {
                        "hasDot": false,
                        "hasSelection": true
                    },
                    legend: {
                        "visible": false
                    }
                };
                // //차트 라인 컬러 변경
                const colors: string[] = [];
                if (data.series) {
                    for (i = 0; i < data.series.length; i+=1) {
                        colors.push(data.series[i].color);
                    }
                }
                const theme: any = {
                    series: {
                        colors: colors
                    }
                };
                tui.chart.registerTheme('newTheme', theme);
                // 차트생성
                const lineChart = tui.chart.columnChart(document.getElementById(elementId), data, options);
                $aiGraphEl.children('.tui-chart').css('margin', "auto");
            }
        }

        makeAICamLineChart(stats: any, type: string) {
            let i: number, len: number, format: string, yTitle: string, data: any, options: any,
                elementId: string, container: HTMLElement | null, datas: (string|number)[] = [], categories: string[] = [];

            if (type === 'sum') {
                elementId = 'sum_graph';
            } else {
                elementId = 'cam_graph_' + stats[0].cameraId;
            }
            container = document.getElementById(elementId);
            if (container) {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }
            //Make Categories
            if (this.pAiIs24Hours) {
                for (i = 0; i < 25; i+=1) {
                    categories.push(i < 10 ? '0' + i : '' + i);
                }
            } else {
                for (i = this.pAiStartTime; i < this.pAiEndTime + 1; i+=1) {
                    categories.push(i < 10 ? '0' + i : '' + i);
                }
            }
            //Make Datas
            len = (categories.length - 1) * 6;
            for (i = 0; i < len; i+=1) {
                if (stats[i]) {
                    datas.push(stats[i].peopleMax);
                } else {
                    datas.push("");
                }
            }
            yTitle = '(' + this.txtMap.manCount + ')';
            format = '0';
            data = {
                categories: categories,
                series: [
                    {
                        name: '',
                        data: datas
                    }
                ]
            };
            options = {
                chart: {
                    width: $('#' + elementId).width() - (type === 'sum' ? 30 : 10),
                    height: type === 'sum' ? 400 : 260,
                    format: format
                },
                yAxis: {
                    title: yTitle,
                    min: 0
                },
                xAxis: {
                    title: '(' + this.txtMap.hourCount + ')'
                },
                legend: {
                    visible: false
                }
            };
            const theme = {
                series: {
                    colors: ['#4b96e6']  // '#D95576, '#00628C', '#00A8DA', '#1EA399', '#F7A655'
                }
            };
            tui.chart.registerTheme('theme', theme);
            options.theme = 'theme';
            const chart = tui.chart.lineChart(container, data, options);
            $('#' + elementId + ' .tui-chart-series-custom-event-area').hide();
            $('#' + elementId + ' .tui-chart-plot-area').hide();
        }

        onCloseDialog () {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    .ai_camera_graph_dlg {
        h4 {
            font-size: 24px; text-align: left; font-weight:bold; padding:32px 0 20px 32px;
        }
        .sum_graph_wrap {
            border-bottom: 1px solid #dddddd;
        }
        #sum_graph {
            width: 100%; height:414px;
        }
        .ai_date_area {
            padding-top: 8px;
            background-color: #e6e6e6;
            border-top: 1px solid #cccccc;
            border-bottom: 1px solid #cccccc;
        }
        .graph_area {
            height:579px; overflow-y:auto;
        }
        .ai_date_select_wrap {
            position:relative; background-color: #fafafa; height:52px;
            .date_control_wrap {
                display:inline-block; width:230px; margin-top:10px;
            }
            .select_day {
                font-size:16px; color:#333333; font-weight:bold; margin-top:7px; display:inline-block;
                &:lang(ja) {
                    margin-top:3px;
                }
            }
            .prev_btn {
                display:inline-block; background: url(/resources/img/btn-arrow-prev-gray.png) no-repeat; width:32px; height:32px; float:left;
            }
            .next_btn {
                display:inline-block; background: url(/resources/img/btn-arrow-next-gray.png) no-repeat; width:32px; height:32px; float:right;
            }
        }
        .cam_graph {
            display:inline-block; box-sizing:border-box; border:1px solid #dddddd; width:50%; height:316px;
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
        .cam_stat_load_img {
            width:50px; height:50px; margin-top:30px;
        }
        .date_mode_control {
            border: 1px solid #b2b2b2; width:60px; height:32px; position:absolute; right:24px; top:10px; color:#333333; font-size:13px;
        }
    }
</style>