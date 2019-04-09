<template>
    <div id="play_indicator" @click="togglePlay">
        <div class="btn_wrap"></div>
    </div>
</template>

<script>
    import store from '../../service/player/store';

    export default {
        name: 'playIndicator',
        props: [],
        computed: {
            isFullScreen: function () {
                return store.state.isFullScreen;
            },
            isPlaying: function () {
                return store.state.isPlaying;
            }
        },
        data: function () {
            return {
                indicatorTimeout: null
            }
        },
        created : function() {
        },
        mounted : function() {
            this.updateIndicatorSize();
        },
        beforeDestroy : function() {
        },
        methods : {
            showIndicator : function(type) {
                if (this.indicatorTimeout) {
                    clearTimeout(this.indicatorTimeout);
                    this.indicatorTimeout = null;
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
            },

            togglePlay: function() {
                if (this.isPlaying) {
                    this.showIndicator('pause');
                } else {
                    this.showIndicator('play');
                }
                this.$emit('event', {event: 'togglePlay'});
            },

            updateIndicatorSize: function() {
                $('#play_indicator').css('width', $("#player").width() - 200);
                $('#play_indicator').css('height', $("#player").height());
            }
        }
    }
</script>

<style lang="less">
    #play_indicator {
        width: 100%;
        height: 100%;
        position: absolute;
        display:table;
        z-index: 1;
        top: 0px;
        right: 0px;
        .btn_wrap {
            display:table-cell; text-align:center; vertical-align:middle; width:100%; height:100%; padding-right:200px;
            button {
                position: absolute;
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
                    transform: scale(1.5);
                    opacity: 0;
                }
            }
        }
    }
</style>