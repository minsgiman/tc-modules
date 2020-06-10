<template>
    <div class="comp_test">
        <div class="comp_wrap">
            <p class="comp_tit">1. toogle</p>
            <div id="toggleId"></div>
        </div>

        <div class="comp_wrap">
            <p class="comp_tit">2. timeselect</p>
            <div id="timeselectId"></div>
        </div>

        <div class="comp_wrap">
            <p class="comp_tit">3. daycheck</p>
            <div id="daycheckId"></div>
        </div>

        <div class="comp_wrap">
            <p class="comp_tit">4. radiobtn</p>
            <div id="radiobtnId"></div>
        </div>

        <div class="comp_wrap">
            <p class="comp_tit">5. checkbox</p>
            <div id="checkboxId"></div>
        </div>

        <div class="comp_wrap">
            <p class="comp_tit">6. search</p>
            <div id="searchId" style="display:inline-block; width:300px;"></div>
        </div>

        <div class="comp_wrap">
            <p class="comp_tit">7. list</p>
            <div id="listId"></div>
        </div>

        <div class="comp_wrap">
            <p class="comp_tit">8. dropdown</p>
            <div>
                <div id="dropdownId"></div>
                <ul id="dropitem" style="width:200px; border:1px solid black;">
                    <li>drop1</li>
                    <li>drop2</li>
                    <li>drop3</li>
                    <li>drop4</li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    import checkbox from './../components/uikit/checkbox';
    import daycheck from './../components/uikit/daycheck';
    import dropdown from './../components/uikit/dropdown';
    import radiobtn from './../components/uikit/radiobtn';
    import search from './../components/uikit/search';
    import timeselect from './../components/uikit/timeselect';
    import toggle from './../components/uikit/toggle';
    import list from './../components/uikit/list';

    @Component
    export default class Checkbox extends Vue {
        private mounted() {
            this.createTimeselect();
            this.createToggle();
            this.createSearch();
            this.createRadiogroup();
            this.createDropdown();
            this.createDaycheck();
            this.createCheckbox();
            this.createList();
        }

        createList () {
            const listObj = list('listId');
            listObj.on('selected', (event: any) => {
                 console.log('event : ' + JSON.stringify(event));
            });
            listObj.listStyle = {
                width: '600px',
                height: '32px',
                border: '1px solid'
            };
            listObj.itemStyle = {
                margin: '0 20px',
                padding: '5px',
                cursor: 'pointer',
                border: '1px solid'
            };
            listObj.focusStyle = {
                border: '1px solid blue'
            };
            listObj.maxViewCount = 5;
            listObj.focusId = 'item3';
            listObj.value = [
                { content: 'Item1', id: 'item1'},
                { content: 'Item2', id: 'item2'},
                { content: 'Item3', id: 'item3'},
                { content: 'Item4', id: 'item4'},
                { content: 'Item5', id: 'item5'},
                { content: 'Item6', id: 'item6'},
                { content: 'Item7', id: 'item7'},
                { content: 'Item8', id: 'item8'}
            ];
        }

        createTimeselect () {
            const timeselect1 = timeselect('timeselectId');
            timeselect1.on('changed', (event: any) => {
                console.log('event : ' + event.type);  // event : changed
                console.log('value : ' + event.value); // value : true
            });
            const date = new Date();
            date.setHours(12);
            date.setMinutes(24);
            timeselect1.value = date;
        }

        createToggle () {
            const toggleObj = toggle('toggleId');
            toggleObj.on('changed', (event: any) => {
                console.log('event : ' + event.type);  // event : changed
                console.log('value : ' + event.value); // value : true
            });
            toggleObj.value = false;
        }

        createSearch () {
            const searchObj = search('searchId');
            searchObj.on('changed', (event: any) => {
                console.log('event : ' + event.type);  // event : changed
                console.log('value : ' + event.value); // value : true
            });
            searchObj.placeholder = '검색어를 입력하세요.';
            searchObj.design = 'search';
            searchObj.active = true;
        }

        createRadiogroup () {
            const radiobtnObj = radiobtn('radiobtnId');
            radiobtnObj.on('changed', (event: any) => {
                console.log('event : ' + event.type);  // event : changed
                console.log('value : ' + event.value); // value : true
            });

            radiobtnObj.items = [
                { value: 'qq1', text: 'radio1' },
                { value: 'qq2', text: 'radio2' },
                { value: 'qq3', text: 'radio3' },
                { value: 'qq4', text: 'radio4' }
            ];
            radiobtnObj.value = 'qq2';
        }

        createDropdown () {
            const dropdownObj = dropdown('dropdownId');
            dropdownObj.on('changed', (event: any) => {
                console.log('event : ' + event.type);  // event : changed
                console.log('value : ' + event.value); // value : true
            });

            dropdownObj.dropElementId = 'dropitem';
            dropdownObj.dropPosition = 'right';
            dropdownObj.value = true;
        }

        createDaycheck () {
            const daycheckObj = daycheck('daycheckId');
            daycheckObj.on('changed', (event: any) => {
                console.log('event : ' + event.type);  // event : changed
                console.log('value : ' + event.value); // value : true
            });
            daycheckObj.value = [true, false, true, false, true, false, true];
        }

        createCheckbox () {
            const checkboxObj = checkbox('checkboxId');
            checkboxObj.on('changed', (event: any) => {
                console.log('event : ' + event.type);  // event : changed
                console.log('value : ' + event.value); // value : true
            });
            checkboxObj.text = 'checklabel';
        }
    }
</script>
<style lang="less">
    .comp_test {
        padding: 20px;
        .comp_tit {
            width:800px;
            border-bottom:1px solid #f0f0f0;
            padding-bottom:8px;
            margin-bottom:8px;
        }
        .comp_wrap {
            margin-top:50px;
            &:nth-child(1) {
                margin-top:0;
            }
        }
    }
</style>