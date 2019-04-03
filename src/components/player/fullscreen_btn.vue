<template>
    <span>
        <button type="button" :title="$t('ENTER_FULLSCREEN')" class="menu_btn fullscreen_btn full" v-show="!isFullScreen" @click="pressedFullScreenButton()"></button>
        <button type="button" :title="$t('ENTER_FULLSCREEN')" class="menu_btn fullscreen_btn" v-show="isFullScreen" @click="pressedExitFullScreenButton()"></button>
    </span>
</template>

<script>
    import store from '../../service/player/store';

    var getFullScreenStatus = function () {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    };

    export default {
        name: 'fullscreenBtn',
        props: [],
        computed: {
            cameraData: function () {
                return store.state.cameraData;
            },
            isFullScreen: function () {
                return store.state.isFullScreen;
            },
            dataLoadingStatus: function () {
                return store.state.dataLoadingStatus;
            }
        },
        data: function () {
            return {
                fullscreenTimer : null
            }
        },
        created : function() {
            this.bindChangeEventCb = this.fullscreenChangeEvent.bind(this);
            d3.select('#fullscreen').on('fullscreenchange', this.bindChangeEventCb);
            d3.select('#fullscreen').on('webkitfullscreenchange', this.bindChangeEventCb);
            d3.select('#fullscreen').on('mozfullscreenchange', this.bindChangeEventCb);
            d3.select(document).on('MSFullscreenChange', this.bindChangeEventCb);

            this.bindFullscreenCb = this.fullscreenHandler.bind(this);
            document.addEventListener('webkitfullscreenchange', this.bindFullscreenCb, false);
            document.addEventListener('mozfullscreenchange', this.bindFullscreenCb, false);
            document.addEventListener('fullscreenchange', this.bindFullscreenCb, false);
            document.addEventListener('MSFullscreenChange', this.bindFullscreenCb, false);
        },
        mounted : function() {
        },
        beforeDestroy : function() {
        },
        methods : {
            pressedFullScreenButton: function() {
                if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                    var rv = 0;
                    var ua = navigator.userAgent;
                    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                    if (re.exec(ua) != null)
                        rv = parseFloat(RegExp.$1);
                    if(rv != 0 && rv <=10){
                        return;
                    }
                }

                if(this.dataLoadingStatus == true){
                    if (this.cameraData.recorderType !== "recorder") {
                        this.$emit('event', {event: 'dataLoading'});
                        return;
                    }
                }

                var element = document.getElementById("fullscreen");
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
            },
            pressedExitFullScreenButton: function() {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }

                this.$emit('event', {event: 'beforeChange', state: false});
            },
            fullscreenChangeEvent : function() {
                var isFullScreenStatus = getFullScreenStatus();

                store.dispatch('IS_FULLSCREEN_CHANGE', isFullScreenStatus);
                this.$emit('event', {event: 'changed', state: isFullScreenStatus});
            },
            fullscreenHandler : function(event) {
                if (getFullScreenStatus()) {
                    if (this.cameraData.recorderType === "recorder") {
                        $('#player').show();
                        $('#player').css('opacity', 0);
                        setTimeout(() => {
                            if ($('#remoteVideosContainer').children('video').length) {
                                $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - 100);
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
            },
            stopFullscreenTimer : function() {
                if (this.fullscreenTimer) {
                    clearTimeout(this.fullscreenTimer);
                    this.fullscreenTimer = null;
                }
            },

            startFullscreenTimer : function() {
                clearTimeout(this.fullscreenTimer);
                this.fullscreenTimer = setTimeout(() => {
                    this.playEventCb('timelineVisibleChanged', false);
                }, 5000);
            },

            destroy : function() {
                document.removeEventListener('webkitfullscreenchange', this.bindFullscreenCb, false);
                document.removeEventListener('mozfullscreenchange', this.bindFullscreenCb, false);
                document.removeEventListener('fullscreenchange', this.bindFullscreenCb, false);
                document.removeEventListener('MSFullscreenChange', this.bindFullscreenCb, false);
                this.stopFullscreenTimer();
            }
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>