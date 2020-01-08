<template>
    <div :id="elementIdMap.playerWrap">
        <div style="display:none;" class="localStream">
            <video :id="elementIdMap.localVideo" muted="muted" autoplay="true"></video>
        </div>

        <div :id="elementIdMap.remoteStream" style="display:none; height:100%;" class="player_cam remoteStreams">
            <!--img id="webrtc_logo" src="/resources/img/toast_cam_logo.png" style="position:absolute; left:12%; top:5%; width:75%;"-->
            <img :id="elementIdMap.webrtcLoading" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ibWFyZ2luOiBhdXRvOyBiYWNrZ3JvdW5kOiBub25lOyBkaXNwbGF5OiBibG9jazsgc2hhcGUtcmVuZGVyaW5nOiBhdXRvOyIgd2lkdGg9IjM2cHgiIGhlaWdodD0iMzZweCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjQiIHI9IjM2IiBzdHJva2UtZGFzaGFycmF5PSIxNjkuNjQ2MDAzMjkzODQ4ODIgNTguNTQ4NjY3NzY0NjE2Mjc2IiB0cmFuc2Zvcm09InJvdGF0ZSgxMjEuMDQ3IDUwIDUwKSI+CiAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBkdXI9IjFzIiB2YWx1ZXM9IjAgNTAgNTA7MzYwIDUwIDUwIiBrZXlUaW1lcz0iMDsxIj48L2FuaW1hdGVUcmFuc2Zvcm0+CjwvY2lyY2xlPgo8IS0tIFtsZGlvXSBnZW5lcmF0ZWQgYnkgaHR0cHM6Ly9sb2FkaW5nLmlvLyAtLT48L3N2Zz4=" style="position:absolute; width: 7%; left:46.5%; top:38%;">
            <div :id="elementIdMap.remoteVideosContainer" class="remoteVideosContainer" style="height:100%;"></div>
        </div>
    </div>
</template>

