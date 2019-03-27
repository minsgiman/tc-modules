<template>

</template>

<script>
    import io from 'socket.io-client';

    let webRTC = {},
        camera = {},
        socket = null,
        cameraId,
        dvrId,
        channelId,
        peer,
        webRTCStatus,
        peerDatabase = {},
        localStream,
        sessionId,
        timeoutId,
        webrtcDetectedBrowser,
        webrtcDetectedVersion,
        controlServerUrl = 'https://dev.toastcam.com:8443',
        getUserMedia,
        remoteVideosContainer;

    const mediaConfig = {
        audio:false,
        video: {
            mandatory: {},
            optional: []
        }
    };
    const configValue = {
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

    camera.preview = document.getElementById('localVideo');

    const webrtcClient = {
        EVENT: {
            'STREAM_CONNECTING' : 'stream_connecting',
            'STREAM_CONNECTED' : 'stream_connected',
            'STREAM_DISCONNECTED' : 'stream_disconnected',
            'STREAM_STOPPED' : 'stream_stopped'
        },

        initialize: (param) => {
            console.log('webrtcClient init');
            webrtcClient.webRTCStatusChanged = param.statusListener;
            remoteVideosContainer = document.getElementById(param.elementId);
            browserAPIInit();
        },

        play: (param) => {
            let realURL;

            //TODO: Country Check
            realURL = controlServerUrl;
            if (socket) {
                socket.disconnect();
                socket = null;
                console.log('webRTC socket disconnect');
            }
            webRTCStatus = webrtcClient.EVENT.STREAM_CONNECTING;
            if (navigator.userAgent.indexOf('OPR') != -1) {
                socket = io.connect(realURL,{transports: ['xhr-polling', 'websocket'], forceNew:true, secure:true});
            } else {
                socket = io.connect(realURL,{transports: ['websocket'], forceNew:true, secure:true}); //,
            }

            const cameraInfos = param.cameraId.split("@");
            dvrId = cameraInfos[0];
            channelId = cameraInfos[1];
            const timeObj = new Date();
            sessionId = 'toastcam' + '_' + timeObj.getTime(); //getCookie("toastcam") + '_' + timeObj.getTime();

            socket.on('LoginRequired', function(data) {
                console.log('!! receive LoginRequired');
                //User.me(function (data) {
                if (socket) {
                    socket.emit('login', {
                        msgid : makeMsgId(),
                        type : "req",
                        messageversion : "s-2.0.0",
                        devicetype : "WEB",
                        deviceinfo : {
                            userid : 'toastcam', //TODO: GET Me
                            appname : "toastcam_b2b",
                            appversion : "1.3.12",
                            browsertype : "chrome",
                            osversion : "6.0",
                            sessionid : sessionId
                        }
                    });
                } else {
                    webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
                    webrtcClient.webRTCStatusChanged({
                        status : webRTCStatus,
                        reason : 'nosocket'
                    });
                }
                //});
            });

            socket.on('login', function(data) {
                console.log('!! receive login - data : ' + JSON.stringify(data));
                if (data.code == 0) {
                    if (socket) {
                        if (dvrId && channelId) {
                            socket.emit('webrtc_request', {
                                msgid : makeMsgId(),
                                type : 'req',
                                scenario : 'livestream',
                                channel : channelId,
                                resolution : 'HD',
                                timestamp : param.time,
                                from : sessionId,
                                to : dvrId
                            });
                            if (timeoutId) {
                                clearTimeout(timeoutId);
                            }
                            timeoutId = setTimeout(function() {
                                webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
                                webrtcClient.webRTCStatusChanged({
                                    status : webRTCStatus,
                                    reason : 'timeout'
                                });
                            }, 15 * 1000);
                        } else {
                            webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
                            webrtcClient.webRTCStatusChanged({
                                status : webRTCStatus,
                                reason : 'nocam'
                            });
                        }
                    } else {
                        webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
                        webrtcClient.webRTCStatusChanged({
                            status : webRTCStatus,
                            reason : 'nosocket'
                        });
                    }
                } else {
                    webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
                    webrtcClient.webRTCStatusChanged({
                        status : webRTCStatus,
                        reason : 'loginfail'
                    });
                    //Code Define
                    //: -1 - 유효하지 않은 sessionid인 경우
                    //: -2 - 서버 내부 에러. (Master에서 client생성 ok가 오지않는 경우)
                }
            });

            socket.on('webrtc_request', function(data) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                handleMessageRequest(data);
            });

            socket.on('webrtc_signaling', function(data) {
                handleMessage(data);
            });
        },

        stop: (cameraId) => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }

            var cameraInfos = cameraId.split("@");
            var peer = peerDatabase[cameraInfos[0]];
            if (peer) {
                peer.pc.close();
            }
            delete peerDatabase[cameraInfos[0]];

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
            webRTCStatus = webrtcClient.EVENT.STREAM_STOPPED;
        },

        getStatus: () => {
            return webRTCStatus;
        }
    };

    function makeMsgId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 30; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function addPeer(remoteId) {
        var peer = new Peer(configValue.peerConnectionConfig, configValue.peerConnectionConstraints);
        peer.pc.onicecandidate = function(event) {
            if (event.candidate) {
                if (socket) {
                    var candidateJSON = {
                        msgid : makeMsgId(),
                        type : 'noti',
                        command : 'candidate',
                        from : sessionId,
                        to : dvrId,
                        payload : {
                            id : event.candidate.sdpMid,
                            label : event.candidate.sdpMLineIndex,
                            candidate : event.candidate.candidate
                        }
                    };
                    socket.emit('webrtc_signaling', candidateJSON);
                    console.log('!!! send : ' + JSON.stringify(candidateJSON));
                }
            }
        };
        peer.pc.onaddstream = function(event) {
            console.log('onaddstream!!!!!!');
            attachMediaStream(peer.remoteVideoEl, event.stream);
            remoteVideosContainer.appendChild(peer.remoteVideoEl);
            webRTCStatus = webrtcClient.EVENT.STREAM_CONNECTED;
            webrtcClient.webRTCStatusChanged({
                status : webRTCStatus
            });
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
                    console.log('disconnected!!!!!!');
                    remoteVideosContainer.removeChild(peer.remoteVideoEl);
                    webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
                    webrtcClient.webRTCStatusChanged({
                        status : webRTCStatus,
                        reason : 'discon'
                    });
                    break;
            }
        };
        peerDatabase[remoteId] = peer;

        return peer;
    }

    function offer(remoteId) {
        var pc = peerDatabase[remoteId].pc;
        var constraints = {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        };

        if (navigator.userAgent.indexOf('Safari') != -1) {
            pc.addTransceiver('audio');
            pc.addTransceiver('video');
        }

        pc.createOffer(
            function(sessionDescription) {
                pc.setLocalDescription(sessionDescription);
                //send('offer', remoteId, sessionDescription);
                console.log('!!! send : webrtc command(offer), dvrId(' + dvrId + '), sdp(' + JSON.stringify(sessionDescription) + ')');
                if (socket) {
                    socket.emit('webrtc_signaling', {
                        msgid : makeMsgId(),
                        type : 'noti',
                        command : 'offer',
                        from : sessionId,
                        to : dvrId,
                        payload : sessionDescription
                    });
                }
            },
            error,
            constraints
        );
    }

    function handleMessageRequest (message) {
        var from = dvrId, pc;

        console.log('!!! received : ' + JSON.stringify(message));

        if (message.code == 0) {
            configValue.peerConnectionConfig.iceServers = [];
            var i, len;
            if (message.stunserver) {
                // for (i = 0, len = message.stunserver.length; i < len; i+=1) {
                //     configValue.peerConnectionConfig.iceServers.push(message.stunserver[i]);
                // }
            }
            if (message.turnserver) {
                for (i = 0, len = message.turnserver.length; i < len; i+=1) {
                    configValue.peerConnectionConfig.iceServers.push(message.turnserver[i]);
                }
            }
            pc = addPeer(from).pc;
            offer(dvrId);
        } else {
            webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
            webrtcClient.webRTCStatusChanged({
                status : webRTCStatus,
                reason : 'discon'
            });
        }
    }

    function handleMessage (message) {
        var type = message.command,
            from = dvrId, pc;

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
    }

    function error(err){
        console.log(err);
    }

    function Peer (pcConfig, pcConstraints) {
        this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
        this.remoteVideoEl = document.createElement('video');
        this.remoteVideoEl.controls = false;
        this.remoteVideoEl.autoplay = true;
    }

    function send(type, to, payload) {
        if (socket) {
            socket.emit('message', {
                to: to,
                type: type,
                payload: payload
            });
        } else {
            webRTCStatus = webrtcClient.EVENT.STREAM_DISCONNECTED;
            webrtcClient.webRTCStatusChanged({
                status : webRTCStatus,
                reason : 'discon'
            });
        }
    }

    function mozInit () {
        console.log('This appears to be Firefox');
        webrtcDetectedBrowser = 'firefox';
        webrtcDetectedVersion =
            parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);

        // The RTCPeerConnection object.
        if (!window.RTCPeerConnection) {
            RTCPeerConnection = function(pcConfig, pcConstraints) {
                return new mozRTCPeerConnection(pcConfig, pcConstraints);
            };
        }

        // The RTCSessionDescription object.
        if (!window.RTCSessionDescription) {
            window.RTCSessionDescription = mozRTCSessionDescription;
        }

        // The RTCIceCandidate object.
        if (!window.RTCIceCandidate) {
            window.RTCIceCandidate = mozRTCIceCandidate;
        }

        // getUserMedia shim (only difference is the prefix).
        // Code from Adam Barth.
        getUserMedia = navigator.mozGetUserMedia.bind(navigator);
        navigator.getUserMedia = getUserMedia;

        // Creates ICE server from the URL for FF.
        window.createIceServer = function(url, username, password) {
            var iceServer = null;
            var urlParts = url.split(':');
            if (urlParts[0].indexOf('stun') === 0) {
                // Create ICE server with STUN URL.
                iceServer = {
                    'url': url
                };
            } else if (urlParts[0].indexOf('turn') === 0) {
                if (webrtcDetectedVersion < 27) {
                    // Create iceServer with turn url.
                    // Ignore the transport parameter from TURN url for FF version <=27.
                    var turnUrlParts = url.split('?');
                    // Return null for createIceServer if transport=tcp.
                    if (turnUrlParts.length === 1 ||
                        turnUrlParts[1].indexOf('transport=udp') === 0) {
                        iceServer = {
                            'url': turnUrlParts[0],
                            'credential': password,
                            'username': username
                        };
                    }
                }  else {
                    // FF 27 and above supports transport parameters in TURN url,
                    // So passing in the full url to create iceServer.
                    iceServer = {
                        'url': url,
                        'credential': password,
                        'username': username
                    };
                }
            }
            return iceServer;
        };

        window.createIceServers = function(urls, username, password) {
            var iceServers = [];
            // Use .url for FireFox.
            for (var i = 0; i < urls.length; i++) {
                var iceServer =
                    window.createIceServer(urls[i], username, password);
                if (iceServer !== null) {
                    iceServers.push(iceServer);
                }
            }
            return iceServers;
        };

        // Attach a media stream to an element.
        window.attachMediaStream = function(element, stream) {
            if (typeof element.srcObject !== 'undefined') {
                element.srcObject = stream;
            } else if (typeof element.mozSrcObject !== 'undefined') {
                element.mozSrcObject = stream;
            } else if (typeof element.src !== 'undefined') {
                element.src = URL.createObjectURL(stream);
            } else {
                console.log('Error attaching stream to element.');
            }
        };

        window.reattachMediaStream = function(to, from) {
            console.log('Reattaching media stream');
            to.src = from.src;
        };
    }

    function webkitInit() {
        console.log('This appears to be Chrome');

        webrtcDetectedBrowser = 'chrome';
        // Temporary fix until crbug/374263 is fixed.
        // Setting Chrome version to 999, if version is unavailable.
        var result = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (result !== null) {
            webrtcDetectedVersion = parseInt(result[2], 10);
        } else {
            webrtcDetectedVersion = 999;
        }

        // Creates iceServer from the url for Chrome M33 and earlier.
        window.createIceServer = function(url, username, password) {
            var iceServer = null;
            var urlParts = url.split(':');
            if (urlParts[0].indexOf('stun') === 0) {
                // Create iceServer with stun url.
                iceServer = {
                    'url': url
                };
            } else if (urlParts[0].indexOf('turn') === 0) {
                // Chrome M28 & above uses below TURN format.
                iceServer = {
                    'url': url,
                    'credential': password,
                    'username': username
                };
            }
            return iceServer;
        };

        // Creates an ICEServer object from multiple URLs.
        window.createIceServers = function(urls, username, password) {
            return {
                'urls': urls,
                'credential': password,
                'username': username
            };
        };

        // The RTCPeerConnection object.
        RTCPeerConnection = function(pcConfig, pcConstraints) {
            return new webkitRTCPeerConnection(pcConfig, pcConstraints);
        };

        // Get UserMedia (only difference is the prefix).
        // Code from Adam Barth.
        getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
        navigator.getUserMedia = getUserMedia;

        // Attach a media stream to an element.
        window.attachMediaStream = function(element, stream) {
            if (typeof element.srcObject !== 'undefined') {
                element.srcObject = stream;
            } else if (typeof element.mozSrcObject !== 'undefined') {
                element.mozSrcObject = stream;
            } else if (typeof element.src !== 'undefined') {
                element.src = URL.createObjectURL(stream);
            } else {
                console.log('Error attaching stream to element.');
            }
        };

        window.reattachMediaStream = function(to, from) {
            to.src = from.src;
        };
    }

    function safariInit () {
        console.log('This appears to be Safari');

        safariRTCPeerConnection = RTCPeerConnection;

        webrtcDetectedBrowser = 'safari';
        // Temporary fix until crbug/374263 is fixed.
        // Setting Chrome version to 999, if version is unavailable.
        var result = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (result !== null) {
            webrtcDetectedVersion = parseInt(result[2], 10);
        } else {
            webrtcDetectedVersion = 999;
        }

        // Creates iceServer from the url for Chrome M33 and earlier.
        window.createIceServer = function(url, username, password) {
            var iceServer = null;
            var urlParts = url.split(':');
            if (urlParts[0].indexOf('stun') === 0) {
                // Create iceServer with stun url.
                iceServer = {
                    'url': url
                };
            } else if (urlParts[0].indexOf('turn') === 0) {
                // Chrome M28 & above uses below TURN format.
                iceServer = {
                    'url': url,
                    'credential': password,
                    'username': username
                };
            }
            return iceServer;
        };

        // Creates an ICEServer object from multiple URLs.
        window.createIceServers = function(urls, username, password) {
            return {
                'urls': urls,
                'credential': password,
                'username': username
            };
        };

        // The RTCPeerConnection object.
        RTCPeerConnection = function(pcConfig, pcConstraints) {
            return new safariRTCPeerConnection(pcConfig, pcConstraints);
        };

        // Attach a media stream to an element.
        window.attachMediaStream = function(element, stream) {
            if (typeof element.srcObject !== 'undefined') {
                element.srcObject = stream;
            } else if (typeof element.mozSrcObject !== 'undefined') {
                element.mozSrcObject = stream;
            } else if (typeof element.src !== 'undefined') {
                element.src = URL.createObjectURL(stream);
            } else {
                console.log('Error attaching stream to element.');
            }
        };

        window.reattachMediaStream = function(to, from) {
            to.src = from.src;
        };
    }

    function browserAPIInit () {
        webrtcDetectedBrowser = null;
        webrtcDetectedVersion = null;

        if (navigator.mozGetUserMedia) {
            mozInit();
        } else if (navigator.webkitGetUserMedia) {
            webkitInit();
        } else if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Version/11') != -1) {
            safariInit();
        } else {
            console.log('Browser does not appear to be WebRTC-capable');
        }
    }

    function getCookie(cName) {
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

    export default webrtcClient;
</script>

<style>

</style>