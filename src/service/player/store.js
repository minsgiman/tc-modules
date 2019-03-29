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
        playBtnStatus: false,
        currentTime: new Date()
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
        CAMERA_DATA_CHANGE: function(context, state) {
            context.commit('UPDATE_CAMERA_DATA', state);
        },
        CAMERA_CONFIG_CHANGE: function(context, state) {
            context.commit('UPDATE_CAMERA_CONFIG', state);
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
        INIT_ALL_DATA: function(context, state) {
            context.commit('UPDATE_CAMERA_DATA', {});
            context.commit('UPDATE_CAMERA_CONFIG', {});
            context.commit('UPDATE_SHOP_ID', '');
            context.commit('UPDATE_IS_SHARED', false);
            context.commit('UPDATE_IS_FULLSCREEN', false);
            context.commit('UPDATE_DATA_LOADING_STATUS', true);
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
        }
    }
});

export default store