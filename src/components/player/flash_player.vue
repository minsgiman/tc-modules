<template>
    <div class="player_cam" id="player"></div>
</template>

<script>
    import $ from 'jquery';
    import store from '../../store/player/store';
    import toastcamAPIs from '../../store/toastcamAPIs';
    import gEventBus from '../../store/gEventBus';

    const zoomZoneBottom = 149;
    const zoomZoneRight = 580;

    let playerCheck = false,
        playCheackCnt = 0,
        cvrReplay = 0,
        flashStatusFlush = false,
        flashStatusEmpty = false,
        statusCheck = 0,
        stopStatusCheck = 0,
        liveReloadCnt = 1;

    function getLiveServerUrl (data) {
        var returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        var rtIdx = data.indexOf("//");
        var rt = "";
        if(rtIdx != -1){
            rt = data.substring(0,rtIdx+2);
        }

        var tmp = data.substring(rtIdx+2,data.length);

        if(tmp.indexOf("/") != -1){
            returnUrl = rt+tmp.substring(0,tmp.indexOf("/"));
        }

        tmp = returnUrl.replace("://","");

        var getPort = parseInt(tmp.substring(tmp.indexOf(":")+1,tmp.length));
        var iePort = getPort+1
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            returnUrl = returnUrl.replace(getPort,iePort);
        }
        return returnUrl;
    }

    function getCvrServerUrl (data){

        var tmp, returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        returnUrl = data;
        tmp = returnUrl.replace("://","");

        var getPort = parseInt(tmp.substring(tmp.indexOf(":")+1,tmp.length));
        var iePort = getPort+1
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            returnUrl = returnUrl.replace(getPort,iePort);
        }

        return returnUrl;
    }

    function getNvrServerUrl (data){
        var returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        var rtIdx = data.indexOf("//");
        var rt = "";
        if(rtIdx != -1){
            rt = data.substring(0,rtIdx+2);
        }

        var tmp = data.substring(rtIdx+2,data.length);

        if(tmp.indexOf("/") != -1){
            returnUrl = rt+tmp.substring(0,tmp.indexOf("/"));
        }

        return returnUrl;
    }

    function getServerIp (data){
        var returnUrl = "";
        if(data == "" || data == undefined){
            return "";
        }

        var rtIdx = data.indexOf("//");
        var rt = "";
        if(rtIdx != -1){
            rt = data.substring(0,rtIdx+2);
        }

        var tmp = data.substring(rtIdx+2,data.length);

        if(tmp.indexOf("/") != -1){
            returnUrl = rt+tmp.substring(0,tmp.indexOf("/"));
        }

        //alert(returnUrl);
        var tmp = "";
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            tmp = returnUrl.replace("rtmps://","rtmp://");
            returnUrl = tmp.replace(":8081",":1935");
        }

        return returnUrl;
    }

    function VideoInfraRMCPlayer(varPlayerId, varName, videoId, inKey, outKey, player, width,
                                 height, serviceId, varCoreSwf,  varSkinPath, varServerUrl) {
        var host = "";
        var swfHost = "";
        var _public = {};
        _public.properties = {
            "wmode" : "opaque",
            "autoPlay" : "",
            "api" : "",
            "skinName" : "default",
            "coverImageURL" : "",
            "isResizableCoverImage" : "",
            "beginTime" : "0",
            "hasRelativeMovie" : "",
            "isP2P" : "",
            "defaultResolution" : "",
            "limitHDResolution" : "",
            "defaultVolume" : "",
            "callbackHandler" : "",
            "ext" : "",
            "isPullingDownResolution" : "",
            "timeNoticeDisplayed" : "",
            "bufferFulledTime" : "",
            "limitTimeForDroppedFPS" : "",
            "droppedFPSDetected" : "",
            "droppedFPSMonitered" : "",
            "limitCountForDroppedFPS" : "",
            "objId" : "",
            "protocol" : "",
            "backgroundColor" : "#000000",
            "typeTimeFormat" : "",
            "playRelationVideo" : "",
            "reloadPage" : "",
            "cassiodServiceID" : "",
            "targetHost":"",
            "isRepeatPlay":"",
            "isSeriesPlay":"",
            "nsc":"",
            "expand":"",
            "buffer":"1"
        };
        var swfPath = swfHost + "/flash/";
        var swfUrl = varCoreSwf;
        var skinPath = varSkinPath;
        var videoUrl = "";
        var targetDiv = "";
        var expireTime;
        var serverUrl = varServerUrl;
        var playerId = varPlayerId;

        var message = {
            "VIDEO_LOAD_ERROR":""
            ,"3G_ALERT" : "3G 망으로 접속하여 동영상을\n재생할 경우 과도한 데이터 요금이\n발생할 수 있습니다."
            ,"ERR_SERVER":"서버 통신이 원활하지 않습니다.<br>페이지 새로고침 후 다시 실행해 주시기 바랍니다. (#code#)"
        };

        var errCodeString = {
            "-1":"d0000",
            "-3":"d0003"
        };

        _public.displayRMCPlayer = function() {
            drawFlashPlayer();
        }

        var getFlashVar = function() {
            var flashVar = "";
            flashVar += "videoPath=" + videoId + "&";
            flashVar += "inKey=" + inKey + "&";
            flashVar += "outKey=" + outKey + "&";
            flashVar += "rtmpURL=" + serverUrl + "&";

            for ( var tempProp in _public.properties) {
                if (isNotEmpty(_public.properties[tempProp])) {
                    if (tempProp == "skinName") {
                        var skinName = _public.properties["skinName"];
                        var skinUrl = skinPath;// + "name=" + skinName;
                        flashVar += "skinName=" + escape(skinName) + "&";
                        flashVar += "skinURL=" + escape(skinUrl) + "&";
                    } else if (tempProp == "objId") {
                        flashVar += "__flashID=" + escape(_public.properties["objId"]) + "&";
                    } else if (tempProp == "autoPlay") {
                        flashVar += "isAutoPlay=" + escape(_public.properties["autoPlay"]) + "&";
                    } else if (tempProp == "backgroundColor") {
                    } else if (tempProp == "targetHost") {
                    } else if (tempProp == "callbackHandler") {
                        flashVar += "callbackHandler=" + escape(varName + ".flashEvent") + "&";
                    } else {
                        flashVar += tempProp + "=" + escape(_public.properties[tempProp]) + "&";
                    }
                }
            }
            return flashVar;
        }

        var createFlashMoviePlayerTag = function(_swfURL_, _flashID_, _width_,
                                                 _height_, _wmode_, _flashVars_, _bgColor_) {
            _wmode_ = (_wmode_ == undefined) ? "window" : _wmode_;
            _bgColor_ = (_bgColor_ == undefined) ? "#000000" : _bgColor_;

            var _object_;
            if (flashObject.bIE && flashObject.bWin && !flashObject.bFF) {
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

        var createFlashVersionWarning = function() {
            // TODO 플래시 버전 확인 페이지 출력
            var imgUrl, imgWidth, coords, lang = document.documentElement.getAttribute('lang');
            if (lang === 'ja') {
                imgUrl = './resources/img/p_install4_jp.png';
                imgWidth = '375';
                coords = "84,113,291,145";
            } else {
                imgUrl = './resources/img/p_install4.png';
                imgWidth = '319';
                coords = "94,113,226,145";
            }
            var _object_;
            _object_ = '<style type="text/css">\n';
            _object_ += '/* Flash Player Guide Popup */ \n';
            _object_ += '\n';
            _object_ += '.ly_flash_player img{border:none;vertical-align:top}\n';
            _object_ += '\n';
            _object_ += '.ly_flash_player{display:table-cell;*display:inline-block;overflow:hidden;position:relative;background:#212126;text-align:center}\n';
            _object_ += '\n';
            _object_ += '.ly_flash_player img{position:static;margin:1px 0 0;border:none;vertical-align:middle}\n';
            _object_ += '\n';
            _object_ += '.ly_flash_player .aligner{display:inline-block;overflow:hidden;height:100%;margin-top:-1px;vertical-align:middle}\n';
            _object_ += '</style>\n';
            _object_ += ' \n';
            _object_ += ' <!-- Flash Player 설치 안내 -->\n';
            _object_ += '<div class="ly_flash_player" style="width:' + width + 'px;height:' + height + 'px">\n';
            _object_ += ' <img src=' + imgUrl + ' width=' + imgWidth + ' height="145" title="동영상을 재생하시려면 Adobe Flash Player 10 이상이 설치되어 있어야 합니다." alt="설치 안내 - Adobe Flash Player 10 설치하기, 네이버 동영상을 재생하시려면 Adobe Flash Player 10 이상이 설치되어 있어야 합니다." usemap="#flash_player_install"><span class="aligner"></span>\n';
            _object_ += '    <map name="flash_player_install" id="flash_player_install">\n';
            _object_ += '        <area shape="rect" coords=' + coords + ' href="http://get.adobe.com/kr/flashplayer/" target="_blank" alt="최신버전 다운로드">\n';
            _object_ += '    </map>\n';
            _object_ += '</div>\n';
            _object_ += '<!-- //Flash Player 설치안내 -->\n';
            _object_ += '\n';

            return _object_;

        }

        var drawFlashPlayer = function() {
            var embedSrc = "";
            var divId = "div_" + _public.properties.objId;
            if (flashObject.detectFlashVer(11, 1, 0) == 1) {
                _public.properties.objId = "rmcPlayer_" + getNowTime() + "" + getRandNum();
                embedSrc = createFlashMoviePlayerTag(swfUrl, _public.properties.objId,width, height, _public.properties.wmode, getFlashVar(), _public.properties.backgroundColor);
            } else {
                embedSrc = createFlashVersionWarning();
            }
            document.getElementById(playerId).innerHTML = embedSrc;
        }

        _public.getCurrentTime = function() {
            if (this.properties.objId) {
                var videoObj = document.getElementById(_public.properties.objId);
                if (videoObj && videoObj.getVideoTimes) {
                    return videoObj.getVideoTimes();
                }
            }
        }

        _public.seek = function(time) {
            if (this.properties.objId) {
                var videoObj = document.getElementById(_public.properties.objId);
                if (videoObj && videoObj.seekVideo) {
                    return videoObj.seekVideo(time);
                }
            }
        }

        _public.startAudioChat = function(url, path) {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.startAudioChat) {
                    videoObj.startAudioChat(url, path);
                }
            }
        }

        _public.stopAudioChat = function(url, path) {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.stopAudioChat) {
                    videoObj.stopAudioChat();
                }
            }
        }

        _public.screenShot = function() {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.screenShot) {
                    videoObj.screenShot();
                }
            }
        }

        _public.zoomVideo = function(ratio) {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.zoomVideo) {
                    videoObj.zoomVideo(ratio);
                }
            }
        }

        _public.zoomZone = function(top, left) {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.zoomZone) {
                    videoObj.zoomZone(top, left);
                }
            }
        }

        _public.setPath = function(url, path) {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj) {
                    if(videoObj.setPath != undefined){
                        videoObj.setPath(url, path);
                    }else{
                        //$("#wrap").removeClass("ng-hide");
                        setTimeout(function(){
                            _public.setPath(url, path);
                        }, 100);
                    }
                }
            }
        }

        _public.play = function(videoUrl) {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                try{
                    videoObj.playVideo();
                } catch (e) {
                    // console.log(e)
                }
            }
        }

        _public.pause = function() {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                try{
                    videoObj.pauseVideo();
                }catch(e){
                    // console.log(e)
                }
            }
        }

        _public.stop = function() {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.stopVideo) {
                    videoObj.stopVideo();
                }
            }
        }

        _public.close = function() {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.closeVideo) {
                    videoObj.closeVideo();
                }
            }
        }

        _public.mute = function() {
            if (this.properties.objId) {
                var videoObj = document.getElementById(this.properties.objId);
                if (videoObj && videoObj.mute) {
                    videoObj.mute();
                }
            }
        }

        // state 변경시 IE에서 메모리 반환 안되는 문제로 직접 node 삭제
        _public.destroy = function () {
            if (playerId) {
                var playerNode = document.getElementById(playerId);
                if (playerNode) {
                    playerNode.removeChild(playerNode.firstChild);
                }
            }
        }

        var isNotEmpty = function(targetStr) {
            if (targetStr) {
                if (targetStr != "") {
                    return true;
                }
            }
            return false;
        }

        var getRandNum = function() {
            var num = Math.floor(Math.random() * 1000);
            return num;
        }

        var getNowTime = function() {
            var date = new Date();
            return date.getTime();
        }



        _public.getVideoStatus = function() {
            return event.getVideoStatus();
        }

        var iOSVersion = function() {
            var match = navigator.userAgent.match(/OS (\d+)_/i);
            if (match && match[1]) { return match[1]; }
        }

        var event = {};

        event.videoStatus = ["connect", "ready", "play", "pause", "stop", "complete"];

        event.videoStatusIndex = 0;

        event.sendEvent = function(eventName) {
            if (_public.properties.callbackHandler) {
                eval(_public.properties.callbackHandler + "('" + eventName + "')");
            }
        }

        event.getVideoStatus = function() {
            if (event.videoStatusIndex > -1) {
                return event.videoStatus[event.videoStatusIndex];
            } else {
                return "error";
            }
        }

        event.videoEvent = function(eventName) {
            if (eventName != "ontimeupdate" && eventName != "onprogress" ) {
            }
            if (eventName == "onerror") {
                event.videoStatusIndex = -1;
            } else if (eventName == "onloadeddata" || eventName == "onsuspend") {
                if (event.videoStatusIndex == 0) {
                    //setReadyVideo();
                    event.videoStatusIndex = 1;
                } else if (event.videoStatusIndex == 1 || event.videoStatusIndex == 2) {
                }
            } else if (eventName == "onplay") {
                if (event.videoStatusIndex == 1) {
                    //showVideo();
                    event.videoStatusIndex = 2;
                }
                var videoObj = document.getElementById(_public.properties.objId);
            } else if (eventName == "onpause") {
                //event.videoStatusIndex = 3;
            } else if (eventName == "onended") {
                //showCover();
                event.vdieoStatusIndex = 4;
                event.sendEvent(event.getVideoStatus());
                event.videoStatusIndex = 1;
                //var videoObj = document.getElementById(_public.properties.objId);
                //videoObj.load();
            } else if (eventName == "onstalled") {
            }
            event.sendEvent(event.getVideoStatus());

        }

        _public.flashEvent = function(eventName) {
            if (_public.properties.callbackHandler) {
                event.sendEvent(eventName);
            }
        }

        event.aTagEvent = function(eventName) {
            //nothing yet
        }

        /*
         * flash version 확인 함수들.
         */
        var flashObject = {};

        flashObject.sClassPrefix = 'F' + new Date().getTime()
            + parseInt(Math.random() * 1000000);
        flashObject.bIE = /MSIE/i.test(navigator.userAgent);
        flashObject.bFF = /FireFox/i.test(navigator.userAgent);
        flashObject.bChrome = /Chrome/i.test(navigator.userAgent);
        flashObject.sReservedName = " className style __flashID codebase classid class width height name src align id type object embed movie forwardInstall requireVersion ";

        flashObject.bWin = (navigator.platform.toLowerCase().indexOf("win") != -1) ? true : false;
        flashObject.isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

        flashObject.controlVersion = function(reqMajorVer) {
            var version, axo, e;

            if (reqMajorVer == null)
                reqMajorVer = 25;

            try {
                axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                version = axo.GetVariable("$version");

                if (version)
                    return flashObject.versionToObject(version);
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
                    return flashObject.versionToObject(version);
            }

            return -1;
        }

        /**
         * 버전을 나타내는 문자열을 Object로 변환해주는 함수
         *
         */
        flashObject.versionToObject = function(sVersion) {
            var versionArray = sVersion.split(" ")[1].split(",");
            return {
                major : versionArray[0],
                minor : versionArray[1],
                revision : versionArray[2]
            };
        }

        /**
         * 플레이어 버전을 디텍팅하는 메인 함수 (Plug-in 방식을 먼저 찾고 없으면 IE 방식 사용 AC_OETag.js에서 사용된 코드
         * 사용
         */
        // JavaScript helper required to detect Flash Player PlugIn version
        // information
        flashObject.getSwfVer = function(reqMajorVer) {
            // NS/Opera version >= 3 check for Flash plugin in plugin array
            var flashVer = -1;

            if (navigator.plugins != null && navigator.plugins.length > 0) {
                if (navigator.plugins["Shockwave Flash 2.0"]
                    || navigator.plugins["Shockwave Flash"]) {
                    var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0"
                        : "";
                    var flashDescription = navigator.plugins["Shockwave Flash"
                    + swVer2].description;
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
            else if (flashObject.bIE && flashObject.bWin && !flashObject.isOpera) {
                flashVer = flashObject.controlVersion(reqMajorVer);
            }
            return flashVer;
        }

        /**
         * require 버전과 비교해서 적합한지 여부를 반환해주는 함수
         *
         */
        // When called with reqMajorVer, reqMinorVer, reqRevision returns true if
        // that version or greater is available
        flashObject.detectFlashVer = function(reqMajorVer, reqMinorVer, reqRevision) {
            var returnValue;

            var version = flashObject.getSwfVer(reqMajorVer);
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
        }

        flashObject.getPlayerVersion = function() {
            return flashObject.getSwfVer();
        };
        return _public;
    }

    export default {
        name: 'flashplayer',
        computed : {
            cameraId: function () {
                return store.state.cameraId;
            },
            config: function () {
                return store.state.cameraConfig;
            },
            currentCamera: function () {
                return store.state.cameraData;
            },
            timelineData: function () {
                return store.state.timelineData;
            },
            currentTime: function () {
                return store.state.currentTime;
            },
            isLive: function () {
                return store.state.isLive;
            },
            clickedCvrTime: function () {
                return store.state.clickedCvrTime;
            },
            showNoPlayLayer: function () {
                return store.state.showNoPlayLayer;
            },
            showCameraOffLayer: function () {
                return store.state.showCameraOffLayer;
            },
            showCameraStreamLayer: function () {
                return store.state.showCameraStreamLayer;
            },
            showNextPlayLayer: function () {
                return store.state.showNextPlayLayer;
            },
            isCameraOffLastRec: function () {
                return store.state.isCameraOffLastRec;
            },
            isCameraOffLastEvent: function () {
                return store.state.isCameraOffLastEvent;
            }
        },
        data : function() {
            return {
                timeRange: 10,
                isShowTimelineCalendar: true,
                control: null,
                playerStopTimer: null
            }
        },
        created : function() {
        },
        mounted : function() {
            console.log('flashBridge init');
            this.control = new VideoInfraRMCPlayer('player', 'rmcPlayer_flash',
                '', '', '', 'flash', '100%', '100%', '',
                './resources/flash/LCP_web_player2016082601.swf',
                './resources/flash/NVP_web_player_skin_tvcast_white.swf',
                '');
            this.control.zoomZone(450, 150);
            this.control.properties.jsCallable = 'true';
            this.control.displayRMCPlayer();

            window.onPlayerStatusChangeFlash = this.onPlayerStatusChange;
            //flashBridge.statusListener = param.statusListener;
        },
        beforeDestroy : function() {
            if (this.control) {
                this.control.destroy();
                this.control = null;
            }
            window.onPlayerStatusChangeFlash = null;
        },
        methods: {
            play: function (time) {
                toastcamAPIs.call(toastcamAPIs.camera.GET_TOKEN, {cameraId: this.cameraId}, (token) => {
                    if (!token) {
                        return;
                    }
                    let mediaUrl = '';

                    if (time) {
                        if (this.currentCamera.recorderType == "nvr") {
                            this.control.setPath(getNvrServerUrl(this.currentCamera.mediaStreamURL), this.currentCamera.channel + "?time=" + time.getTime());
                        } else{
                            mediaUrl = getCvrServerUrl(token.cvrHostPort);
                            this.control.setPath(mediaUrl,'/token=' + token.token + '&time=' + time.getTime());
                        }
                    } else {
                        mediaUrl = getLiveServerUrl(this.currentCamera.mediaStreamURL);
                        this.control.setPath(mediaUrl, this.cameraId + '?token=' + token.token);
                    }
                }, (err) => {
                    console.log(err);
                });
            },

            zoomZone: function() {
                if (this.isFullScreen == true){
                    this.control.zoomZone(260, parseInt($("#player").css("width"))-20);
                } else {
                    this.control.zoomZone(zoomZoneBottom, parseInt($("#player").css("width"))-20);
                }
            },
            getCurrentTime: function() {
                return this.control.getCurrentTime();
            },
            onPlayerStatusChange: function(status) {
                console.log('status : ' + status);
                playerCheck = true;

                if(this.showNextPlayLayer == true){
                    return;
                }

                if (status === 'NetStream.Play.Start') {
                    cvrReplay = 0;
                    liveReloadCnt = 0;
                    flashStatusFlush = false;
                    flashStatusEmpty = false;
                    if(playCheackCnt == 1){
                        playCheackCnt =0;
                        return;
                    }
                    playCheackCnt += 1;
                    $("#cam_info").css("background","");
                    gEventBus.$emit('play-status-change', status);
                    store.dispatch('SET_IS_PLAYING', true);
                    //$scope.isShowMike = true;
                    store.dispatch('CAMERA_STATUS_NORMAL');
                    gEventBus.$emit('start-timer');
                    // setTimeout(function(){
                    //     screenSizeStatus = true;
                    // },500);
                } else {
                    if (status === "NetStream.Buffer.Flush") {
                        flashStatusFlush = true;
                    } else if(flashStatusFlush === true && status === "NetStream.Buffer.Empty"){
                        this.playerStopTimer = setTimeout(() => {
                            this.control.stop();
                            gEventBus.$emit('stop-timer');
                            if (this.currentCamera.recordType == "event") {
                                //$scope.jumpToNextRecord();
                            }
                        },3000);
                    }else if(flashStatusFlush === false && status === "NetStream.Buffer.Empty"){
                        flashStatusFlush = false;
                    }else if(status === "NetStream.Buffer.Empty"){
                        if(cvrReplay == 0){
                            if(this.isLive == false){
                                setTimeout(function(){
                                    gEventBus.$emit('go-cvr', this.clickedCvrTime);
                                },1000);
                                cvrReplay++;
                            }
                        }
                    }else if(status == "NetConnection.Connect.Closed" || status === 'NetStream.Play.Stop'){
                        if (this.isLive){
                            if (status === "NetConnection.Connect.Closed" && this.config.streamStatus !== "off" && this.showCameraOffLayer !== true) {
                                setTimeout(function(){
                                    if (this.isPlaying) {
                                        gEventBus.$emit('go-live');
                                    }
                                },4000);
                            } else {
                                statusCheck++;
                                if(statusCheck == 2){
                                    setTimeout(function(){
                                        if (this.isLive && liveReloadCnt ==0){
                                            statusCheck = 0;
                                            liveReloadCnt++;
                                            gEventBus.$emit('go-live');
                                        }
                                    },4000);
                                }
                            }
                        } else {
                            if (status === "NetStream.Play.Stop") {
                                stopStatusCheck++;
                                if (stopStatusCheck == 2) {
                                    stopStatusCheck = 0;
                                    var i, len, curTime;
                                    if (this.currentTime && this.timelineData && this.timelineData.recTimes.length) {
                                        len = this.timelineData.recTimes.length;
                                        curTime = this.currentTime.getTime();
                                        for (i = 0; i < len; i+=1) {
                                            if (curTime > parseInt(this.timelineData.recTimes[i].startTime, 10) && curTime <= parseInt(this.timelineData.recTimes[i].endTime, 10)) {
                                                if (this.timelineData.recTimes[i+1]) {
                                                    if ((parseInt(this.timelineData.recTimes[i+1].startTime) - parseInt(this.timelineData.recTimes[i].endTime)) < 1000) {
                                                        gEventBus('go-cvr', new Date(parseInt(this.timelineData.recTimes[i+1].startTime, 10) + 1000));
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else if (status === "NetConnection.Connect.Closed") {
                                var i, len, curTime;
                                if (this.currentTime && this.timelineData.recTimes && this.timelineData.recTimes.length) {
                                    len = this.timelineData.recTimes.length;
                                    curTime = this.currentTime.getTime();
                                    for (i = 0; i < len; i+=1) {
                                        if (curTime > parseInt(this.timelineData.recTimes[i].startTime, 10) && curTime <= parseInt(this.timelineData.recTimes[i].endTime, 10)) {
                                            if (this.timelineData.recTimes[i+1]) {
                                                if ((parseInt(this.timelineData.recTimes[i+1].startTime) - parseInt(this.timelineData.recTimes[i].endTime)) < 1000) {
                                                    gEventBus('go-cvr', new Date(parseInt(this.timelineData.recTimes[i+1].startTime, 10) + 1000));
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }else if(status == "NetStream.Buffer.Full" && this.showCameraOffLayer){
                        if (this.isLive){
                            statusCheck++;
                            if(statusCheck == 2){
                                setTimeout(function(){
                                    if (this.isLive && liveReloadCnt ==0){
                                        statusCheck = 0;
                                        liveReloadCnt++;
                                        gEventBus.$emit('go-live');
                                    }
                                },4000);
                            }
                        }
                    }
                }
                // if (status === 'NetStream.Play.Start') {
                //     this.isPlaying = true;
                //     gEventBus.$emit('start-timer');
                // } else if (status === 'NetConnection.Connect.Closed') {
                //     this.isPlaying = false;
                // }
                //flashBridge.statusListener(status);
            },
            changeTimeRange: function(timeRange) {

            }
        }
    }
</script>

<style lang="less">
    #flashview {
    }
</style>