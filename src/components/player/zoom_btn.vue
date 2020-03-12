<template>
    <div class="zoom" v-show="cameraData.recorderType !== 'recorder' && !browserInfo.supportWebRTC">
        <button type="button" class="sp zoomout" @click="zoomUp(-1)"></button>
        <button type="button" class="sp zoomin" @click="zoomUp(1)"></button>
        <span class="zoom_bg">
            <span class="bar" id="zoom_cursor_length" style="width: 0%">
                <button type="button" class="bar_ctrl" id="zoomCursor"></button>
            </span>
        </span>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../service/player/store';

    @Component
    export default class ZoomBtn extends Vue {
        get cameraData() {
            return store.state.cameraData;
        }
        get browserInfo() {
            return store.state.browserInfo;
        }

        zoomUp(zoom: any) {
            this.$emit('event', zoom);
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>