<template>
    <div class="dlg_test">
        <div id="playerTipDlgId"></div>
        <div id="videoPlayDlgId"></div>
        <div id="conrfirmDlgId"></div>
        <button class="dlg-btn" @click="createPlayerTipDlg">Show player-tip-dialog</button>
        <button class="dlg-btn" @click="createVideoPlayDlg">Show video-play-dialog</button>
        <button class="dlg-btn" @click="createConfirmDlg('normal')">Show confirm-dialog (normal)</button>
        <button class="dlg-btn" @click="createConfirmDlg('center')">Show confirm-dialog (center)</button>
        <button class="dlg-btn" @click="createConfirmDlg('checker')">Show confirm-dialog (checker)</button>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { playerTipDialog, videoPlayDialog, confirmDialog } from './../components/dialogs';

    @Component
    export default class Checkbox extends Vue {
        playerTipDlg: any = null;
        videoPlayDlg: any = null;
        confirmDlg: any = null;

        createPlayerTipDlg () {
            this.playerTipDlg = playerTipDialog({
                elId: 'playerTipDlgId',
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
                elId: 'videoPlayDlgId',
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
                    elId: 'conrfirmDlgId',
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
                    elId: 'conrfirmDlgId',
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
                    elId: 'conrfirmDlgId',
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