import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        cameraId: null,
        shopId: null,
        cameraData: null,
        cameraConfig: null,
        timelineData: null,
        isPlaying: false,
        isLive: true,
        clickedCvrTime: null,
        currentTime: null,
        alarmZones: null,
        showNoPlayLayer: false,
        showCameraOffLayer: false,
        showCameraStreamLayer: false,
        showNextPlayLayer: false,
        isCameraOffLastRec: false,
        isCameraOffLastShowRec: false,
        isCameraOffLastEvent: false,
        isCameraOffLastShowEvent: false,
        isFullscreen: false,
        isShared: false,
        cloudOut: false,
        serviceDay: 0,
        serviceCalendarDay: null,
        serviceCalendarDate: null
    },
    getters: {
        isExpiredCloud: state => {
            if ((state.cameraData.serviceType === 'n/a' || state.cameraData.serviceType === '0d' || state.cameraData.saveEndDate < Date.now()) && state.cameraData.recorderType !== 'nvr') {
                return true;
            }
            return false;
        }
    },
    actions: {
        SET_CAMERA_ID: function(context, state) {
            context.commit('UPDATE_CAMERA_ID', state);
        },
        SET_CAMERA_DATA: function(context, state) {
            context.commit('UPDATE_CAMERA_DATA', state);
        },
        SET_CAMERA_CONFIG: function(context, state) {
            context.commit('UPDATE_CAMERA_CONFIG', state);
        },
        SET_TIMELINE_DATA: function(context, state) {
            context.commit('UPDATE_TIMELINE_DATA', state);
        },
        SET_CURRENT_TIME: function(context, state) {
            context.commit('UPDATE_CURRENT_TIME', state);
        },
        SET_IS_PLAYING: function(context, state) {
            context.commit('UPDATE_IS_PLAYING', state);
        },
        SET_IS_LIVE: function(context, state) {
            context.commit('UPDATE_IS_LIVE', state);
        },
        SET_SHOP_ID: function(context, state) {
            context.commit('UPDATE_SHOP_ID', state);
        },
        SET_CLICKED_CVR_TIME: function(context, state) {
            context.commit('UPDATE_CLICKED_CVR_TIME', state);
        },
        SET_ALARM_ZONES: function(context, state) {
            context.commit('UPDATE_ALARM_ZONES', state);
        },
        SET_SHOW_NO_PLAY_LAYER: function(context, state) {
            context.commit('UPDATE_SHOW_NO_PLAY_LAYER', state);
        },
        SET_SHOW_CAMERA_OFF_LAYER: function(context, state) {
            context.commit('UPDATE_SHOW_CAMERA_OFF_LAYER', state);
        },
        SET_SHOW_CAMERA_STREAM_LAYER: function(context, state) {
            context.commit('UPDATE_SHOW_CAMERA_STREAM_LAYER', state);
        },
        SET_SHOW_NEXT_PLAY_LAYER: function(context, state) {
            context.commit('UPDATE_SHOW_NEXT_PLAY_LAYER', state);
        },
        SET_IS_CAMERA_OFF_LAST_REC: function(context, state) {
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_REC', state);
        },
        SET_IS_CAMERA_OFF_LAST_SHOW_REC: function(context, state) {
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_SHOW_REC', state);
        },
        SET_IS_CAMERA_OFF_LAST_EVENT: function(context, state) {
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_EVENT', state);
        },
        SET_IS_CAMERA_OFF_LAST_SHOW_EVENT: function(context, state) {
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_SHOW_EVENT', state);
        },
        SET_IS_FULLSCREEN: function(context, state) {
            context.commit('UPDATE_IS_FULLSCREEN', state);
        },
        SET_IS_SHARED: function(context, state) {
            context.commit('UPDATE_IS_SHARED', state);
        },
        SET_CLOUD_OUT: function(context, state) {
            context.commit('UPDATE_CLOUD_OUT', state);
        },
        SET_SERVICE_DAY: function(context, state) {
            context.commit('UPDATE_SERVICE_DAY', state);
        },
        SET_SERVICE_CALENDAR_DAY: function(context, state) {
            context.commit('UPDATE_SERVICE_CALENDAR_DAY', state);
        },
        SET_SERVICE_CALENDAR_DATE: function(context, state) {
            context.commit('UPDATE_SERVICE_CALENDAR_DATE', state);
        },
        CAMERA_REC_DELAY: function(context, state) {
            context.commit('UPDATE_SHOW_NO_PLAY_LAYER', true);
            context.commit('UPDATE_SHOW_CAMERA_OFF_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_STREAM_LAYER', false);
            context.commit('UPDATE_SHOW_NEXT_PLAY_LAYER', false);
        },
        CAMERA_CONNECT_OFF: function(context, state) {
            context.commit('UPDATE_SHOW_NO_PLAY_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_OFF_LAYER', true);
            context.commit('UPDATE_SHOW_CAMERA_STREAM_LAYER', false);
            context.commit('UPDATE_SHOW_NEXT_PLAY_LAYER', false);
            // Camera.isLastRecord({ id: $stateParams.cameraId }, function (data) {
            //     $scope.currentCameraIsLastRecordDataSet(data);
            // });
        },
        CAMERA_NO_CVR: function(context, state) {
            context.commit('UPDATE_SHOW_NO_PLAY_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_OFF_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_STREAM_LAYER', false);
            context.commit('UPDATE_SHOW_NEXT_PLAY_LAYER', true);
        },
        CAMERA_REC_OFF: function(context, state) {
            context.commit('UPDATE_SHOW_NO_PLAY_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_OFF_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_STREAM_LAYER', true);
            context.commit('UPDATE_SHOW_NEXT_PLAY_LAYER', false);
        },
        CAMERA_STATUS_NORMAL: function(context, state) {
            context.commit('UPDATE_SHOW_NO_PLAY_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_OFF_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_STREAM_LAYER', false);
            context.commit('UPDATE_SHOW_NEXT_PLAY_LAYER', false);
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_REC', false);
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_EVENT', false);
        },
        INIT_ALL_DATA: function(context, state) {
            context.commit('UPDATE_CAMERA_ID', null);
            context.commit('UPDATE_SHOP_ID', null);
            context.commit('UPDATE_CAMERA_DATA', null);
            context.commit('UPDATE_CAMERA_CONFIG', null);
            context.commit('UPDATE_TIMELINE_DATA', null);
            context.commit('UPDATE_IS_PLAYING', false);
            context.commit('UPDATE_IS_LIVE', true);
            context.commit('UPDATE_CLICKED_CVR_TIME', null);
            context.commit('UPDATE_CURRENT_TIME', null);
            context.commit('UPDATE_ALARM_ZONES', null);
            context.commit('UPDATE_SHOW_NO_PLAY_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_OFF_LAYER', false);
            context.commit('UPDATE_SHOW_CAMERA_STREAM_LAYER', false);
            context.commit('UPDATE_SHOW_NEXT_PLAY_LAYER', false);
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_REC', false);
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_SHOW_REC', false);
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_EVENT', false);
            context.commit('UPDATE_IS_CAMERA_OFF_LAST_SHOW_EVENT', false);
            context.commit('UPDATE_IS_FULLSCREEN', false);
            context.commit('UPDATE_IS_SHARED', false);
            context.commit('UPDATE_CLOUD_OUT', false);
            context.commit('UPDATE_SERVICE_DAY', 0);
            context.commit('UPDATE_SERVICE_CALENDAR_DAY', null);
            context.commit('UPDATE_SERVICE_CALENDAR_DATE', null);
        }
    },
    mutations: {
        UPDATE_CAMERA_ID: function(state, id) {
            state.cameraId = id;
        },
        UPDATE_CAMERA_DATA: function(state, data) {
            state.cameraData = data;
        },
        UPDATE_CAMERA_CONFIG: function(state, config) {
            state.cameraConfig = config;
        },
        UPDATE_TIMELINE_DATA: function(state, data) {
            state.timelineData = data;
        },
        UPDATE_CURRENT_TIME: function(state, time) {
            state.currentTime = time;
        },
        UPDATE_IS_PLAYING: function(state, status) {
            state.isPlaying = status;
        },
        UPDATE_IS_LIVE: function(state, status) {
            state.isLive = status;
        },
        UPDATE_SHOP_ID: function(state, id) {
            state.shopId = id;
        },
        UPDATE_CLICKED_CVR_TIME: function(state, time) {
            state.clickedCvrTime = time;
        },
        UPDATE_ALARM_ZONES: function(state, zones) {
            state.alarmZones = zones;
        },
        UPDATE_SHOW_NO_PLAY_LAYER: function(state, status) {
            state.showNoPlayLayer = status;
        },
        UPDATE_SHOW_CAMERA_OFF_LAYER: function(state, status) {
            state.showCameraOffLayer = status;
        },
        UPDATE_SHOW_CAMERA_STREAM_LAYER: function(state, status) {
            state.showCameraStreamLayer = status;
        },
        UPDATE_SHOW_NEXT_PLAY_LAYER: function(state, status) {
            state.showNextPlayLayer = status;
        },
        UPDATE_IS_CAMERA_OFF_LAST_REC: function(state, status) {
            state.isCameraOffLastRec = status;
        },
        UPDATE_IS_CAMERA_OFF_LAST_SHOW_REC: function(state, status) {
            state.isCameraOffLastShowRec = status;
        },
        UPDATE_IS_CAMERA_OFF_LAST_EVENT: function(state, status) {
            state.isCameraOffLastEvent = status;
        },
        UPDATE_IS_CAMERA_OFF_LAST_SHOW_EVENT: function(state, status) {
            state.isCameraOffLastShowEvent = status;
        },
        UPDATE_IS_FULLSCREEN: function(state, status) {
            state.isFullscreen = status;
        },
        UPDATE_IS_SHARED: function(state, status) {
            state.isShared = status;
        },
        UPDATE_CLOUD_OUT: function(state, status) {
            state.cloudOut = status;
        },
        UPDATE_SERVICE_DAY: function(state, day) {
            state.serviceDay = day
        },
        UPDATE_SERVICE_CALENDAR_DAY: function(state, day) {
            state.serviceCalendarDay = day;
        },
        UPDATE_SERVICE_CALENDAR_DATE: function(state, date) {
            state.serviceCalendarDate = date;
        }
    }
});

export default store