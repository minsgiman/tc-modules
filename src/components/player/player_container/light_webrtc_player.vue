<template>
    <div id="webrtc_player_wrap">
        <div style="display:none;" class="localStream">
            <video id="localVideo" muted="muted" autoplay="true"></video>
        </div>

        <div id="remote_stream" style="display:none; height:100%;" class="player_cam remoteStreams">
            <img id="webrtc_logo" src="/resources/img/toast_cam_logo.png" style="position:absolute; left:12%; top:5%; width:75%;">
            <img id="webrtc_loading" src="/resources/img/loading_2.gif" style="position:absolute; left:48%; top:43%;">
            <div id="remoteVideosContainer" style="height:100%;"></div>
        </div>
    </div>
</template>

<script>
    import browserInfo from './../browser_checker';
    import $ from 'jquery';

    function getCookie (cName) {
        cName = cName + '=';
        var cookieData = document.cookie;
        var start = cookieData.indexOf(cName);
        var cValue = '';
        if(start != -1){
            start += cName.length;
            var end = cookieData.indexOf(';', start);
            if(end == -1)end = cookieData.length;
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
    }

    function makeMsgId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 30; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function Peer (pcConfig, pcConstraints) {
        this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
        this.remoteVideoEl = document.createElement('video');
        this.remoteVideoEl.controls = false;
        this.remoteVideoEl.autoplay = true;
    }

    function error(err){
        console.log(err);
    }

    export default {
        name : 'webrtcPlayer',
        props : [],
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
                url : '',
                webrtcServer : 'https://mediartc.toast.com:8080'
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
                $.ajax({
                    type: "GET",
                    url: this.webrtcServer + "/rtc/credential",
                    success:function(dataStr){
                        var resObj = JSON.parse(dataStr);
                        that.webRTCConfig.peerConnectionConfig.iceServers.push({url: resObj.urls, username: resObj.username, credential: resObj.credential});
                        that.addPeer(that.currentWebRTCPeerId); //new RTCPeerConnection with Turn Server
                        that.offer(cameraIdValue);
                        console.log('Get TurnServer - webRTC Media url : ' + url);
                    },
                    error:function(e){
                        that.webRTCStatus = that.webRTCStatusEnum.EVENT_ERROR_WEBRTC_SERVER;
                        that.$emit('playerStatusChanged', that.webRTCStatus);
                    }
                });
            },

            resume : function () {
                if ($('#remoteVideosContainer').length) {
                    if ($('#remoteVideosContainer').children('video').length) {
                        $('#remoteVideosContainer').children('video')[0].play();
                    }
                }
            },

            pause : function () {
                if ($('#remoteVideosContainer').length) {
                    if ($('#remoteVideosContainer').children('video').length) {
                        $('#remoteVideosContainer').children('video')[0].pause();
                    }
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
                $('#webrtc_logo').hide();
                $('#webrtc_loading').hide();
            },

            addPeer : function (remoteId) {
                const that = this;
                const peer = new Peer(this.webRTCConfig.peerConnectionConfig, this.webRTCConfig.peerConnectionConstraints);

                if (browserInfo.name === 'Firefox') {
                    peer.pc.ontrack = (event) => {
                        console.log('peer.pc.ontrack!');

                        attachMediaStream(peer.remoteVideoEl, event.streams[0]);
                        $('#remoteVideosContainer')[0].appendChild(peer.remoteVideoEl);
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - $('#timeline_table').height());
                        }
                        $('#webrtc_logo').hide();
                        $('#webrtc_loading').hide();
                        this.$emit('playerStatusChanged', this.webRTCStatus);
                    };
                } else {
                    peer.pc.onaddstream = (event) => {
                        console.log('peer.pc.onaddstream!');

                        attachMediaStream(peer.remoteVideoEl, event.stream);
                        $('#remoteVideosContainer')[0].appendChild(peer.remoteVideoEl);
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                        if ($('#remoteVideosContainer').children('video').length) {
                            $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - $('#timeline_table').height());
                        }
                        $('#webrtc_logo').hide();
                        $('#webrtc_loading').hide();
                        this.$emit('playerStatusChanged', this.webRTCStatus);
                    };
                }
                peer.pc.onremovestream = (event) => {
                    console.log('peer.pc.onremovestream!');

                    peer.remoteVideoEl.src = '';
                    $('#remoteVideosContainer').empty();
                };
                peer.pc.oniceconnectionstatechange = (event) => {
                    console.log('oniceconnectionstatechange - ' + (event.srcElement || event.target).iceConnectionState);

                    switch(
                        (  event.srcElement // Chrome
                            || event.target   ) // Firefox
                            .iceConnectionState) {
                        case 'disconnected':
                            $('#remoteVideosContainer').empty();
                            this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                            this.$emit('playerStatusChanged', this.webRTCStatus);
                            break;
                        case 'closed':
                            $('#remoteVideosContainer').empty();
                            this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_STOPPED;
                            this.$emit('playerStatusChanged', this.webRTCStatus);
                            break;
                    }
                };
                peer.pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('onicecandidate candidate : ' + event.candidate.candidate);
                        $.ajax({
                            type: "POST",
                            url: this.webrtcServer + "/rtc/candidate",
                            data: {
                                "id":this.sessionId,
                                "candidate":encodeURIComponent(event.candidate.candidate)
                            },
                            success:function(){
                                console.log('send candidate : ' + event.candidate.candidate);
                            },
                            error:function(e){
                                that.webRTCStatus = that.webRTCStatusEnum.EVENT_ERROR_WEBRTC_SERVER;
                                that.$emit('playerStatusChanged', that.webRTCStatus);
                            }
                        });
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
                                    "url": encodeURIComponent(that.webRTCConfig.peerConnectionConfig.iceServers[0].url)
                                },
                                "sdp": encodeURIComponent(sessionDescription.sdp)
                            }
                        };

                        $.ajax({
                            type: "POST",
                            url: this.webrtcServer + "/rtc/offer",
                            data: sendData,
                            success:function(dataStr){
                                var resObj = JSON.parse(dataStr);
                                var answerObj = new RTCSessionDescription({
                                    type: 'answer',
                                    sdp: resObj.sdp
                                });
                                pc.setRemoteDescription(answerObj, () => {}, error);
                            },
                            error:function(e){
                                that.webRTCStatus = that.webRTCStatusEnum.EVENT_ERROR_WEBRTC_SERVER;
                                that.$emit('playerStatusChanged', that.webRTCStatus);
                            }
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