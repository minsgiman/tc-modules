<template>
    <div id="zoom_wrapper" class="zoom_wrap" v-show="showZoomArea" :style="{width: zoomAreaInfo.width + 'px', height: zoomAreaInfo.height + 'px'}">
        <video id="zoom_player" muted class="video-js zoom_video"></video>
        <div id="zoom_area"></div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import videojs from 'video.js';
    import store from '../../service/player/store';

    const d3: any = (window as any).d3 as any;
    const $: any = (window as any).$ as any;
    let zoomMover: any = null;
    let maskRect: any = null;

    @Component
    export default class ZoomBtn extends Vue {
        showZoomArea: boolean = false;
        zoomAreaInfo: any = {width: 160, height: 90};
        hlsPlayer: any = null;
        zoomMoverInfo: any = {x: 0, y: 0, width: 0, height: 0};

        @Watch('hlsPlayUrl')
        onPlayUrlChanged(value: string, oldValue: string) {
            this.setVideoSource(value);
        }

        get hlsPlayUrl() {
            return store.state.hlsPlayUrl;
        }
        get playerSize() {
            return store.state.playerSize;
        }
        get hlsZoomLevel() {
            return store.state.hlsZoomLevel;
        }

        private mounted() {
            this.hlsPlayer = videojs('zoom_player', {
                controls: false,
                errorDisplay: false,
                preload: 'auto'
            });
            if (this.hlsPlayUrl) {
                this.setVideoSource(this.hlsPlayUrl);
            }
            this.hlsPlayer.on('ready', () => {
                this.hlsPlayer.play();
            });
            this.hlsPlayer.on('error', () => {
            });
            this.makeZoomArea('zoom_area');
        }

        private beforeDestroy() {
            if (this.hlsPlayer) {
                this.hlsPlayer.dispose();
            }
        }

        makeZoomArea(id: string) {
            const zoomAreaEl = document.getElementById(id);
            const svg = d3.select(zoomAreaEl).append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('class', 'zoom_svg');

            this.updateMoverPosition();
            this.makeZoomAreaBg(svg, this.zoomAreaInfo, this.zoomMoverInfo);
            this.makeZoomAreaMover(svg, this.zoomMoverInfo);
        }

        makeZoomAreaBg(svg: any, zoomAreaInfo: any, zoomMoverInfo: any) {
            const maskId = 'rect-mask';
            const defs = svg.append('defs');
            const mask = defs.append('mask').attr('id', maskId);

            mask.append('rect')
                .attr("x", 0).attr("y", 0).attr("width", zoomAreaInfo.width).attr("height", zoomAreaInfo.height)
                .style("fill", "white").style("opacity", 0.7);

            maskRect = mask.append('rect')
                .attr("x", zoomMoverInfo.x).attr("y", zoomMoverInfo.y).attr("height", zoomMoverInfo.height).attr("width", zoomMoverInfo.width);

            svg.append("rect")
                .attr("x", 0).attr("y", 0).attr("width", zoomAreaInfo.width).attr("height", zoomAreaInfo.height)
                .attr('fill', 'black').attr('opacity', 0.6).attr("mask", "url(#" + maskId + ")");
        }

        makeZoomAreaMover(svg: any, zoomMoverInfo: any) {
            const polyDragger = d3.behavior.drag()
                .on('drag', this.handlePolyDrag.bind(this))
                .on('dragend', this.handlePolyDragEnd.bind(this));
            const g = svg.append('g')
                .attr('class', 'poly_wrap');

            zoomMover = g.append('rect')
                .attr("x", zoomMoverInfo.x)
                .attr("y", zoomMoverInfo.y)
                .attr("height", zoomMoverInfo.height)
                .attr("width", zoomMoverInfo.width)
                .attr("fill", 'white')
                .attr('stroke', 'red')
                .attr('stroke-width', 0.6)
                .attr('fill-opacity', 0.1)
                .call(polyDragger);
        }

        handlePolyDrag() {
            this.zoomMoverInfo.x = this.zoomMoverInfo.x + d3.event.dx;
            this.zoomMoverInfo.y = this.zoomMoverInfo.y + d3.event.dy;

            if (this.zoomMoverInfo.x < 0) {
                this.zoomMoverInfo.x = 0;
            } else if ((this.zoomMoverInfo.x + this.zoomMoverInfo.width) > this.zoomAreaInfo.width) {
                this.zoomMoverInfo.x = this.zoomAreaInfo.width - this.zoomMoverInfo.width;
            }
            if (this.zoomMoverInfo.y < 0) {
                this.zoomMoverInfo.y = 0;
            } else if ((this.zoomMoverInfo.y + this.zoomMoverInfo.height) > this.zoomAreaInfo.height) {
                this.zoomMoverInfo.y = this.zoomAreaInfo.height - this.zoomMoverInfo.height;
            }
            zoomMover.attr('x', this.zoomMoverInfo.x);
            zoomMover.attr('y', this.zoomMoverInfo.y);
            maskRect.attr('x', this.zoomMoverInfo.x);
            maskRect.attr('y', this.zoomMoverInfo.y);
            this.updateVideoTransform();
        }

        handlePolyDragEnd() {
            console.log('handlePolyDragEnd : ' + JSON.stringify(this.zoomMoverInfo));
        }

        setVideoSource(src: string) {
            if (this.hlsPlayer) {
                this.changeZoom(1);
                this.hlsPlayer.src([
                    { type: "video/mp4", src: src }
                ]);
                this.hlsPlayer.play();
            }
        }

        updateVideoTransform() {
            const moverCenter = {
                x: this.zoomMoverInfo.x + (this.zoomMoverInfo.width / 2),
                y: this.zoomMoverInfo.y + (this.zoomMoverInfo.height / 2)
            };
            const diffWidthFromCenter = (this.zoomAreaInfo.width / 2) - moverCenter.x;
            const diffHeightFromCenter = (this.zoomAreaInfo.height / 2) - moverCenter.y;
            const calcTranslateX = diffWidthFromCenter * ((this.playerSize.width) / this.zoomAreaInfo.width);
            const calcTranslateY = diffHeightFromCenter * ((this.playerSize.height) / this.zoomAreaInfo.height);

            this.$emit('event', {
                event : 'transformChange',
                value : 'scale(' + this.hlsZoomLevel + ') translate(' + calcTranslateX + 'px, ' + calcTranslateY + 'px' + ')'
            });
        }

        changeZoom(value: number) {
            if (value > 5 || value < 1) {
                return;
            }
            store.dispatch('HLS_ZOOM_LEVEL_CHANGE', value);
            this.showZoomArea = this.hlsZoomLevel === 1 ? false : true;
            $("#zoom_cursor_length").css("width", ((this.hlsZoomLevel - 1) * 25) + "%");
            this.updateMoverPosition();
            this.updateVideoTransform();
        }

        zoomUpHandler(value: number) {
            if (value > 0) {
                if (this.hlsZoomLevel >= 5) {
                    return;
                }
                store.dispatch('HLS_ZOOM_LEVEL_CHANGE', this.hlsZoomLevel + 1);
            } else {
                if (this.hlsZoomLevel <= 1) {
                    return;
                }
                store.dispatch('HLS_ZOOM_LEVEL_CHANGE', this.hlsZoomLevel - 1);
            }
            this.showZoomArea = this.hlsZoomLevel === 1 ? false : true;
            $("#zoom_cursor_length").css("width", ((this.hlsZoomLevel - 1) * 25) + "%");
            this.updateMoverPosition();
            this.updateVideoTransform();
        }

        updateMoverPosition() {
            const centerInfo = {x: 0, y: 0};
            let x, y, width, height;

            if (this.zoomMoverInfo.width && this.zoomMoverInfo.height && this.hlsZoomLevel !== 1) {
                centerInfo.x = this.zoomMoverInfo.x + (this.zoomMoverInfo.width / 2);
                centerInfo.y = this.zoomMoverInfo.y + (this.zoomMoverInfo.height / 2);
            } else {
                centerInfo.x = this.zoomAreaInfo.width / 2;
                centerInfo.y = this.zoomAreaInfo.height / 2;
            }
            width = this.zoomAreaInfo.width / this.hlsZoomLevel;
            height = this.zoomAreaInfo.height / this.hlsZoomLevel;
            x = centerInfo.x - (width / 2);
            y = centerInfo.y - (height / 2);
            x = x < 0 ? 0 : x;
            y = y < 0 ? 0 : y;
            this.zoomMoverInfo = {x, y, width, height};

            if (zoomMover) {
                zoomMover.attr('x', this.zoomMoverInfo.x);
                zoomMover.attr('y', this.zoomMoverInfo.y);
                zoomMover.attr('width', this.zoomMoverInfo.width);
                zoomMover.attr('height', this.zoomMoverInfo.height);
            }
            if (maskRect) {
                maskRect.attr('x', this.zoomMoverInfo.x);
                maskRect.attr('y', this.zoomMoverInfo.y);
                maskRect.attr('width', this.zoomMoverInfo.width);
                maskRect.attr('height', this.zoomMoverInfo.height);
            }
        }
    }
</script>

<style lang="less">
    #zoom_wrapper {
        &.zoom_wrap {
            position: absolute;
            left: 19px;
            bottom: 65px;
        }
        #zoom_player {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0px;
            top: 0px;
        }
        #zoom_area {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0px;
            top: 0px;
            cursor: pointer;
        }
    }
</style>