<script>
    export default {
        props: ['parentId'],
        data: function() {
            return {
                eventCallback: {}
            }
        },
        created : function() {
        },
        mounted : function() {
        },
        beforeDestroy : function() {
            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
        },
        methods: {
            on: function(events, callback) {
                if (!events || !callback) {
                    return;
                }
                const eventList = events.split(" ");
                eventList.forEach((event) => {
                    this.eventCallback[event] = callback;
                });
            },
            off: function(events) {
                if (!events) {
                    return;
                }
                const eventList = events.split(" ");
                eventList.forEach((event) => {
                    this.eventCallback[event] = null;
                });
            },
            emitEvent: function (event, value) {
                if (!event || !this.eventCallback[event]) {
                    return;
                }
                this.eventCallback[event]({
                    type: event,
                    value: value
                });
            },
            destroy: function() {
                this.$destroy();
            }
        }
    }
</script>
<style lang="less">
    @import 'common';
</style>