<template>
    <div id="webrtc_player_wrap">
        <div style="display:none;" class="localStream">
            <video id="localVideo" muted="muted" autoplay="true"></video>
        </div>

        <div id="remote_stream" style="display:none; height:100%;" class="player_cam remoteStreams">
            <!--img id="webrtc_logo" src="/resources/img/toast_cam_logo.png" style="position:absolute; left:12%; top:5%; width:75%;"-->
            <img id="webrtc_loading" src="data:image/gif;base64,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" style="position:absolute; left:48%; top:43%;">
            <div id="remoteVideosContainer" style="height:100%;"></div>
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
        this.remoteVideoEl.controls = false;
        this.remoteVideoEl.autoplay = true;
    }

    function error(err){
        //console.log(err);
    }

    export default {
        name : 'webrtcPlayer',
        props : ['credentialUrl', 'candidateUrl', 'offerUrl'],
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
                remoteVideoContainer : null,
                webRTCStatusEnum : {
                    EVENT_STREAM_CONNECTING : 'stream_connecting',
                    EVENT_STREAM_CONNECTED : 'stream_connected',
                    EVENT_STREAM_DISCONNECTED : 'stream_disconnected',
                    EVENT_STREAM_STOPPED : 'stream_stopped',
                    EVENT_ERROR_WEBRTC_SERVER : 'webrtc_server_error'
                },
                url : ''
            }
        },
        created : function() {
        },
        mounted : function() {
            const remoteEl = document.getElementById('remote_stream');
            remoteEl.style.display = 'block';
            this.videoStreamObj.preview = document.getElementById('localVideo');
        },
        beforeDestroy : function() {
        },
        methods : {
            play : function(cameraIdValue, url) {
                const that = this;
                this.currentWebRTCPeerId = cameraIdValue;
                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTING;
                this.sessionId = makeMsgId() + '_' + new Date().getTime();
                this.url = url;

                //document.getElementById('webrtc_logo').style.display = 'block';
                document.getElementById('webrtc_loading').style.display = 'block';

                const httpRequest = new XMLHttpRequest();
                httpRequest.onreadystatechange = function() {
                    if (httpRequest.readyState === XMLHttpRequest.DONE) {
                        if (httpRequest.status === 200) {
                            const resObj = JSON.parse(httpRequest.responseText);
                            that.webRTCConfig.peerConnectionConfig.iceServers.push({urls: resObj.urls, username: resObj.username, credential: resObj.credential});
                            that.addPeer(that.currentWebRTCPeerId); //new RTCPeerConnection with Turn Server
                            that.offer(cameraIdValue);
                        } else {
                            that.webRTCStatus = that.webRTCStatusEnum.EVENT_ERROR_WEBRTC_SERVER;
                            that.$emit('playerStatusChanged', that.webRTCStatus);
                        }
                    }
                };
                httpRequest.open('GET', this.credentialUrl);
                httpRequest.send();
            },

            resume : function () {
                const videoEl = document.querySelector('#remoteVideosContainer video');
                if (videoEl) {
                    videoEl.play();
                }
            },

            pause : function () {
                const videoEl = document.querySelector('#remoteVideosContainer video');
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
                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_STOPPED;
                //document.getElementById('webrtc_logo').style.display = 'none';
                document.getElementById('webrtc_loading').style.display = 'none';
            },

            addPeer : function (remoteId) {
                const that = this;
                const peer = new Peer(this.webRTCConfig.peerConnectionConfig, this.webRTCConfig.peerConnectionConstraints);

                if (browserInfo.name === 'Firefox') {
                    peer.pc.ontrack = (event) => {
                        attachMediaStream(peer.remoteVideoEl, event.streams[0]);
                        const contEl = document.getElementById('remoteVideosContainer');
                        if (contEl) {
                            contEl.appendChild(peer.remoteVideoEl);
                        }
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                        //document.getElementById('webrtc_logo').style.display = 'none';
                        document.getElementById('webrtc_loading').style.display = 'none';
                        this.$emit('playerStatusChanged', this.webRTCStatus);
                    };
                } else {
                    peer.pc.onaddstream = (event) => {
                        attachMediaStream(peer.remoteVideoEl, event.stream);
                        const contEl = document.getElementById('remoteVideosContainer');
                        if (contEl) {
                            contEl.appendChild(peer.remoteVideoEl);
                        }
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                        //document.getElementById('webrtc_logo').style.display = 'none';
                        document.getElementById('webrtc_loading').style.display = 'none';
                        this.$emit('playerStatusChanged', this.webRTCStatus);
                    };
                }
                peer.pc.onremovestream = (event) => {
                    peer.remoteVideoEl.src = '';

                    const contEl = document.getElementById('remoteVideosContainer');
                    while (contEl && contEl.firstChild) contEl.removeChild(contEl.firstChild);
                };
                peer.pc.oniceconnectionstatechange = (event) => {
                    const contEl = document.getElementById('remoteVideosContainer');

                    switch(
                        (  event.srcElement // Chrome
                            || event.target   ) // Firefox
                            .iceConnectionState) {
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
                            body: bodyStr,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
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
                            "offer": {
                                "id": that.sessionId,
                                "url": encodeURIComponent(that.url),
                                "relay": {
                                    "username": that.webRTCConfig.peerConnectionConfig.iceServers[0].username,
                                    "credential": that.webRTCConfig.peerConnectionConfig.iceServers[0].credential,
                                    "url": encodeURIComponent(that.webRTCConfig.peerConnectionConfig.iceServers[0].urls)
                                },
                                "sdp": encodeURIComponent(sessionDescription.sdp)
                            }
                        };
                        var bodyStr = jsonArrayToUrl(sendData);
                        if (bodyStr[bodyStr.length - 1] === '&') {
                            bodyStr = bodyStr.substring(0, bodyStr.length - 1);
                        }
                        fetch(this.offerUrl, {
                            method: 'POST',
                            mode: 'cors',
                            body: bodyStr,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
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
    #remoteVideosContainer video {width:100%; height:100%;}
</style>