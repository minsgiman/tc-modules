<template>
    <div class="tc_progressbar" :style="barStyle">
        <div class="tc_progressbar__bar" :style="{width: percent + '%'}"></div>
    </div>
</template>
<script lang="ts">
  import { Component } from 'vue-property-decorator';
  import Base from './../base.vue';

  @Component
  export default class Progressbar extends Base {
    percent: number = 0;
    barStyle: any = null;

    get value(): number {
      return this.percent;
    }

    set value(newValue: number) {
      this.percent = newValue;
    }
  }
</script>
<style lang="less">
    .tc_progressbar {
        width: 100%;
        height: 4px;
        background-color: #e0e0e0;
        &__bar {
            height: 100%;
            background-color: #4a96e6;
        }
    }
</style>