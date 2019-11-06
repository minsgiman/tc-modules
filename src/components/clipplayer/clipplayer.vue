<template>
    <div class="tc_clipplayer" >
        <div class="video_area" id="video_area">
            <div id="replayShowArea" class="replay_show_area" v-show="replaceShow" @click="clipsReplay()">
                  <span>
                    <button><img src="/resources/im/btn_clip_re.png"></button>
                  </span>
            </div>
            <div class="clip_play" v-show="!metaLoaded">
                <span style="margin-left:-23px;margin-top:-23px;">
                    <img src="/resources/img/loading.svg" style="width:45px; height:45px;">
                </span>
            </div>
            <div class="clip_play" :class="{clip_fade: isShowAnimate && metaLoaded}" @click="togglePlay()" v-show="isPlayed && !replaceShow && metaLoaded" v-if="clipStatus == '4' || clipStatus == '5'">
                  <span>
                    <button></button>
                  </span>
            </div>
            <div class="clip_stop" :class="{clip_fade: !isShowAnimate && metaLoaded}" @click="togglePlay()" v-show="!isPlayed && !replaceShow && metaLoaded" v-if="clipStatus == '4' || clipStatus == '5'">
                  <span>
                    <button></button>
                  </span>
            </div>
            <video id="video" style="height:366px;" :poster="'https://' + thumbnailPath">
                <source :src="videoUrl" type='video/mp4'>
            </video>
        </div>
        <div class="screen" id="clip_screen">
            <div class="zoom" id="player_bar_area" style="bottom:53px; z-index:999; width:650px; border-bottom:1px solid #f4f4f4;">
                <button type="button" class="sp full" @click="pressedFullScreenButton()" v-show="!clipFullScreen" :style="{bottom: fullBottom}"></button>
                <button type="button" class="sp small" @click="pressedExitFullScreenButton()" v-show="clipFullScreen" style="bottom:136px;"></button>
                <div class="zoom_bg" id="zoom_bg" style="position:absolute;height:4px; cursor: pointer; margin-top: -1px;">
                    <div>
                        <div id="videoBar" style="position:absolute; width: 100%; z-index:999; bottom:3px; background: rgba(255,255,255,.6);">
                            <span class="bar"  id="videoCursor" :style="{ 'width': videoCursorPosition + 'px' }">100%<button type="button" class="bar_ctrl"></button></span>
                        </div>
                    </div>
                </div>
                <div class="time_box" id="timebox" v-show="clipFullScreen == false">
                    <span class="time"><em>{{ formattedDetailDate(startTime ? startTime : 0) }}</em>{{ formattedDetailTime(startTime ? startTime : 0) }}</span>
                    <span class="time_mg"> ~ </span>
                    <span class="time"><em>{{ formattedDetailDate(endTime ? endTime : 0) }}</em>{{ formattedDetailTime(endTime ? endTime : 0) }}</span>
                    <span class="long" v-if="clipStatus == '4' || clipStatus == '5' "><em>{{timeMsg}}</em>{{ remainTimeStr }}</span>
                </div>
                <div class="time_box time_box_full" id="timeboxfull" v-show="clipFullScreen == true" style="border-top:2px solid #262626; height:104px;">
                    <div style="position:relative; width:100%; text-align:center; margin-top:-15px;">
                        <li>
                            <span style="font-size:22px; color:#777; letter-spacing: -0.5px; margin-right: 5px; top: 53px;">{{ formattedDetailDate(startTime ? startTime : 0) }}</span>
                            <span style="font-size:22px; color:#fff; letter-spacing: -0.5px; top: 53px;">{{ formattedDetailTime(startTime ? startTime : 0) }}</span>
                            <span style="font-size:22px; color:#fff; letter-spacing: -0.5px; margin-left:10px; margin-right:10px; top: 53px;"> ~ </span>
                            <span style="font-size:22px; color:#777; letter-spacing: -0.5px; margin-right: 5px; top: 53px;">{{ formattedDetailDate(endTime ? endTime : 0) }}</span>
                            <span style="font-size:22px; color:#fff; letter-spacing: -0.5px; top: 53px;">{{ formattedDetailTime(endTime ? endTime : 0) }}</span>
                            <span style="font-size:22px; color:#777; letter-spacing: -0.5px; margin-left:30px; top: 53px;">{{timeMsg}}</span>
                            <span style="font-size:22px; color:#4b96e6; letter-spacing: -0.5px; margin-left:10px; top: 53px;">{{ remainTimeStr }}</span>
                        </li>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    // import $ from 'jquery';
    // import * as d3 from "d3";
    // import moment from 'moment';
    import { Component, Prop, Vue } from 'vue-property-decorator';

    const $: any = (window as any).$ as any;
    const d3: any = (window as any).d3 as any;
    const moment: any = (window as any).moment as any;

    function getBrowserLanguage (): string | null {
        var nav: any = window.navigator,
            browserLanguagePropertyKeys: string[] = [ 'language', 'browserLanguage', 'systemLanguage', 'userLanguage' ],
            i: number, language: string;

        // support for HTML 5.1 "navigator.languages"
        if (nav.languages && nav.languages.length) {
            for (i = 0; i < nav.languages.length; i++) {
                language = nav.languages[i];
                /*if (language && language.length) {
                    return language;
                }*/
                if($("html").attr("lang") == nav.languages[i]){
                    return language;
                }
            }
        }

        // support for other well known properties in browsers
        for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
            language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
                return language;
            }
        }

        return null;
    }

    @Component
    export default class ClipPlayer extends Vue {
        @Prop() private videoUrl!: string;
        @Prop() private durationStr!: string;
        @Prop() private clipStatus!: string;
        @Prop() private thumbnailPath!: string;
        @Prop() private startTime!: number;
        @Prop() private endTime!: number;

        remainTimeStr: string = "";
        replaceShow: boolean = false;
        isShowAnimate: boolean = false;
        metaLoaded: boolean = false;
        isPlayed: boolean = true;
        clipFullScreen: boolean = false;
        firstPlay: boolean = true;
        videoCursorPosition: number = 0;
        smallHeight: number = 0;
        smallTimeboxHeight: number = 0;
        barWidth: number = 0;
        timeMsg: string = '';
        lang: string | null = 'ko';
        video: any;
        fullBottom: string = '104px';

        private created () {
            this.lang = document.documentElement.getAttribute('lang');
            this.timeMsg = this.lang === 'ja' ? '合計時間' : '총 시간';
            this.remainTimeStr = this.durationStr;
            this.fullBottom = location.href.indexOf('biz') === -1 ? '128px' : '104px';
        }

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        initialize () {
            this.barWidth = parseInt(d3.select('#videoCursor').style('width'));//  커서가 bar 밖으로 나가지 않도록 보정
            const fullscreenCb: Function = this.fullscreenChangeEvent.bind(this);
            d3.select('#fullscreen').on('fullscreenchange', fullscreenCb);
            d3.select('#fullscreen').on('webkitfullscreenchange', fullscreenCb);
            d3.select('#fullscreen').on('mozfullscreenchange', fullscreenCb);
            d3.select(document).on('MSFullscreenChange', fullscreenCb);
            this.setDragControl();
            this.startVideoTimer();
        }

        timeCalcul (timeSec: number): string{
            let absTimeSec: number = Math.abs(timeSec),
                min: number = Math.floor(absTimeSec / 60),
                sec: number = Math.floor(absTimeSec % 60);

            return min + ":" + (sec < 10 ? "0" : "") + (absTimeSec < 0 ? 1 : sec);
        }

        setDragControl () {
            var that = this;
            var videoDrag = d3.behavior.drag().on('drag', function (e: any) {
                that.videoCursorPosition += d3.event.dx;
                if (that.videoCursorPosition < 0) {
                    that.videoCursorPosition = 0;
                } else if (that.videoCursorPosition > that.barWidth) {
                    that.videoCursorPosition = that.barWidth;
                }

                if(that.videoCursorPosition.toString() == "NaN"){
                    that.videoCursorPosition = 0;
                }
                var newTime = that.video.duration * (that.videoCursorPosition / that.barWidth);
                that.video.currentTime = newTime;
                that.remainTimeStr = that.timeCalcul(Math.floor(that.video.duration - that.video.currentTime));
                if (that.firstPlay) {
                    that.firstPlay = false;
                    that.timeMsg = that.lang === 'ja' ? '残り時間' : '남은 시간';
                }
            }).on('dragstart', function () {
                that.replaceShow = false;
            }).on('dragend', function () {
                let newTime: number = that.video.duration * (that.videoCursorPosition / that.barWidth);

                if(Math.floor((that.video.currentTime / that.video.duration) * that.barWidth) >= that.barWidth){
                    that.video.pause();
                    that.replaceShow = true;
                }else{
                    that.replaceShow = false;
                }
                that.video.currentTime = newTime;
                that.startVideoTimer();
            });

            d3.select('#videoCursor').call(videoDrag);
            d3.select('#videoBar').on('click', function () {
                var x = d3.mouse(document.getElementById('videoBar'))[0] - 8; // for cursur center
                that.videoCursorPosition = x;
                that.barWidth = parseInt(d3.select('#videoBar').style('width'));
                var newTime = that.video.duration * (that.videoCursorPosition / that.barWidth);
                that.video.currentTime = newTime;
                that.replaceShow = false;
                if (that.firstPlay) {
                    that.firstPlay = false;
                    that.timeMsg = that.lang === 'ja' ? '残り時間' : '남은 시간';
                }
            });
        }

        startVideoTimer() {
            var that = this;

            this.video = document.getElementById("video");
            this.barWidth = parseInt((document.getElementById('videoBar') as any).offsetWidth);
            if (this.barWidth < 650) {
                this.barWidth = 650;
            }

            this.video.addEventListener('loadedmetadata', function() {
                const elVideo: any = that.video;
                that.metaLoaded = true;
                that.remainTimeStr = that.timeCalcul(that.video.duration);
            });

            // 플레이시간 업데이트 이벤트에 따라 cusor 위치 업데이트
            this.video.addEventListener("timeupdate", function () {
                const elVideo: any = that.video;
                var minusPrefix = (Math.floor(elVideo.duration - elVideo.currentTime) > 0) ? "-" : "";
                that.remainTimeStr = that.timeCalcul(Math.floor(elVideo.duration - elVideo.currentTime));
                that.videoCursorPosition = Math.floor((elVideo.currentTime / elVideo.duration) * that.barWidth);
            });

            // play 끝났을때 replay layer show
            this.video.addEventListener("ended", function () {
                const elVideo: any = that.video;
                that.remainTimeStr = that.timeCalcul(Math.floor(elVideo.duration - elVideo.currentTime));
                that.replaceShow = true;
            });
        }

        clipsReplay () {
            this.videoCursorPosition = 0;
            this.replaceShow = false;
            this.video.currentTime = 0;
            this.isPlayed = true;
            this.isShowAnimate = true;
            if (this.video) {
                this.video.play();
            }
            this.startVideoTimer();
        }

        togglePlay () {
            if (this.video.paused) {
                this.video.play();
                this.isPlayed = true;
                this.isShowAnimate = true;
                if (this.firstPlay) {
                    this.firstPlay = false;
                    this.timeMsg = this.lang === 'ja' ? '残り時間' : '남은 시간';
                }
            } else {
                this.video.pause();
                this.isPlayed = false;
                this.isShowAnimate = false;
            }
        }

        fullscreenChangeEvent () {
            var that = this;
            if(this.clipFullScreen == true){
                this.clipFullScreen = false;
                setTimeout(function () {
                    $("#dsc_box").show();
                    $("#player_bar_area").css("bottom","53px");
                    $("#video").css("height","366px");
                    $("#player_bar_area").css("width","650px");
                    $("#timeboxfull").css("height",that.smallTimeboxHeight);
                    if (that.clipStatus == '4' || that.clipStatus == '5') {
                        that.barWidth = parseInt(d3.select('#videoBar').style('width'));

                        that.videoCursorPosition = Math.floor((that.video.currentTime / that.video.duration) * that.barWidth);
                        var newTime = that.video.duration * (that.videoCursorPosition / that.barWidth);
                        that.video.currentTime = newTime;
                    }
                    $("#replayShowArea").css("height",$("#video").css("height"));
                    $("#replayShowArea > span").css("margin", "-43px 0px 0px -43px");
                    $("#replayShowArea").find("img").css("width","64px");
                    $("#replayShowArea").find("img").css("height","64px");
                }, 100);
            }else{
                this.clipFullScreen = true;
            }
        }

        pressedFullScreenButton () {
            var that = this;
            var element: any = document.getElementById("fullscreen");
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
            // $scope.clipFullScreen = true;
            this.smallHeight = $("#video").height();
            setTimeout(function () {
                $("#dsc_box").hide();
                $("#video").css("height","");
                $("#player_bar_area").css("bottom",-1);
                $("#player_bar_area").css("width","");
                $("#player_bar_area").css("left","");
                $("#zoom_bg").css("bottom","");
                that.smallTimeboxHeight = $("#timebox").height();

                if (that.clipStatus == '4' || that.clipStatus == '5') {
                    that.barWidth = parseInt(d3.select('#videoBar').style('width'));
                    that.videoCursorPosition = Math.floor((that.video.currentTime / that.video.duration) * that.barWidth);
                    var newTime = that.video.duration * (that.videoCursorPosition / that.barWidth);

                    that.video.currentTime = newTime;
                }
                $("#replayShowArea").css("height",$("#video").css("height"));
                $("#replayShowArea > span").css("margin", "-62px 0px 0px -62px");
                $("#replayShowArea").find("img").css("width","128px");
                $("#replayShowArea").find("img").css("height","128px");
            }, 200);

            $("#dsc_box").hide();
            $("#dsc_box").show();
        }

        pressedExitFullScreenButton () {
            const doc: any = document;
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }

        formattedDetailDate (time: number) {
            return moment(new Date(time)).locale(getBrowserLanguage()).format('YYYY.MM.DD (ddd)');
        }

        formattedDetailTime (time: number) {
            return moment(new Date(time)).locale(getBrowserLanguage()).format('HH:mm:ss');
        }

        destroy () {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    @import './../uikit/common';
    .tc_clipplayer {
        .video_area {
            .replay_show_area {
                background: rgba(0,0,0,.5);
                position: absolute;
                height: 366px;
                width: 100%;
                z-index:101;
                span {
                    top: 50%;
                    position: absolute;
                    left: 50%;
                    margin: -43px 0px 0px -43px;
                }
            }
            video {
                width: 100%;
            }
            .clip_fade {
                -webkit-animation: 1.5s opacity-animation;
                animation: 1.5s opacity-animation;
                @keyframes opacity-animation {
                    from { opacity:1; }
                    to { opacity:0; }
                }
            }
        }
    }
</style>