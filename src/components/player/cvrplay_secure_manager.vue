<template>
    <div id="cvr_play_manager_wrap">
        <div class="dimmed ly_pop_full" v-show="isShowCVRPlayPasswordConfirm"></div>
        <div class="ly_pop type2 ly_pop_full ly_pop_w01 ly_pop_bottom_long" v-show="isShowCVRPlayPasswordConfirm">
            <div class="ly_tit">
                <h2>{{$t('CAMERA_SECURITY_UPGRADE')}}</h2>
            </div>
            <div class="ly_con ly_con_sm">
                <p v-show="!isShared">{{$t('CAMERA_SHOW_VIDEO_INPUT_PASSWORD')}}</p>
                <p v-show="isShared">{{$t('CAMERA_INPUT_PASSWORD_SHARE_MAN')}}</p>
                <div class="ly_in_box">
                    <input type="password" :placeholder="$t('CAMERA_PASSWORD_INPUT')" v-model="securePassword" style="width: 490px;"></input>
                </div>
            </div>
            <div class="btn_box">
                <button type="button" class="btn btn_b" @click="checkPlayPassword()">{{$t('BUTTON_CONFIRM')}}</button>
            </div>
            <button type="button" class="sp btn_close_alert" @click="cancelCVRPlay()"></button>
        </div>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';
    import toastcamAPIs from './../../service/toastcamAPIs';

    @Component
    export default class CvrPlaySecureManager extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get isLive() {
            return store.state.isLive;
        }
        get isShared() {
            return store.state.isShared;
        }
        get category() {
            return store.state.category;
        }

        securePassword: string = '';
        cvrPasswordSuccessCallback: any = null;
        isShowCVRPlayPasswordConfirm: boolean = false;

        checkCVRSeucre(callback: any) {
            if (this.category === 'demo') {
                callback(false);
            } else {
                toastcamAPIs.call(this.isShared && this.category === 'b2b' ? toastcamAPIs.camera.GET_SHARED_CAMERA_CONFIG : toastcamAPIs.camera.GET_CAMERA_CONFIG, {cameraId: this.cameraData.id}, (data: any) => {
                    if(data.secureMode == "on"){
                        this.$emit('event', {event: 'stopTimer'});
                        var passCVRSecure = sessionStorage.getItem("passCVRSecureCameraIds");
                        if (passCVRSecure == null || passCVRSecure === "undefined"){
                            callback(true);
                        } else {
                            if(passCVRSecure.indexOf(this.cameraData.id) > -1){
                                callback(false);
                            }else{
                                callback(true);
                            }
                        }
                    } else {
                        callback(false);
                    }
                }, (err: any) => {
                    callback(false);
                });
            }
        }

        showCVRPlayPasswordConfirm() {
            this.isShowCVRPlayPasswordConfirm = true;
        }

        setCVRSecureCallback(callback: any) {
            this.securePassword = '';
            this.isShowCVRPlayPasswordConfirm = true;
            this.cvrPasswordSuccessCallback = callback;
        }

        checkPlayPassword() {
            this.isShowCVRPlayPasswordConfirm = false;
            toastcamAPIs.call(toastcamAPIs.camera.CONFIRM_SECURE_PASSWORD, {cameraId: this.cameraData.id, securePassword: this.securePassword}, (data: any) => {
                if(data.code == "ok"){
                    var passCVRSecure = sessionStorage.getItem("passCVRSecureCameraIds");
                    if(passCVRSecure == null || passCVRSecure == "undefined" || passCVRSecure.indexOf(this.cameraData.id) > -1){
                        sessionStorage.setItem("passCVRSecureCameraIds", this.cameraData.id);
                    } else {
                        sessionStorage.setItem("passCVRSecureCameraIds", passCVRSecure + "," + this.cameraData.id);
                    }
                    if (this.cvrPasswordSuccessCallback) {
                        this.cvrPasswordSuccessCallback();
                    }
                } else {
                    this.$emit('event', {event: 'isIncorrectPlayPasswordChanged', data: true});
                }
            }, (err: any) => {});
        }

        cancelCVRPlay() {
            if(this.isLive){
                this.$emit('event', {event: 'goLiveByCancleCVR'});
            }
            this.isShowCVRPlayPasswordConfirm = false;
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>