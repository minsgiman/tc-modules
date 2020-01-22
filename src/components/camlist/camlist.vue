<template>
    <div class="tc_camlist">
        <list :pList="pList" :pMaxViewCount="maxViewCount" :pFocusId="focusId">
            <template v-slot:default="slotProps">
                <li @click="selectCamera(slotProps.item)" :class="{has_error: checkHasError(slotProps.item), has_focus: focusId === slotProps.item.id}">
                    <img class="lst_thumb" :src="slotProps.item.thumbnailPath" onerror="this.src='/resources/images/img_camera_fail.png'">
                    <div class="lst_dim"></div>
                    <div class="lst_camera_name">
                        <span>{{slotProps.item.labelName}}</span>
                    </div>
                    <div class="lst_txt_off">
                        <img src="/resources/img/ic-detailview-smallthumb-disconnect.png">
                    </div>
                </li>
            </template>
        </list>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import list from './../uikit/list/list.vue';
    import { ICamInfo } from './interface';

    @Component({
        components: {
            list
        }
    })
    export default class camlist extends Vue {
        @Prop() pList!: ICamInfo[];
        @Prop() pFocusId!: string;

        maxViewCount: number = 7;
        focusId: string = '';

        private created() {
            if (this.pFocusId) {
                this.focusId = this.pFocusId;
            }
        }

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        checkHasError (camera: ICamInfo) {
            return (camera.recordType != 'live' && camera.recordType != 'event' &&
                (camera.streamStatusConfig != 'on' || camera.controlStatus != 'on' || camera.streamStatus != 'on')) ||
                (camera.recordType == 'live' && (camera.controlStatus != 'on' || camera.streamStatusConfig != 'on')) ||
                (camera.recordType == 'event' && (camera.controlStatus != 'on' || camera.streamStatusConfig != 'on'));
        }

        selectCamera (camera: ICamInfo) {
            this.focusId = camera.id;
            this.$emit('event', {event: 'selected', value: camera});
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    .tc_camlist {
        .tc_list {
            position:relative;
            background-color:#ffffff;
            height: 9.2vw;
            min-height: 127px;
            max-height: 172px;
            ul {
                display:inline-block;
                width:100%;
                height:100%;
                text-align:left;
                padding: 20px 4% 12px 4%;
                box-sizing:border-box;
                li {
                    position: relative;
                    width: 13.4%;
                    height: 76%;
                    margin-right: 1%;
                    display:inline-block;
                    cursor:pointer;
                    &:last-child {
                        margin-right:0px;
                    }
                    img {
                        width: 100%;
                        height: 100%;
                        cursor:pointer;
                    }
                    .lst_dim {
                        position:absolute;
                        left:0px;
                        top:0px;
                        background-color:#000000;
                        opacity:0.6;
                        width:100%;
                        height:100%;
                        display:none;
                    }
                    .lst_camera_name {
                        padding-top:10px;
                        font-size:14px;
                        color:#444444;
                        width: 100%;
                        height: 32px;
                        box-sizing: border-box;
                        text-align:center;
                        span {
                            text-overflow: ellipsis;
                            overflow: hidden;
                            white-space: nowrap;
                            display: block;
                        }
                    }
                    .lst_txt_off {
                        position:absolute;
                        left:0px;
                        top:0px;
                        width:100%;
                        height:100%;
                        text-align:center;
                        display:none;
                    }
                    &.has_error {
                        .lst_dim {
                            display:block;
                        }
                        .lst_camera_name {
                            background: none;
                        }
                        .lst_txt_off {
                            display:block;
                            img {
                                width:22px;
                                height:22px;
                                padding-top: 22%;
                            }
                            p {
                                font-size: 11px;
                                padding: 5px 10px 0;
                                color:#999;
                            }
                        }
                    }
                    &.has_focus  {
                        .lst_thumb {
                            border: 3px solid #4b96e6;
                            box-sizing: border-box;
                        }
                        .lst_camera_name {
                            top: 2px;
                        }
                        .lst_dim {
                            margin-left: 2px;
                            margin-top: 2px;
                            width: calc(100% - 4px);
                            height: calc(100% - 4px);
                        }
                    }
                }
            }
            .backward {
               position:absolute; left:0px; top:35%;
            }
            .forward {
               position:absolute; right:0px; top:35%;
            }
        }
    }
</style>