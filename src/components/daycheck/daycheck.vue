<template>
    <ul class="tc_daycheck">
        <li v-for="(item, index) in dayList">
            <span>
                <input type="checkbox" v-model="item.check" :id="item.id" :key="item.id" @change="checkChange">
                <label :class="{on: item.check}" :for="item.id">
                    <span class="label_icon"></span>
                    <span class="label_txt">{{item.str}}</span>
                </label>
            </span>
        </li>
    </ul>
</template>
<script>
    export default {
        props: ['theme'],
        name: 'daycheck',
        computed : {
        },
        data: function() {
            return {
                dayList: []
            }
        },
        created : function() {
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
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods: {
            checkChange: function() {
                this.$emit('event', {event: 'timechange', checkMap: this.getCheckMap()});
            },
            addZero: function(n) {
                return n < 10 ? '0' + n : '' + n
            },
            getCheckMap: function() {
                const valueMap = {};
                this.dayList.forEach((value) => {
                    valueMap[value.id] = value.check;
                });
                return valueMap;
            },
            setCheckMap: function(map) {
                this.dayList.forEach(function(item) {
                    if (map[item.id]) {
                        item.check = true;
                    } else {
                        item.check = false;
                    }
                });
            },
            destroy: function() {
                this.$destroy();
            }
        },
        components : {
        }
    }
</script>
<style lang="less">
    @import './../comp_common';
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
                top: 0px;
                left: 0px;
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