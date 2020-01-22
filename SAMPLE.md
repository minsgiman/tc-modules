# Player Examples

<br>

## Event Play Example

### 1. Fetch Data

 Fetch event start & end time and camera serial number from your domain api

    /* Fetching ... */
    const eventStartTime = response.event.startTime,
          eventEndTime = response.event.endTime,
          serialNumber = response.camera.serialNo;
               
### 2. Create player

 Create event player with fetched data (serialNumber, eventStartTime, eventEndTime)

    const data = {
        serialNo: serialNumber, //'BC8AA30000B1'
        startTime : eventStartTime, //1578322740915
        endTime : eventEndTime, //1578322745915,
        elementId : 'player',
        cvrJumpInterval : 5000,
        useControl : true,
        showTime : true,
        credentialUrl: ${rtcCredentialUsingGET},    /* your domain WebRTC credential API (default : '/rtc/credential') */ 
        candidateUrl: ${rtcCandidateUsingPOST},     /* your domain WebRTC candidate API (default : '/rtc/candidate') */
        offerUrl: ${rtcOfferUsingPOST},             /* your domain WebRTC offer API (default : '/rtc/offer') */
        getTokenUrl : ${getTokenUsingGET},          /* your domain get token API (default: '/biz/cameras/token/:serialNo') */
        getTimelineUrl : ${getCameraVideoUsingGET}, /* your domain get video API (default: '/biz/cameras/:serialNo/video') */
        playEventHandler : (event) => {
            console.log('playEventHandler - event.status : ' + event.status);
        }
    };
    let playerObj = new ToastCamPlayer(data);
        
### 3. Destroy player after play

    playerObj.destroy();
    playerObj = null;
    
<br><br>

## Live Play Example

### 1. Fetch Data

 Fetch camera serial number from your domain api

    /* Fetching ... */
    const serialNumber = response.camera.serialNo;
               
### 2. Create player

 Create live player with fetched data (serialNumber)

    const data = {
        serialNo: serialNumber, //'BC8AA30000B1'
        elementId : 'player',
        useControl : true,
        showTime : true,
        credentialUrl: ${rtcCredentialUsingGET},    /* your domain WebRTC credential API (default : '/rtc/credential') */ 
        candidateUrl: ${rtcCandidateUsingPOST},     /* your domain WebRTC candidate API (default : '/rtc/candidate') */
        offerUrl: ${rtcOfferUsingPOST},             /* your domain WebRTC offer API (default : '/rtc/offer') */
        getTokenUrl : ${getTokenUsingGET},          /* your domain get token API (default: '/biz/cameras/token/:serialNo') */
        playEventHandler : (event) => {
            console.log('playEventHandler - event.status : ' + event.status);
        }
    };
    let playerObj = new ToastCamPlayer(data);
        
### 3. Destroy player after play

    playerObj.destroy();
    playerObj = null;
    