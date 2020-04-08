<template>
    <div class="tc_mgrid" :style="{gridTemplateColumns: gridColumns, gridTemplateRows: gridRows}">
        <div class="gitem" v-for="(gItem, index) in gridItems" :key="gItem.camera ? gItem.camera.id : index">
            <mplayer v-if="gItem.camera" :camera="gItem.camera"></mplayer>
        </div>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import mplayer from './mplayer.vue';

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
                this.gridItems.push({
                    camera: this.gridCameras[i] ? this.gridCameras[i] : null
                });
            }
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