<template>
    <div id="webrtc_player_wrap">
        <div style="display:none;" class="localStream">
            <video id="localVideo" muted="muted" autoplay="true"></video>
        </div>

        <div id="remote_stream" style="display:none; height:100%;" class="player_cam remoteStreams">
            <h2>Remote Streams</h2>
            <img id="webrtc_logo" src="/resources/img/toast_cam_logo.png" style="position:absolute; left:12%; top:5%; width:75%;">
            <img id="webrtc_loading" src="/resources/images/loading_2.gif" style="position:absolute; left:48%; top:43%;">
            <div id="remoteVideosContainer" style="height:100%;"></div>
        </div>
    </div>
</template>

<script>
    import toastcamAPIs from './../../../service/toastcamAPIs';
    import store from '../../../service/player/store';

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
            cameraData: function () {
                return store.state.cameraData;
            },
            browserInfo: function () {
                return store.state.browserInfo;
            }
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
                    EVENT_STREAM_CONNECTING : 'v2_event_stream_connecting',
                    EVENT_STREAM_CONNECTED : 'v2_event_stream_connected',
                    EVENT_STREAM_DISCONNECTED : 'v2_event_stream_disconnected',
                    EVENT_STREAM_STOPPED : 'v2_event_stream_stopped'
                },
                url : ''
            }
        },
        created : function() {
        },
        mounted : function() {
            $('#player').hide();
            $('#remote_stream').show();
            this.videoStreamObj.preview = document.getElementById('localVideo');
        },
        beforeDestroy : function() {
        },
        methods : {
            play : function(cameraIdValue, url) {
                const that = this;
                this.currentWebRTCPeerId = cameraIdValue;
                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTING;
                this.sessionId = getCookie("toastcam");
                this.url = url;
                $.ajax({
                    type: "GET",
                    url: "https://10.77.29.91:8080/rtc/credential",
                    success:function(dataStr){
                        var resObj = JSON.parse(dataStr);
                        that.webRTCConfig.peerConnectionConfig.iceServers.push({url: resObj.urls, username: resObj.username, credential: resObj.credential});
                        that.addPeer(that.currentWebRTCPeerId); //new RTCPeerConnection with Turn Server
                        that.offer(cameraIdValue);
                        console.log('Get TurnServer - webRTC Media url : ' + url);
                    },
                    error:function(e){
                    }
                });
                /*
                1. Get Turn Server
                2. new RTCPeerConnection with Turn Server
                3. Get Token
                4. Create offer and call offerAPI with (userId, mediaUrl, token, offer.sdp)
                5. Get answer.sdp from offerAPI. Then, set remote description with answer.sdp

                => Disconnected, 1~5 or 3~5?
                 */
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
                const peer = new Peer(this.webRTCConfig.peerConnectionConfig, this.webRTCConfig.peerConnectionConstraints);

                if (this.browserInfo.name === 'Firefox') {
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
                        this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : ''});
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
                        this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : ''});
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
                        //case 'closed':
                            $('#remoteVideosContainer').empty();
                            this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                            this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : ''});
                            break;
                    }
                };
                peer.pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('onicecandidate candidate : ' + event.candidate.candidate);
                        $.ajax({
                            type: "POST",
                            url: "https://10.77.29.91:8080/rtc/candidate",
                            data: {
                                "id":this.sessionId,
                                "candidate":encodeURIComponent(event.candidate.candidate)
                            },
                            success:function(){
                                console.log('send candidate : ' + event.candidate.candidate);
                            },
                            error:function(e){
                                console.log('send candidate error!');
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
                if (this.browserInfo.name === 'Firefox') {
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

                if (this.browserInfo.name === 'Safari') {
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
                            url: "https://10.77.29.91:8080/rtc/offer",
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
                                that.webRTCStatus = that.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                                that.$emit('playerStatusChanged', {status : that.webRTCStatus, code : ''});
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
    #player {
    }
</style>