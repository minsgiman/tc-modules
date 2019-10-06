## Install

### script

#### (npm)

```sh
$ npm install --save toastcam-components
```

#### (script tag)

download ***dist/api.min.js*** from git repository and copy to your publish directory

```sh
<script src="api.min.js"></script>
```

<br>
<br>

## Usage

### HTML

Add the element where component will be created

``` html
<div id="componentId"></div>
```

### Javascript
#### Load
To access the constructor function, import the module using one of the three following methods depending on your environment.

```javascript
var toggleConstructor = tcam.toggle; /* namespace */
```
```javascript
var toggleConstructor = require('toastcam-components/toggle'); /* CommonJS */
```
```javascript
import { toggle as toggleConstructor } from 'toastcam-components'; /* ES6 */
```

#### Create Instance

```javascript
/* Toggle */
function toggleHandler (data) {
    console.log('event : ' + data.event); //event : toggle
    console.log('isOn : ' + data.isOn); //isOn : true
}

const toggleComponent = tCam.toggle({
    elId: "componentId",
    eventHandler: toggleHandler
});
component.setData('isOn', true);
```

```javascript
/* Timeselect */
function timeselectHandler (data) {
    console.log('event : ' + data.event); //event : timechange
    console.log('hour : ' + data.hour); //hour : 8
    console.log('min : ' + data.min); //min : 35
}

const timeselectComponent = tCam.timeselect({
    elId: "componentId",
    eventHandler: timeselectHandler
});
timeselectComponent.setTime(6, 38);
const timeObj = timeselectComponent.getTime(); //timeObj = {hour: 6, min: 38}
const timeStr = timeselectComponent.getTimeStr(); //timeStr = "06:38"
```

```javascript
/* Daycheck */
function daycheckHandler (data) {
    console.log('event : ' + data.event); //event : checkchange
    console.log('checkMap : ' + data.checkMap); 
    /* checkMap : {
          'MON' : true,
          'TUE' : false,
          'WED' : false,
          'THU' : false,
          'FRI' : false,
          'SAT' : false,
          'SUN' : false
      }
    */
}

const daycheckComponent = tCam.daycheck({
    elId: "componentId",
    eventHandler: daycheckHandler
});
daycheckComponent.setCheckMap({
    'MON' : true,
    'TUE' : false,
    'WED' : false,
    'THU' : false,
    'FRI' : false,
    'SAT' : false,
    'SUN' : false
});
const checkMap = daycheckComponent.getCheckMap();
/* checkMap : {
      'MON' : true,
      'TUE' : false,
      'WED' : false,
      'THU' : false,
      'FRI' : false,
      'SAT' : false,
      'SUN' : false
  }
*/
```

```javascript
/* RadioButton */
function radioHandler (data) {
    console.log('event : ' + data.event); //event : changed
    console.log('value : ' + data.value); //value : value1
}

const radioComponent = tCam.radiobtn({
    elId: 'componentId',
    name: 'radioname',
    items: [{value: 'value1', text: 'No.1'}, {value: 'value2', text: 'No.2'}],
    eventHandler: radioHandler
});
radioComponent.setValue('value1');
const radioValue = radioComponent.getValue(); //radioValue = value1
```

```javascript
/* ClipPlayer */
const clipPlayer = tCam.clipplayer({
    elId: "componentId",
    videoUrl: "https://bizcam.toast.com/AAADEGI/clip/2d642597-66fa-457e-bd96-92e543e4ee25.mp4?category=b2b",
    durationStr: "10:20", //min:second
    clipStatus: "4", //clip detail status
    thumbnailPath: "bizcam.toast.com/AAADEGI/clip/2d642597-66fa-457e-bd96-92e543e4ee25.jpg?category=b2b",
    startTime: 1567733734000, //clip detail start
    endTime: 1567734334000 //clip detail end
});
```

```javascript
/* Checkbox */
function checkHandler (data) {
    console.log('event : ' + data.event); //event : changed
    console.log('value : ' + data.value); //value : true
}

const checkboxComponent = tCam.checkbox({
    elId: "componentId",
    name: "componentName",
    text: "Checkbox Lable",
    eventHandler: checkHandler
});
checkboxComponent.setValue(true);
const checkValue = checkboxComponent.getValue(); //checkValue = true
```

```javascript
/* Search */
function searchHandler (data) {
    console.log('event : ' + data.event); //event : changed
    console.log('value : ' + data.value); //value : 검색어
}

const searchComponent = tCam.search({
    elId: "componentId",
    placeholder: "이름을 입력하세요",
    eventHandler: searchHandler
});
searchComponent.setValue("검색어");
```

```javascript
/* Dropdown */
function dropHandler (data) {
    console.log('event : ' + data.event); //event : changed
    console.log('value : ' + data.value); //value : true
}

const dropdownComponent = tCam.dropdown({
    elId: "componentId",
    dropElId: "dropElementId",
    position: "left",
    eventHandler: dropHandler
});
dropdownComponent.setValue(true);
/* Dropdown Element
<div id="dropdownId"></div>
<ul id="dropElementId">
  <li>drop1</li>
  <li>drop2</li>
  <li>drop3</li>
  <li>drop4</li>
</ul>
*/
```

```javascript
/* Dialog */
const mydlg = dlg({
    elId: 'dlgId',
    theme: 'toast',
    header: '<span>title</span>',
    contents: '<p>CONTENTS</p>',
    footer: '',
    btn: {
        items: [
            {id: 'confirm', name: 'OK', type: 'confirm'},
            {id: 'close', name: 'NO', type: 'cancel'}
        ],
        align: 'bottom'
    },
    eventHandler: function (event) {
    }
});
```

#### Destroy Instance

```javascript
component.destroy();
component = null;
```


## Test & Build

```sh
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# run unit tests
npm run unit
```