<template>
    <div class="player_cam" id="player"></div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    const $: any = (window as any).$ as any;

    var host = "";
    var swfHost = "";
    var swfPath = swfHost + "/flash/";

    var isNotEmpty = function(targetStr: any) {
        if (targetStr) {
            if (targetStr != "") {
                return true;
            }
        }
        return false;
    };

    var getRandNum = function() {
        var num = Math.floor(Math.random() * 1000);
        return num;
    };

    var getNowTime = function() {
        var date = new Date();
        return date.getTime();
    };

    var flashVerChecker = {
        sClassPrefix: 'F' + new Date().getTime() + parseInt((Math.random() * 1000000) as any),
        bIE: /MSIE/i.test(navigator.userAgent),
        bFF: /FireFox/i.test(navigator.userAgent),
        bChrome: /Chrome/i.test(navigator.userAgent),
        sReservedName: " className style __flashID codebase classid class width height name src align id type object embed movie forwardInstall requireVersion ",
        bWin: (navigator.platform.toLowerCase().indexOf("win") != -1) ? true : false,
        isOpera: (navigator.userAgent.indexOf("Opera") != -1) ? true : false,
        controlVersion: function(reqMajorVer: any) {
            var version, axo, e;

            if (reqMajorVer == null)
                reqMajorVer = 25;

            try {
                axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                version = axo.GetVariable("$version");

                if (version)
                    return this.versionToObject(version);
            } catch (e) {
            }

            for ( var i = reqMajorVer; i > 0; i--) {
                try {
                    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
                    version = axo.GetVariable("$version");
                } catch (e) {
                    continue;
                }

                if (version)
                    return this.versionToObject(version);
            }

            return -1;
        },
        versionToObject: function(sVersion: any) {
            var versionArray = sVersion.split(" ")[1].split(",");
            return {
                major : versionArray[0],
                minor : versionArray[1],
                revision : versionArray[2]
            };
        },
        getSwfVer: function(reqMajorVer: any) {
            // NS/Opera version >= 3 check for Flash plugin in plugin array
            const plugins: any = navigator.plugins;
            let flashVer: any = -1;

            if (plugins != null && plugins.length > 0) {
                if (plugins["Shockwave Flash 2.0"]
                    || plugins["Shockwave Flash"]) {
                    var swVer2 = plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
                    var flashDescription = plugins["Shockwave Flash" + swVer2].description;
                    var descArray = flashDescription.split(" ");
                    var tempArrayMajor = descArray[2].split(".");
                    var versionMajor = tempArrayMajor[0];
                    var versionMinor = tempArrayMajor[1];
                    var versionRevision = descArray[3];
                    if (versionRevision == "") {
                        versionRevision = descArray[4];
                    }
                    if (versionRevision[0] == "d") {
                        versionRevision = versionRevision.substring(1);
                    } else if (versionRevision[0] == "r") {
                        versionRevision = versionRevision.substring(1);
                        if (versionRevision.indexOf("d") > 0) {
                            versionRevision = versionRevision.substring(0,
                                versionRevision.indexOf("d"));
                        }
                    }

                    flashVer = {
                        major : versionMajor,
                        minor : versionMinor,
                        revision : versionRevision
                    };
                }
            }
            // MSN/WebTV 2.6 supports Flash 4
            else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1)
                flashVer = 4;
            // WebTV 2.5 supports Flash 3
            else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1)
                flashVer = 3;
            // older WebTV supports Flash 2
            else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1)
                flashVer = 2;
            else if (this.bIE && this.bWin && !this.isOpera) {
                flashVer = this.controlVersion(reqMajorVer);
            }
            return flashVer;
        },
        detectFlashVer: function(reqMajorVer: any, reqMinorVer: any, reqRevision: any) {
            var returnValue;

            var version = this.getSwfVer(reqMajorVer);
            if (version == -1) {
                returnValue = -1;
            } else if (version != 0) {

                returnValue = 0;
                // is the major.revision >= requested major.revision AND the minor
                // version >= requested minor
                if (version.major > parseFloat(reqMajorVer)) {
                    returnValue = 1;
                } else if (version.major == parseFloat(reqMajorVer)) {
                    if (version.minor > parseFloat(reqMinorVer))
                        returnValue = 1;
                    else if (version.minor == parseFloat(reqMinorVer)) {
                        if (version.revision >= parseFloat(reqRevision))
                            returnValue = 1;
                    }
                }
            }

            return returnValue;
        },
        getPlayerVersion: function() {
            return this.getSwfVer();
        }
    };

    @Component
    export default class FlashPlayer extends Vue {
        @Prop() varPlayerId!: any;
        @Prop() varName!: any;
        @Prop() videoId!: any;
        @Prop() inKey!: any;
        @Prop() outKey!: any;
        @Prop() player!: any;
        @Prop() width!: any;
        @Prop() height!: any;
        @Prop() serviceId!: any;
        @Prop() varCoreSwf!: any;
        @Prop() varSkinPath!: any;
        @Prop() varServerUrl!: any;

        flashConfig: any = {
            wmode : "opaque", autoPlay : "", api : "", skinName : "default", coverImageURL : "",
            isResizableCoverImage : "", beginTime : "0", hasRelativeMovie : "", isP2P : "", defaultResolution : "",
            limitHDResolution : "", defaultVolume : "", callbackHandler : "", ext : "", isPullingDownResolution : "",
            timeNoticeDisplayed : "", bufferFulledTime : "", limitTimeForDroppedFPS : "", droppedFPSDetected : "",
            droppedFPSMonitered : "", limitCountForDroppedFPS : "", objId : "", protocol : "", backgroundColor : "#000000",
            typeTimeFormat : "", playRelationVideo : "", reloadPage : "", cassiodServiceID : "", targetHost:"", isRepeatPlay:"",
            isSeriesPlay:"", nsc:"", expand:"", buffer:"1"
        };
        videoStatus: any = ["connect", "ready", "play", "pause", "stop", "complete"];
        videoStatusIndex: any = 0;

        private created() {
            (window as any).onPlayerStatusChangeFlash = this.onFlashPlayerStatusChanged.bind(this);
        }

        private beforeDestroy() {
            (window as any).onPlayerStatusChangeFlash = null;
            this.destroy();
        }

        onFlashPlayerStatusChanged(status: any) {
            this.$emit('playerStatusChanged', status);
        }

        getCurrentTime() {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.getVideoTimes) {
                    return videoObj.getVideoTimes();
                }
            }
        }

        seek(time: any) {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.seekVideo) {
                    return videoObj.seekVideo(time);
                }
            }
        }

        startAudioChat(url: any, path: any) {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.startAudioChat) {
                    videoObj.startAudioChat(url, path);
                }
            }
        }

        stopAudioChat(url: any, path: any) {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.stopAudioChat) {
                    videoObj.stopAudioChat();
                }
            }
        }

        screenShot() {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.screenShot) {
                    videoObj.screenShot();
                }
            }
        }

        zoomVideo(ratio: any) {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.zoomVideo) {
                    videoObj.zoomVideo(ratio);
                }
            }
        }

        zoomZone(top: any, left: any) {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.zoomZone) {
                    videoObj.zoomZone(top, left);
                }
            }
        }

        setPath(url: any, path: any) {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj) {
                    if(videoObj.setPath != undefined){
                        videoObj.setPath(url, path);
                    }else{
                        $("#wrap").removeClass("ng-hide");
                        setTimeout(() => {
                            this.setPath(url, path);
                        }, 100);
                    }
                }
            }
        }

        play(videoUrl: any) {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                try{
                    videoObj.playVideo();
                } catch (e) {
                    // console.log(e)
                }
            }
        }

        pause() {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                try{
                    videoObj.pauseVideo();
                }catch(e){
                    // console.log(e)
                }
            }
        }

        stop() {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.stopVideo) {
                    videoObj.stopVideo();
                }
            }
        }

        close() {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.closeVideo) {
                    videoObj.closeVideo();
                }
            }
        }

        mute() {
            if (this.flashConfig.objId) {
                const videoObj: any = document.getElementById(this.flashConfig.objId);
                if (videoObj && videoObj.mute) {
                    videoObj.mute();
                }
            }
        }

        destroy() {
            if (this.varPlayerId) {
                const playerNode: any = document.getElementById(this.varPlayerId);
                if (playerNode) {
                    playerNode.removeChild(playerNode.firstChild);
                }
            }
        }

        flashEvent(eventName: any) {
            if (this.flashConfig.callbackHandler) {
                this.sendEvent(eventName);
            }
        }

        displayRMCPlayer() {
            this.drawFlashPlayer();
        }

        getFlashVar() {
            var flashVar = "";
            flashVar += "videoPath=" + this.videoId + "&";
            flashVar += "inKey=" + this.inKey + "&";
            flashVar += "outKey=" + this.outKey + "&";
            flashVar += "rtmpURL=" + this.varServerUrl + "&";

            for ( var tempProp in this.flashConfig) {
                if (isNotEmpty(this.flashConfig[tempProp])) {
                    if (tempProp == "skinName") {
                        var skinName = this.flashConfig["skinName"];
                        var skinUrl = this.varSkinPath;// + "name=" + skinName;
                        flashVar += "skinName=" + escape(skinName) + "&";
                        flashVar += "skinURL=" + escape(skinUrl) + "&";
                    } else if (tempProp == "objId") {
                        flashVar += "__flashID=" + escape(this.flashConfig["objId"]) + "&";
                    } else if (tempProp == "autoPlay") {
                        flashVar += "isAutoPlay=" + escape(this.flashConfig["autoPlay"]) + "&";
                    } else if (tempProp == "backgroundColor") {
                    } else if (tempProp == "targetHost") {
                    } else if (tempProp == "callbackHandler") {
                        flashVar += "callbackHandler=" + escape(this.varName + ".flashEvent") + "&";
                    } else {
                        flashVar += tempProp + "=" + escape(this.flashConfig[tempProp]) + "&";
                    }
                }
            }
            return flashVar;
        }

        createFlashMoviePlayerTag(_swfURL_: any, _flashID_: any, _width_: any, _height_: any, _wmode_: any, _flashVars_: any, _bgColor_: any) {
            _wmode_ = (_wmode_ == undefined) ? "window" : _wmode_;
            _bgColor_ = (_bgColor_ == undefined) ? "#000000" : _bgColor_;

            var _object_;
            if (flashVerChecker.bIE && flashVerChecker.bWin && !flashVerChecker.bFF) {
                _object_ = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="'
                    + _width_ + '" height="' + _height_ + '" id="' + _flashID_ + '" align="middle">';
                _object_ += '<param name="allowScriptAccess" value="always" />';
                _object_ += '<param name="quality" value="high" />';
                _object_ += '<param name="movie" value="' + _swfURL_ + '" />';
                _object_ += '<param name="wmode" value="' + _wmode_ + '" />';
                _object_ += '<param name="allowFullScreen" value="false" />';
                _object_ += '<param name="bgcolor" value="' + _bgColor_ + '" />';
                _object_ += '<param name="FlashVars" value="' + _flashVars_ + '">';

                _object_ += '<embed src="' + _swfURL_ + '" quality="high" wmode="' + _wmode_ + '" FlashVars="' + _flashVars_ + '" bgcolor="' + _bgColor_
                _object_ += '" width="' + _width_ + '" height="' + _height_ + '" id="' + _flashID_ + '" name="' + _flashID_
                _object_ += '" align="middle" allowScriptAccess="always" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';

                _object_ += '</object>';
            } else {
                _object_ = '<embed src="' + _swfURL_ + '" quality="high" wmode="' + _wmode_ + '" FlashVars="' + _flashVars_ + '" bgcolor="' + _bgColor_
                    + '" width="' + _width_ + '" height="' + _height_ + '" id="' + _flashID_ + '" name="' + _flashID_
                    + '" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
            }
            return _object_;
        }

        createFlashVersionWarning() {
            var imgUrl, imgWidth, coords, lang = $("html").attr("lang");
            if (lang === 'ja') {
                imgUrl = '/resources/img/p_install4_jp.png';
                imgWidth = '375';
                coords = "84,113,291,145";
            } else {
                imgUrl = '/resources/img/p_install4.png';
                imgWidth = '319';
                coords = "94,113,226,145";
            }
            var _object_;
            _object_ = '<style type="text/css">\n';
            _object_ += '/* Flash Player Guide Popup */ \n';
            _object_ += '\n';
            _object_ += '.ly_flash_player img{border:none;vertical-align:top}\n';
            _object_ += '\n';
            _object_ += '.ly_flash_player{overflow:hidden;position:relative;background:#212126;text-align:left}\n';
            _object_ += '\n';
            _object_ += '.ly_flash_player img{position:static;margin:1px 0 0;border:none;vertical-align:middle}\n';
            _object_ += '\n';
            _object_ += '.ly_flash_player .aligner{display:inline-block;overflow:hidden;height:100%;margin-top:-1px;vertical-align:middle}\n';
            _object_ += '</style>\n';
            _object_ += ' \n';
            _object_ += ' <!-- Flash Player 설치 안내 -->\n';
            _object_ += '<div class="ly_flash_player">\n';
            _object_ += ' <img src=' + imgUrl + ' width=' + imgWidth + ' height="145" title="동영상을 재생하시려면 Adobe Flash Player 10 이상이 설치되어 있어야 합니다." alt="설치 안내 - Adobe Flash Player 10 설치하기, 네이버 동영상을 재생하시려면 Adobe Flash Player 10 이상이 설치되어 있어야 합니다." usemap="#flash_player_install"><span class="aligner"></span>\n';
            _object_ += '    <map name="flash_player_install" id="flash_player_install">\n';
            _object_ += '        <area shape="rect" coords=' + coords + ' href="http://get.adobe.com/kr/flashplayer/" target="_blank" alt="최신버전 다운로드">\n';
            _object_ += '    </map>\n';
            _object_ += '</div>\n';
            _object_ += '<!-- //Flash Player 설치안내 -->\n';
            _object_ += '\n';

            return _object_;
        }

        drawFlashPlayer() {
            var embedSrc = "";
            var divId = "div_" + this.flashConfig.objId;
            if (flashVerChecker.detectFlashVer(11, 1, 0) == 1) {
                this.flashConfig.objId = "rmcPlayer_" + getNowTime() + "" + getRandNum();
                embedSrc = this.createFlashMoviePlayerTag(this.varCoreSwf, this.flashConfig.objId, this.width, this.height, this.flashConfig.wmode, this.getFlashVar(), this.flashConfig.backgroundColor);
            } else {
                embedSrc = this.createFlashVersionWarning();
            }
            const elPlayer: any = document.getElementById(this.varPlayerId);
            if (elPlayer) {
                elPlayer.innerHTML = embedSrc;
            }
        }

        sendEvent(eventName: any) {
            if (this.flashConfig.callbackHandler) {
                eval(this.flashConfig.callbackHandler + "('" + eventName + "')");
            }
        }

        getVideoStatus() {
            if (this.videoStatusIndex > -1) {
                return this.videoStatus[this.videoStatusIndex];
            } else {
                return "error";
            }
        }

        videoEvent(eventName: any) {
            if (eventName != "ontimeupdate" && eventName != "onprogress" ) {
            }
            if (eventName == "onerror") {
                this.videoStatusIndex = -1;
            } else if (eventName == "onloadeddata" || eventName == "onsuspend") {
                if (this.videoStatusIndex == 0) {
                    this.videoStatusIndex = 1;
                } else if (this.videoStatusIndex == 1 || this.videoStatusIndex == 2) {
                }
            } else if (eventName == "onplay") {
                if (this.videoStatusIndex == 1) {
                    this.videoStatusIndex = 2;
                }
                var videoObj = document.getElementById(this.flashConfig.objId);
            } else if (eventName == "onpause") {
                //event.videoStatusIndex = 3;
            } else if (eventName == "onended") {
                //showCover();
                (this as any).vdieoStatusIndex = 4;
                this.sendEvent(this.getVideoStatus());
                this.videoStatusIndex = 1;
                //var videoObj = document.getElementById(_public.properties.objId);
                //videoObj.load();
            } else if (eventName == "onstalled") {
            }
            this.sendEvent(this.getVideoStatus());

        }
    }
</script>

<style lang="less">
    #player {
    }
</style>