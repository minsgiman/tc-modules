<template>
    <div class="tc_timeselect">
        <span class="date_lst">
            <div class="date_lst_sel">
                <select @change="timeChange" v-model="hour">
                    <option v-for="n in 24" :key="n">{{addZero(n - 1)}}</option>
                </select>
            </div>
            <span class="bar">{{hourStr}}</span>
            <div class="date_lst_sel">
                <select @change="timeChange" v-model="min">
                    <option v-for="n in 60" :key="n">{{addZero(n - 1)}}</option>
                </select>
            </div>
            <span class="bar">{{minStr}}</span>
        </span>
    </div>
</template>
<script>
    export default {
        props: ['theme'],
        name: 'timeselect',
        computed : {
        },
        data: function() {
            return {
                hour: '00',
                min: '00',
                hourStr: '',
                minStr: ''
            }
        },
        created : function() {
            if (document.documentElement.getAttribute('lang') === 'ja') {
                this.hourStr = '時';
                this.minStr = '分';
            } else {
                this.hourStr = '시';
                this.minStr = '분';
            }
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods: {
            timeChange: function() {
                this.$emit('event', {event: 'timechange', hour: parseInt(this.hour), min: parseInt(this.min)});
            },
            addZero: function(n) {
                return n < 10 ? '0' + n : '' + n
            },
            getTime: function() {
                return {hour: parseInt(this.hour), min: parseInt(this.min)};
            },
            getTimeStr: function() {
                return this.hour + ':' + this.min;
            },
            setTime: function(hour, min) {
                this.hour = this.addZero(parseInt(hour));
                this.min = this.addZero(parseInt(min));
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
    .tc_timeselect {
        .date_lst_sel {
            display: inline-block;
            width: 55px;
            select {
                width: 100%;
                height: 30px;
                padding: 0 8px;
            }
        }
        .bar {
            display:inline-block;
            margin: 0 7px;
            font-size: 14px;
        }
    }
</style>