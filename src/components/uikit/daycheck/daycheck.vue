<template>
    <ul class="tc_daycheck">
        <li v-for="(item, index) in dayList">
            <span>
                <input type="checkbox" v-model="item.check" :id="name + item.id" :key="name + item.id" @change="checkChange">
                <label :class="{on: item.check}" :for="name + item.id">
                    <span class="label_icon"></span>
                    <span class="label_txt">{{item.str}}</span>
                </label>
            </span>
        </li>
    </ul>
</template>
<script lang="ts">
    import { Component } from 'vue-property-decorator';
    import Base from './../base.vue';
    import { IDayChecking } from '../interface';

    @Component
    export default class Daycheck extends Base {
        // @ts-ignore
        name: string = 'name_' + this.parentId;
        dayList: IDayChecking[] = [];

        get value(): boolean[] {
            const valueList: boolean[] = [];
            this.dayList.forEach((day: IDayChecking) => {
                valueList.push(day.check);
            });
            return valueList;
        }

        set value(newValues: boolean[]) {
            if (!newValues) {
                return;
            }
            const len = newValues.length;
            let i;
            for (i = 0; i < len; i += 1) {
                if (this.dayList[i]) {
                    this.dayList[i].check = newValues[i];
                }
            }
        }

        private created() {
            const lang = document.documentElement.getAttribute('lang');
            this.dayList = [
                {id: 'MON', str: lang === 'ja' ? '月' : '월', check: false},
                {id: 'TUE', str: lang === 'ja' ? '火' : '화', check: false},
                {id: 'WED', str: lang === 'ja' ? '水' : '수', check: false},
                {id: 'THU', str: lang === 'ja' ? '木' : '목', check: false},
                {id: 'FRI', str: lang === 'ja' ? '金' : '금', check: false},
                {id: 'SAT', str: lang === 'ja' ? '土' : '토', check: false},
                {id: 'SUN', str: lang === 'ja' ? '日' : '일', check: false}
            ];
        }

        checkChange() {
            const valueList: boolean[] = [];
            this.dayList.forEach((day: IDayChecking) => {
                valueList.push(day.check);
            });
            // @ts-ignore
            this.emitEvent('changed', valueList);
        }
    }
</script>
<style lang="less">
    .tc_daycheck {
        input {
            opacity: 0;
        }
        li {
            display:inline-block;
            position:relative;
            width:40px;
            height:30px;
            margin-right:5px;
        }
        label {
            cursor:pointer;
            .label_icon {
                position: absolute;
                width: 32px;
                height: 32px;
                top: 0;
                left: 0;
                background-color: #ffffff;
                border: solid 1px #cccccc;
                border-radius: 32px;
            }
            .label_txt {
                position: absolute;
                z-index: 10;
                left:11px;
                top:8px;
                font-size:14px;
            }
            &.on {
                .label_icon {
                    background-color: #767d96;
                }
                .label_txt {
                    color: #ffffff;
                }
            }
        }
    }
</style>