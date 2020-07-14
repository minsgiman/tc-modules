<template>
    <div class="cam_info" id="cam_info" :class="{toggle_on : isShowTimelineToggleArea}">  <!--&& isToggleOn , toggle_off : isShowTimelineToggleArea && !isToggleOn-->
        <div class="cam_info_area cam_info_bg cam_info_bg_en_en_en">
            <div class="time_area" id="time_area" style="position: relative;">
                <button type="button" class="sp pause" v-show="isPlaying" @click="pauseBtn()" id="pause_btn"></button>
                <button type="button" class="sp play" v-show="!isPlaying" @click="playBtn()" id="play_btn"></button>
                <span class="date">{{formattedDateNotYo(currentTime)}}</span>
                <span class="time">{{formattedTime(currentTime)}}</span>
                <button type="button" class="golive" v-show="!isLive" @click="goLive()" id="golive_btn">
                    <span>Go live</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';
    // import moment from 'moment';
    // import 'moment-timezone';

    const $: any = (window as any).$ as any;
    const moment: any = (window as any).moment as any;

    @Component
    export default class PlayInfoBar extends Vue {
        get isPlaying() {
            return store.state.isPlaying;
        }
        get currentTime() {
            return store.state.currentTime;
        }
        get isLive() {
            return store.state.isLive;
        }
        get timeZone() {
            return (store.state.cameraConfig && store.state.cameraConfig.timezone) ? store.state.cameraConfig.timezone.split(',')[2] : '';
        }

        isShowTimelineToggleArea: boolean = false;
        isToggleOn: boolean = false;

        pauseBtn() {
            this.$emit('event', {event: 'pause'});
            store.dispatch('IS_PLAYING_CHANGE', false);
        }

        playBtn() {
            this.$emit('event', {event: 'play'});
            store.dispatch('IS_PLAYING_CHANGE', true);
        }

        formattedDateNotYo(date: any) {
            var md, tz = this.timeZone;
            if (tz !== undefined) {
                md = moment(new Date(date)).tz(tz);
            } else {
                md = moment(new Date(date));
            }
            return md ? md.locale($("html").attr("lang")).format("MM. DD dd") : '';
        }

        formattedTime(date: any) {
            var md, tz = this.timeZone;
            if (tz !== undefined) {
                md = moment(new Date(date)).tz(tz);
            } else {
                md = moment(new Date(date));
            }
            return md ? md.format("HH:mm:ss") : '';
        }

        camInfoBarChange() {
            if(this.isLive == false){
                if(parseInt(window.innerWidth as any) < 1900){
                    $(".cam_info_bg").css("width","270px");
                    $(".cam_info_bg").css("margin-left"," -140px");

                    $(".cam_info_bg_en").css("width","290px");
                    $(".cam_info_bg_en").css("margin-left"," -145px");
                }else{
                    $(".cam_info_bg").css("width","270px");
                    $(".cam_info_bg").css("margin-left"," -140px");

                    $(".cam_info_bg_en").css("width","290px");
                    $(".cam_info_bg_en").css("margin-left"," -145px");
                }
            }else{
                if(parseInt(window.innerWidth as any) < 1900){
                    $(".cam_info_bg").css("width","198px");
                    $(".cam_info_bg").css("margin-left"," -103px");

                    $(".cam_info_bg_en").css("width","216px");
                    $(".cam_info_bg_en").css("margin-left"," -108px");
                }else{
                    $(".cam_info_bg").css("width","198px");
                    $(".cam_info_bg").css("margin-left"," -103px");

                    $(".cam_info_bg_en").css("width","216px");
                    $(".cam_info_bg_en").css("margin-left"," -108px");
                }
            }
        }

        goLive() {
            this.$emit('event', {event: 'goLive'});
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>