<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    @Component
    export default class Base extends Vue {
        @Prop({ default: '' }) parentId!: string;

        eventCallback: any = {};

        private beforeDestroy() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        }

        on(events: string, callback: (event: any) => void) {
            if (!events || !callback) {
                return;
            }
            const eventList = events.split(' ');
            eventList.forEach((event: string) => {
                this.eventCallback[event] = callback;
            });
        }

        off(events: string) {
            if (!events) {
                return;
            }
            const eventList = events.split(' ');
            eventList.forEach((event: string) => {
                this.eventCallback[event] = null;
            });
        }

        emitEvent(event: string, value: any) {
            if (!event || !this.eventCallback[event]) {
                return;
            }
            this.eventCallback[event]({
                type: event,
                value
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