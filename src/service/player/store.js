import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        cameraData: {},
        cameraConfig: {},
        shopId: '',
        isShared: false,
        isFullScreen: false,
        dataLoadingStatus: true,
        isPlaying: false,
        isLive: true,
        playBtnStatus: true,
        serviceDay: 0,
        currentTime: new Date(),
        timezone: '',
        timeRange: 60,
        cvrData: [],
        arrEvents: [],
        inoutFilter: false,
        sensorZones: [],
        eventZones: [],
        motionZones: [],
        currentDomain: null,
        isShowTimelineCalendar: false
    },
    getters: {
        isExpiredCloud: state => {
            if ((state.cameraData.serviceType === 'n/a' || state.cameraData.serviceType === '0d' || state.cameraData.saveEndDate < Date.now()) && state.cameraData.recorderType !== 'nvr') {
                return true;
            }
            return false;
        },
        getAllFilteredZonesIds: state => {
            return zoneData => {
                var filteredEventZoneIdsArr = state.eventZones.filter(item => item.filterMark === 'on').map(item => item.id);
                var filteredMotionZoneIdsArr = state.motionZones.filter(item => item.filterMark === 'on' && item.id !== '9').map(item => item.uid);
                var allFilteredZoneIdsArr = filteredEventZoneIdsArr.concat(filteredMotionZoneIdsArr);	// 체크 처리된 모든 zoneId
                var deleteZone = state.motionZones.find(item => item.id === 9);
                var isCheckedDeleteZoneId = (deleteZone && deleteZone.filterMark === 'on') ? true : false;

                // 삭제된 이벤트가 체크된 경우 이벤트에서 alarmzone으로 설정된 zoneId가 아닌 zoneId 모두를 추출.
                if (isCheckedDeleteZoneId) {
                    var allZoneIdsArr = state.eventZones.map(item => item.id).concat(state.motionZones.filter(item => item.id !== '9').map(item => item.uid));
                    var deletedZoneIdsArr = zoneData.filter(item => !allZoneIdsArr.includes(item));
                    allFilteredZoneIdsArr = allFilteredZoneIdsArr.concat(deletedZoneIdsArr.filter(item => (o !== "ACCESS_ENTER" && o !== "ACCESS_EXIT" && o !== "SENSOR_TEMP" && o !== "SENSOR_HUMID" && o !== "SENSOR_MOTION" && o !== "SENSOR_MAGNETIC" && o !== "SENSOR_SMOKE" && o !== "SENSOR_GAS" && o !== "SENSOR_PLUG" && o !== "DOORLOCK_EVENT")));
                }

                if (state.inoutFilter) {
                    allFilteredZoneIdsArr = allFilteredZoneIdsArr.concat(["ACCESS_ENTER", "ACCESS_EXIT"]);
                }
                if (state.sensorZones) {
                    var i, len = state.sensorZones.length;
                    for (i = 0; i < len; i+=1) {
                        if (state.sensorZones[i].filterMark === "on") {
                            allFilteredZoneIdsArr.push(state.sensorZones[i].id);
                        }
                    }
                }
                return allFilteredZoneIdsArr;
            }
        }
    },
    actions: {
        CAMERA_DATA_CHANGE: function(context, state) {
            context.commit('UPDATE_CAMERA_DATA', state);
        },
        CAMERA_CONFIG_CHANGE: function(context, state) {
            let timezone = '';
            if (state && state.timezone) {
                var tokens = state.timezone.split(',');
                timezone = tokens[2];
            }
            context.commit('UPDATE_CAMERA_CONFIG', state);
            context.commit('UPDATE_TIMEZONE', timezone);
        },
        SHOP_ID_CHANGE: function(context, state) {
            context.commit('UPDATE_SHOP_ID', state);
        },
        IS_SHARED_CHANGE: function(context, state) {
            context.commit('UPDATE_IS_SHARED', state);
        },
        IS_FULLSCREEN_CHANGE: function(context, state) {
            context.commit('UPDATE_IS_FULLSCREEN', state);
        },
        IS_PLAYING_CHANGE: function(context, state) {
            context.commit('UPDATE_IS_PLAYING', state);
        },
        DATA_LOADING_STATUS_CHANGE: function(context, state) {
            context.commit('UPDATE_DATA_LOADING_STATUS', state);
        },
        CURRENT_TIME_CHANGE: function(context, state) {
            context.commit('UPDATE_CURRENT_TIME', state);
        },
        IS_LIVE_CHANGE: function(context, state) {
            context.commit('UPDATE_IS_LIVE', state);
        },
        PLAY_BTN_STATUS_CHANGE: function(context, state) {
            context.commit('UPDATE_PLAY_BTN_STATUS', state);
        },
        SERVICE_DAY_CHANGE: function(context, state) {
            context.commit('UPDATE_SERVICE_DAY', state);
        },
        TIME_ZONE_CHANGE: function(context, state) {
            context.commit('UPDATE_TIME_ZONE', state);
        },
        CURRENT_DOMAIN_CHANGE: function(context, state) {
            context.commit('UPDATE_CURRENT_DOMAIN', state);
        },
        CVR_DATA_CHANGE: function(context, state) {
            context.commit('UPDATE_CVR_DATA', state);
        },
        EVENTS_CHANGE: function(context, state) {
            context.commit('UPDATE_EVENTS', state);
        },
        INOUT_FILTER_CHANGE: function(context, state) {
            context.commit('UPDATE_INOUT_FILTER', state);
        },
        SENSOR_ZONES_CHANGE: function(context, state) {
            context.commit('UPDATE_SENSOR_ZONES', state);
        },
        EVENT_ZONES_CHANGE: function(context, state) {
            context.commit('UPDATE_EVENT_ZONES', state);
        },
        MOTION_ZONES_CHANGE: function(context, state) {
            context.commit('UPDATE_MOTION_ZONES', state);
        },
        TIME_RANGE_CHANGE: function(context, state) {
            context.commit('UPDATE_TIME_RANGE', state);
        },
        IS_SHOW_CALENDAR_CHANGE: function(context, state) {
            context.commit('UPDATE_IS_SHOW_CALENDAR', state);
        },
        INIT_ALL_DATA: function(context, state) {
            context.commit('UPDATE_CAMERA_DATA', {});
            context.commit('UPDATE_CAMERA_CONFIG', {});
            context.commit('UPDATE_SHOP_ID', '');
            context.commit('UPDATE_IS_SHARED', false);
            context.commit('UPDATE_IS_FULLSCREEN', false);
            context.commit('UPDATE_DATA_LOADING_STATUS', true);
            context.commit('UPDATE_IS_PLAYING', false);
            context.commit('UPDATE_CURRENT_TIME', null);
            context.commit('UPDATE_IS_LIVE', true);
            context.commit('UPDATE_PLAY_BTN_STATUS', false);
            context.commit('UPDATE_SERVICE_DAY', 0);
            context.commit('UPDATE_TIME_ZONE', '');
            context.commit('UPDATE_CURRENT_DOMAIN', null);
            context.commit('UPDATE_CVR_DATA', []);
            context.commit('UPDATE_EVENTS', []);
            context.commit('UPDATE_INOUT_FILTER', false);
            context.commit('UPDATE_SENSOR_ZONES', []);
            context.commit('UPDATE_EVENT_ZONES', []);
            context.commit('UPDATE_MOTION_ZONES', []);
            context.commit('UPDATE_TIME_RANGE', 60);
            context.commit('UPDATE_IS_SHOW_CALENDAR', false);
        }
    },
    mutations: {
        UPDATE_CAMERA_DATA: function(state, value) {
            state.cameraData = value;
        },
        UPDATE_CAMERA_CONFIG: function(state, value) {
            state.cameraConfig = value;
        },
        UPDATE_SHOP_ID: function(state, value) {
            state.shopId = value;
        },
        UPDATE_IS_SHARED: function(state, value) {
            state.isShared = value;
        },
        UPDATE_IS_FULLSCREEN: function(state, value) {
            state.isFullScreen = value;
        },
        UPDATE_DATA_LOADING_STATUS: function(state, value) {
            state.dataLoadingStatus = value;
        },
        UPDATE_IS_PLAYING: function(state, value) {
            state.isPlaying = value;
        },
        UPDATE_CURRENT_TIME: function(state, value) {
            state.currentTime = value;
        },
        UPDATE_IS_LIVE: function(state, value) {
            state.isLive = value;
        },
        UPDATE_PLAY_BTN_STATUS: function(state, value) {
            state.playBtnStatus = value;
        },
        UPDATE_SERVICE_DAY: function(state, value) {
            state.serviceDay = value;
        },
        UPDATE_CURRENT_DOMAIN: function(state, value) {
            state.currentDomain = value;
        },
        UPDATE_TIMEZONE: function(state, value) {
            state.timezone = value;
        },
        UPDATE_CVR_DATA: function(state, value) {
            state.cvrData = value;
        },
        UPDATE_EVENTS: function(state, value) {
            state.arrEvents = value;
        },
        UPDATE_INOUT_FILTER: function(state, value) {
            state.inoutFilter = value;
        },
        UPDATE_SENSOR_ZONES: function(state, value) {
            state.sensorZones = value;
        },
        UPDATE_EVENT_ZONES: function(state, value) {
            state.eventZones = value;
        },
        UPDATE_MOTION_ZONES: function(state, value) {
            state.motionZones = value;
        },
        UPDATE_TIME_RANGE: function(state, value) {
            state.timeRange = value;
        },
        UPDATE_IS_SHOW_CALENDAR: function(state, value) {
            state.isShowTimelineCalendar = value;
        }
    }
});

export default store