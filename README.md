## Install

### script

#### (npm)

```sh
$ npm install --save https://github.com/nhn/toastcam_player_light.git
```

#### (script tag)

download ***dist/tc.player.min.js*** from git repository and copy to your publish directory

```sh
<script src="tc.player.min.js"></script>
```
 

<br>
<br>

## Usage

### HTML

Add the element where TOASTCAM Light Player will be created

``` html
<div id="player" style="width:640px; height:360px;"></div>
```

### Javascript
#### Load
The TOASTCAM Light Player can be used by creating an instance with the constructor function. To access the constructor function, import the module using one of the three following methods depending on your environment.

```javascript
var tcPlayer = toastcam.lPlayer; /* namespace */
```
```javascript
var tcPlayer = require('toastcam-player-light'); /* CommonJS */
```
```javascript
import tcPlayer from 'toastcam-player-light'; /* ES6 */
```

#### Create Instance

The TOASTCAM Light Player needs following parameters

 - serialNo: Camera serial number
 - elementId: elementId where TOASTCAM Light Player will be created (***mandatory***)
 - startTime: CVR start timestamp - 13 digits (if not set this param, play live mode)  
 - endTime: CVR end timestamp - 13 digits
 - loop: repeat video (default: true)
 - showTime: show timer (default : false)
 - usePauseResume: show Pause Resume Button. if want to use it, showTime should be set to true (default : false)
 - credentialUrl: WebRTC credential API Url (default : '/rtc/credential')
 - candidateUrl: WebRTC candidate API Url (default : '/rtc/candidate') 
 - offerUrl: WebRTC offer API Url (default: '/rtc/offer') 
 - getTokenUrl : Get Token API Url (default: '/biz/cameras/token/:serialNo')
 - playEventHandler: Player Event Handler (not mandatory)

```javascript
var data = {
    serialNo: 'AZZDSF21312A',
    elementId : 'player',
    startTime : 1563837900000,
    endTime : 1563837903000,
    loop : true,
    showTime : true,
    usePauseResume: true,
    credentialUrl: '/rtc/credential',
    candidateUrl: '/rtc/candidate',
    offerUrl: '/rtc/offer',
    getTokenUrl : '/biz/cameras/token/:serialNo',
    playEventHandler : function (event) {
        console.log('playEventHandler - event.status : ' + event.status);
        //event.status : 'stream_connected', 'webrtc_server_error', 'finish', 'webrtc_not_support_browser'
        // 'stream_connected' -> webRTC connected. play will start
        // 'webrtc_server_error' -> webRTC API error
        // 'finish' -> play end
        // 'webrtc_not_support_browser' -> browser does not support webrtc
    }
}

var playerObj = new tcPlayer(data);
```

<br>

#### Replay Method

replay cvr video method. if not set startTime and endTime, replay original startTime and endTime 

 - method : replay(startTime, endTime)

```javascript
/* Example */
var data = {
    ...
    ...
    playEventHandler : function (event) {
        if (event.status === 'finish') {
            playerObj.replay(1563837910000, 1563837923000);
            //playerObj.replay();
        }
    }
}

var playerObj = new tcPlayer(data);
```

<br>

#### Destroy Instance

```javascript
var playerObj = new tcPlayer(data);
playerObj.destroy();
playerObj = null;
```


