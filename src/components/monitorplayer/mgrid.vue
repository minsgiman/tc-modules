<template>
    <div class="tc_mgrid" :style="{gridTemplateColumns: gridColumns, gridTemplateRows: gridRows}">
        <div class="gitem" v-for="(gItem, index) in gridItems" :key="gItem.camera ? gItem.camera.cameraId : index">
            <mplayer v-if="gItem.camera" :camera="gItem.camera" :ref="gItem.camera.cameraId" :serverUrl="getPlayServerUrl()" :commonToken="commonToken"></mplayer>
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

        private created() {
        }

        private mounted() {
            this.gridCameras = this.cameras ? this.cameras : [];
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

        getPlayServerUrl() {
            //TODO:
            return this.serverUrls[0];
        }

        unshiftCamera(camera: any) {
            this.gridItems.pop();
            this.gridItems.unshift({
                camera: camera
            })
        }

        changeCameras(cameras: any[]) {
            this.gridCameras = cameras ? cameras : [];
            this.buildGridItems();
        }

        updateCameraStatus(camera: ICameraInfo) {
            const playerRef: any = this.$refs[camera.cameraId];
            if (playerRef && playerRef[0]) {
                playerRef[0].updateCameraConfig(camera);
            }
        }

        gridSizeChange(width: number, height: number) {
            this.gWidth = width ? width : 0;
            this.gHeight = height ? height : 0;
            this.gridColumns = 'repeat(' + this.dimension + ', ' + ((this.gWidth / this.dimension) - this.dimension) + 'px)';
            this.gridRows = 'repeat(' + this.dimension + ', ' + ((this.gHeight / this.dimension) - this.dimension) + 'px)';
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    .tc_mgrid {
        display: grid;
        grid-gap: 1px;
        background-color: #fff;
        color: #444;
        .gitem {
            position: relative;
            background-color: #444;
            color: #fff;
        }
    }
</style>