<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import store from '../../../service/player/store';
    import flashPlayer from './flash_player.vue';

    const $: any = (window as any).$ as any;
    const d3: any = (window as any).d3 as any;

    @Component
    export default class FlashPlayerContainer extends Vue {
        get isFullScreen() {
            return store.state.isFullScreen;
        }

        player: any = null;
        currentZoom: any = 1.0;
        zoomZoneBottom: any = 149;
        type: string = 'flash';

        private created() {
            const vExtendConstructor = Vue.extend(flashPlayer);
            this.player = new vExtendConstructor({
                propsData : {
                    varPlayerId: 'player',
                    varName: 'rmcPlayer_flash',
                    videoId: '',
                    inKey: '',
                    outKey: '',
                    player: 'flash',
                    width: '100%',
                    height: '100%',
                    serviceId: '',
                    varCoreSwf: '/resources/vendor/nvp_web_player/LCP_web_player2016082601.swf',
                    varSkinPath: '/resources/vendor/nvp_web_player/NVP_web_player_skin_tvcast_white.swf',
                    varServerUrl: ''
                }
            }).$mount('#player');
            this.player.$on('playerStatusChanged', this.flashEventCallback.bind(this));
            this.player.zoomZone(450, 150);
            this.player.displayRMCPlayer();
            setTimeout(() => {
                store.dispatch('DATA_LOADING_STATUS_CHANGE', false);
            },1050);
        }

        private beforeDestroy() {
            if (this.player) {
                this.player.$destroy();
            }
        }

        play(param: any) {
            this.player.setPath(param.url, param.path);
        }

        resume() {
            this.player.play();
        }

        mute() {
            this.player.mute();
        }

        pause() {
            this.player.pause();
        }

        stop() {
            this.player.stop();
        }

        close() {
            this.player.close();
        }

        getCurrentTime() {
            return this.player.getCurrentTime();
        }

        getStatus() {
            return this.player.getVideoStatus();
        }

        zoomZone(top: any, left: any) {
            this.player.zoomZone(top, left);
        }

        zoomVideo(ratio: any) {
            this.player.zoomVideo(ratio);
        }

        zoomVideoWithZoomablePoint(x: any, y: any) {
            var containerWidth = parseInt($("#zoom_area").width());
            var containerHeight = parseInt($("#zoom_area").height());

            var percentX = parseInt((x / containerWidth * 100) as any);
            var percentY = parseInt((y / containerHeight * 100) as any);

            if (this.player) {
                this.player.zoomVideo(this.currentZoom, percentY, percentX);
            }
        }

        zoomUp(zoom: any) {
            if(this.isFullScreen == true){
                if (this.player) {
                    this.player.zoomZone(260, parseInt($("#player").css("width"))-20);
                }
            }else{
                if (this.player) {
                    this.player.zoomZone(this.zoomZoneBottom, parseInt($("#player").css("width"))-20);
                }
            }

            var newZoom = this.currentZoom + zoom;
            if (newZoom > 5.0) {
                newZoom = 5.0;
            }

            if (newZoom < 1.0) {
                newZoom = 1.0;
            }

            $("#zoom_cursor_length").css("width",((newZoom-1) * 25)+"%");

            this.zoomUpWithZoom(newZoom);
        }

        zoomUpWithZoom(zoom: any) {
            // if (zoom > 1.0) {
            //     //this.playInfoBar.setData('isShowTimelineToggleArea', false);
            // } else {
            //     if(this.isFullScreen){
            //         //this.playInfoBar.setData('isShowTimelineToggleArea', true);
            //     } else {
            //     }
            // }
            this.currentZoom = zoom;
            this.positionZoomable(zoom);
        }

        positionZoomable(newZoom: any) {
            var zoomable = d3.select('.zoom_area .selected');
            var container = d3.select('.zoom_area');
            var containerWidth = parseInt((getComputedStyle(container.node()).width) as any);
            var containerHeight = parseInt((getComputedStyle(container.node()).height) as any);

            var zoomableX = 0;
            var zoomableY = 0;

            if(newZoom == 2){
                $("#zoom_area").css("left", "0px");
                $("#zoom_area").css("top", "0px");
            }else{
                zoomableX =  parseInt($("#zoom_area").css("left"));
                zoomableY =  parseInt($("#zoom_area").css("top"));
            }

            var zoomableWidth = parseInt($("#zoom_area").width());
            var zoomableHeight = parseInt($("#zoom_area").height());

            var currentCenterX = zoomableX + parseInt((zoomableWidth / 2) as any);
            var currentCenterY = zoomableY + parseInt((zoomableHeight / 2) as any);

            var newZoomableWidth = containerWidth / newZoom;
            var newZoomableHeight = containerHeight / newZoom;

            var newX = currentCenterX - parseInt((newZoomableWidth / 2) as any);
            if (newX < 0) {
                newX = 0;
            } else if (newX + newZoomableWidth > containerWidth) {
                newX = containerWidth - newZoomableWidth;
            }

            var newY = currentCenterY - parseInt((newZoomableHeight / 2) as any);
            if (newY < 0) {
                newY = 0;
            } else if (newY + newZoomableHeight > containerHeight) {
                newY = containerHeight - newZoomableHeight;
            }

            var percentX = newX / containerWidth * 100;
            var percentY = newY / containerHeight * 100;
            if (this.player) {
                this.player.zoomVideo(newZoom);
            }
        }

        flashEventCallback(status: any) {
            this.$emit('playerStatusChanged', status);
        }

        setData(key: any, value: any) {
            (this as any)[key] = value;
        }

        getData(key: any) {
            return (this as any)[key];
        }
    }
</script>