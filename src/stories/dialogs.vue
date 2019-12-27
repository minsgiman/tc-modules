<template>
    <div class="dlg_test">
        <div id="dlgId"></div>
        <button class="dlg-btn" @click="createPlayerTipDlg">Show player-tip-dialog</button>
        <button class="dlg-btn" @click="createVideoPlayDlg">Show video-play-dialog</button>
        <button class="dlg-btn" @click="createConfirmDlg('normal')">Show confirm-dialog (normal)</button>
        <button class="dlg-btn" @click="createConfirmDlg('center')">Show confirm-dialog (center)</button>
        <button class="dlg-btn" @click="createConfirmDlg('checker')">Show confirm-dialog (checker)</button>
        <button class="dlg-btn" @click="createAiGuideDlg">Show ai-guide-dialog</button>
        <button class="dlg-btn" @click="createAiStatsDialog">Show ai-stats-dialog</button>
        <button class="dlg-btn" @click="createAiGraphsDialog">Show ai-graphs-dialog</button>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { playerTipDialog, videoPlayDialog, confirmDialog, aiStatsDialog, aiGraphsDialog, aiGuideDialog } from './../components/dialogs';

    @Component
    export default class Checkbox extends Vue {
        playerTipDlg: any = null;
        videoPlayDlg: any = null;
        confirmDlg: any = null;
        aiStatsDlg: any = null;
        aiGraphsDlg: any = null;
        aiGuideDlg: any = null;

        createAiGuideDlg () {
            this.aiGuideDlg = aiGuideDialog({
                elId: 'dlgId',
                dlgStyle: {
                    width: '452px', height: '367px', borderRadius: '12px', boxSizing: 'border-box', overflow: 'hidden'
                },
                txtMap: {
                    description : '수정할 영역의 점을 눌러 원하는 방향으로 늘리거나 줄여보세요.',
                    noshow : '다시 보지 않기',
                    confirm : '확인'
                },
                noCloseBtn: true,
                eventHandler: (event: any) => {
                    console.log(JSON.stringify(event));
                }
            });
        }

        createAiStatsDialog () {
            this.aiStatsDlg = aiStatsDialog({
                elId: 'dlgId',
                dlgStyle: {
                    width: '800px', height: '667px', padding: '32px', boxSizing: 'border-box'
                },
                txtMap: {
                    title : '카메라별 혼잡도',
                    countUnit : '명',
                    seatUnit : '석'
                },
                pUpdateDate: 1521709944718,
                pCameraSummaries: [
                    {
                        "cameraId":"AAAAAADFRO",
                        "cameraName":"v3lite",
                        "aiThumbnail": "http://dev-bizcam.toast.com/AAAAAADFRO/title_image.jpg?1576628323312",
                        "totalInPeopleZone" : 1,
                        "useTableCount" : 3,
                        "allTableCount" : 5
                    }
                ],
                eventHandler: (event) => {
                }
            });
        }

        createAiGraphsDialog () {
            const aiGraphObject = {
                startDate: new Date(),
                endDate: new Date(),
                mode: 'hourly'
            };

            this.aiGraphsDlg = aiGraphsDialog({
                elId: 'dlgId',
                dlgStyle : {
                    width: '1100px', height: '662px', boxSizing: 'border-box'
                },
                txtMap : {
                    title : '혼잡도 그래프',
                    weekly : '주간',
                    daily : '일일',
                    today : '오늘',
                    hour : '시간',
                    min : '분',
                    man : '인원',
                    manCount : '명',
                    hourCount : '시',
                    dayMap : ['일', '월', '화', '수', '목', '금', '토']
                },
                pRequestShopChart : function(mode: any, startDate: any, endDate: any) {

                }
            });
        }

        createPlayerTipDlg () {
            this.playerTipDlg = playerTipDialog({
                elId: 'dlgId',
                dlgStyle : {
                    width: '500px', height: '610px', padding: '24px', boxSizing: 'border-box', overflow: 'auto'
                },
                txtMap : {
                    title : 'title Str',
                    guideKeyFb : 'guideKeyFb line1 Str<br>guideKeyFb line2 Str',
                    guideKeySpace : 'guideKeySpace Str',
                    confirm : 'confirm Str'
                },
                eventHandler: (event: any) => {
                    console.log(event);
                }
            });
        }

        createVideoPlayDlg () {
            this.videoPlayDlg = videoPlayDialog({
                elId: 'dlgId',
                dlgStyle : {
                    width: '1180px', height: '730px', padding: '60px', boxSizing: 'border-box', overflow: 'auto'
                },
                webmUrl : 'https://bizcam.toast.com/CF/video/biz_app_final.webm',
                mp4Url : 'https://bizcam.toast.com/CF/video/biz_app_final.mp4'
            });
        }

        createConfirmDlg (type: string) {
            if (type === 'center') {
                this.confirmDlg = confirmDialog({
                    elId: 'dlgId',
                    dlgStyle : {
                        width: '482px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
                    },
                    theme : 'center',
                    title : '매장을 공유하면 해당 카메라들에 대한<br>클라우드 모니터 기능도 함께 공유됩니다.',
                    description : '공유를 진행하시겠습니까?',
                    btns : [{name: 'cancel', text: '취소', class: 'white'}, {name: 'conf', text: '확인', class: 'blue'}],
                    eventHandler : (event: any) => {
                        console.log(event);
                        this.confirmDlg.destroy();
                    }
                });
            } else if (type === 'checker') {
                this.confirmDlg = confirmDialog({
                    elId: 'dlgId',
                    dlgStyle : {
                        width: '460px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
                    },
                    theme : 'checker',
                    title : '공유설정 변경',
                    pCheckList : [
                        { id: 1, text: '영상,센서/도어락 이벤트 (필수)', value: true, disabled: true },
                        { id: 2, text: '클립&타임랩스', value: true },
                        { id: 3, text: '근태관리기록', value: false },
                        { id: 4, text: '매출관리기록', value: false },
                        { id: 5, text: 'DID 컨텐츠', value: false }
                    ],
                    btns : [{name: 'cancel', text: '취소', class: 'white'}, {name: 'conf', text: '확인', class: 'blue'}],
                    eventHandler : (event: any) => {
                        console.log(event);
                        this.confirmDlg.destroy();
                    }
                });
            } else {
                this.confirmDlg = confirmDialog({
                    elId: 'dlgId',
                    dlgStyle : {
                        width: '450px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
                    },
                    noCloseBtn : true,
                    description : '로그인이 만료되었거나, 비정상적인 접근입니다.<br>다시 로그인해주세요.',
                    btns : [{name: 'conf', text: '확인', class: 'blue'}],
                    eventHandler : (event: any) => {
                        console.log(event);
                        if (event.name === 'conf') {
                            this.confirmDlg.destroy();
                        }
                    }
                });
            }
        }
    }
</script>
<style lang="less">
    .dlg_test {
        padding: 20px;
        .dlg-btn {
            display: block;
            width: 230px;
            height: 80px;
            border: 1px solid;
            font-size:14px;
            margin: 20px 0;
        }
    }
</style>