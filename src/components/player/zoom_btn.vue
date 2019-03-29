<template>
    <div class="zoom" v-show="cameraData.recorderType !== 'recorder'">
        <button type="button" class="sp zoomout" @click="zoomUp(-1)"></button>
        <button type="button" class="sp zoomin" @click="zoomUp(1)"></button>
        <span class="zoom_bg">
            <span class="bar" id="zoom_cursor_length" style="width: 0%">
                <button type="button" class="bar_ctrl" id="zoomCursor"></button>
            </span>
        </span>
    </div>
</template>

<script>
    import store from '../../service/player/store';

    export default {
        name: 'zoomBtn',
        computed: {
            cameraData: function () {
                return store.state.cameraData;
            }
        },
        data: function () {
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
        },
        methods : {
            zoomUp: function (zoom) {
                this.$emit('event', zoom);
            }
        }
    }
</script>

<style lang="less">
    #timebar_area {
    }
</style>