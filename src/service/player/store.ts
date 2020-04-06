import Vue from 'vue';
import Vuex from 'vuex';
import { IStoreState } from './interface';

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        category: '',
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
        isShowTimelineCalendar: false,
        ptzControlMode: false,
        browserInfo: {},
        playerType: '',
        playerSize: {width: 0, height: 0},
        hlsPlayUrl: '',
        hlsZoomLevel: 1
    } as IStoreState,
    getters: {
        isExpiredCloud: (state) => {
            if ((state.cameraData.serviceType === 'n/a' || state.cameraData.serviceType === '0d' || state.cameraData.saveEndDate < Date.now()) && state.cameraData.recorderType !== 'nvr') {
                return true;
            }
            return false;
        },
        getAllFilteredZonesIds: (state) => {
            return (zoneData: any) => {
                const filteredEventZoneIdsArr: any = state.eventZones.filter((item: any) => item.filterMark === 'on').map((item: any) => item.id);
                const filteredMotionZoneIdsArr: any = state.motionZones.filter((item: any) => item.filterMark === 'on' && item.id !== '9').map((item: any) => item.uid);
                let allFilteredZoneIdsArr: any = filteredEventZoneIdsArr.concat(filteredMotionZoneIdsArr);	// 체크 처리된 모든 zoneId
                const deleteZone: any = state.motionZones.find((item: any) => item.id === '9');
                const isCheckedDeleteZoneId: any = (deleteZone && deleteZone.filterMark === 'on') ? true : false;

                // 삭제된 이벤트가 체크된 경우 이벤트에서 alarmzone으로 설정된 zoneId가 아닌 zoneId 모두를 추출.
                if (isCheckedDeleteZoneId) {
                    const allZoneIdsArr: any = state.eventZones.map((item: any) => item.id).concat(state.motionZones.filter((item: any) => item.id !== '9').map((item: any) => item.uid));
                    const deletedZoneIdsArr: any = zoneData ? zoneData.filter((item: any) => !allZoneIdsArr.includes(item)) : [];
                    allFilteredZoneIdsArr = allFilteredZoneIdsArr.concat(deletedZoneIdsArr.filter((item: any) => (
                        item !== 'ACCESS_ENTER' && item !== 'ACCESS_EXIT' && item !== 'SENSOR_TEMP' &&
                        item !== 'SENSOR_HUMID' && item !== 'SENSOR_MOTION' && item !== 'SENSOR_MAGNETIC' &&
                        item !== 'SENSOR_SMOKE' && item !== 'SENSOR_GAS' && item !== 'SENSOR_PLUG' && item !== 'DOORLOCK_EVENT')));
                }

                if (state.inoutFilter) {
                    allFilteredZoneIdsArr = allFilteredZoneIdsArr.concat(['ACCESS_ENTER', 'ACCESS_EXIT']);
                }
                if (state.sensorZones) {
                    let i;
                    const len = state.sensorZones.length;
                    for (i = 0; i < len; i += 1) {
                        if (state.sensorZones[i].filterMark === 'on') {
                            allFilteredZoneIdsArr.push(state.sensorZones[i].id);
                        }
                    }
                }
                return allFilteredZoneIdsArr;
            }
        }
    },
    actions: {
        CATEGORY_CHANGE: (context, state) => {
            context.commit('UPDATE_CATEGORY', state);
        },
        CAMERA_DATA_CHANGE: (context, state) => {
            context.commit('UPDATE_CAMERA_DATA', state);
        },
        CAMERA_CONFIG_CHANGE: (context, state) => {
            let timezone = '';
            if (state && state.timezone) {
                const tokens = state.timezone.split(',');
                timezone = tokens[2];
            }
            context.commit('UPDATE_CAMERA_CONFIG', state);
            context.commit('UPDATE_TIMEZONE', timezone);
        },
        SHOP_ID_CHANGE: (context, state) => {
            context.commit('UPDATE_SHOP_ID', state);
        },
        IS_SHARED_CHANGE: (context, state) => {
            context.commit('UPDATE_IS_SHARED', state);
        },
        IS_FULLSCREEN_CHANGE: (context, state) => {
            context.commit('UPDATE_IS_FULLSCREEN', state);
        },
        IS_PLAYING_CHANGE: (context, state) => {
            context.commit('UPDATE_IS_PLAYING', state);
        },
        DATA_LOADING_STATUS_CHANGE: (context, state) => {
            context.commit('UPDATE_DATA_LOADING_STATUS', state);
        },
        CURRENT_TIME_CHANGE: (context, state) => {
            context.commit('UPDATE_CURRENT_TIME', state);
        },
        IS_LIVE_CHANGE: (context, state) => {
            context.commit('UPDATE_IS_LIVE', state);
        },
        PLAY_BTN_STATUS_CHANGE: (context, state) => {
            context.commit('UPDATE_PLAY_BTN_STATUS', state);
        },
        SERVICE_DAY_CHANGE: (context, state) => {
            context.commit('UPDATE_SERVICE_DAY', state);
        },
        TIME_ZONE_CHANGE: (context, state) => {
            context.commit('UPDATE_TIME_ZONE', state);
        },
        CURRENT_DOMAIN_CHANGE: (context, state) => {
            context.commit('UPDATE_CURRENT_DOMAIN', state);
        },
        CVR_DATA_CHANGE: (context, state) => {
            context.commit('UPDATE_CVR_DATA', state);
        },
        EVENTS_CHANGE: (context, state) => {
            context.commit('UPDATE_EVENTS', state);
        },
        INOUT_FILTER_CHANGE: (context, state) => {
            context.commit('UPDATE_INOUT_FILTER', state);
        },
        SENSOR_ZONES_CHANGE: (context, state) => {
            context.commit('UPDATE_SENSOR_ZONES', state);
        },
        EVENT_ZONES_CHANGE: (context, state) => {
            context.commit('UPDATE_EVENT_ZONES', state);
        },
        MOTION_ZONES_CHANGE: (context, state) => {
            context.commit('UPDATE_MOTION_ZONES', state);
        },
        TIME_RANGE_CHANGE: (context, state) => {
            context.commit('UPDATE_TIME_RANGE', state);
        },
        IS_SHOW_CALENDAR_CHANGE: (context, state) => {
            context.commit('UPDATE_IS_SHOW_CALENDAR', state);
        },
        PTZ_CONTROL_CHANGE: (context, state) => {
            context.commit('UPDATE_PTZ_CONTROL', state);
        },
        PLAYER_TYPE_CHANGE: (context, state) => {
            context.commit('UPDATE_PLAYER_TYPE', state);
        },
        PLAYER_SIZE_CHANGE: (context, state) => {
            context.commit('UPDATE_PLAYER_SIZE', state);
        },
        HLS_PLAY_URL_CHANGE: (context, state) => {
            context.commit('UPDATE_HLS_PLAY_URL', state);
        },
        HLS_ZOOM_LEVEL_CHANGE: (context, state) => {
            context.commit('UPDATE_HLS_ZOOM_LEVEL', state);
        },
        BROWSER_INFO: (context, state) => {
            const checkSupportWebRTC = (browserInfo: any) => {
                if (!browserInfo || !browserInfo.name) {
                    return false;
                }
                if (browserInfo.name === 'Internet Explorer' || browserInfo.name === 'Edge') {
                    return false;
                }
                if (browserInfo.name === 'Safari' && browserInfo.version < 11) {
                    return false;
                }
                return true;
            };
            context.commit('UPDATE_BROWSER_INFO', {name: state.name, version: state.version, supportWebRTC: checkSupportWebRTC(state)});
        },
        INIT_ALL_DATA: (context, state) => {
            context.commit('UPDATE_CAMERA_DATA', {});
            context.commit('UPDATE_CAMERA_CONFIG', {});
            context.commit('UPDATE_SHOP_ID', '');
            context.commit('UPDATE_IS_SHARED', false);
            context.commit('UPDATE_IS_FULLSCREEN', false);
            context.commit('UPDATE_DATA_LOADING_STATUS', true);
            context.commit('UPDATE_IS_PLAYING', false);
            context.commit('UPDATE_CURRENT_TIME', null);
            context.commit('UPDATE_IS_LIVE', true);
            context.commit('UPDATE_PLAY_BTN_STATUS', true);
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
            context.commit('UPDATE_PTZ_CONTROL', false);
            context.commit('UPDATE_PLAYER_TYPE', '');
            context.commit('UPDATE_PLAYER_SIZE', {width: 0, height: 0});
            context.commit('UPDATE_HLS_PLAY_URL', '');
            context.commit('UPDATE_HLS_ZOOM_LEVEL', 1);
        }
    },
    mutations: {
        UPDATE_CATEGORY: (state, value) => {
            state.category = value;
        },
        UPDATE_CAMERA_DATA: (state, value) => {
            state.cameraData = value;
        },
        UPDATE_CAMERA_CONFIG: (state, value) => {
            state.cameraConfig = value;
        },
        UPDATE_SHOP_ID: (state, value) => {
            state.shopId = value;
        },
        UPDATE_IS_SHARED: (state, value) => {
            state.isShared = value;
        },
        UPDATE_IS_FULLSCREEN: (state, value) => {
            state.isFullScreen = value;
        },
        UPDATE_DATA_LOADING_STATUS: (state, value) => {
            state.dataLoadingStatus = value;
        },
        UPDATE_IS_PLAYING: (state, value) => {
            state.isPlaying = value;
        },
        UPDATE_CURRENT_TIME: (state, value) => {
            state.currentTime = value;
        },
        UPDATE_IS_LIVE: (state, value) => {
            state.isLive = value;
        },
        UPDATE_PLAY_BTN_STATUS: (state, value) => {
            state.playBtnStatus = value;
        },
        UPDATE_SERVICE_DAY: (state, value) => {
            state.serviceDay = value;
        },
        UPDATE_CURRENT_DOMAIN: (state, value) => {
            state.currentDomain = value;
        },
        UPDATE_TIMEZONE: (state, value) => {
            state.timezone = value;
        },
        UPDATE_CVR_DATA: (state, value) => {
            state.cvrData = value;
        },
        UPDATE_EVENTS: (state, value) => {
            state.arrEvents = value;
        },
        UPDATE_INOUT_FILTER: (state, value) => {
            state.inoutFilter = value;
        },
        UPDATE_SENSOR_ZONES: (state, value) => {
            state.sensorZones = value;
        },
        UPDATE_EVENT_ZONES: (state, value) => {
            state.eventZones = value;
        },
        UPDATE_MOTION_ZONES: (state, value) => {
            state.motionZones = value;
        },
        UPDATE_TIME_RANGE: (state, value) => {
            state.timeRange = value;
        },
        UPDATE_IS_SHOW_CALENDAR: (state, value) => {
            state.isShowTimelineCalendar = value;
        },
        UPDATE_PTZ_CONTROL: (state, value) => {
            state.ptzControlMode = value;
        },
        UPDATE_BROWSER_INFO: (state, value) => {
            state.browserInfo = value;
        },
        UPDATE_PLAYER_TYPE: (state, value) => {
            state.playerType = value;
        },
        UPDATE_PLAYER_SIZE: (state, value) => {
            state.playerSize = value;
        },
        UPDATE_HLS_PLAY_URL: (state, value) => {
            state.hlsPlayUrl = value;
        },
        UPDATE_HLS_ZOOM_LEVEL: (state, value) => {
            state.hlsZoomLevel = value;
        }
    }
});

export default store