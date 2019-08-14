<script>
    var host = "";
    var swfHost = "";
    var swfPath = swfHost + "/flash/";

    var isNotEmpty = function(targetStr) {
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
        sClassPrefix: 'F' + new Date().getTime() + parseInt(Math.random() * 1000000),
        bIE: /MSIE/i.test(navigator.userAgent),
        bFF: /FireFox/i.test(navigator.userAgent),
        bChrome: /Chrome/i.test(navigator.userAgent),
        sReservedName: " className style __flashID codebase classid class width height name src align id type object embed movie forwardInstall requireVersion ",
        bWin: (navigator.platform.toLowerCase().indexOf("win") != -1) ? true : false,
        isOpera: (navigator.userAgent.indexOf("Opera") != -1) ? true : false,
        controlVersion: function(reqMajorVer) {
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
        versionToObject: function(sVersion) {
            var versionArray = sVersion.split(" ")[1].split(",");
            return {
                major : versionArray[0],
                minor : versionArray[1],
                revision : versionArray[2]
            };
        },
        getSwfVer: function(reqMajorVer) {
            // NS/Opera version >= 3 check for Flash plugin in plugin array
            var flashVer = -1;

            if (navigator.plugins != null && navigator.plugins.length > 0) {
                if (navigator.plugins["Shockwave Flash 2.0"]
                    || navigator.plugins["Shockwave Flash"]) {
                    var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
                    var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
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
        detectFlashVer: function(reqMajorVer, reqMinorVer, reqRevision) {
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

    export default {
        name : 'flashPlayer',
        props : ['varPlayerId', 'varName', 'videoId', 'inKey', 'outKey', 'player', 'width', 'height', 'serviceId', 'varCoreSwf', 'varSkinPath', 'varServerUrl'],
        computed : {
            // currentCamera: function () {
            //     return store.state.cameraData;
            // }
        },
        data : function() {
            return {
                flashConfig: {
                    wmode : "opaque", autoPlay : "", api : "", skinName : "default", coverImageURL : "",
                    isResizableCoverImage : "", beginTime : "0", hasRelativeMovie : "", isP2P : "", defaultResolution : "",
                    limitHDResolution : "", defaultVolume : "", callbackHandler : "", ext : "", isPullingDownResolution : "",
                    timeNoticeDisplayed : "", bufferFulledTime : "", limitTimeForDroppedFPS : "", droppedFPSDetected : "",
                    droppedFPSMonitered : "", limitCountForDroppedFPS : "", objId : "", protocol : "", backgroundColor : "#000000",
                    typeTimeFormat : "", playRelationVideo : "", reloadPage : "", cassiodServiceID : "", targetHost:"", isRepeatPlay:"",
                    isSeriesPlay:"", nsc:"", expand:"", buffer:"1"
                },
                videoStatus: ["connect", "ready", "play", "pause", "stop", "complete"],
                videoStatusIndex: 0
            }
        },
        created : function() {
            window.onPlayerStatusChangeFlash = this.onFlashPlayerStatusChanged.bind(this);
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            window.onPlayerStatusChangeFlash = null;
            this.destroy();
        },
        methods : {
            onFlashPlayerStatusChanged : function(status) {
                this.$emit('playerStatusChanged', status);
            },

            getCurrentTime : function() {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.getVideoTimes) {
                        return videoObj.getVideoTimes();
                    }
                }
            },

            seek : function(time) {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.seekVideo) {
                        return videoObj.seekVideo(time);
                    }
                }
            },

            startAudioChat : function(url, path) {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.startAudioChat) {
                        videoObj.startAudioChat(url, path);
                    }
                }
            },

            stopAudioChat : function(url, path) {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.stopAudioChat) {
                        videoObj.stopAudioChat();
                    }
                }
            },

            screenShot : function() {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.screenShot) {
                        videoObj.screenShot();
                    }
                }
            },

            zoomVideo : function(ratio) {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.zoomVideo) {
                        videoObj.zoomVideo(ratio);
                    }
                }
            },

            zoomZone : function(top, left) {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.zoomZone) {
                        videoObj.zoomZone(top, left);
                    }
                }
            },

            setPath : function(url, path) {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj) {
                        if(videoObj.setPath != undefined){
                            videoObj.setPath(url, path);
                        }else{
                            setTimeout(() => {
                                this.setPath(url, path);
                            }, 100);
                        }
                    }
                }
            },

            play : function(videoUrl) {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    try{
                        videoObj.playVideo();
                    } catch (e) {
                        // console.log(e)
                    }
                }
            },

            pause : function() {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    try{
                        videoObj.pauseVideo();
                    }catch(e){
                        // console.log(e)
                    }
                }
            },

            stop : function() {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.stopVideo) {
                        videoObj.stopVideo();
                    }
                }
            },

            close : function() {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.closeVideo) {
                        videoObj.closeVideo();
                    }
                }
            },

            mute : function() {
                if (this.flashConfig.objId) {
                    var videoObj = document.getElementById(this.flashConfig.objId);
                    if (videoObj && videoObj.mute) {
                        videoObj.mute();
                    }
                }
            },

            destroy : function () {
                if (this.varPlayerId) {
                    var playerNode = document.getElementById(this.varPlayerId);
                    if (playerNode) {
                        playerNode.removeChild(playerNode.firstChild);
                    }
                }
            },

            getVideoStatus : function() {
                return this.getVideoStatus();
            },

            flashEvent : function(eventName) {
                if (this.flashConfig.callbackHandler) {
                    this.sendEvent(eventName);
                }
            },

            displayRMCPlayer : function() {
                this.drawFlashPlayer();
            },

            getFlashVar : function() {
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
            },

            createFlashMoviePlayerTag : function(_swfURL_, _flashID_, _width_, _height_, _wmode_, _flashVars_, _bgColor_) {
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
            },

            createFlashVersionWarning : function() {
                var imgUrl, imgWidth, coords, lang = document.documentElement.getAttribute('lang');
                if (lang === 'ja') {
                    imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAACRCAIAAABR4aTGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4YzM3NDk3Ni00ZjUwLTQ2YWItYTY3YS0wZGU4ZTllMzA1YzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzM0NDczRkExRThGMTFFODg2MURCNjdCODk0QzVFMzQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzM0NDczRjkxRThGMTFFODg2MURCNjdCODk0QzVFMzQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3ODc0MWE0MS1jMGYzLTQzNzAtYjYwZS1kODQxMDMwNTZmZTMiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDplMmU5MzY3OC02MzA3LTExN2ItOGEy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';
                    imgWidth = '375';
                    coords = "84,113,291,145";
                } else {
                    imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT8AAACRCAIAAAA6pSjWAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTk3NEVDN0QxQTlEMTFFODgyRUZEOENERTgwM0VCQzIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTk3NEVDN0UxQTlEMTFFODgyRUZEOENERTgwM0VCQzIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBOTc0RUM3QjFBOUQxMUU4ODJFRkQ4Q0RFODAzRUJDMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBOTc0RUM3QzFBOUQxMUU4ODJFRkQ4Q0RFODAzRUJDMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv4H/b8AADhoSURBVHja7J0HeF3Vle9vUe9yU3OVe7cxuOJCccGFhIBpCQMvEyAJmQyTCSF13vdNgJAyeTPzIISQCbwPAgZTArhjg3sB23JvknuR5KIuWe3e+373LGmzfc7V1ZUsOzjZ6+MzR+fus/faa6//Knvvs487NzfXZciQoWuQPEYEhgwZ9BoyZMig15AhQwa9hgwZ9BoyZMig15AhQwa9hgwZ9BoyZMig15AhQwa9hgwZMug1ZMig15AhQwa9hgwZMug1ZMig15AhQwa9hgwZMug1ZMiQQa8hQwa9hgwZMug1ZMiQQa8hQwa9hgwZMug1ZMiQQa8hQ4YMeg0ZMug1ZMjQF4iijAgMfWEp0EzuZtLv+/1+rr1er7qv/6r+lF/l35YelPL6U/KIFPBbFPR1FrWJ+ZaYvGbQ29IYhCe63dZH9LaQcgfKS1Ub8lfFoepm5GPcarvIoU1CCMmq0mAbADqW2yuhOQ8//PDw4cPLy8t/9rOf6cxz/8c//jHXI0aMqK6u1tVm1qxZgpmm8NLj2bhxY1VVVZgHk5OTecqG+b179+7bt4/rCRMmvP7661zMmTNn//79+liH0YcwTF4z6KUP48ePnz17NteMwa9//WvsUCTQveeee4YNG8Y1j4joIyGG4YknnuBiw4YNy5Yt6yi9hJ+nnnqqpV+lX1xImT179rz55puX3zSimzlz5qRJk7h+8cUXT58+HQmAnayWlZUJk0uWLKESsWuqWEdxeyUIJufOnYvqHz9+nGudSYUcG4Qo9uyzz6ampuo377///s2bNyvUOWvo3r37L3/5S1vrr732mpiMkI+g1T169HACOC0t7eTJk8uXLw/D5DWDXp/P981vfnPKlCny5+LFiw8cONCqFtJbtHbevHlc//73v6+srIxEcXkK9H7ta1/jmvFbunRpB9ogqbYl+tWvfpWSkiJl1q5du2DBgg5pFPsldSI3gHeZrP7kJz95+umn//CHP2BAlaA6itsrRIJD0KvHC7prdfq9Xbt22dCL5QrfSkVFBU/Zbp44cSKMkO+77z7RTycBezzHNZ/3ilVT0BUr+NOf/jQS9+u0sh1euH3ViiZdBTbCxGZtYhVvoLQZAPOnRApXWmiX3/2cnJxevXrpSQTxgvRF3Xfmmffee68tBk5PT5ccIaS555GSkhLbU/JgYmKixClO9nbv3u20EYLnSDTk2kAvJkq/Q/cIUcgBnKKURFekFkafbHldmPxWxlLV6QwO9aoizC0ZoYkTJ0ZFRdmGuSV7FNBIKrcxbOtOS2zYfE4kWb1iVXT0Rz/6kThb/iVSaCu3Npk7TYwtqVas2iRvM0lyHbI7RG3f/va35RoH8OijjxKFTZ482YlbZzLspG9961sSzTqzjJZcqKJHHnnE6eFfeuklohi9L9nZ2VIVwA6vw9cGepGO9AdN+vDDD9EbzNVtt922cOFCmwYzVLNmzSLJoQCdf/7551uqEHs8dOhQRrFnz57ENuvXrydCDjmnh+F87LHHZM5j0aJFBDN6MapKSkoiqpcCVPX666+fOXOm1QwwyqIIjRc8YNTJ3NA58k9pZf/+/dIKPDDkxCP0hY7DBvEb3YEN5zzqoEGDvvrVr0qv9UoiYfXixYu/+MUvVE5BkO/UrTDcwgwx1D333CPx5FtvvSVNS/onmTlsyxwPQ8kQ33jjjcIqo0lkriSPHREwMHA8To8kIVd5qYIu+qCnAEQN+LRnnnlG/kRVWkWdTs7AWJ/Pays5LSxDiU7KNXnvNe97GZsJEyaIpQS6r776qrL9tmkShuq5555Tg4GhZWycuQoCGjx48BtvvKFHLNRG5Vhc25we7W7atEmVpHKKfec73xFtpirUDltuq+oHP/jBihUrwqMCbvWRC+MtGxsbsRo2X0EruBFa4XrGjBkvvviiLTahAN23dYeburLyJ3YHZ9KBk9vhuQU5YnwZF4ZAWR81qcFN51AKzZkzBzMqPQK9XHMBtlUxEA56baZcJEO7WA28HDaFf0kpMUOVlZX642og0CsMgTJMpaWlBHoUg+dTp05JGKI/Qi9QCfiRYAESM0qjNKEiAtRYjymk7070MmoyjxCyrStBnivqeLGsci0mXOwfw4DzVH2TREWNBMPz9NNPSzGbeunQBYpoiSQYPItJZsj18vI4ZahNDAHFaEhiabyugi4tUowy/InG4AzDyJ0yL7zwwv+9lELmRVTywx/+UMBAE0888QT/yk/YGtEViWARC7/CG2yI3eFBGw9ifSjGv3KHqDLM5I0QgGywKDMz89lnn1VeqKKiwunbw3NLeWlaoiclRoEuKovD4Q5+VeV+SJ77Yo6ffPJJ4Vb1S4rBjPhexQZ1IgeBLj8RmBQVFaFIojxYkI0bN8pihNMfVlVVEbYUNhMwk1bwHCHNnKQ8EL/SBCqKEcEmHjhwAPVIS0uT4EU9ixm6++6758+fjw2yqToIF1H8+c9/vmoT+FFXzvEyDGog9+7di4wYfgGVPndFz1V6g5WVCGrx4sUMkk1ApC6CN3SL4I1iAImBR+doCAOh7LcQSsZYSpAm8880RBSHcIGKVIWGoShUJaG1JEjh59WcAZs4E6dm0K6s1qAK/AmHkrZByCfVIlnRoSQGe8OGDXghoIW4bIkToqMVOId/iWz5N7x1p/KQ09RkJU71apVbBMIdiZ5wMpJDykIghPSokzHClekpNwPEU6g1D3INovRGGW7iI0Ciz4OotQaQT67OCNI0BbhJeeJn7u/Zs4fIPGToq/7EcmGP5Fp6FMbNoFEyiHCOEESjkDA91VcrpXcuaz1S3ZdgQfJtVB0tijCx+kKjV81XYcXF7nKB9G1zV5QUk4/gGMvo6GiuUTtsre5+KabmrlWiSw0SD3MTe8zjqjxjTCUiR8CAWJUiQqpm7hMIUBUDIO63VVQ4M6iQmsFN+GGY6TupNewBBjRVX6UQrugXJblet24dMMBsiTfQa+MnuQlv8pTgs6amJvJBoYO4tZDxdqvcyu4FGRQYFm8ssSLVMiKSG4s92rlzJ5UItzwiA0dQKsZUSV6GW4cuF1SFAeVB7LLa6iS/EnkhHwkcEAiQ44I/naZWT5tpKPwkaE5OjkAX/cReUOeQIUMAIUImL9Bn+OgL2JZGdegS+olGcXE1V86vFHqRuJpyAKsqoReE6HNXPXr0kJ8Ycn0UEbqOXoqJZiBBchKBpXgMQa8t0qYhW22i8egQMZ7K7kilQi4whgEADkdXl5b2KkmORCKNioecJqUS1FTlAmJcEBqs4jRsccSJEyfaOr8Cq0SMarWTGmTLUcgJ3la5lSxRoicZPiSvwmbJEkGsmrnQlwmFkLzeKboZskeIRRy7itXDE7muE7rjx49XqKM7ZA0oSUvxlHLjZNRYE9olhKZp0Vt9FwfykTk8kaFAl/BNVF0sY5tWQ7+I6NXnq5y4UtMhyF03Y7qll8DSpr6CfPGfuk6EXIalpF5MVS4wkBBRzK26Vjoa3nwyPJGERoAB8IgSowrrLEIVlFqLlhAoYg7QEu4rGBPpoVJA4jKnRmlOsapWgNrHrdSArZHoCZCnpKTIfZXpqYlGLKxkvPqztplY3by2FMuE1BwbwYYKQMQGzZw5U8140QuZ8KM5OA/Zok0Bws0SeTwS9AlucdrYWYnzEVqE+wi/6OjV56sYSBuuRE1l7urAgQOgV8EyOTlZRoKLkSNH2gSHc5Zn5UEJdyV4k2l6fWx4XGqTDFxMidh7SG2jQclkQyU8k6pxXyYML18IDK1yTeTb1EkmplsotfpFFie7nQjY8Bji3PBjtsy/PXOSEe+qb5VbNS0kTknZGgmAZYpVSZWfcHdykw7SU0aHCLlNUSXNOXdQ2CbnbVrHQD/66KMSi8EYuRvtwowUxtAT7DirQv5yAc+gEYXEngomAX9IwNPWww8/TENqDlV8+5V4FeGqolf2BiibjQQZcn2VlfBD5CtzVxIgyWrELywCzPxr870SJEu1+IQnn3wSXaEGucNQqTRJKZDUxgXJjNQmkysyKyZjDycMMONHhiNe5Xe/+91vfvOby5eD4h8MiKkm2lTOBI/Btex9x8AhJTwtPVL5wlXbrxMJtyrBluk9NJs7ylGrVyAwfICf+9hKSQoY7hdeeIE/GVPu69FEJKRMs5OcSxKYieeff17MNCKFgcLCQiJhUTaxOBgmm6eF7dOnTxP9MvrzLBJfIkNAEBRykw+GXrSFwuizbSvBtY1eBl7ZJCyu7sqQBYOqBCpzV7IoJzZSzejaZq0QDeEQ5hPUcV/fw4wEMZm6jZDH9dqkmMw9ygyN+BCpSg0YT8FMh8Q/aqqMJriWmUw93tuwYYPouhRQmbnILcJdzR1F4bnFHMvcEsOniwvCaCr9Rm64L6IefkW5lWuSjNG5TNWqIoXfW66H2Xo8pfZyC2NcwAm/ojywh5l2RigvvfQSBR577DEJfGRzUUubArlDWIT/wLigeGfOnLlqk8xXI3JWQsfFOSf01XwyYpozZ85bb70F8IhVMNICV2T31FNP4QTkTzXLwjCgE0hZ3jtRoa+sK8hQKU2S/SH4dgVLjLHM2bial+m5KRomZajqxz/+cUgjatueET5bEwNBE7QonkeaeO6552hR5skwHFw88MADqLXEHWrinVQcOyUTtqo7tsrDz3VHki23lVv0W+k6ghX7SwGgrqfWZPJqKEWq9AiXqKZz9B6FB7OKmRlKWxatA0/NOTO4SJKnCAH0QZRFXYmnQtplKbBixQpcqEy4iKFRU1Mh5z7esuiv+36lOzc3t8N9r9pdHDLvCllAbmLjkZ3KYKWM7S1qKYnv6tGjBxGv1KAXkG0bqgaKoUD61pmQVdGos4xemGoFTuHLqFloNbch6yjCqsuxs1d4kDKyJUh+ksfVhmGboJySaROr7eNWqiIfVrOsXPzxj3+0DbHatzRs2DBbj0K225IiNTQ0iDsNg14JoyJ8d1ISt2984xsS9A4fPjyS9TYYHjdunOwkwzBF8oZcu9v66/veMFv2wxSQmzUWhYlDlKOgGHKUxWFbAdvjskMgZIt6VeHZdlYbSRm5I/t+nKzqC05SxmXtTHZy2FbxRhLItZVbQR0aSVqkYit0OmScIhuYkKqtR5Gzp0cHtgzIRkSwCxcudP1d0jV8Mk4HThJc0fmGSCq/+hMebeUE9JLO6IkoET7BaniTd5mcLFq0qNXdwm16JYA6ibBkRpCLCCc45J1hV8vrbR3Y1l85cjb0N0l43e9///tqT+hVWCMJfxqRnvq2iQeJ6luN222PhHmTsWPbMug1dEWwlJycnJOTI1lxmDkCQ9fwrJWhv20Mf6Hi/L9zMifCGvqiTBAYaiuZ09gNGTLoNWTIkEGvIUOGDHoNGTLoNWTIkEGvIUOGOoo6YMXIuQbY6qqgfvi4frOtZ6M7K3RWG7KM7eNx+s2QvEXYhVYl074yhq5F6lgNCVksqqUH/H6/1xviTFrrRItG9SUr6wSGTvX1dRcv1qhDQ7p06UbJ8+fPqlN/qYqm1UnIlOzaNbOsrKS29qJ6uyUuLr5Tpy4xMTEUqK+vLy4upHLnXjzZtmbrdkJCIo9ER0enp3c+c+YkT6l3WWR/Kf9GR8dUV1d165apeKNAfHyC+kYjXaBC2KBH584VqcPQ1Gs9ihnrzaS0xMQk2pJzOWx2R97vU3KQY0D0zwvIVn6nrGyjIG8LOQ+pszHW0hkaaqdeWzfZqncSbPelHvnSQuR1trphUDpiO9NXmhD1aF8v2gc59VKX/lKU/kpcyM+AqE9eKp5tiiTjSDUCH3nKiZRW64kIvb169R0/fnLIX9ev/7iw8BRd6ty565Qpt8bExHLzzJlTW7asa2hooPVBg4bHxsZ+9NEi4YmSd9/94KFD+/LyPhWVBcyTJ9+ydu1KAGONk2fKlJuzs7tXVlbwnyv4OngK/x07dnjbts0Mq340Bx0Ggcqq0OLx40fmzZu/Zs1HSUnJY8aMf+ONP9EKjc6Zcye1rV37EWxkZ/ekOwsWvAJvruCrvB9RJ5jnQamnsPA0N13BcyTS4e3999/0+eoUVsePn4JZoQl5P4Yu5Ob2z8rqfupUcA/6ddeNS0z8/IDfoqIz+fn7rK8fNMnBFTwK+E5dhti7pUv/wkVu7gB6qmSlE12YMmU6YoEZyod8GbB3776jR499993XQ6KXGu677+urVi0tKTnXJvfOg9Onz2V8bfcZwYKCg/PnP9CmOoWNdetWoTYtHTQzdOioYcNG6fJh7Pbs2cEjUVHR6E87etEO6OIwJkyYiifIy9uCFsEY4Bk0aBhyrqury8/fjxrbPIoAgVFgHEHB1q2bsADWe8KXKBLFbrhhEqP5zjt/VlgdOfJ6unn2bJH4kkjqidT3cvHJJ8sbGuptFrGiolxMAtA9f/7c9u1b8EKTJk27447PP1l04cI59UVjsMoFILd9ENFnEXwPHTqcXn3wwcLy8lIF+B49et9000yQcOLEEZ1pcAJs6CEV0grDfOxYgUvbSq4qBzn19bFitqU7yrrzp+WKq2m02QrUY0Swi7ZDw1VhG/9yKf+rqqpUd/r06QtL2BR0Ts8IZEjw1a7gB2960N+bb76N6y5dujJ+Ib9LgoQpRh9B+N69O5wv1lnDFHBpZ6aGDLowfyG/wdVqtEbTu3Zt19+nZ4CkrTbV2cyGP0wBCLlt2LBamkPgAwcOmTp1+pIl78p5Ou3oRVuhy6gNH34dQD14cJ/SohEjxjD0H320GCWfOBFg1+EtVBRAsdjYuFtvnSOyGjHiuokTp61Zs0KCL9elHwGlHv7TYzqFf/oVYT2Xm/eiyNXV9d26ZcEK0K2uRrzldHj48NGgHV0EybpQ0tI6c4FdgUs9+Bk4cGhOTs9t2zaVlFzgz+uvn4BcqE0g2qtXcAN2Scl522ERYBUTiBljdBcvfpdoOS4uwTkS6emdYI9GQREDL/dhDLRgcZDgjBnzQJTtwe3bP0VB2zbv5/Fgj0W4DD94cwUPGb0ZJRAAqJJAl5JcME6wIT85eVAmo2/fgZQ5eHAvktm1a5set4upsv69JLy3xV26S1Ehvf6Wvx54O703Q2m5Pvsrx7aIUT8/QPIIFSqrBKElNmx0+vQJSZ2sM+6O3nvvQz169Nm7d2eYFlUkr/dLflVBry4QlebYpOHxeKdNu1mMqWqra9cMxvG99xbU19dWVJSh5P37Dz56tECpsQXv4DEvwBs1A9ugLjU1DQ/ndIcy1oTBKLnqPip6ww0TCwoO9O07qNV6IkKvkgXez/lrXt5nBw/uCfkg7s7lSrHZMyIiuIF14ArwVM8t31jHBfHnokXvAFf+s2pwEaWguITiJMZSXh1fJNogxfBO3LaZYxkzjIv82b17r6NH8+VaQcU64+5jK7G/5CPrNTXVBCpWJS7d0suDLb2tpn96T+4cOrQfrNJfZ96oygBLGTzpizPaRG/IHY4fP8pA0ovi4jMSgJE7DB48QsyQmADpMuWJP6lNxZzSVqdOXUgo6ALld+z4rKoqeOwLQMLakh9RnvuffrqesQh5SntLHyugRZR7yJCRcGIlb+c++2wDqVB8fAK2lZsyiFYEGGSDvGbatJkCDyJwfnLmsTqcCF8pCdu6j7K1CNuYwrFjJ23Y8EldXa3Ih84SDe3fvxuhDR06khqoBxPAiFAVVhvnhkGkvzg35QkzMrKsAxLfJnLWfEAX+Lx4sRqbwq9FRacRGv5A6YY1c9HVijQJ0KLLykq4yVPl5WU26Pbp0x9OaJQMjixA5dISlkZFxbRaT0ToFS08cuQQqiMN3377fPqPX5WUnfASuaNMsELKJ5EznpBn0TMVOVtycU+adBPuaPnyD1BTRIbmWcMZLIMQEWjPnn1gF4OIA+c/nZOMjGwaBP+2fImaJSVLSkpinJRfVb8mJCQRe2ApLZamMq50i+tlyz4Qe0RH8LHJyamIkqroyNGjh3fu3IrZwzRaTWeiiPRCom5U3BJxtDN4YxgI8JKSUhTOeers2cKiIn/v3v1syKQvMmbUdtddX1Oycjpe1JSqTp48yggQcmPyJerGYJEFcWfFikUYO5QJ5i1HPYCxoMvELxSGpc2b1+bnB0+3EFFwnwK33jr7/fffamxsQEfp+O7deQgQ8zp79h3ct/UOJumX1yuQDo67TOyJdcPMEelRA1BEAcAMEceSJe9Nn34z2gJ7PD5mzDgUYOXKxRJbbdy4BrMyYMBgHly48NWQwsSsiAaKBIhWwrSIKIi/KJaT06ugIPhRReRD93EGhHVkdhTGh6NjXK9duxIh0GtUxcoIvAyHsiCIF8+vz5xZsW4MNkh5jurqKiswTJQLV9OLkykoj5i50tISsVNaJcGzhNAE9JBRwGTPmnX7bbd9GbtDViijj+lptZ5I0YsqDBgwRKVtyqOiBM3W1wX3R47kIw6EMnfunTJrtW7dKtSC/iNiHqGGWbO+BE+bNq0tLb1gxcAehhPYU1gZ2n79Bkmw1BKhXqK4Sl7U3ByEdFahBZaYRhkb4Ddz5jyEDhoFTujN7t3bbQtFCQmJ06fPQc82blwNjLE+PM61FMAM8RNJl3hvmZnjAjjZPIbkM0CIgaGDtADDo0bdgMdTYZi0iwBFhlIeDeN6/PgpTt9rfcwul3Elp6A5asbokCDU1V0EpdRJ4IDJo1NURaaNzEEmUuUO5bdu3Uid+OEDB4LuHZ2Q+x9/vPRLX7onN7d/YeFpHDXmmKiHIVix4sP77/862TUA0HuH2c3Ovkv9iepjERTc6BSJxv79u6iBwUXV6J3Eh3DCHapCJVJSmo6VBEhkPdwEe7ROamNLi+gLaFTxpNhB1ExPvJ0tchNU9O6dK/EgkTby4UHsF+5HJkr5k8rxwwS9VtSzD6Ogf15MhRi25Fy8pWKScED4ZIgVpNE0CRAg0nWZctMVhMAYg2JNwW6iRVAzbtxkIghGQY/IWqsn4sgZzdNxLyooGZ0QsoMb/n377dfS0tIrKioaGurlNCNVBiR/+ukGOMDLSVeRO5Ez9zGcKj5fvXo59hIsheSkrKwU56NXi3wzM3OkbygBUbF4clSczjPqWArCpMOHD0kYgcpSOS2KI1X1SN6ONyAJQfu5BsCgQn794IOFIjuJ/GUyHEeHuoecfeFXNEN9XhQB6qKnm5s3r9NXjKyP+9Vzh2I29Mo8H5jEHoEoCsspU/36DcQedeoUDJhpSGRCLEdJmVRjRNQQgB+EI0pAGblPcwgBEYnJ69OnH/+pdjt37pKff0lqQIWwrYSPE9YFSHRHr7EmqAouWtSDnuJdMSUIEx4APA5NnhI8W6eXVcu8lFOMlqNraprysviHmoRp0fpKw1GGBj3EZQFj0hZuCvDwLgqHKm+iZh26YUghSs34iOLpB1bCEmZasnHGXfyNJij3zp3bcLNoDo1Spri4kHhBP61SCrdWT2TopVebNq2RtVz0XiVmksbIuq5agZR/sWpSTLQcS08xeC0pOSe2hICZ6AWJqzIkGAS0EopnZ/cYPfqGUNNjsRgqlE9fMWIslZ+ZOfN2cktUxJZbYiNUmiTtinT69x8kvFntNoUV5IHN8cUlIZy1AOm7/vqJdA3vRLgxZ85XCA6tOMcXMlOF4eggxdAWfm/atBlSLc3hdlJS0hj+c+eKpddqOjGk4xVvL1Nfwjx4IEkRVm0POr232A75V8V+yu1L+fPnz2JEUB5qQ54EraEWpRC4VxO+KhBITU0jyBJHxxBQm3jCAwf24FUQO+jCAVKzrJnpkxchdRHGiCfFVIkzRIUsLQ/XopUElXEHr8ugMVg4fPyBhGPN7j3YQTnZMhKfprjVbasE0lzon1a2PpF1hJ6iaUAUH8sjZ88WafAOzpZL6ofwMcFoIxaBQaEjBPDogxQOX0+k6JWZIaLTadNmUh21SFAqizQYRVmJkhmC/v2HEAwjO8oUFgbnGHgEQ0i0LCs9MotAKI74ZIEH+aKU6OLKlUsEOWQmGCQbG7gF6tHVlOv4+AS4gplVq9Zjwrdt2yLTD84pN1zb1KkzYIZ2aQVJ0S5Qh8M1az5CmidPHr/uujrSP8tpp8IS0ZQWSrmsb6NM4z4hnyiBZAo33zxr2bL3bbM4FFNIE3rvvTdsZYYMGQEPixa9rbyZleFc0GcgBSQktLBN1KB2R4B8MhQggQwRnZp6lZl5jDRCyMrqTr9k5RBmKCnVdurUGTNq2bUoBCK5rppSlvI4tIqKqpCzVrY/1VIZsR+DvmrVEvCmVlawXIw1Q79nT96uXduwy8T86emdI5zAD/ONqJZabJ723y/LxcgN6yzrT+jJ4cMHxeOBCmL4Ni04UZhxR9qybYlKyNSoFpOnztwUu8wozJgxj5/gh+RC36HQLLQAokB5kLkFhMNgGE9L5eiwZOyt1hNp5Ayjo0dfL7NN2AbRIeRFyoRC06WCggMynTN8+Ci4WblysXx8TSaZ8VFAWpIcrADDSaahzKq1vuIi0erbd+COHZ9anxHsPX78ZKdFFEnpUiDaRDOOHz+K36a2/Px9Z88WypYP20inpqbDP4YGVyAKQbvkLV/5yv0MszUf61+y5L2xY2/EfmMI0TbU2vZxQFJ0Mk8SKnEC4OHjj5fZNk4g9x07tsqilKyNV1VVqXXjkC5aBwns6ce+Wsu8CXCOicHSq/sVFWWW+x1KjxhyFHffvl3AVaJH2KZ3yJl+YQd79+5noXSHPM5TJ08eo++jRl0P8yg0cQR9oeNYQMzH4MHDsbAffPBWm5bK4EeCczrbrVumTFvW1l7MzMwip92yZb3H45W9RGoN5jIpZIuy4kVcOmHCFO7gNiSNpPsoJ6nHkSOHMB9EAXv27GxTc9aXA06gGyNHXo/2Eq7jTgh/9OGTAGHNmhU4m8TEZBSGiEBfWVCA6tdvEPy/++7rMn0tWTShBEweOrRXzFar9US63itYwlOReSIsSVTwUXrgoYL+zMxsiqG7lJH5Bu4Li9ykPGWQoCTA4BkrYP1Upy/QoZcym6WLxoYBVF9W/wRmdBi/GjKDEiBh8IhDVLs9e+bIFi5BHYytXfuR2sQnX82yBUXSitrgKbPi+vhZMyjn9J2b/INlwYqFXFGj7yqRUw2dOXNC7RIZMGAQjKmASk8HSBmQAArKhcw2YxZRWTjE9GCwidVlgACz6ITkkNhTfrV2nq0Uw0eGf8MNk7gv057kt5IT2UJcp+1XnxfBCjDW9977kOyL2rBhNW4WF5eX99moUTfccce90iKWXZblbN+FsGEgzCcOw7fIHQYFK083sVkSbUJ0PzY2ZuLEqbLFgl+xws3fc/CG+SCGpQxuFboTh0+efMsDDzwilajZDRuAiR9lCl3txrOVQVFhj+iJkYVbazmqs6yrRV6PnduQp9JZz3uwzZhzBVdJmVALFEUU2lpKiZP9X1JM7Zr87LMNktZaX3ZLof8yiyDTAKJSZNcCGNK8lnZl5ucfyMvbEn6CgV8HDhwG0jIysvH5b7zxJ4msMjNz0HJpTvGmR/4hgw6eIsLBEcn6YUv+c/TocVlZOYsXv9NSpNfY2DhlynTZKUkZ65GxtuhaEeG0Qm/IrcvqvpoaTUgIrluozQ9qK3ViYhL31ae61eYE7uNp1YSFBN6yDQ5laumTFCH3maudGHoNOuC5L6tr3BfA6Pucnduew2/YbrVFSZSICtEutEXpveydFoHIxztb3TLt3OcslYi01RdAI9narSuSbAcmyxMFwPTIGqS1qWE9wA7zZdYwCtnimZIyfkiKKEicG+kZ+bos9urTSLLXHxkJvOmkWHHFkCpD7EFVeMXS0hJVT/g3ImT4W30Jo3mePThjJJNSavDS0joF78bE2tptqSp5n0EUPUyLUkzaaknudJkLxY8s0IfsZkvvIRiKBCdxcfEpKWnEHaRCYZBwNcmpSDZAoY1VVZU2pLRVIVs5EVbXtjAThrZi7S7TIVKz1dyOdiPcT9tqMfP231Ug2V9A/ExGKqu4XxzeOkQbw2iaOc/Z0DXveyVwUy+u/v303ZznbOjaJisr8bta+Lrn33jfzfAbMmTQa8iQIYNeQ4YMmbz38sk23ec8IizMYXdX9Fy7lg4DdLX9PMDIy6jFOf3YwA5pN8LDAA3p5E1PTzdSaIlkmVpOoVBr91lZ3d1uj5ynJ4uNsogv+6vkZpcu3WR939W82UC2UqjjLGQvZ3p68A1HfXVatgqonQmqHhtKrXN/4uBNmpBf4aRLlwzZ5auKqbfAdf7hV5b+pVG9jBy416lTF2HMBjBazM7uAeepqcG3oKlE9mBLeXlcYVt/UHiTMurIO/0wEJtgje4Z33u5Xhedmzdv/vbtW/Lz96td3OPG3Xjo0L69e0ulzE03zVKvni1Y8LJsL1Pn0fFU//5DMjOz9Zq5+ckny9Bm2RnGI3LSxYABQ+rq6g4d2p+fv09e6LOd79ccCzQd4uey9pBt2rRWXsPSjy9rLjZd3jFWG3rkPMBt27aUlZXIWy9jx94ox3TI9jge7N69J5y8886f9Vlcde5njx595E5BQV1p6QXr8L1hnTt3PXXqOBX26tW3f/9Bsr1MPUtHcnJ6XnddsLNWmVzMlgpZuLNnz3YkgGDljVyjewa9HYBeees4MTHZ2neZ3b17L3TOOp7uc8+2aNE76qU2OV7MdvheYmIS8Dh69PDnkw0eCTjleLeg9xs2bDT/yV5lIA3SiovP2OpR4cD48cFzZz75ZDmOd9iwUVOnTv/LXxYI8FzaoXwzZszGrOzatb1Pn35ypIZWoWxL9M6efQf2gjIDBw69+ebbPvxwoRUIBMtIHKH2pYHGIUNG4CnVSSAg0Hol+ICCKCXpLEh2vqGh7wPNyMjG9GAv9FC5mflWdvYaMuiNCLqyU9plHUuQl+dNSEhSx99IAcA8cuT1tgf37dt1+PBBZ4XqFSuXdmxYU/bijRo4cAhuZ9eubXJOEpjUjxOxwUAOPSwsPKXOqcAf4q71MsS3oGj16hXUc/LksTvuuC83tz8RBIjV+cdYrFixqKKirKTk/IwZ8/CQ0i73/+EfHpXDNCJZRyVA6No1Q3/xNTwRDqxatUT889U5qPlvksycc2joEsiRhhHNghNUc/r0Oag14e7KlYvVK1a4PvAgh8tRhgv+lPPEnOS+lPS2EhMTQcuZM8HTGyEuAB53yGxDViVvroY5QoX7cjjD2bNFmAwyYdBCd6hT33yelZXDg0DXOgYtmAjwlDhJ7uPb9+/frVjFFeflfYaHl9ez5VyxPXt2SuJNzYC/f/+BbfAbUVHWvvRo9QqXEJLXT2wzZHxvG6fyvF6cqpwoQDZYUHAA9M6de6d1DP1phUb0Hqyi1nJ2JLoub+SGnHQhOdTOW/Do/lkQqI5BkdD0zju/Kr/azqyzXuM+DH5GjBgjh0tYhzAU2iyCvNHV2Nggb5NSCY985Sv362WAHOGrWJOGhqYDHFUBrJX+gjHlx46dhExANekuEbK8nffxx0vFl7733hvIDa4uR/LEIHI+EZGF0UOD3nZScnIqWSihLJ6hsrL8vfcW9O8/SA4BtOD3+RdPwIAoPY6rurrSeRgFwCC3lGM95B1JV/A4kSN6GZd2uo2cKLZx42pKqpMAdctCmiqKTmgALFeuXOKcp+VZ/fh4eeN669ZNrktP+dUPbYIB9a6pq/msfP19LDmRg0fotbxSJofLNtug6MufK8ZcEr9gFo0GGvS2k9BaeWs/MzNbna1ZUVFOWoiuAx6cjwqwhw0bLaHm0KEjgZxKbpWr3Lt3x+7d23HR99770NGjhyUB1pc3BRWAX05g7tKlG7UdOZLPT2DedmaVNSvm3759y2efbYQ3vKscsAbPPCWHJPOnHDkkB3/LOY80baXKUaoe8ExKb51W74+PT9TR6Mx75dB56s/MzCGpLik5t3btytOnT1gnFlTIu9N64q1/kiLkMSP6CdjqrVrr4JiTtljakEFvG0id+T527I3OA9/QVNwyegx0+/cfjAPEp/HnzJm3u6wTQi79YErAtv6pXmlWFcrB0US2e/bsINeVs7hsB33Y2JNfp0y5paDgIJiUQ3xx2suWvY9pAGknTx4bM2Z8v36DtmxZ16NHb3iWkyVVJGyVOYoDz83tv2/frtzcAdzkKXVu24YNq/XXwdVL8FS1Zg2mzadetddPvRVKSUmLj4+34ogUK4GPqa2ttcmQn6KivHIapnVS/Fl9gsAooUHv5ZKlpn7b5KqglPuTJt0kx8fJieHbtm0ZM2acfKVBoRc31b17L6WyIPO2274s8accFi+WAozdeuucO++8X06T2blzq7jTlhij9dTUtKys7sS6p04dpyHsCLzhkEX7iaWFnz59+spZguLTdBMAYOD8+usnEJ9TZs+ePD0Ct+W9QurYfetwL+ljcE5eHlc5/+23z1cTbBD2RaFXCtB9W5nwHw0wZNDb5pnnGTPmyoEhtilf65Nl7hMnjqJ2W7dulGg5P39fWVlJTU1VSNdBSYErjwdP+qqrVVNEKD2IXbr0L927925oAI0nxLO1hF6J2IcMGelyNSFHHVYs35qR057hp7T0fHp6MBsnxL30dNUmX7pt2+bCwtME7eoYNNVoGB8Ya5HuSF3Np8MdOrT38OGDsq1Fju+TWEOOWJLO0ijmSSILdbgPPdJtk0T46mOZhgx624xeV/M5WI6po2CqiUvBQanZGjm/Wo8hrePmTspXQm2hLwqKt9TnoqzTHg+4HKvBTq48Hu/EiZPkYwh4zhkz5oEl+AR+/MnT4FYWn0pKzssZ9CEzSbkPbmWrVuSnUhw8uFef38J1ywJS89bLOrlWCNfNkOTtyiDqpyXr8w533/0gZVr6sqkhg97Ws19XqIOaXcFVnPMrVy5q6fRjhZOWvs2nQ1SHunO+Wm7Y7nfrlonL3bRpLeZj1aolkyffAkSJmfF2cXFx1hm9J+QktJY4VCFuC422eASSVCi5g07EDrYjI1vtbAuic6llM91AGAqtouZknDC5JT425HypFdY2RngeXUsutNVz7UKWkRkvmW2W1xvwmYTi6sxtklWi0PC8gXPZ1NkmxvSPhjoFEslZf60e4ieMKXcd4QGOBr2GOj7qblXzIjn+rsM/Of1XadQV2SF+Bqsmcv6iRN0dUqzDFfqv0mgkdRrotpXMlIAhQwa9hgwZMug1ZMiQQa8hQwa9hgwZMug1ZMiQQa8hQwa9hgwZMug1ZMiQQa8hQ4YMeg0ZMug1ZMiQQa8hQ4YMeg0ZMug1ZMiQQa8hQ4YMeg0ZMmTQa8iQQa8hQ4a+WGTOtWonuT1Rib3HJ/YaG5c5JDotxxub5PbGGLFESAFfva+uqqHsdG3Rvurjn1Yf2xzwNxqxtFkJzZmSbSVvbHL6mHvTR93pjU830ugQ8l0sK93xdum2Bb66SiMNg94rRSmDpne76XtRCZ2MKDqcGmtKzn7y24oDHxlRROpI0tONA4k0Vs689Ymuk7/jiY43wrgShGCTB9wcldip6ugmgmsjEIPeDoNuzrxnUofMNpK40hSXOSS2S9/KQx8bABv0dgxl3PyvqUPnGDlcHYrt3Mcbn1Z9dKMRRSvRihFB67nuwOnpo+cbOVxNSh91F2I3cjDovbzgJDYZxxt5+YD1ra6A9qkudcdWLORTkdTcCgOXtt6OCgPWZzz9vkb+jaSeKxfvIHyjgSZybj91HvdgUu6kCAuj7rnpgbQYX1qsPz3BXVITcLnd3RL8k/pEAYPSmoB8ijohyp8e6w/4/A2Bps9tJnj9N/WLSox2FVX4rXoag0mf9ZN1HYQQT1FG6uGOv7Eh+F8QY8H/BIT8mtvJNbZnVGE5tzw6SkEkLTbBNRBkLODzzRxIowEadVufIwxQUX3diCzPyGzPqGxvWlygtrahstbndjd9MTRYpLGRdn3B1hvVf1RFterrocHmGi5hr+k/v8/61Jgnkk8WeaLjA776mpPbjRK2RGa3Rjhye6PTR93ZBsfr8z17Z2ZyXBA2lbX++b8vCvqQRNfjMzq/tObC4QsNboKdQKBvJ9cv52cu2lHx/Noad1QQkIlRvsdnZCzaUb7jVHVuV+8/TkpdvLt60/Egmp75Utqh4vpXNtd0S3NTzxubSw9fqAv4Ay8/2NXW+tNLSgvONd42NHHuqNS8P56pqfMoLIHSfl21sXa7qbCyvvHxGZmr91fuOF3l8nppa2Ivz7/MzE6O8+rVbjta89+rys7VRgUR7vf9aFbKdb3inH2vqvX/r1fOeWNi6A4G6xdf6RpSRPTl2eWV7si+9I3wL2x5JeBrMKpo0NtmSuw1LsItGeJR4xN9v11arG52TfTVNLokMgVvModqOcLgx2mTYt0qauWe9b/gRWK057reCduO1QTwlT4f13jKgL/K5fc0e1I8p2vb8Ysuf2Dq4CTABgKr6vwVNQ2+hsbmVvx6JDyqR8y0wcl4UXXz5U3Vn5ex6sxNd/3blzIKyxr+/b3CgguB6rpARop79rDE+yZ0+u4trp98UOb1BDeT5RfXV9bY90WN6ZOQlRZNv7zNMQh/UtXBwlpbyWBwEfGnAhE+Q1B1ZL1RRYPetqO397jI891ROd6fzu1hu/1/Vpw/U1JnK5mZElTy7PTP1d2ZEvNPY11dMGxW2ayWgXq8Uc+vqWmouwhsQO9/Lj9X44v6+qTkpFgPd5w1yv+//J9HvTGxQdfroYJol6u5cstsZKV6rZDBt/1EXVRsnNvrKq7wrd5fBXphtfmLxJ63tlapYF7I19j4m/u6A1e9SXHa//Vxmder3XcHm3Z7vG0ZgvEGvQa97aG4bgMjDrLdBed8//5+cWKM619vy+DGfywtxn0dvuDvlujW3aCvoX7e6G5cD8iMG5nt3V3c4PGG0Ob7JqTPG50q18nxnhHZHh0ewZDY48lKjZKbo3vFbzjagJfOSgs3oEA3Os6+1QTwJ3gbL/o8eaf8h4pq4eq1R3viM4mEB2TFSv0LtpQJk7D/k9npAzJjbZVIMWc2642K8UZHX9YQZAw0emjQ2x6K6dQz8sJF5b6yirqf3Z4hf04blPzzD89e9EV1S2yaPUL1E72N3w1qfxyxLk7y376c8dLqC8sPNLhiQ6SREnYCDMrj3HRfiveLc9c/Pr2LeMvv3datcMHpx14rxDo8Pr3z3GbYR0Kw8d4/9fr5h+c2HG744Tvnb8yNnjooGWcLqql5zf6qxburjpS4LF8dtD64d1halFfutF9uhxlqrK9V4YMUwffi9/k30iFI72H00KC3PeSJSYo0cPb7H5qQOGdkBkr/h0/Oo/d44Fcf6fHHtaVnSuqlTEai65fzM1B9XNx/rSzJTCn/1T1Z35vVrbrhHHdsFX6YV/52Xo2/sZF8lV/f2FTKg4/c1EVC60m9vY9Pz5G2th+r+fV9Ob9/qOebW8r/tLHNu/zJTjEl9fW+3E7Eu+5DxXUHCy8J9T1eT99OhLv+I6VNeTK9I7LwXjrzBHSjomObURoEJ0aEtNzRXON33yrxRozeyIfAoNdQ+6movDE45fNJYVKclwTvm6+cvG98et6JuoykpniyqNK37djFytqqlzdWRcXEH6sIPPinwtnDEtcfrs9IDDGT4/FEBTzBBLLyon/9kfp+XT6fc0qODWr/b5edXb6/3u2JfuzVwn+cnLa24GKrJqZ5KdhKra3JMzz8/6wv/8aU9HvHpYV//KGXiwvLm4Lt17/dx1ng6SWlR0qDi2DVDZ5FOypcodaKq+oD7sinrQwZ9Lab/PVVkb8GuGRPzeKdlYTH5I38+bUXTzy16DwX3RKjPp9qWlcTXBf1eIgn+bM2EPvurgZ8ltvdqIJL+X92WvTwzLpAwKu8mTg0iT8JttcdLiaCzkzxApVztZ5nP6oKlvF4de9no5E5XrenEeQnxXmof+vRxubsNBoLcrCwSOFtTO8EPCfh8bZjNZLNUnNVPQbFm3eyVuauia4J6YkLzpQ2CFdVdcFFaq5r/N7n19aE3OkR7IfX26YhMHpo0Nseqi89GR8BelHTjCTXP93UWVZrZArnhQeDkS04USmi25rq9fnq3/5mJl76u2+WBmd0LGwEndXOioJzjVZe2BR26unrJYkihaKiahp9MwbG/MuMLj//4NymEwHBrTsQyDuFN66gws/nkJov9eQZBH6+nON2k9lW1Ph+Orcz0cHLGyqT4+skqN50POD2StOyG8T/1tZqy4f7JveP/993ZK3eX/Xmp+UerzdoO7xeLvzWmliLsvK53H5/5KkvQ2D00KC3PVRbfCA+e0SEha1NDk0rJXIHpwQAzpRdstlAFnshX4NKLwOVgcB/ryqXGZ3DF1xPLiz2NwPACkSDuBf8XGI0/E0bs3wNviavGwisL2hYX1AXhIc3IKjl2YXbLy7eVc2vlnt0FVb6aurdvsYmxoKhLCUDwWlweKba/LMNb2wq2X7SKm1toqIAFuqu0UnKP4uRmjY4KVtNhrtd6w7V9s+ImTIwIayo3M8sLTtbE4hkx1Vt8UGjhwa97aHqY1vSR9/dajG08Gy1+7tvXrDFirIvckSm23ZTVP+fb0l35oT/b0ttjc+7u5h6vJc8E0yAQzu0uaNSx/S+dDeS27W+oH5XUcDVFPR6SEddzRsnrZvRUbFuR2Qb/HNgVtw/39rE2JzhSeqRlzdVJ8Z4pg5K1B/AgdMRfSkrv7ihstZPoh5WXq6q2oigGxyC41uMHhr0tgu9x7f4LpZ741tfgAk6R09MyIkijzfQFPoKltyeqlo/EXXI+dhXtlz0WI7O5QCWhJraJuFgm+BnQFYs/9nKF5wr21Xku8RkOOpsrtBNaC1pObWFZAx6e3vNkZLAXb8vChMVWzsxqIu0vCzM6w1WBuF1RxA4+y6WVh/bbPSwRUmak3HCU5eJD3eZ8I12Py47KJOiA1X1Lpxq0BsTEzc2EvU6HXX4tVAi5IxE1+f1WC8V+K3XA5wosuDhDe/feDYjMVBZF7hIhcGJNJ962yFUhVGetsw2dQid3/TH8xtfMkpo0NtO8sYm5359oTfhst7Esl6s6YBlko6q58pV2IGE4z3yP/PNOXVhyLzf25oO1VUWf/wfl2sjOwghHY60Lyx0IcRuoGvQe7lUcfCj0h1vGzlcTULg5nDJ1gND83Z+JFR9bHNsl76xnfsYUVwFqsz/pHD5U+ZUOoPeDssQKw99HJWQHpc5xMjiilLZzncKl/3cFfAbURj0diSAq45sqC89ntB9tDnS+YpMMdSUFq14+sKnrxqva9B7Raju/JHy3e8HfA0E0p7oOCOQjsHtxfKSrX8uXPJvtcX7jTQiJ7Ni1F7ByVfIeo8jlo5JzfHEJXPHiCXSMMbf6K+trC+3vkJ2bEv18S3m8CqDXkOG/o7o/wswAKkRGmnFvmj6AAAAAElFTkSuQmCC';
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
            },

            drawFlashPlayer : function() {
                var embedSrc = "";
                var divId = "div_" + this.flashConfig.objId;
                if (flashVerChecker.detectFlashVer(11, 1, 0) == 1) {
                    this.flashConfig.objId = "rmcPlayer_" + getNowTime() + "" + getRandNum();
                    embedSrc = this.createFlashMoviePlayerTag(this.varCoreSwf, this.flashConfig.objId, '100%', '100%', this.flashConfig.wmode, this.getFlashVar(), this.flashConfig.backgroundColor);
                } else {
                    embedSrc = this.createFlashVersionWarning();
                }
                document.getElementById(this.varPlayerId).innerHTML = embedSrc;
            },

            sendEvent : function(eventName) {
                if (this.flashConfig.callbackHandler) {
                    eval(this.flashConfig.callbackHandler + "('" + eventName + "')");
                }
            },

            getVideoStatus : function() {
                if (this.videoStatusIndex > -1) {
                    return this.videoStatus[this.videoStatusIndex];
                } else {
                    return "error";
                }
            },

            videoEvent : function(eventName) {
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
                    this.vdieoStatusIndex = 4;
                    this.sendEvent(this.getVideoStatus());
                    this.videoStatusIndex = 1;
                    //var videoObj = document.getElementById(_public.properties.objId);
                    //videoObj.load();
                } else if (eventName == "onstalled") {
                }
                this.sendEvent(this.getVideoStatus());

            }
        }
    }
</script>

<style lang="less">
    #player {
    }
</style>