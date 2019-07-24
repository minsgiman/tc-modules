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

### swf

 - download ***dist/resources/vendor/nvp_web_player*** from git repository and copy to your publish directory

 - when create player instance, pass parameter ***coreSwfPath*** and ***skinSwfPath*** according to swf file path
 

<br>
<br>

## Usage

### HTML

Add the element where TOASTCAM Light Player will be created

``` html
<div style="width:540px;height:303px;">
    <div id="player"></div>
</div>
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

 - serialNo: Camera serial number (***mandatory***)
 - elementId: elementId where TOASTCAM Light Player will be created (***mandatory***)
 - startTime: CVR start timestamp - 13 digits (***mandatory***)  
 - endTime: CVR end timestamp - 13 digits (***mandatory***)
 - loop: repeat video (default: true)
 - coreSwfPath: downloaded flash core swf file path (default: '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf')
 - skinSwfPath: downloaded flash skin swf file path (default: '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf')
 - getTokenUrl : Get Token API Url (default: '/biz/cameras/token/')
 - playEventHandler: Player Event Handler (not mandatory)

```javascript
var data = {
    serialNo: 'AZZDSF21312A',
    elementId : 'player',
    startTime : 1563837900000,
    endTime : 1563837903000,
    loop : true,
    coreSwfPath : '/nvp_web_player/LCP_web_player2016082601.swf',
    skinSwfPath : '/nvp_web_player/NVP_web_player_skin_tvcast_white.swf',
    getTokenUrl : '/biz/cameras/token/:serialNo',
    playEventHandler : function (event) {
        console.log('playEventHandler - event.status : ' + event.status); 
        //event.status : 'start', 'finish', 'error'
    }
}

var playerObj = new tcPlayer(data);
```

#### Destroy Instance

```javascript
var playerObj = new tcPlayer(data);
playerObj.destroy();
playerObj = null;
```