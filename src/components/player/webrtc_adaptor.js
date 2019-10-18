import browser from './browser_checker';

if (navigator.mozGetUserMedia) {
    if (!window.RTCPeerConnection) {
        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
            return new mozRTCPeerConnection(pcConfig, pcConstraints);
        };
    }

    if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = mozRTCSessionDescription;
    }

    if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = mozRTCIceCandidate;
    }

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
} else if (navigator.webkitGetUserMedia) {
    if (!window.RTCPeerConnection) {
        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
            return new webkitRTCPeerConnection(pcConfig, pcConstraints);
        };
    }

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
} else if (browser.name === 'Safari' && browser.version === 11) {
    if (!window.RTCPeerConnection) {
        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
            return new safariRTCPeerConnection(pcConfig, pcConstraints);
        };
    }

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
} else if (browser.name !== 'Internet Explorer' && browser.name !== 'Edge') {
    if (browser.name === 'Safari' && browser.version < 11) {
        console.log('webrtc not support safari version');
    } else {
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
}