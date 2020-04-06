<template>
    <div id="play_indicator" @click="togglePlay">
        <div style="width:210px; height:65%; position:absolute; left:-200px; top:0px;"></div>
        <div class="btn_wrap"></div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';

    const $: any = (window as any).$ as any;

    @Component
    export default class PlayIndicator extends Vue {
        get isFullScreen() {
            return store.state.isFullScreen;
        }
        get isPlaying() {
            return store.state.isPlaying;
        }
        get ptzControlMode() {
            return store.state.ptzControlMode;
        }
        get hlsZoomLevel() {
            return store.state.hlsZoomLevel;
        }

        indicatorTimeout: any = null;

        private mounted() {
            this.updateIndicatorSize();
            $('#play_indicator').hover(() => {
                this.$emit('event', {event: 'indicatorHoverIn'});
            }, () => {
                this.$emit('event', {event: 'indicatorHoverOut'});
            });
            $('#play_indicator').mousemove(() => {
                this.$emit('event', {event: 'indicatorHoverIn'});
            });
        }

        showIndicator(type: string) {
            if (this.indicatorTimeout) {
                clearTimeout(this.indicatorTimeout);
                this.indicatorTimeout = null;
                $('#play_indicator .btn_wrap').empty();
            }

            this.indicatorTimeout = setTimeout(() => {
                let className;

                if (type === 'play') {
                    className = 'play_btn';
                } else if (type === 'pause') {
                    className = 'pause_btn';
                } else if (type === 'backward') {
                    className = 'left_btn';
                } else if (type === 'forward') {
                    className = 'right_btn';
                }
                const $btn = $('<button>', {class: className});
                if (type === 'forward' || type === 'backward') {
                    const $num = $('<span>');
                    $num.text(10);
                    $num.css('color', 'white').css('font-size', '8px').css('display', 'inline-block').css('margin-top', '2px');
                    $btn.append($num);
                }
                $('#play_indicator .btn_wrap').append($btn);
                setTimeout(function () {
                    $btn.addClass('animate');
                },100);
                setTimeout(function (){
                    $btn.remove();
                }, 700);
            }, 200);
        }

        togglePlay() {
            if (this.ptzControlMode) {
                return;
            }
            if (this.hlsZoomLevel > 1) {
                this.$emit('event', {event: 'zoomInit'});
                return;
            }

            if (this.isPlaying) {
                this.showIndicator('pause');
            } else {
                this.showIndicator('play');
            }
            this.$emit('event', {event: 'togglePlay'});
        }

        updateIndicatorSize() {
            $('#play_indicator').css('display', 'block');
            $('#play_indicator').css('width', $("#player").width() - 200);
            $('#play_indicator').css('height', $("#player").height());
            $('#play_indicator').css('display', 'table');
        }
    }
</script>

<style lang="less">
    #play_indicator {
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 1;
        top: 0px;
        right: 0px;
        .btn_wrap {
            display:table-cell; text-align:center; vertical-align:middle; width:100%; height:100%; padding-right:200px;
            button {
                width:52px;
                height:52px;
                margin: 0 auto;
                -webkit-transition: opacity 0.7s ease-in-out;
                -moz-transition: opacity 0.7s ease-in-out;
                -ms-transition: opacity 0.7s ease-in-out;
                -o-transition: opacity 0.7s ease-in-out;
                transition: opacity 0.7s ease-in-out;
                &.play_btn {
                    background:url(/resources/img/btn-camera-play.png) no-repeat;
                    background-size:contain;
                }
                &.pause_btn {
                    background:url(/resources/img/btn-camera-pause.png) no-repeat;
                    background-size:contain;
                }
                &.left_btn {
                    background:url(/resources/img/btn-cvr-rewind-white.png) no-repeat;
                    background-size:contain;
                }
                &.right_btn {
                    background:url(/resources/img/btn-cvr-forward-white.png) no-repeat;
                    background-size:contain;
                }
                &.animate {
                    transition: all 0.7s;
                    transform: scale(2.0);
                    opacity: 0;
                }
            }
        }
    }
</style>