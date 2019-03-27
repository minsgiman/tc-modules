<template></template>
<script>
    import _ from "lodash";
    import gEventBus from './gEventBus';

    export default {
        data() {
            return {
                events: Object.keys(this.$listeners),
                methods: _.mapValues(this.$listeners, (value, key) =>
                    this.handleEvent.bind(this, key)
                )
            };
        },
        mounted() {
            this.events.forEach(event => {
                this.methods[event].SOMETHING = event;
                gEventBus.$on(event, this.methods[event]);
            });
        },
        destroyed() {
            this.events.forEach(event => {
                gEventBus.$off(event, this.methods[event]);
            });
        },
        methods: {
            handleEvent(name, ...args) {
                this.$emit(name, ...args);
            }
        }
    };
</script>