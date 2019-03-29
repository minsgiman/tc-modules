<template>
    <div class="cam_info" id="cam_info" :class="{toggle_on : isShowTimelineToggleArea && isToggleOn , toggle_off : isShowTimelineToggleArea && !isToggleOn }">
        <div class="cam_info_area cam_info_bg cam_info_bg_en_en_en">
            <div class="time_area" id="time_area" style="position: relative;">
                <button type="button" class="sp pause" v-show="isPlaying" @click="pauseBtn()" id="pause_btn"></button>
                <button type="button" class="sp play" v-show="!isPlaying" @click="playBtn()" id="play_btn"></button>
                <span class="date">{{formattedDateNotYo(currentTime)}}</span>
                <span class="time">{{formattedTime(currentTime)}}</span>
                <button type="button" class="golive" v-show="!isLive" @click="goLive()" id="golive_btn">
                    <span>GO LIVE</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import store from '../../service/player/store';
    import moment from 'moment';
    import 'moment-timezone';

    export default {
        name: 'playInfoBar',
        props: [],
        computed: {
            isPlaying: function () {
                return store.state.isPlaying;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            isLive: function () {
                return store.state.isLive;
            },
            timeZone: function () {
                return (store.state.cameraConfig && store.state.cameraConfig.timezone) ? store.state.cameraConfig.timezone.split(',')[2] : '';
            }
        },
        data: function () {
            return {
                isShowTimelineToggleArea : false,
                isToggleOn : false
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
        },
        methods : {
            pauseBtn : function() {
                this.$emit('event', {event: 'pause'});
                store.dispatch('IS_PLAYING_CHANGE', false);
            },
            playBtn : function() {
                this.$emit('event', {event: 'play'});
                store.dispatch('IS_PLAYING_CHANGE', true);
            },
            formattedDateNotYo: function(date) {
                var md, tz = this.timeZone;
                if (tz !== undefined) {
                    md = moment(new Date(date)).tz(tz);
                } else {
                    md = moment(new Date(date));
                }
                return md ? md.locale($("html").attr("lang")).format("MM. DD dd") : '';
            },

            formattedTime: function(date) {
                var md, tz = this.timeZone;
                if (tz !== undefined) {
                    md = moment(new Date(date)).tz(tz);
                } else {
                    md = moment(new Date(date));
                }
                return md ? md.format("HH:mm:ss") : '';
            },

            camInfoBarChange : function() {
                if(this.isLive == false){
                    if(parseInt(window.innerWidth) < 1900){
                        $(".cam_info_bg").css("width","280px");
                        $(".cam_info_bg").css("margin-left"," -140px");

                        $(".cam_info_bg_en").css("width","290px");
                        $(".cam_info_bg_en").css("margin-left"," -145px");
                    }else{
                        $(".cam_info_bg").css("width","280px");
                        $(".cam_info_bg").css("margin-left"," -140px");

                        $(".cam_info_bg_en").css("width","290px");
                        $(".cam_info_bg_en").css("margin-left"," -145px");
                    }
                }else{
                    if(parseInt(window.innerWidth) < 1900){
                        $(".cam_info_bg").css("width","206px");
                        $(".cam_info_bg").css("margin-left"," -103px");

                        $(".cam_info_bg_en").css("width","216px");
                        $(".cam_info_bg_en").css("margin-left"," -108px");
                    }else{
                        $(".cam_info_bg").css("width","206px");
                        $(".cam_info_bg").css("margin-left"," -103px");

                        $(".cam_info_bg_en").css("width","216px");
                        $(".cam_info_bg_en").css("margin-left"," -108px");
                    }
                }
            },

            goLive: function() {
                this.$emit('event', {event: 'goLive'});
            },

            setData : function(key, value) {
                this[key] = value;
            },

            getData : function(key) {
                return this[key];
            }
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>