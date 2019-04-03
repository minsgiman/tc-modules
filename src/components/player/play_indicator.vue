<template>
    <div id="play_indicator">
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
                    } else if (type === 'forward') {
                        className = 'left_btn';
                    } else if (type === 'backward') {
                        className = 'right_btn';
                    }

                    const $btn = $('<button>', {class: className});
                    if (this.isFullScreen) {
                        $btn.addClass('fullscreen_mode');
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

            destroy : function() {
            }
        }
    }
</script>

<style lang="less">
    #play_indicator {
        width: 100%;
        height: 30vw;
        position: absolute;
        display:table;
        z-index: 1;
        top: 0px;
        left: 0px;
        .btn_wrap {
            display:table-cell; text-align:center; vertical-align:middle; width:100%; height:100%;
            button {
                position: absolute;
                width:40px;
                height:40px;
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
                &.fullscreen_mode {
                    margin-top:100px;
                }
                &.animate {
                    transition: all 0.7s;
                    transform: scale(2);
                    opacity: 0;
                }
            }
        }
    }
</style>