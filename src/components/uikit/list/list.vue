<template>
    <div class="tc_list" :class="{horizontal: type === 'horizontal', vertical: type === 'vertical'}" :style="listStyle">
        <button :class="{enabled: list.length > maxViewCount && viewFirstIndex > 0}" @click="moveList(-1)" class="backward"></button>
        <ul>
            <slot v-for="(item, index) in viewList" v-bind:item="item"></slot>
        </ul>
        <button :class="{enabled: list.length > maxViewCount && ((viewFirstIndex + viewList.length) < list.length)} " @click="moveList(1)" class="forward"></button>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import Base from './../base.vue';

    @Component
    export default class List extends Base {
        @Prop() pList!: any[];
        @Prop() pType!: string;
        @Prop() pMaxViewCount!: number;
        @Prop() pFocusId!: string;

        list: any[] = [];
        type: string = 'horizontal';
        maxViewCount: number = 0;
        viewFirstIndex: number = 0;
        viewList: any[] = [];
        listStyle: any = null;
        itemStyle: any = null;
        focusStyle: any = null;
        focusId: string = '';

        @Watch('pFocusId')
        onPFocusIdChanged(value: string, oldValue: string) {
            this.focusId = value;
            this.calcViewFirstIndex();
            this.makeViewList();
        }

        get value(): any[] {
            return this.list;
        }

        set value(newValue: any[]) {
            this.list = newValue;
            this.calcViewFirstIndex();
            this.makeViewList();
        }

        private mounted () {
            if (this.pList) {
                this.list = this.pList;
            }
            if (this.pType) {
                this.type = this.pType;
            }
            if (this.pMaxViewCount) {
                this.maxViewCount = this.pMaxViewCount;
            }
            if (this.pFocusId) {
                this.focusId = this.pFocusId;
            }
            this.calcViewFirstIndex();
            this.makeViewList();
        }

        itemSelect (item: any) {
            this.focusId = item.id;
            // @ts-ignore
            this.emitEvent('selected', item);
        }

        calcViewFirstIndex () {
            if (this.maxViewCount === 0) {
                return;
            }

            let i, j, focusIdx = 0, len = this.list.length;
            for (i = 0; i < len; i+=1) {
                if (this.focusId === this.list[i].id) {
                    focusIdx = i;
                    break;
                }
            }
            j = 1;
            this.viewFirstIndex = 0;
            while (focusIdx >= (this.viewFirstIndex + this.maxViewCount * j)) {
                j+=1;
            }
            this.viewFirstIndex = this.viewFirstIndex + this.maxViewCount * (j - 1);
        }

        makeViewList () {
            this.viewList = this.list.slice(this.viewFirstIndex, this.viewFirstIndex + this.maxViewCount);
        }

        moveList (direction: number) {
            if (direction > 0) {
                if ((this.viewFirstIndex + this.viewList.length) < this.list.length) {
                    this.viewFirstIndex += this.maxViewCount;
                    this.makeViewList();
                }
            } else {
                if (this.viewFirstIndex > 0) {
                    this.viewFirstIndex -= this.maxViewCount;
                    this.makeViewList();
                }
            }
        }
    }
</script>
<style lang="less">
    .tc_list {
        &.horizontal {
            text-align: center;
            button {
                display: inline-block;
                width: 30px;
                height: 30px;
                &.backward {
                    float: left;
                    background: url(/resources/img/btn-prev-arrow-disabled.svg) no-repeat;
                    &.enabled {
                        background-image: url(/resources/img/btn-prev-arrow.svg);
                    }
                }
                &.forward {
                    float: right;
                    background: url(/resources/img/btn-next-arrow-disabled.svg) no-repeat;
                    &.enabled {
                        background-image: url(/resources/img/btn-next-arrow.svg);
                    }
                }
            }
            ul {
                display: inline-block;
            }
            li {
                display: inline-block;
                box-sizing: border-box;
            }
        }
    }
</style>