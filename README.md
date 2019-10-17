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
const toggleComponent = tCam.toggle("#componentId");

toggleComponent.on('changed', function (event) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
})

toggleComponent.value = true;
```

```javascript
/* Timeselect */
const timeselectComponent = tCam.timeselect('#componentId');

timeselectComponent.on('changed', function (event) {
    console.log('event : ' + event.type); //event : changed
    console.log('hour : ' + event.value.getHours()); //hour : 10 (event.value is Date)
})

timeselectComponent.value = new Date();
```

```javascript
/* Daycheck */
const daycheckComponent = tCam.daycheck('#componentId');

daycheckComponent.on('changed', function (event) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + JSON.stringify(event.value));
    /* value : {
          'MON' : true,
          'TUE' : false,
          'WED' : false,
          'THU' : false,
          'FRI' : false,
          'SAT' : false,
          'SUN' : false
      }
    */
})

daycheckComponent.value = {
    'MON' : true,
    'TUE' : false,
    'WED' : false,
    'THU' : false,
    'FRI' : false,
    'SAT' : false,
    'SUN' : false
};
```

```javascript
/* RadioGroup */
const radioComponent = tCam.radiogroup('#componentId');

radioComponent.on('changed', function(event) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : value1
})

radioComponent.name = 'radioname';
radioComponent.items = [{value: 'value1', text: 'No.1'}, {value: 'value2', text: 'No.2'}];
radioComponent.value = 'value1';
```

```javascript
/* RadioButton */
//RadioGroup Component 내부에서만 사용하는 Vue Component
<radio-btn 
    :name="name" 
    :id="name + item.value" 
    :value="item.value" 
    :text="item.text" 
    @selected="radioBtnSelected">
</radio-btn>
```

```javascript
/* Checkbox */
const checkboxComponent = tCam.checkbox('#componentId');

checkboxComponent.on('changed', function(event) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});

checkboxComponent.name = 'componentName';
checkboxComponent.text = 'Checkbox Lable';
checkboxComponent.value = true;
```

```javascript
/* Search */
const searchComponent = tCam.search('#componentId');

searchComponent.on('changed', function(event) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : '검색어'
});

searchComponent.placeholder = "이름을 입력하세요";
searchComponent.value = '검색어';
```

```javascript
/* Dropdown */
const dropdownComponent = tCam.dropdown('#componentId');

dropdownComponent.on('changed', function(event) {
    console.log('event : ' + event.type); //event : changed
    console.log('value : ' + event.value); //value : true
});

dropdownComponent.position = 'left';
dropdownComponent.dropElId = 'dropElementId';
dropdownComponent.value = true;
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