<script>
    import browserInfo from './../browser_checker';

    function makeMsgId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 30; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function jsonArrayToUrl(obj, prefix) {
        var urlString = "";

        for (var key in obj) {
            if (obj[key] !== null && typeof obj[key] == "object") {
                urlString += jsonArrayToUrl(obj[key], prefix ? prefix + "[" + key + "]" : key);
            }else{
                if (prefix) {
                    urlString += (prefix + "[" + key + "]" + '=' + encodeURIComponent(obj[key]) + "&");
                } else {
                    urlString += (key + '=' + encodeURIComponent(obj[key]) + "&");
                }
            }
        }
        return urlString;
    }

    function Peer (pcConfig, pcConstraints) {
        this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
        this.remoteVideoEl = document.createElement('video');
        this.remoteVideoEl.muted = true;
        // this.remoteVideoEl.playsInline = true;
        this.remoteVideoEl.setAttribute("playsinline", true);
        this.remoteVideoEl.setAttribute('webkit-playsinline', 'webkit-playsinline');
        // this.remoteVideoEl.WebKitPlaysInline = true;
        this.remoteVideoEl.controls = false;
        this.remoteVideoEl.autoplay = true;
    }

    function error(err){
        //console.log(err);
    }

    export default {
        name : 'webrtcPlayer',
        props : ['credentialUrl', 'candidateUrl', 'offerUrl', 'varPlayerId'],
        computed : {
        },
        data : function() {
            return {
                videoStreamObj : {},   //camera
                mediaConfig : {
                    audio:false,
                    video: {
                        mandatory: {},
                        optional: []
                    }
                },
                webRTCConfig : {   //configValue
                    peerConnectionConfig: {
                        iceServers: [
                            // {"url": "stun:23.21.150.121"},
                            // {"url": "stun:stun.l.google.com:19302"},
                            // {"url": "stun:devmedia012.toastcam.com:10088"},
                            // {"url": "turn:devmedia012.toastcam.com:10088?transport=udp", "username": "test", "credential": "test"},
                            // {"url": "turn:devmedia012.toastcam.com:10088?transport=tcp", "username": "test", "credential": "test"}
                            //{"url": "turn:10.77.29.91:10088?transport=udp", "username": "test", "credential": "test"}
                        ],
                        iceTransportPolicy: 'relay'
                    },
                    peerConnectionConstraints: {
                        optional: [
                            {"DtlsSrtpKeyAgreement": true}
                        ]
                    }
                },
                peer : null,
                webRTCStatus : '',
                currentWebRTCPeerId : '',
                peerDatabase : {},
                localStream : null,
                sessionId : '',
                timeoutId : null,
                httpCredRequest : null,
                remoteVideoContainer : null,
                webRTCStatusEnum : {
                    EVENT_STREAM_CONNECTING : 'stream_connecting',
                    EVENT_STREAM_CONNECTED : 'stream_connected',
                    EVENT_STREAM_DISCONNECTED : 'stream_disconnected',
                    EVENT_STREAM_STOPPED : 'stream_stopped',
                    EVENT_ERROR_WEBRTC_SERVER : 'webrtc_server_error'
                },
                url : '',
                elementIdMap : {
                    playerWrap : this.varPlayerId,
                    localVideo : 'localVideo' + this.varPlayerId,
                    remoteStream : 'remote_stream' + this.varPlayerId,
                    webrtcLoading : 'webrtc_loading' + this.varPlayerId,
                    remoteVideosContainer : 'remoteVideosContainer' + this.varPlayerId
                }
            }
        },
        created : function() {
        },
        mounted : function() {
            const remoteEl = document.getElementById(this.elementIdMap.remoteStream);
            remoteEl.style.display = 'block';
            this.videoStreamObj.preview = document.getElementById(this.elementIdMap.localVideo);
        },
        beforeDestroy : function() {
            this.stop();
        },
        methods : {
            play : function(cameraIdValue, url) {
                const that = this;
                this.currentWebRTCPeerId = cameraIdValue;
                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTING;
                this.sessionId = makeMsgId() + '_' + new Date().getTime();
                this.url = url;
                document.getElementById(this.elementIdMap.webrtcLoading).style.display = 'block';

                this.requestCredential(function(resObj) {
                    if (resObj) {
                        that.webRTCConfig.peerConnectionConfig.iceServers.push({urls: resObj.urls, username: resObj.username, credential: resObj.credential});
                        that.addPeer(that.currentWebRTCPeerId); //new RTCPeerConnection with Turn Server
                        that.offer(cameraIdValue);
                    } else {
                        that.webRTCStatus = that.webRTCStatusEnum.EVENT_ERROR_WEBRTC_SERVER;
                        that.$emit('playerStatusChanged', that.webRTCStatus);
                    }
                });
            },

            resume : function () {
                const videoEl = document.querySelector('#' + this.elementIdMap.remoteVideosContainer + ' video');
                if (videoEl) {
                    videoEl.play();
                }
            },

            pause : function () {
                const videoEl = document.querySelector('#' + this.elementIdMap.remoteVideosContainer + ' video');
                if (videoEl) {
                    videoEl.pause();
                }
            },

            stop : function() {
                if (!this.currentWebRTCPeerId) {
                    return;
                }
                var peer = this.peerDatabase[this.currentWebRTCPeerId];
                if (peer) {
                    peer.pc.close();
                }
                delete this.peerDatabase[this.currentWebRTCPeerId];

                if (this.videoStreamObj.stream && this.videoStreamObj.stream.getTracks) {
                    var tracks = this.videoStreamObj.stream.getTracks();
                    for( var track in tracks ){
                        if (tracks[track]) {
                            tracks[track].stop();
                        }
                    }
                }
                if (this.videoStreamObj.preview) {
                    this.videoStreamObj.preview.src = '';
                }

                const contEl = document.getElementById(this.elementIdMap.remoteVideosContainer);
                while (contEl && contEl.firstChild) contEl.removeChild(contEl.firstChild);

                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_STOPPED;
                document.getElementById(this.elementIdMap.webrtcLoading).style.display = 'none';
            },

            getMuteState : function() {
                if (!this.currentWebRTCPeerId) {
                    return false;
                }
                const peer = this.peerDatabase[this.currentWebRTCPeerId];
                if (peer) {
                    return peer.remoteVideoEl.muted;
                } else {
                    return false;
                }
            },

            toggleMute : function() {
                if (!this.currentWebRTCPeerId) {
                    return;
                }
                const peer = this.peerDatabase[this.currentWebRTCPeerId];
                if (peer) {
                    if (peer.remoteVideoEl.muted) {
                        peer.remoteVideoEl.muted = false;
                    } else {
                        peer.remoteVideoEl.muted = true;
                    }
                }
            },

            requestCredential : function (callback) {
                if (this.httpCredRequest) {
                    this.httpCredRequest.abort();
                }
                this.httpCredRequest = new XMLHttpRequest();
                this.httpCredRequest.onreadystatechange = () => {
                    if (this.httpCredRequest.readyState === XMLHttpRequest.DONE) {
                        if (this.httpCredRequest.status === 200) {
                            const resObj = JSON.parse(this.httpCredRequest.responseText);
                            callback(resObj);
                        } else {
                            callback(null);
                        }
                    }
                };
                this.httpCredRequest.open('GET', this.credentialUrl);
                this.httpCredRequest.send();
            },

            addPeer : function (remoteId) {
                const that = this;
                const peer = new Peer(this.webRTCConfig.peerConnectionConfig, this.webRTCConfig.peerConnectionConstraints);

                if (browserInfo.name === 'Firefox') {
                    peer.pc.ontrack = (event) => {
                        attachMediaStream(peer.remoteVideoEl, event.streams[0]);
                        // const tracks = event.stream.getTracks();
                        // if (tracks) {
                        //     tracks.forEach(function(track) {
                        //         console.log('track - ' + JSON.stringify(track));
                        //     });
                        // }
                        const contEl = document.getElementById(that.elementIdMap.remoteVideosContainer);
                        if (contEl) {
                            contEl.appendChild(peer.remoteVideoEl);
                        }
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                        document.getElementById(that.elementIdMap.webrtcLoading).style.display = 'none';
                        this.$emit('playerStatusChanged', this.webRTCStatus);
                    };
                } else {
                    peer.pc.onaddstream = (event) => {
                        attachMediaStream(peer.remoteVideoEl, event.stream);
                        // const tracks = event.stream.getTracks();
                        // if (tracks) {
                        //     tracks.forEach(function(track) {
                        //         console.log('track - ' + JSON.stringify(track));
                        //     });
                        // }
                        const contEl = document.getElementById(that.elementIdMap.remoteVideosContainer);
                        if (contEl) {
                            contEl.appendChild(peer.remoteVideoEl);
                        }
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                        document.getElementById(that.elementIdMap.webrtcLoading).style.display = 'none';
                        this.$emit('playerStatusChanged', this.webRTCStatus);
                    };
                }
                peer.pc.onremovestream = (event) => {
                    peer.remoteVideoEl.src = '';

                    const contEl = document.getElementById(that.elementIdMap.remoteVideosContainer);
                    while (contEl && contEl.firstChild) contEl.removeChild(contEl.firstChild);
                };
                peer.pc.oniceconnectionstatechange = (event) => {
                    const contEl = document.getElementById(that.elementIdMap.remoteVideosContainer);

                    switch(peer.pc.iceConnectionState) {
                        case 'disconnected':
                            while (contEl && contEl.firstChild) contEl.removeChild(contEl.firstChild);
                            this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                            this.$emit('playerStatusChanged', this.webRTCStatus);
                            break;
                        case 'closed':
                            while (contEl && contEl.firstChild) contEl.removeChild(contEl.firstChild);
                            this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_STOPPED;
                            this.$emit('playerStatusChanged', this.webRTCStatus);
                            break;
                    }
                };
                peer.pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        var bodyStr = jsonArrayToUrl({
                            "id":this.sessionId,
                            "candidate": encodeURIComponent(event.candidate.candidate)
                        });
                        if (bodyStr[bodyStr.length - 1] === '&') {
                            bodyStr = bodyStr.substring(0, bodyStr.length - 1);
                        }
                        fetch(this.candidateUrl, {
                            method: 'POST',
                            mode: 'cors',
                            body: JSON.stringify({
                                "id":this.sessionId,
                                "candidate": encodeURIComponent(event.candidate.candidate)
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                                //'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        })
                        .then(response => response.json())
                        .catch(error => {
                            that.webRTCStatus = that.webRTCStatusEnum.EVENT_ERROR_WEBRTC_SERVER;
                            that.$emit('playerStatusChanged', that.webRTCStatus);
                        })
                        .then(response => {});
                    }
                };
                this.peerDatabase[remoteId] = peer;

                return peer;
            },

            offer : function (remoteId) {
                var pc = this.peerDatabase[remoteId].pc;
                var that = this;
                var constraints;
                if (browserInfo.name === 'Firefox') {
                    constraints = { offerToReceiveVideo: 1, offerToReceiveAudio: 1 }
                } else {
                    constraints = {
                        optional: [],
                        mandatory: {
                            OfferToReceiveAudio: true,
                            OfferToReceiveVideo: true
                        }
                    };
                }

                if (browserInfo.name === 'Safari') {
                    pc.addTransceiver('audio');
                    pc.addTransceiver('video');
                }

                pc.createOffer((sessionDescription) => {
                        pc.setLocalDescription(sessionDescription);
                        var sendData = {
                            "id": that.sessionId,
                            "url": encodeURIComponent(that.url),
                            "relay": {
                                "username": that.webRTCConfig.peerConnectionConfig.iceServers[0].username,
                                "credential": that.webRTCConfig.peerConnectionConfig.iceServers[0].credential,
                                "url": encodeURIComponent(that.webRTCConfig.peerConnectionConfig.iceServers[0].urls)
                            },
                            "sdp": encodeURIComponent(sessionDescription.sdp)
                        };
                        var bodyStr = jsonArrayToUrl(sendData);
                        if (bodyStr[bodyStr.length - 1] === '&') {
                            bodyStr = bodyStr.substring(0, bodyStr.length - 1);
                        }
                        fetch(this.offerUrl, {
                            method: 'POST',
                            mode: 'cors',
                            body: JSON.stringify(sendData),
                            headers: {
                                'Content-Type': 'application/json'
                                //'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        })
                        .then(response => response.json())
                        .catch(error => {
                            that.webRTCStatus = that.webRTCStatusEnum.EVENT_ERROR_WEBRTC_SERVER;
                            that.$emit('playerStatusChanged', that.webRTCStatus);
                        })
                        .then(response => {
                            var answerObj = new RTCSessionDescription({
                                type: 'answer',
                                sdp: response.sdp
                            });
                            pc.setRemoteDescription(answerObj, () => {}, error);
                        });
                    },
                    error,
                    constraints
                );
            },

            getStatus : function () {
                return this.webRTCStatus;
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
    .player_cam{position:absolute;top:0;left:0;right:0;bottom:178px;background:#222;content:'';width: 100%;margin-bottom:-14px;overflow: hidden;}
    .remoteVideosContainer video {width:100%; height:100%;}
</style>