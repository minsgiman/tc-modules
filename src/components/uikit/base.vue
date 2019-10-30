<script lang="ts">
    import Vue from 'vue';
    import { Component, Prop } from 'vue-property-decorator';

    @Component
    export default class Base extends Vue {
        @Prop() parentId: string = '';

        eventCallback: any = {};

        private beforeDestroy () {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        on(events: any, callback: any) {
            if (!events || !callback) {
                return;
            }
            const eventList = events.split(" ");
            eventList.forEach((event: string) => {
                this.eventCallback[event] = callback;
            });
        }

        off(events: any) {
            if (!events) {
                return;
            }
            const eventList = events.split(" ");
            eventList.forEach((event: string) => {
                this.eventCallback[event] = null;
            });
        }

        emitEvent(event: any, value: any) {
            if (!event || !this.eventCallback[event]) {
                return;
            }
            this.eventCallback[event]({
                type: event,
                value: value
            });
        }

        destroy() {
            this.$destroy();
        }
    }
</script>
<style lang="less">
    @import 'common';
</style>