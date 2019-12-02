<template>
    <div class="dlg_test">
        <div id="playerTipDlgId"></div>
        <div id="videoPlayDlgId"></div>
        <div id="conrfirmDlgId"></div>
        <button class="dlg-btn" @click="createPlayerTipDlg">Show player-tip-dialog</button>
        <button class="dlg-btn" @click="createVideoPlayDlg">Show video-play-dialog</button>
        <button class="dlg-btn" @click="createConfirmDlg">Show confirm-dialog</button>
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

        createConfirmDlg () {
            this.confirmDlg = confirmDialog({
                elId: 'conrfirmDlgId',
                dlgStyle : {
                    width: '450px', height: '208px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
                },
                title : '',
                description : '로그인이 만료되었거나, 비정상적인 접근입니다.<br>다시 로그인해주세요.',
                btns : [{name: 'conf', text: '확인', style: 'blue'}],
                eventHandler : (event: any) => {
                    console.log(event);
                    if (event.name === 'conf') {
                        this.confirmDlg.destroy();
                    }
                }
            });
        }
    }
</script>
<style lang="less">
    .dlg_test {
        padding: 20px;
        .dlg-btn {
            display: block;
            width: 200px;
            height: 80px;
            border: 1px solid;
            font-size:14px;
            margin: 20px 0;
        }
    }
</style>