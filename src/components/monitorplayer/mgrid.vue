<template>
    <div class="tc_mgrid">
        <div class="gitem" @click="onClickCamera(gItem.camera ? gItem.camera.cameraId : '')"
             :style="{width: itemWidth + 'px', height: itemHeight + 'px'}"
             v-for="(gItem, index) in gridItems"
             :key="gItem.camera ? gItem.camera.cameraId : index">
            <mplayer v-if="gItem.camera" :camera="gItem.camera" :ref="gItem.camera.cameraId" :serverUrl="serverUrlMap[gItem.camera.cameraId]"
                     :streamType="streamType" :dimension="dimension" :commonToken="commonToken"></mplayer>
        </div>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import mplayer from './mplayer.vue';
    import { ICameraInfo } from './interface';

    //const $: any = (window as any).$ as any;
    //const d3: any = (window as any).d3 as any;
    //const moment: any = (window as any).moment as any;

    @Component({
        components: {
            mplayer
        }
    })
    export default class MonitorGrid extends Vue {
        @Prop() width!: number;
        @Prop() height!: number;
        @Prop() cameras!: any[];
        @Prop() dimension!: number;
        @Prop() commonToken!: string;
        @Prop() streamType!: string;
        @Prop() serverUrls!: string[];

        gridItems: any[] = [];
        gWidth: number = 0;
        gHeight: number = 0;
        gridColumns: string = '';
        gridRows: string = '';
        gridCameras: any[] = [];
        serverIdx: number = 0;
        serverUrlMap: any = {};
        itemWidth: number = 0;
        itemHeight: number = 0;

        private created() {
            this.gridCameras = this.cameras ? this.cameras : [];
            this.serverIdx = 0;
            this.serverUrlMap = {};
            this.gridCameras.forEach((camera) => {
                this.serverUrlMap[camera.cameraId] = this.getPlayServerUrl();
            });
        }

        private mounted() {
            this.gridSizeChange(this.width, this.height);
            this.buildGridItems();
        }

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        buildGridItems() {
            const len = this.dimension * this.dimension;
            let i;

            this.gridItems = [];
            for (i = 0; i < len; i+=1) {
                this.gridItems.push({});
            }
            setTimeout(() => {
                for (i = 0; i < len; i+=1) {
                    this.gridItems[i].camera = this.gridCameras[i] ? this.gridCameras[i] : null;
                }
                this.$forceUpdate();
            }, 0);
        }

        getPlayServerUrl(): string {
            const idx: number = this.serverIdx % this.serverUrls.length;
            const url: string = this.serverUrls[idx];
            this.serverIdx += 1;
            return url;
        }

        unshiftCamera(camera: any) {
            this.gridItems.pop();
            this.gridItems.unshift({
                camera: camera
            });
            this.serverUrlMap[camera.cameraId] = this.getPlayServerUrl();
        }

        changeCameras(cameras: any[]) {
            this.gridCameras = cameras ? cameras : [];
            this.serverIdx = 0;
            this.serverUrlMap = {};
            this.gridCameras.forEach((camera) => {
                this.serverUrlMap[camera.cameraId] = this.getPlayServerUrl();
            });
            this.buildGridItems();
        }

        updateCameraStatus(camera: ICameraInfo) {
            const playerRef: any = this.$refs[camera.cameraId];
            if (playerRef && playerRef[0]) {
                playerRef[0].updateCameraConfig(camera);
            }
        }

        playCamera(cameraId: string) {
            const playerRef: any = this.$refs[cameraId];
            if (playerRef && playerRef[0]) {
                playerRef[0].play();
            }
        }

        gridSizeChange(width: number, height: number) {
            this.gWidth = width ? width - 2 : 0;
            this.gHeight = height ? height - 2 : 0;
            this.itemWidth = Math.floor(this.gWidth / this.dimension) - 1;
            this.itemHeight = Math.floor(this.gHeight / this.dimension) - 1;
            //this.gridColumns = 'repeat(' + this.dimension + ', ' + ((this.gWidth / this.dimension) - this.dimension) + 'px)';
            //this.gridRows = 'repeat(' + this.dimension + ', ' + ((this.gHeight / this.dimension) - this.dimension) + 'px)';
        }

        onClickCamera(cameraId: string) {
            if (cameraId) {
                this.$emit('event', {type: 'click', id: cameraId});
            }
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    .tc_mgrid {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        align-content: space-evenly;
        align-items: stretch;
        gap: 1px;
        background-color: #fff;
        color: #444;
        width: 100%;
        height: 100%;
        border: 1px solid #fff;
        box-sizing: border-box;
        .gitem {
            position: relative;
            background-color: black;
            color: #fff;
            overflow: hidden;
            cursor: pointer;
        }
    }
</style>