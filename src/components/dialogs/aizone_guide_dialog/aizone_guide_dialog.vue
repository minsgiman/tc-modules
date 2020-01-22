<template>
    <div class="aizone_guide_dialog">
        <modal_dialog @close="destroy" :dlgStyle="dlgStyle" :noCloseBtn="noCloseBtn">
            <template slot="content">
                <div class="ai_guide_area">
                    <div class="swiper-container">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide" v-for="(item, index) in swipeInfos">
                                <div :style="{backgroundImage: 'url(' + item.imgUrl + ')'}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="page_num">{{pageCount}}/2</div>
                    <div class="ai_guide_desc">
                        <span v-html="description"></span>
                    </div>
                    <div class="ai_btn_wrap">
                        <button @click="clickNoShow">{{txtMap.noshow}}</button>
                        <button @click="clickConfirm">{{txtMap.confirm}}</button>
                    </div>
                </div>
            </template>
        </modal_dialog>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import modal_dialog from '../../uikit/modal_dialog';

    const Swiper: any = (window as any).Swiper as any;

    @Component({
        components: {
            modal_dialog
        }
    })
    export default class AizoneGuideDialog extends Vue {
        @Prop() dlgStyle!: any;
        @Prop() txtMap!: any;
        @Prop() noCloseBtn!: boolean;
        @Prop() swipeInfos!: any[];

        aiSwiper: any = null;
        pageCount: number = 1;
        description: string = '';

        private mounted() {
            const swipeInfo = this.swipeInfos[0];
            this.description = swipeInfo ? swipeInfo.description : '';
            setTimeout(() => {
                this.initSwiper();
            }, 500);
        }

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        initSwiper() {
            this.aiSwiper = new Swiper('.swiper-container', {
                direction: 'horizontal',
                loop: true,
                // autoplay
                autoplay: false
            });
            this.aiSwiper.on('transitionEnd', () => {
                switch (this.aiSwiper.activeIndex) {
                    case 0:
                    case 2:
                        this.pageCount = 2;
                        break;
                    case 1:
                    case 3:
                        this.pageCount = 1;
                        break;
                    default:
                        this.pageCount = 1;
                        break;
                }
                const swipeInfo = this.swipeInfos[this.pageCount - 1];
                this.description = swipeInfo ? swipeInfo.description : '';
            });
        }

        clickNoShow() {
            this.$emit('event', {event: 'noshow'});
        }

        clickConfirm() {
            this.$emit('event', {event: 'confirm'});
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    @import './../../uikit/common';

    .ai_guide_area {
        .swiper-container {
            position: relative;
            .swiper-slide {
                width: 452px;
                height: 240px;
                div {
                    width: 100%;
                    height: 100%;
                }
            }
        }
        .page_num {
            position: absolute;
            top: 204px;
            left: 206px;
            width: 40px;
            height: 19px;
            padding-top: 4px;
            font-size: 13px;
            border-radius: 12px;
            color: #ffffff;
            z-index: 10;
            background: rgba(38,38,38,0.8);
        }
        .ai_guide_desc {
            padding: 20px 0;
            border-bottom: 1px solid #e0e0e0;
            span {
                font-size: 14px;
                line-height: 20px;
                display: inline-block;
                width: 240px;
            }
        }
        .ai_btn_wrap {
            height: 46px;
            button {
                display:inline-block;
                color: #444444;
                font-size: 14px;
                width: 225px;
                height: 100%;
                &:first-child {
                    float: left;
                    border-right: 1px solid #e0e0e0;
                    border-bottom-left-radius: 10px;
                }
                &:last-child {
                    border-bottom-right-radius: 10px;
                }
            }
        }
    }
</style>