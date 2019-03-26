import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        cameraData: {},
        cameraConfig: {},
        shopId: '',
        isShared: false
    },
    getters: {
        // isExpiredCloud: state => {
        //     if ((state.cameraData.serviceType === 'n/a' || state.cameraData.serviceType === '0d' || state.cameraData.saveEndDate < Date.now()) && state.cameraData.recorderType !== 'nvr') {
        //         return true;
        //     }
        //     return false;
        // }
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
        INIT_ALL_DATA: function(context, state) {
            context.commit('UPDATE_CAMERA_DATA', {});
            context.commit('UPDATE_CAMERA_CONFIG', {});
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
        }
    }
});

export default store