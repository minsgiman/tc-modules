<template>
    <span>
        <button type="button" :title="$t('ENTER_FULLSCREEN')" class="menu_btn fullscreen_btn full" v-show="!isFullScreen" @click="pressedFullScreenButton()"></button>
        <button type="button" :title="$t('ENTER_FULLSCREEN')" class="menu_btn fullscreen_btn" v-show="isFullScreen" @click="pressedExitFullScreenButton()"></button>
    </span>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';

    const $: any = (window as any).$ as any;
    const d3: any = (window as any).d3 as any;

    const getFullScreenStatus = function () {
        return !!((document as any).fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
    };

    @Component
    export default class FullscreenBtn extends Vue {
        get cameraData () {
            return store.state.cameraData;
        }
        get isFullScreen () {
            return store.state.isFullScreen;
        }
        get dataLoadingStatus () {
            return store.state.dataLoadingStatus;
        }

        fullscreenTimer: any = null;

        private created() {
            (this as any).bindChangeEventCb = this.fullscreenChangeEvent.bind(this);
            d3.select('#fullscreen').on('fullscreenchange', (this as any).bindChangeEventCb);
            d3.select('#fullscreen').on('webkitfullscreenchange', (this as any).bindChangeEventCb);
            d3.select('#fullscreen').on('mozfullscreenchange', (this as any).bindChangeEventCb);
            d3.select(document).on('MSFullscreenChange', (this as any).bindChangeEventCb);

            (this as any).bindFullscreenCb = this.fullscreenHandler.bind(this);
            document.addEventListener('webkitfullscreenchange', (this as any).bindFullscreenCb, false);
            document.addEventListener('mozfullscreenchange', (this as any).bindFullscreenCb, false);
            document.addEventListener('fullscreenchange', (this as any).bindFullscreenCb, false);
            document.addEventListener('MSFullscreenChange', (this as any).bindFullscreenCb, false);
        }

        private beforeDestroy() {
            document.removeEventListener('webkitfullscreenchange', (this as any).bindFullscreenCb, false);
            document.removeEventListener('mozfullscreenchange', (this as any).bindFullscreenCb, false);
            document.removeEventListener('fullscreenchange', (this as any).bindFullscreenCb, false);
            document.removeEventListener('MSFullscreenChange', (this as any).bindFullscreenCb, false);
            this.stopFullscreenTimer();
        }

        pressedFullScreenButton() {
            if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                let rv = 0,
                    ua = navigator.userAgent,
                    re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
                if(rv != 0 && rv <=10){
                    return;
                }
            }

            if (this.dataLoadingStatus == true){
                if (this.cameraData.recorderType !== "recorder") {
                    this.$emit('event', {event: 'dataLoading'});
                    return;
                }
            }

            const element: any = document.getElementById("fullscreen");
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }

            this.$emit('event', {event: 'beforeChange', state: true});
        }

        pressedExitFullScreenButton() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }

            this.$emit('event', {event: 'beforeChange', state: false});
        }

        fullscreenChangeEvent() {
            const isFullScreenStatus = getFullScreenStatus();

            store.dispatch('IS_FULLSCREEN_CHANGE', isFullScreenStatus);
            this.$emit('event', {event: 'changed', state: isFullScreenStatus});
        }

        fullscreenHandler(event: any) {
            if (getFullScreenStatus()) {
                if (this.cameraData.recorderType === "recorder") {
                    $('#player').show();
                    $('#player').css('opacity', 0);
                    setTimeout(() => {
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - 78);
                        }
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    if (this.cameraData.recorderType === "recorder") {
                        $('#player').hide();
                    }
                    if ($('#remoteVideosContainer').children('video').length) {
                        $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - $('#timeline_table').height());
                    }
                }, 100);
            }
        }

        stopFullscreenTimer() {
            if (this.fullscreenTimer) {
                clearTimeout(this.fullscreenTimer);
                this.fullscreenTimer = null;
            }
        }

        startFullscreenTimer() {
            clearTimeout(this.fullscreenTimer);
            this.fullscreenTimer = setTimeout(() => {
                (this as any).playEventCb('timelineVisibleChanged', false);
            }, 5000);
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>