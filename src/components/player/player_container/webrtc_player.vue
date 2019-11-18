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

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import toastcamAPIs from './../../../service/toastcamAPIs';
    import store from '../../../service/player/store';

    const $: any = (window as any).$ as any;
    const io: any = (window as any).io as any;
    const attachMediaStream: any = (window as any).attachMediaStream as any;

    // Returns the result of getUserMedia as a Promise.
    function requestUserMedia(constraints: any) {
        return new Promise(function(resolve, reject) {
            var onSuccess = function(stream: any) {
                resolve(stream);
            };
            var onError = function(error: any) {
                reject(error);
            };

            try {
                //getUserMedia(constraints, onSuccess, onError);
            } catch (e) {
                reject(e);
            }
        });
    }

    function getCookie (cName: any) {
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

    function getBrowserType() {
        if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 )
        {
            return 'opera';
        }
        else if(navigator.userAgent.indexOf("Chrome") != -1 )
        {
            return 'chrome';
        }
        else if(navigator.userAgent.indexOf("Safari") != -1)
        {
            return 'safari';
        }
        else if(navigator.userAgent.indexOf("Firefox") != -1 )
        {
            return 'firefox';
        }
        else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!(document as any).documentMode == true )) //IF IE > 10
        {
            return 'ie';
        }
        else
        {
            return 'unknown';
        }
    }

    function Peer (pcConfig: any, pcConstraints: any) {
        const peerConnection: any = RTCPeerConnection;

        this.pc = new peerConnection(pcConfig, pcConstraints);
        this.remoteVideoEl = document.createElement('video');
        this.remoteVideoEl.controls = false;
        this.remoteVideoEl.autoplay = true;
    }

    function error(err: any){
        console.log(err);
    }

    @Component
    export default class WebrtcPlayer extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }

        videoStreamObj: any = {};
        mediaConfig: any = {
            audio:false,
            video: {
                mandatory: {},
                optional: []
            }
        };
        socket: any = null;
        webRTCConfig: any = {   //configValue
            peerConnectionConfig: {
                iceServers: [
                    // {"url": "stun:23.21.150.121"},
                    // {"url": "stun:stun.l.google.com:19302"},
                    // {"url": "stun:devmedia012.toastcam.com:10088"},
                    // {"url": "turn:devmedia012.toastcam.com:10088?transport=udp", "username": "test", "credential": "test"},
                    // {"url": "turn:devmedia012.toastcam.com:10088?transport=tcp", "username": "test", "credential": "test"}
                ],
                iceTransportPolicy: 'relay'
            },
            peerConnectionConstraints: {
                optional: [
                    {"DtlsSrtpKeyAgreement": true}
                ]
            }
        };
        dvrId: any = '';
        channelId: any = '';
        peer: any = null;
        dvrConnectFail: any = false;
        webRTCStatus: any = '';
        currentWebRTCPeerId: any = '';
        peerDatabase: any = {};
        localStream: any = null;
        sessionId: any = '';
        timeoutId: any = null;
        remoteVideoContainer: any = null;
        webRTCStatusEnum: any = {
            EVENT_STREAM_CONNECTING : 'event_stream_connecting',
            EVENT_STREAM_CONNECTED : 'event_stream_connected',
            EVENT_STREAM_DISCONNECTED : 'event_stream_disconnected',
            EVENT_STREAM_STOPPED : 'event_stream_stopped'
        };
        userData: any = null;
        controlServerJpUrl: any = location.href.indexOf('dev') == -1 ? 'https://control-jp.toastcam.com:8443' : 'https://dev-control-jp.toastcam.com:8443';
        controlServerUrl: any = location.href.indexOf('dev') == -1 ? 'https://control.toastcam.com:8443' : 'https://dev.toastcam.com:8443';

        private mounted() {
            $('#player').hide();
            $('#remote_stream').show();
            this.videoStreamObj.preview = document.getElementById('localVideo');
        }

        play(cameraIdValue: any, timestamp: any) {
            var realURL;

            toastcamAPIs.call(toastcamAPIs.account.ME, {}, (data: any) => {
                this.userData = data;
                if (this.userData && this.userData.country === 'JP') {
                    realURL = this.controlServerJpUrl;
                } else {
                    realURL = this.controlServerUrl;
                }
                if (this.socket) {
                    this.socket.disconnect();
                    this.socket = null;
                }
                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTING;

                var cameraInfos = cameraIdValue.split("@");
                this.dvrId = cameraInfos[0];
                this.channelId = cameraInfos[1];

                var timeObj = new Date();
                this.sessionId = getCookie("toastcam") + '_' + timeObj.getTime();

                if (navigator.userAgent.indexOf('OPR') != -1) {
                    this.socket = io.connect(realURL,{transports: ['xhr-polling', 'websocket'], forceNew:true, secure:true});
                } else {
                    this.socket = io.connect(realURL,{transports: ['websocket'], forceNew:true, secure:true});
                }

                this.socket.on('LoginRequired', (data: any) => {
                    if (this.socket) {
                        this.socket.emit('login', {
                            msgid : makeMsgId(),
                            type : "req",
                            messageversion : "s-2.0.0",
                            devicetype : "WEB",
                            deviceinfo : {
                                userid : this.userData.userId,
                                appname : "toastcam_b2b",
                                appversion : "1.3.12",
                                browsertype : "chrome",
                                osversion : "6.0",
                                sessionid : this.sessionId
                            }
                        });
                    } else {
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                        this.$emit('playerStatusChanged', {status : this.webRTCStatus, code: 'nosocket'});
                    }
                });

                this.socket.on('login', (data: any) => {
                    if (data.code == 0) {
                        if (this.socket) {
                            if (this.dvrId && this.channelId) {
                                this.socket.emit('webrtc_request', {
                                    msgid : makeMsgId(),
                                    type : 'req',
                                    scenario : 'livestream',
                                    channel : this.channelId,
                                    resolution : 'HD',
                                    timestamp : timestamp,
                                    from : this.sessionId,
                                    to : this.dvrId
                                });
                                if (this.timeoutId) {
                                    clearTimeout(this.timeoutId);
                                }
                                this.timeoutId = setTimeout(() => {
                                    this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                                    this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : 'timeout'});
                                }, 15 * 1000);
                            } else {
                                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                                this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : 'nocamera'});
                            }
                        } else {
                            this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                            this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : 'nosocket'});
                        }
                    } else {
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                        this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : 'loginfail'});
                    }
                });

                this.socket.on('webrtc_request', (data: any) => {
                    if (this.timeoutId) {
                        clearTimeout(this.timeoutId);
                        this.timeoutId = null;
                    }
                    this.handleMessageRequest(data);
                });

                this.socket.on('webrtc_signaling', (data: any) => {
                    this.handleMessage(data);
                });
            }, (err: any) => {
            });
        }

        resume() {
            if ($('#remoteVideosContainer').length) {
                if ($('#remoteVideosContainer').children('video').length) {
                    $('#remoteVideosContainer').children('video')[0].play();
                }
            }
        }

        pause() {
            if (this.cameraData.recorderType == "recorder") {
                if ($('#remoteVideosContainer').length) {
                    if ($('#remoteVideosContainer').children('video').length) {
                        $('#remoteVideosContainer').children('video')[0].pause();
                    }
                }
            }
        }

        stop() {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
            if (!this.currentWebRTCPeerId) {
                return;
            }
            var cameraInfos = this.currentWebRTCPeerId.split("@");
            var peer = this.peerDatabase[cameraInfos[0]];
            if (peer) {
                peer.pc.close();
            }
            delete this.peerDatabase[cameraInfos[0]];

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
        }

        getStatus() {
            return this.webRTCStatus;
        }

        send(type: any, to: any, payload: any) {
            if (this.socket) {
                this.socket.emit('message', {
                    to: to,
                    type: type,
                    payload: payload
                });
            } else {
                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : 'nosocket'});
            }
        }

        addPeer(remoteId: any) {
            const peer: any = new (Peer as any)(this.webRTCConfig.peerConnectionConfig, this.webRTCConfig.peerConnectionConstraints);
            peer.pc.onicecandidate = (event: any) => {
                if (event.candidate) {
                    if (this.socket) {
                        var candidateJSON = {
                            msgid : makeMsgId(),
                            type : 'noti',
                            command : 'candidate',
                            from : this.sessionId,
                            to : this.dvrId,
                            payload : {
                                id : event.candidate.sdpMid,
                                label : event.candidate.sdpMLineIndex,
                                candidate : event.candidate.candidate
                            }
                        };
                        this.socket.emit('webrtc_signaling', candidateJSON);
                    }
                }
            };
            if (getBrowserType() === 'firefox') {
                peer.pc.ontrack = (event: any) => {
                    const remoteVideosContainer: any = document.getElementById('remoteVideosContainer');

                    attachMediaStream(peer.remoteVideoEl, event.streams[0]);
                    remoteVideosContainer.appendChild(peer.remoteVideoEl);
                    this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                    if ($('#remoteVideosContainer').children('video').length) {
                        $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - $('#timeline_table').height());
                    }
                    $('#webrtc_logo').hide();
                    $('#webrtc_loading').hide();
                    this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : ''});
                };
            } else {
                peer.pc.onaddstream = (event: any) => {
                    const remoteVideosContainer: any = document.getElementById('remoteVideosContainer');

                    attachMediaStream(peer.remoteVideoEl, event.stream);
                    remoteVideosContainer.appendChild(peer.remoteVideoEl);
                    this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_CONNECTED;
                    if ($('#remoteVideosContainer').children('video').length) {
                        $('#remoteVideosContainer').children('video').css('height', $('#remoteVideosContainer').height() - $('#timeline_table').height());
                    }
                    $('#webrtc_logo').hide();
                    $('#webrtc_loading').hide();
                    this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : ''});
                };
            }
            peer.pc.onremovestream = (event: any) => {
                const remoteVideosContainer: any = document.getElementById('remoteVideosContainer');
                peer.remoteVideoEl.src = '';
                remoteVideosContainer.removeChild(peer.remoteVideoEl);
            };
            peer.pc.oniceconnectionstatechange = (event: any) => {
                const remoteVideosContainer: any = document.getElementById('remoteVideosContainer');

                switch(
                    (  event.srcElement // Chrome
                        || event.target   ) // Firefox
                        .iceConnectionState) {
                    case 'disconnected':
                        remoteVideosContainer.removeChild(peer.remoteVideoEl);
                        this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                        this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : ''});
                        break;
                }
            };
            this.peerDatabase[remoteId] = peer;

            return peer;
        }

        answer(remoteId: any) {
            var pc = this.peerDatabase[remoteId].pc;
            pc.createAnswer((sessionDescription: any) => {
                    pc.setLocalDescription(sessionDescription);
                    this.send('answer', remoteId, sessionDescription);
                },
                error
            );
        }

        offer(remoteId: any) {
            var pc = this.peerDatabase[remoteId].pc;
            var constraints, browserType = getBrowserType();
            if (browserType === 'firefox') {
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

            if (browserType === 'safari') {
                pc.addTransceiver('audio');
                pc.addTransceiver('video');
            }

            pc.createOffer((sessionDescription: any) => {
                    pc.setLocalDescription(sessionDescription);
                    if (this.socket) {
                        this.socket.emit('webrtc_signaling', {
                            msgid : makeMsgId(),
                            type : 'noti',
                            command : 'offer',
                            from : this.sessionId,
                            to : this.dvrId,
                            payload : sessionDescription
                        });
                    }
                },
                error,
                constraints
            );
        }

        handleMessageRequest(message: any) {
            var from = this.dvrId, pc;

            if (message.code == 0) {
                this.webRTCConfig.peerConnectionConfig.iceServers = [];
                var i, len;
                if (message.stunserver) {
                    // for (i = 0, len = message.stunserver.length; i < len; i+=1) {
                    //     this.webRTCConfig.peerConnectionConfig.iceServers.push(message.stunserver[i]);
                    // }
                }
                if (message.turnserver) {
                    if (getBrowserType() === 'firefox') {
                        for (i = 0, len = message.turnserver.length; i < len; i+=1) {
                            if (i === 0) {
                                this.webRTCConfig.peerConnectionConfig.iceServers.push(message.turnserver[i]);
                                if (this.webRTCConfig.peerConnectionConfig.iceServers[0] && this.webRTCConfig.peerConnectionConfig.iceServers[0].url) {
                                    this.webRTCConfig.peerConnectionConfig.iceServers[0]['urls'] = [];
                                    this.webRTCConfig.peerConnectionConfig.iceServers[0]['urls'].push(this.webRTCConfig.peerConnectionConfig.iceServers[0].url);
                                    delete this.webRTCConfig.peerConnectionConfig.iceServers[0].url;
                                }
                            } else {
                                if (this.webRTCConfig.peerConnectionConfig.iceServers[0] && this.webRTCConfig.peerConnectionConfig.iceServers[0].urls) {
                                    this.webRTCConfig.peerConnectionConfig.iceServers[0].urls.push(message.turnserver[i].url);
                                }
                            }
                        }
                    } else {
                        for (i = 0, len = message.turnserver.length; i < len; i+=1) {
                            this.webRTCConfig.peerConnectionConfig.iceServers.push(message.turnserver[i]);
                        }
                    }
                }
                pc = this.addPeer(from).pc;
                this.offer(this.dvrId);
            } else {
                this.webRTCStatus = this.webRTCStatusEnum.EVENT_STREAM_DISCONNECTED;
                this.$emit('playerStatusChanged', {status : this.webRTCStatus, code : message.code});
            }
        }

        handleMessage(message: any) {
            var type = message.command,
                from = this.dvrId, pc;

            switch (type) {
                case 'offer':
                    //pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){}, error);
                    //answer(from);
                    break;
                case 'answer':
                    pc = this.peerDatabase[from].pc;
                    var payloadJSON;
                    if (typeof message.payload === 'string') {
                        payloadJSON = JSON.parse(message.payload);
                    } else {
                        payloadJSON = message.payload;
                    }
                    pc.setRemoteDescription(new RTCSessionDescription(payloadJSON), function(){}, error);
                    break;
                case 'candidate':
                    pc = this.peerDatabase[from].pc;
                    if(pc.remoteDescription) {
                        var candidateJSON;
                        if (typeof message.payload === 'string') {
                            candidateJSON = JSON.parse(message.payload);
                        } else {
                            candidateJSON = message.payload;
                        }
                        pc.addIceCandidate(new RTCIceCandidate({
                            sdpMLineIndex: candidateJSON.label,
                            sdpMid: candidateJSON.id,
                            candidate: candidateJSON.candidate
                        }), function(){}, error);
                    }
                    break;
            }
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>

<style lang="less">
    #player {
    }
</style>


