<script>
    import toastcamAPIs from './../../service/toastcamAPIs';

    function Peer (pcConfig, pcConstraints) {
        this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
        this.remoteVideoEl = document.createElement('video');
        this.remoteVideoEl.controls = true;
        this.remoteVideoEl.autoplay = true;
    }

    export default {
        name: 'webrtc',
        props: [],
        computed: {
        },
        data: function () {
            return {
                camera : {},
                mediaConfig : {
                    audio:true,
                    video:false
                },
                socket : null,
                cameraId : '',
                configValue : {
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
                },
                sessionId : '',
                peer : null,
                peerDatabase : {},
                localStream : null,
                remoteVideoContainer : null,
                browserType : '',
                EVENT_STREAM_CONNECTING : 'event_stream_connecting',
                EVENT_STREAM_CONNECTED : 'event_stream_connected',
                EVENT_STREAM_DISCONNECTED : 'event_stream_disconnected',
                EVENT_STREAM_STOPPED : 'event_stream_stopped',
            }
        },
        created : function() {
            this.remoteVideoContainer = document.getElementById('remoteVideosContainer');
        },
        beforeDestroy : function() {
        },
        methods : {
            // Returns the result of getUserMedia as a Promise.
            requestUserMedia : function (constraints) {
                var that = this;
                return new Promise(function(resolve, reject) {
                    var onSuccess = function(stream) {
                        resolve(stream);
                    };
                    var onError = function(error) {
                        reject(error);
                        that.$emit('event', {status: 'disconnect', code : 'nomike'});
                    };

                    try {
                        getUserMedia(constraints, onSuccess, onError);
                    } catch (e) {
                        reject(e);
                        that.$emit('event', {status: 'disconnect', code : 'nomike'});
                    }
                });
            },

            audioChatStart : function(cameraIdValue) {
                var realURL, that = this;


                toastcamAPIs.call(toastcamAPIs.account.ME, {}, (data) => {
                    if (data.country === 'JP') {
                        realURL = that.controlServerJpUrl;
                    } else {
                        realURL = controlServerUrl;
                    }
                    if (that.socket) {
                        that.socket.disconnect();
                        that.socket = null;
                        console.log('audioChat socket disconnect');
                    }

                    requestUserMedia(that.mediaConfig)
                        .then(function(stream){
                            that.camera.preview = document.getElementById('localVideo');
                            attachMediaStream(that.camera.preview, stream);
                            that.setLocalStream(stream);
                            that.camera.stream = stream;

                            if (navigator.userAgent.indexOf('OPR') != -1) {
                                that.socket = io.connect(realURL,{transports: ['xhr-polling', 'websocket'], forceNew:true, secure:true});
                            } else {
                                that.socket = io.connect(realURL,{transports: ['websocket'], forceNew:true, secure:true});
                            }

                            that.cameraId = cameraIdValue;

                            var timeObj = new Date();
                            that.sessionId = Util.getCookie("toastcam") + '_' + timeObj.getTime();
//TODO:///////
                            that.socket.on('LoginRequired', function(data) {
                                User.me(function (data) {
                                    if (that.socket) {
                                        socket.emit('login', {
                                            msgid : makeMsgId(),
                                            type : "req",
                                            messageversion : "s-2.0.0",
                                            devicetype : "WEB",
                                            deviceinfo : {
                                                userid : data.userId,
                                                appname : "toastcam_b2c",
                                                appversion : "1.1.1",
                                                browsertype : "chrome",
                                                osversion : "6.0",
                                                sessionid : sessionId
                                            }
                                        });
                                    } else {
                                        $rootScope.$broadcast(audioChat.EVENT_STREAM_DISCONNECTED, {code : 'nosocket'});
                                    }
                                });
                            });

                            socket.on('login', function(data) {
                                console.log('!! receive login - data : ' + JSON.stringify(data));
                                if (data.code == 0) {
                                    if (socket) {
                                        socket.emit('webrtc_request', {
                                            msgid : makeMsgId(),
                                            type : 'req',
                                            scenario : 'voicechat',
                                            from : sessionId,
                                            to : cameraId
                                        });
                                    } else {
                                        $rootScope.$broadcast(audioChat.EVENT_STREAM_DISCONNECTED, {code : 'nosocket'});
                                    }
                                } else {
                                    $rootScope.$broadcast(audioChat.EVENT_STREAM_DISCONNECTED, {code : 'loginfail'});
                                    //Code Define
                                    //: -1 - 유효하지 않은 sessionid인 경우
                                    //: -2 - 서버 내부 에러. (Master에서 client생성 ok가 오지않는 경우)
                                }
                            });

                            socket.on('webrtc_request', function(data) {
                                handleMessageRequest(data);
                            });

                            socket.on('webrtc_signaling', function(data) {
                                handleMessage(data);
                            });
                        })
                        .catch(Error('Failed to get access to local media.'));
                });
            },

            audioChatStop : function(cameraIdValue) {
                if (socket) {
                    socket.disconnect();
                    socket = null;
                }

                var peer = peerDatabase[cameraIdValue];
                if (peer) {
                    peer.pc.close();
                }
                delete peerDatabase[cameraIdValue];

                if (camera.stream && camera.stream.getTracks) {
                    var tracks = camera.stream.getTracks();
                    for( var track in tracks ){
                        if (tracks[track]) {
                            tracks[track].stop();
                        }
                    }
                }
                if (camera.preview) {
                    camera.preview.src = '';
                }
            },

            getId : function() {
                return localId;
            },

            setLocalStream : function(stream) {

                // if local cam has been stopped, remove it from all outgoing streams.
                if(!stream) {
                    for(id in peerDatabase) {
                        pc = peerDatabase[id].pc;
                        if(!!pc.getLocalStreams().length) {
                            pc.removeStream(localStream);
                            //offer(id);
                        }
                    }
                }

                localStream = stream;
            },

            toggleLocalStream : function(remoteId) {
                peer = peerDatabase[remoteId] || addPeer(remoteId);
                toggleLocalStream(peer.pc);
            },

            peerInit : function(remoteId) {
                peer = peerDatabase[remoteId] || addPeer(remoteId);
                send('init', remoteId, null);
            },

            peerRenegociate : function(remoteId) {
                //offer(remoteId);
            },

            send : function(type, payload) {
                if (socket) {
                    socket.emit(type, payload);
                }
            },

            /********** Local Function ***********/
            addPeer : function (remoteId) {
                var peer = new Peer(configValue.peerConnectionConfig, configValue.peerConnectionConstraints);
                peer.pc.onicecandidate = function(event) {
                    if (event.candidate) {
                        if (socket) {
                            socket.emit('webrtc_signaling', {
                                msgid : makeMsgId(),
                                type : 'noti',
                                command : 'candidate',
                                from : Util.getCookie("toastcam"),
                                to : cameraId,
                                payload : {
                                    id : event.candidate.sdpMid,
                                    label : event.candidate.sdpMLineIndex,
                                    candidate : event.candidate.candidate
                                }
                            });
                        }
                    }
                };
                peer.pc.onaddstream = function(event) {
                    attachMediaStream(peer.remoteVideoEl, event.stream);
                    remoteVideosContainer.appendChild(peer.remoteVideoEl);
                    $rootScope.$broadcast(audioChat.EVENT_STREAM_CONNECTED, {});
                };
                peer.pc.onremovestream = function(event) {
                    peer.remoteVideoEl.src = '';
                    remoteVideosContainer.removeChild(peer.remoteVideoEl);
                };
                peer.pc.oniceconnectionstatechange = function(event) {
                    switch(
                        (  event.srcElement // Chrome
                            || event.target   ) // Firefox
                            .iceConnectionState) {
                        case 'disconnected':
                            remoteVideosContainer.removeChild(peer.remoteVideoEl);
                            $rootScope.$broadcast(audioChat.EVENT_STREAM_DISCONNECTED, {code: 'disconnect'});
                            break;
                    }
                };
                peerDatabase[remoteId] = peer;

                return peer;
            },

            answer : function (remoteId) {
                var pc = peerDatabase[remoteId].pc;
                pc.createAnswer(
                    function(sessionDescription) {
                        pc.setLocalDescription(sessionDescription);
                        send('answer', remoteId, sessionDescription);
                    },
                    error
                );
            },

            offer : function (remoteId) {
                var pc = peerDatabase[remoteId].pc;
                pc.createOffer(
                    function(sessionDescription) {
                        pc.setLocalDescription(sessionDescription);
                        //send('offer', remoteId, sessionDescription);
                        console.log('!!! send : audio_chat command(offer), cameraId(' + cameraId + '), sdp(' + JSON.stringify(sessionDescription) + ')');
                        if (socket) {
                            socket.emit('webrtc_signaling', {
                                msgid : makeMsgId(),
                                type : 'noti',
                                command : 'offer',
                                form : Util.getCookie("toastcam"),
                                to : cameraId,
                                payload : sessionDescription
                            });
                        }
                    },
                    error
                );
            },

            handleMessageRequest : function (message) {
                var from = cameraId, pc;

                console.log('!!! received : ' + JSON.stringify(message));

                if (message.code == 0) {
                    configValue.peerConnectionConfig.iceServers = [];
                    var i, len, browserType = Util.getBrowserType();
                    if (message.stunserver) {
                        //for (i = 0, len = message.stunserver.length; i < len; i+=1) {
                        //    configValue.peerConnectionConfig.iceServers.push(message.stunserver[i]);
                        //}
                    }
                    if (message.turnserver) {
                        if (browserType === 'safari' || browserType === 'firefox') {
                            for (i = 0, len = message.turnserver.length; i < len; i+=1) {
                                if (i === 0) {
                                    configValue.peerConnectionConfig.iceServers.push(message.turnserver[i]);
                                    if (configValue.peerConnectionConfig.iceServers[0] && configValue.peerConnectionConfig.iceServers[0].url) {
                                        configValue.peerConnectionConfig.iceServers[0]['urls'] = [];
                                        configValue.peerConnectionConfig.iceServers[0]['urls'].push(configValue.peerConnectionConfig.iceServers[0].url);
                                        delete configValue.peerConnectionConfig.iceServers[0].url;
                                    }
                                } else {
                                    if (configValue.peerConnectionConfig.iceServers[0] && configValue.peerConnectionConfig.iceServers[0].urls) {
                                        configValue.peerConnectionConfig.iceServers[0].urls.push(message.turnserver[i].url);
                                    }
                                }
                            }
                        } else {
                            for (i = 0, len = message.turnserver.length; i < len; i+=1) {
                                configValue.peerConnectionConfig.iceServers.push(message.turnserver[i]);
                            }
                        }
                    }
                    pc = addPeer(from).pc;
                    toggleLocalStream(pc);
                    offer(cameraId);
                } else {
                    $rootScope.$broadcast(audioChat.EVENT_STREAM_DISCONNECTED, {code : message.code});
                }
            },

            handleMessage : function (message) {
                var type = message.command,
                    from = cameraId, pc;

                console.log('!!! received : ' + JSON.stringify(message));

                switch (type) {
                    case 'offer':
                        //pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){}, error);
                        //answer(from);
                        break;
                    case 'answer':
                        pc = peerDatabase[from].pc;
                        var payloadJSON;
                        if (typeof message.payload === 'string') {
                            payloadJSON = JSON.parse(message.payload);
                        } else {
                            payloadJSON = message.payload;
                        }
                        pc.setRemoteDescription(new RTCSessionDescription(payloadJSON), function(){}, error);
                        break;
                    case 'candidate':
                        pc = peerDatabase[from].pc;
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
            },

            send : function(type, to, payload) {
                if (socket) {
                    socket.emit('message', {
                        to: to,
                        type: type,
                        payload: payload
                    });
                } else {
                    $rootScope.$broadcast(audioChat.EVENT_STREAM_DISCONNECTED, {code : 'nosocket'});
                }
            },

            toggleLocalStream : function (pc) {
                if(localStream) {
                    (!!pc.getLocalStreams().length) ? pc.removeStream(localStream) : pc.addStream(localStream);
                }
            },

            error : function (err){
                console.log(err);
            },

            makeMsgId : function () {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 30; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }
        }
    }
</script>