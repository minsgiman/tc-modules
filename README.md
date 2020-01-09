## Install

#### 1. Download

download SDK ***(tc.player.min.js)*** from "https://dev-bizcam.toast.com/openapi/"

#### 2. Copy & Paste

copy ***tc.player.min.js*** to your appropriate library directory

<br><br>

## Import

#### 1. Import script manually

```sh
<script src="library/tc.player.min.js"></script>
```
 
<br><br>

## Usage

### HTML

Add the element where TOASTCAM Light Player will be created

``` html
<div id="player" style="width:640px; height:360px;"></div>
```

### Javascript
#### 1. Get Class
The TOASTCAM Light Player can be used by creating an instance with the constructor function.

```javascript
const ToastCamPlayer = toastcam.lPlayer; /* namespace */
```

#### 2. Create Instance

The TOASTCAM Light Player needs following parameters

 - serialNo: Camera serial number (***mandatory***)
 - elementId: elementId where TOASTCAM Light Player will be created (***mandatory***)
 - startTime: CVR start timestamp - 13 digits (if not set this param, play live mode)  
 - endTime: CVR end timestamp - 13 digits
 - useControl : If set 'useControl' true, you can use control buttons (play, pause, forward, backward). When click play area, control layer show up (default: false)
 - cvrJumpInterval : CVR jump interval when click forward & backward button. if use this option, 'useControl' option should be true previously (default: 5000)
 - showTime: show play timer (default : false)
 - loop: repeat video (default: true)
 - credentialUrl: WebRTC credential API Url (default : '/rtc/credential')
 - candidateUrl: WebRTC candidate API Url (default : '/rtc/candidate') 
 - offerUrl: WebRTC offer API Url (default: '/rtc/offer') 
 - getTokenUrl : Get Token API Url (default: '/biz/cameras/token/:serialNo')
 - getTimelineUrl : Get Timeline API Url (default: '/biz/cameras/:serialNo/video')
 - playEventHandler: Player Event Handler (not mandatory)

```javascript
const data = {
    serialNo: 'BC8AA30000B1',
    elementId : 'player',
    startTime : 1578322740915,
    endTime : 1578322745915,
    cvrJumpInterval : 5000,
    useControl : true,
    showTime : true,
    loop : true,
    credentialUrl: '/rtc/credential', 
    candidateUrl: '/rtc/candidate',
    offerUrl: '/rtc/offer',
    getTokenUrl : '/biz/cameras/token/:serialNo',
    getTimelineUrl : '/biz/cameras/:serialNo/video',
    playEventHandler : function (event) {
        console.log('playEventHandler - event.status : ' + event.status);
        //event.status : 'stream_connected', 'webrtc_server_error', 'finish', 'webrtc_not_support_browser', 'no_cvr'
        // 'stream_connected' -> webRTC connected. play will start
        // 'webrtc_server_error' -> webRTC API error
        // 'finish' -> play end
        // 'webrtc_not_support_browser' -> browser does not support webrtc
        // 'no_cvr' -> 'cvr record not exist'
    }
};

let playerObj = new ToastCamPlayer(data);
```

<br>

#### 3. Replay Method

replay cvr video method. if not set startTime and endTime, replay original startTime and endTime 

 - method : replay(startTime, endTime)

```javascript
/* Example */
const data = {
    ...
    ...
    playEventHandler : function (event) {
        if (event.status === 'finish') {
            playerObj.replay(1563837910000, 1563837923000);
            //playerObj.replay();
        }
    }
};

let playerObj = new ToastCamPlayer(data);
```

<br>

#### 4. Destroy Instance

```javascript
let playerObj = new ToastCamPlayer(data);
playerObj.destroy();
playerObj = null;
```


