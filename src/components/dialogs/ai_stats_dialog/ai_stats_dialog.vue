<template>
    <div class="ai_camera_stats_dlg">
        <modal_dialog @close="onCloseDialog" :dlgStyle="dlgStyle">
            <template slot="content">
                <div>
                    <h4>{{txtMap.title}}</h4>
                    <ul class="ai_cam_list">
                        <li class="ai_cam" v-for="(camera, index) in cameraSummaries">
                            <img :src="camera.thumbnailPath" onerror="this.src='/resources/images/img_camera_fail.png'">
                            <p>
                                <span class="ai_cam_name">{{camera.labelName}}</span>
                                <span class="ai_date">{{aiDataTimeConverter(camera.aiCountSummary.updateDate)}}</span>
                                <span class="ai_count_wrap">
                                <span class="count_num">{{camera.aiCountSummary.totalInPeopleZone}}</span>
                                <span>{{txtMap.countUnit}},</span>
                                <span class="count_num">{{camera.aiCountSummary.useTableCount}}/{{camera.aiCountSummary.allTableCount}}</span>
                                <span>{{txtMap.seatUnit}}</span>
                            </span>
                            </p>
                        </li>
                    </ul>
                </div>
            </template>
        </modal_dialog>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import modal_dialog from '../../uikit/modal_dialog';
    import { IAiCameraSummary } from '../interface';

    @Component({
        components: {
            modal_dialog
        }
    })
    export default class AiStatsDialog extends Vue {
        @Prop() dlgStyle!: any;
        @Prop() txtMap!: any;
        @Prop() pCameraSummaries!: IAiCameraSummary[];

        cameraSummaries: IAiCameraSummary[] | null = null;

        private created() {
            this.cameraSummaries = this.pCameraSummaries;
        }

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        updateAiData (cameraSummaries: IAiCameraSummary[]) {
            this.cameraSummaries = cameraSummaries;
        }

        onCloseDialog () {
            this.$emit('event', {event: 'close'});
            this.$destroy();
        }

        destroy() {
            this.$destroy();
        }

        aiDataTimeConverter (timestamp: number): string {
            if (!timestamp) {
                return ''
            }

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
    }
</script>
<style lang="less">
    .ai_camera_stats_dlg {
        h4{
            font-size: 24px; text-align: left; font-weight:bold;
        }
        .ai_cam_list {
            width:calc(100% + 12px); height:578px; margin-top:24px; overflow-y:auto; text-align:left;
        }
        .ai_cam {
            display:inline-block; width:356px; height:252px; margin:0 16px 16px 0;
            &:nth-child(2n) {
                margin-right:0;
            }
            img {
                display:block; width:356px; height:208px;
            }
            p {
                border:1px solid #dcdcdc; box-sizing:border-box; background-color:#f8f8f8; height: 48px; padding: 15px 16px 14px 16px;
                &:lang(ja) {
                    padding-top:10px;
                }
            }
            .ai_cam_name {
                font-size:15px; font-weight:bold; color:#333333; margin-right:12px;
            }
            .ai_date {
                font-size:16px; color:#333333;
            }
            .ai_count_wrap {
                font-size:16px; color:#333333; float:right;
            }
            .count_num {
                color:#e94155;
            }
        }
    }
</style>