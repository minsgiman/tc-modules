<script lang="ts">
    import store from '../../../service/player/store';
    import hlsPlayer from './hls_player.vue';
    import Vue from 'vue';

    const $: any = (window as any).$ as any;

    export default {
        name: 'hlsPlayerContainer',
        props: [],
        computed: {
            cameraData: function () {
                return store.state.cameraData;
            }
        },
        data: function () {
            return {
                player : null,
                type : 'hls'
            }
        },
        created : function() {
            const vExtendConstructor = Vue.extend(hlsPlayer);
            this.player = new vExtendConstructor().$mount('#hls_player_wrap');
            this.player.$on('playerStatusChanged', this.hlsEventCallback.bind(this));
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            this.stop();
            if (this.player) {
                this.player.$destroy();
            }
        },
        methods : {
            play : function (url: string) {
                this.player.dvrConnectFail = false;
                this.player.hlsStatus = this.player.hlsStatusEnum.EVENT_STREAM_CONNECTING;
                if (this.player.currentHlsPeerId) {
                    this.stop(this.player.currentHlsPeerId);
                }
                this.player.currentHlsPeerId = this.cameraData.id;
                this.player.play(this.cameraData.id, url);
                $('#hls_logo').show();
                $('#hls_loading').show();
            },
            resume : function () {
                this.player.resume();
            },
            mute : function () {
                return;
            },
            pause : function () {
                this.player.pause();
            },
            stop : function () {
                $('#remoteVideosContainer').empty();
                this.player.stop();
                $('#hls_logo').hide();
                $('#hls_loading').hide();
            },
            close : function () {
                this.player.close();
            },
            getCurrentTime : function () {
                return;
            },
            getStatus : function () {
                return this.player.getStatus();
            },
            zoomZone: function () {
                return;
            },
            zoomVideo: function () {
                return;
            },
            zoomVideoWithZoomablePoint : function(x: any, y: any) {
                return;
            },
            zoomUp : function(zoom: any) {
                return;
            },
            zoomUpWithZoom : function(zoom: any) {
                return;
            },
            positionZoomable : function(zoom: any) {
                return;
            },
            hlsEventCallback : function (status: any) {
                this.$emit('playerStatusChanged', status);
            },
            updatePlayerSize: function () {
                this.player.updatePlayerSize();
            },
            setData(key: any, value: any) {
                (this as any)[key] = value;
            },
            getData(key: any) {
                return (this as any)[key];
            }
        }
    }
</script>