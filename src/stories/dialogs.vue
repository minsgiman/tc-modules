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
                    width: '1100px', height: '720px', boxSizing: 'border-box'
                },
                'txtMap' : {
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
                'pAiStartTime' : 0,
                'pAiEndTime' : 0,
                'pAiIs24Hours' : false,
                'pShopStats' : [{"key":2019121000,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1278,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121001,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1265,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121002,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1277,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121003,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1277,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121004,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1275,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121005,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1282,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121006,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1274,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121007,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1244,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121008,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1227,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121009,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1214,"objMax":2,"objMin":-1,"objSum":45,"peopleMax":2,"peopleMin":-1,"peopleSum":27,"seatMax":1,"seatMin":-1,"seatSum":22},{"key":2019121010,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1188,"objMax":5,"objMin":0,"objSum":1098,"peopleMax":4,"peopleMin":-1,"peopleSum":688,"seatMax":3,"seatMin":-1,"seatSum":633},{"key":2019121011,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1134,"objMax":10,"objMin":0,"objSum":3117,"peopleMax":8,"peopleMin":0,"peopleSum":1820,"seatMax":4,"seatMin":0,"seatSum":1573},{"key":2019121012,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1092,"objMax":12,"objMin":0,"objSum":6566,"peopleMax":8,"peopleMin":0,"peopleSum":4281,"seatMax":4,"seatMin":0,"seatSum":3049},{"key":2019121013,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1035,"objMax":8,"objMin":0,"objSum":4079,"peopleMax":7,"peopleMin":0,"peopleSum":3196,"seatMax":4,"seatMin":0,"seatSum":1989},{"key":2019121014,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1158,"objMax":6,"objMin":0,"objSum":1049,"peopleMax":5,"peopleMin":-1,"peopleSum":613,"seatMax":3,"seatMin":-1,"seatSum":556},{"key":2019121015,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":383,"objMax":3,"objMin":-1,"objSum":209,"peopleMax":3,"peopleMin":-1,"peopleSum":209,"seatMax":2,"seatMin":-1,"seatSum":26}],
                'pAiGraphObject' : aiGraphObject,
                'pRequestShopStats' : function(mode: string, startDate: Date, endDate: Date) {
                    /*
                    if (mode === 'hourly') {
                        return Shop.aiHourlyStats({shopId: $scope.shopId, start: getDateString(startDate), end: getDateString(endDate), count: 1}).$promise;
                    } else if (mode === 'min') {
                        var startDateStr = getDateString(startDate), endDateStr = getDateString(endDate);
                        if (aiIs24Hours) {
                            startDateStr = startDateStr + '-00';
                            endDateStr = endDateStr + '-23';
                        } else {
                            startDateStr = startDateStr + '-' + (aiStartTime < 10 ? '0' + aiStartTime : aiStartTime);
                            endDateStr = endDateStr + '-' + (aiEndTime < 10 ? '0' + aiEndTime : aiEndTime);
                        }
                        return Shop.aiMinStats({shopId: $scope.shopId, start: startDateStr, end: endDateStr, count: 1}).$promise;
                    } else {
                        return Shop.aiDailyStats({shopId: $scope.shopId, start: getDateString(startDate), end: getDateString(endDate)}).$promise;
                    }
                     */
                },
                'pRequestCamStats' : function(camIds: string[], mode: string, startDate: Date, endDate: Date) {
                    /*
                    var i, len = camIds.length, promiseMap = {};
                    var startDateStr = getDateString(startDate), endDateStr = getDateString(endDate);
                    if (mode === 'min') {
                        if (aiIs24Hours) {
                            startDateStr = startDateStr + '-00';
                            endDateStr = endDateStr + '-23';
                        } else {
                            startDateStr = startDateStr + '-' + (aiStartTime < 10 ? '0' + aiStartTime : aiStartTime);
                            endDateStr = endDateStr + '-' + (aiEndTime < 10 ? '0' + aiEndTime : aiEndTime);
                        }
                    }
                    for (i = 0; i < len; i+=1) {
                        if (mode === 'hourly') {
                            promiseMap[camIds[i]] = Camera.aiHourlyStats({cameraId: camIds[i], start: startDateStr, end: endDateStr}).$promise;
                        } else if (mode === 'min') {
                            promiseMap[camIds[i]] = Camera.aiMinStats({cameraId: camIds[i], start: startDateStr, end: endDateStr}).$promise;
                        } else {
                            promiseMap[camIds[i]] = Camera.aiDailyStats({cameraId: camIds[i], start: startDateStr, end: endDateStr}).$promise;
                        }
                    }
                    return promiseMap;
                     */
                },
                'pGetCameraName' : function(camId: string) {
                    /*
                    if (aiStats) {
                        var i, len = aiStats.length;
                        for (i = 0; i < len; i+=1) {
                            if (aiStats[i].cameraId === camId) {
                                return aiStats[i].cameraName;
                            }
                        }
                    }
                    return '';
                    */
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