<template>
    <div class="player_cam" id="player"></div>
</template>

<script>
    // Returns the result of getUserMedia as a Promise.
    function requestUserMedia(constraints) {
        return new Promise(function(resolve, reject) {
            var onSuccess = function(stream) {
                resolve(stream);
            };
            var onError = function(error) {
                reject(error);
            };

            try {
                //getUserMedia(constraints, onSuccess, onError);
            } catch (e) {
                reject(e);
            }
        });
    }

    export default {
        name : 'webrtcPlayer',
        props : [],
        computed : {
            // currentCamera: function () {
            //     return store.state.cameraData;
            // }
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
                socket : null,
                webRTCConfig : {   //configValue
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
                dvrId : '',
                channelId : '',
                peer : null,
                webRTCStatus : '',
                peerDatabase : {},
                localStream : null,
                sessionId : '',
                timeoutId : null,
                remoteVideoContainer : null,
                webRTCStatusEnum : {
                    EVENT_STREAM_CONNECTING : 'event_stream_connecting',
                    EVENT_STREAM_CONNECTED : 'event_stream_connected',
                    EVENT_STREAM_DISCONNECTED : 'event_stream_disconnected',
                    EVENT_STREAM_STOPPED : 'event_stream_stopped'
                }
            }
        },
        created : function() {
            videoStreamObj.preview = document.getElementById('localVideo');
        },
        mounted : function() {
        },
        beforeDestroy : function() {
        },
        methods : {
            play : function() {
            },

            pause : function() {
            },

            stop : function() {
            },

            getWebRTCStatus : function () {
                return this.webRTCStatus;
            },

            setLocalStream : function(stream) {
                var id, pc;
                // if local cam has been stopped, remove it from all outgoing streams.
                if(!stream) {
                    for(id in this.peerDatabase) {
                        pc = this.peerDatabase[id].pc;
                        if(!!pc.getLocalStreams().length) {
                            pc.removeStream(localStream);
                            //offer(id);
                        }
                    }
                }

                this.localStream = stream;
            },

            toggleLocalStream : function(remoteId) {
                peer = this.peerDatabase[remoteId] || this.addPeer(remoteId);
            },
        }
    }


    // webRTC.webRTCStart = function(cameraIdValue, timestamp) {
    //     var realURL;
    //     if ($rootScope.me && $rootScope.me.country === 'JP') {
    //         realURL = controlServerJpUrl;
    //     } else {
    //         realURL = controlServerUrl;
    //     }
    //     if (socket) {
    //         socket.disconnect();
    //         socket = null;
    //         console.log('webRTC socket disconnect');
    //     }
    //     webRTCStatus = webRTC.EVENT_STREAM_CONNECTING;
    //
    //     if (navigator.userAgent.indexOf('OPR') != -1) {
    //         socket = io.connect(realURL,{transports: ['xhr-polling', 'websocket'], forceNew:true, secure:true});
    //     } else {
    //         socket = io.connect(realURL,{transports: ['websocket'], forceNew:true, secure:true}); //,
    //     }
    //
    //     var cameraInfos = cameraIdValue.split("@");
    //     dvrId = cameraInfos[0];
    //     channelId = cameraInfos[1];
    //
    //     var timeObj = new Date();
    //     sessionId = Util.getCookie("toastcam") + '_' + timeObj.getTime();
    //
    //     // socket.on('connect_error', function(){
    //     //     if (socket) {
    //     //         socket.disconnect();
    //     //         socket = null;
    //     //         console.log('webRTC socket disconnect');
    //     //     }
    //     // });
    //
    //     socket.on('LoginRequired', function(data) {
    //         console.log('!! receive LoginRequired');
    //         User.me(function (data) {
    //             if (socket) {
    //                 socket.emit('login', {
    //                     msgid : makeMsgId(),
    //                     type : "req",
    //                     messageversion : "s-2.0.0",
    //                     devicetype : "WEB",
    //                     deviceinfo : {
    //                         userid : data.userId,
    //                         appname : "toastcam_b2b",
    //                         appversion : "1.3.12",
    //                         browsertype : "chrome",
    //                         osversion : "6.0",
    //                         sessionid : sessionId
    //                     }
    //                 });
    //             } else {
    //                 webRTCStatus = webRTC.EVENT_STREAM_DISCONNECTED;
    //                 $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {code : 'nosocket'});
    //             }
    //         });
    //     });
    //
    //     socket.on('login', function(data) {
    //         console.log('!! receive login - data : ' + JSON.stringify(data));
    //         if (data.code == 0) {
    //             if (socket) {
    //                 if (dvrId && channelId) {
    //                     socket.emit('webrtc_request', {
    //                         msgid : makeMsgId(),
    //                         type : 'req',
    //                         scenario : 'livestream',
    //                         channel : channelId,
    //                         resolution : 'HD',
    //                         timestamp : timestamp,
    //                         from : sessionId,
    //                         to : dvrId
    //                     });
    //                     if (timeoutId) {
    //                         clearTimeout(timeoutId);
    //                     }
    //                     timeoutId = setTimeout(function() {
    //                         $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {code : 'timeout'});
    //                     }, 15 * 1000);
    //                 } else {
    //                     webRTCStatus = webRTC.EVENT_STREAM_DISCONNECTED;
    //                     $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {code : 'nocamera'});
    //                 }
    //             } else {
    //                 webRTCStatus = webRTC.EVENT_STREAM_DISCONNECTED;
    //                 $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {code : 'nosocket'});
    //             }
    //         } else {
    //             webRTCStatus = webRTC.EVENT_STREAM_DISCONNECTED;
    //             $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {code : 'loginfail'});
    //             //Code Define
    //             //: -1 - 유효하지 않은 sessionid인 경우
    //             //: -2 - 서버 내부 에러. (Master에서 client생성 ok가 오지않는 경우)
    //         }
    //     });
    //
    //     socket.on('webrtc_request', function(data) {
    //         if (timeoutId) {
    //             clearTimeout(timeoutId);
    //             timeoutId = null;
    //         }
    //         handleMessageRequest(data);
    //     });
    //
    //     socket.on('webrtc_signaling', function(data) {
    //         handleMessage(data);
    //     });
    // };
    //
    // webRTC.webRTCStop = function(cameraIdValue) {
    //     if (socket) {
    //         socket.disconnect();
    //         socket = null;
    //     }
    //
    //     var cameraInfos = cameraIdValue.split("@");
    //     var peer = peerDatabase[cameraInfos[0]];
    //     if (peer) {
    //         peer.pc.close();
    //     }
    //     delete peerDatabase[cameraInfos[0]];
    //
    //     if (camera.stream && camera.stream.getTracks) {
    //         var tracks = camera.stream.getTracks();
    //         for( var track in tracks ){
    //             if (tracks[track]) {
    //                 tracks[track].stop();
    //             }
    //         }
    //     }
    //     if (camera.preview) {
    //         camera.preview.src = '';
    //     }
    //     webRTCStatus = webRTC.EVENT_STREAM_STOPPED;
    // };
    //
    // webRTC.setLocalStream = function(stream) {
    //
    //     // if local cam has been stopped, remove it from all outgoing streams.
    //     if(!stream) {
    //         for(id in peerDatabase) {
    //             pc = peerDatabase[id].pc;
    //             if(!!pc.getLocalStreams().length) {
    //                 pc.removeStream(localStream);
    //                 //offer(id);
    //             }
    //         }
    //     }
    //
    //     localStream = stream;
    // };
    //
    // webRTC.toggleLocalStream = function(remoteId) {
    //     peer = peerDatabase[remoteId] || addPeer(remoteId);
    //     toggleLocalStream(peer.pc);
    // };
    //
    // webRTC.peerInit = function(remoteId) {
    //     peer = peerDatabase[remoteId] || addPeer(remoteId);
    //     send('init', remoteId, null);
    // };
    //
    // webRTC.peerRenegociate = function(remoteId) {
    //     //offer(remoteId);
    // };
    //
    // webRTC.send = function(type, payload) {
    //     if (socket) {
    //         socket.emit(type, payload);
    //     }
    // };
    //
    // /********** Local Function ***********/
    // function startStream() {
    //     return requestUserMedia(mediaConfig)
    //         .then(function(stream){
    //             attachMediaStream(camera.preview, stream);
    //             webRTC.setLocalStream(stream);
    //             camera.stream = stream;
    //         })
    //         .catch(Error('Failed to get access to local media.'));
    // }
    //
    // function callStream(stream, callback){
    //     /* If json isn't loaded yet, construct a new stream
    //      * This happens when you load <serverUrl>/<socketId> :
    //      * it calls socketId immediatly.
    //      **/
    //     if(!stream.id){
    //         stream = {id: stream, isPlaying: false};
    //     }
    //     startStream()
    //         .then(function(result) {
    //             webRTC.toggleLocalStream(stream.id);
    //             if(stream.isPlaying){
    //                 webRTC.peerRenegociate(stream.id);
    //             } else {
    //                 webRTC.peerInit(stream.id);
    //             }
    //             stream.isPlaying = !stream.isPlaying;
    //             callback();
    //         })
    //         .catch(function(err) {
    //             console.log(err);
    //         });
    // };
    //
    // function addPeer(remoteId) {
    //     var peer = new Peer(configValue.peerConnectionConfig, configValue.peerConnectionConstraints);
    //     peer.pc.onicecandidate = function(event) {
    //         if (event.candidate) {
    //             if (socket) {
    //                 var candidateJSON = {
    //                     msgid : makeMsgId(),
    //                     type : 'noti',
    //                     command : 'candidate',
    //                     from : sessionId,
    //                     to : dvrId,
    //                     payload : {
    //                         id : event.candidate.sdpMid,
    //                         label : event.candidate.sdpMLineIndex,
    //                         candidate : event.candidate.candidate
    //                     }
    //                 };
    //                 socket.emit('webrtc_signaling', candidateJSON);
    //                 console.log('!!! send : ' + JSON.stringify(candidateJSON));
    //             }
    //         }
    //     };
    //     if (Util.getBrowserType() === 'firefox') {
    //         peer.pc.ontrack = function(event) {
    //             console.log('ontrack!!!!!!');
    //             attachMediaStream(peer.remoteVideoEl, event.streams[0]);
    //             remoteVideosContainer.appendChild(peer.remoteVideoEl);
    //             webRTCStatus = webRTC.EVENT_STREAM_CONNECTED;
    //             $rootScope.$broadcast(webRTC.EVENT_STREAM_CONNECTED, {});
    //         };
    //     } else {
    //         peer.pc.onaddstream = function(event) {
    //             console.log('onaddstream!!!!!!');
    //             attachMediaStream(peer.remoteVideoEl, event.stream);
    //             remoteVideosContainer.appendChild(peer.remoteVideoEl);
    //             webRTCStatus = webRTC.EVENT_STREAM_CONNECTED;
    //             $rootScope.$broadcast(webRTC.EVENT_STREAM_CONNECTED, {});
    //         };
    //     }
    //     peer.pc.onremovestream = function(event) {
    //         peer.remoteVideoEl.src = '';
    //         remoteVideosContainer.removeChild(peer.remoteVideoEl);
    //     };
    //     peer.pc.oniceconnectionstatechange = function(event) {
    //         switch(
    //             (  event.srcElement // Chrome
    //                 || event.target   ) // Firefox
    //                 .iceConnectionState) {
    //             case 'disconnected':
    //                 console.log('disconnected!!!!!!');
    //                 remoteVideosContainer.removeChild(peer.remoteVideoEl);
    //                 webRTCStatus = webRTC.EVENT_STREAM_DISCONNECTED;
    //                 $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {});
    //                 break;
    //         }
    //     };
    //     peerDatabase[remoteId] = peer;
    //
    //     return peer;
    // }
    // function answer(remoteId) {
    //     var pc = peerDatabase[remoteId].pc;
    //     pc.createAnswer(
    //         function(sessionDescription) {
    //             pc.setLocalDescription(sessionDescription);
    //             send('answer', remoteId, sessionDescription);
    //         },
    //         error
    //     );
    // }
    // function offer(remoteId) {
    //     var pc = peerDatabase[remoteId].pc;
    //     var constraints;
    //     if (webrtcDetectedBrowser === 'firefox') {
    //         constraints = { offerToReceiveVideo: 1, offerToReceiveAudio: 1 }
    //     } else {
    //         constraints = {
    //             optional: [],
    //             mandatory: {
    //                 OfferToReceiveAudio: true,
    //                 OfferToReceiveVideo: true
    //             }
    //         };
    //     }
    //
    //     if (Util.getBrowserType() === 'safari') {
    //         pc.addTransceiver('audio');
    //         pc.addTransceiver('video');
    //     }
    //
    //     pc.createOffer(
    //         function(sessionDescription) {
    //             pc.setLocalDescription(sessionDescription);
    //             //send('offer', remoteId, sessionDescription);
    //             console.log('!!! send : webrtc command(offer), dvrId(' + dvrId + '), sdp(' + JSON.stringify(sessionDescription) + ')');
    //             if (socket) {
    //                 socket.emit('webrtc_signaling', {
    //                     msgid : makeMsgId(),
    //                     type : 'noti',
    //                     command : 'offer',
    //                     from : sessionId,
    //                     to : dvrId,
    //                     payload : sessionDescription
    //                 });
    //             }
    //         },
    //         error,
    //         constraints
    //     );
    // }
    //
    // function handleMessageRequest (message) {
    //     var from = dvrId, pc;
    //
    //     console.log('!!! received : ' + JSON.stringify(message));
    //
    //     if (message.code == 0) {
    //         configValue.peerConnectionConfig.iceServers = [];
    //         var i, len;
    //         if (message.stunserver) {
    //             // for (i = 0, len = message.stunserver.length; i < len; i+=1) {
    //             //     configValue.peerConnectionConfig.iceServers.push(message.stunserver[i]);
    //             // }
    //         }
    //         if (message.turnserver) {
    //             if (Util.getBrowserType() === 'firefox') {
    //                 for (i = 0, len = message.turnserver.length; i < len; i+=1) {
    //                     if (i === 0) {
    //                         configValue.peerConnectionConfig.iceServers.push(message.turnserver[i]);
    //                         if (configValue.peerConnectionConfig.iceServers[0] && configValue.peerConnectionConfig.iceServers[0].url) {
    //                             configValue.peerConnectionConfig.iceServers[0]['urls'] = [];
    //                             configValue.peerConnectionConfig.iceServers[0]['urls'].push(configValue.peerConnectionConfig.iceServers[0].url);
    //                             delete configValue.peerConnectionConfig.iceServers[0].url;
    //                         }
    //                     } else {
    //                         if (configValue.peerConnectionConfig.iceServers[0] && configValue.peerConnectionConfig.iceServers[0].urls) {
    //                             configValue.peerConnectionConfig.iceServers[0].urls.push(message.turnserver[i].url);
    //                         }
    //                     }
    //                 }
    //             } else {
    //                 for (i = 0, len = message.turnserver.length; i < len; i+=1) {
    //                     configValue.peerConnectionConfig.iceServers.push(message.turnserver[i]);
    //                 }
    //             }
    //         }
    //         pc = addPeer(from).pc;
    //         toggleLocalStream(pc);
    //         offer(dvrId);
    //     } else {
    //         webRTCStatus = webRTC.EVENT_STREAM_DISCONNECTED;
    //         $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {code : message.code});
    //     }
    // }
    //
    // function handleMessage (message) {
    //     var type = message.command,
    //         from = dvrId, pc;
    //
    //     console.log('!!! received : ' + JSON.stringify(message));
    //
    //     switch (type) {
    //         case 'offer':
    //             //pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){}, error);
    //             //answer(from);
    //             break;
    //         case 'answer':
    //             pc = peerDatabase[from].pc;
    //             var payloadJSON;
    //             if (typeof message.payload === 'string') {
    //                 payloadJSON = JSON.parse(message.payload);
    //             } else {
    //                 payloadJSON = message.payload;
    //             }
    //             pc.setRemoteDescription(new RTCSessionDescription(payloadJSON), function(){}, error);
    //             break;
    //         case 'candidate':
    //             pc = peerDatabase[from].pc;
    //             if(pc.remoteDescription) {
    //                 var candidateJSON;
    //                 if (typeof message.payload === 'string') {
    //                     candidateJSON = JSON.parse(message.payload);
    //                 } else {
    //                     candidateJSON = message.payload;
    //                 }
    //                 pc.addIceCandidate(new RTCIceCandidate({
    //                     sdpMLineIndex: candidateJSON.label,
    //                     sdpMid: candidateJSON.id,
    //                     candidate: candidateJSON.candidate
    //                 }), function(){}, error);
    //             }
    //             break;
    //     }
    // }
    //
    // function send(type, to, payload) {
    //     if (socket) {
    //         socket.emit('message', {
    //             to: to,
    //             type: type,
    //             payload: payload
    //         });
    //     } else {
    //         webRTCStatus = webRTC.EVENT_STREAM_DISCONNECTED;
    //         $rootScope.$broadcast(webRTC.EVENT_STREAM_DISCONNECTED, {code : 'nosocket'});
    //     }
    // }
    //
    // function toggleLocalStream(pc) {
    //     // if(localStream) {
    //     //     (!!pc.getLocalStreams().length) ? pc.removeStream(localStream) : pc.addStream(localStream);
    //     // }
    // }
    //
    // function error(err){
    //     console.log(err);
    // }
    //
    // function Peer (pcConfig, pcConstraints) {
    //     this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
    //     this.remoteVideoEl = document.createElement('video');
    //     this.remoteVideoEl.controls = false;
    //     this.remoteVideoEl.autoplay = true;
    // }
    //
    // function makeMsgId() {
    //     var text = "";
    //     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //
    //     for (var i = 0; i < 30; i++)
    //         text += possible.charAt(Math.floor(Math.random() * possible.length));
    //
    //     return text;
    // }
</script>

<style lang="less">
    #player {
    }
</style>


