<template>
    <div class="camlist_test">
        <div id="listId"></div>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import camlist from './../components/camlist';

    @Component
    export default class CamList extends Vue {
        private mounted() {
            this.createList();
        }

        createList () {
            const listObj = camlist({
                elId: 'listId',
                list: [
                    {
                        id: 'AA',
                        recorderType: 'cvr',
                        recordType: '24h',
                        streamStatusConfig: 'on',
                        controlStatus: 'off',
                        streamStatus: 'on',
                        thumbnailPath: 'https://dev-bizcam.toast.com/AAAAAADFRO/title_image.jpg?1575506704272&category=b2b',
                        labelName: 'v3lite'
                    },
                    {
                        id: 'BB',
                        recorderType: 'cvr',
                        recordType: '24h',
                        streamStatusConfig: 'on',
                        controlStatus: 'on',
                        streamStatus: 'on',
                        thumbnailPath: 'https://dev-bizcam.toast.com/AAAAAADFRO/title_image.jpg?1575506704272&category=b2b',
                        labelName: 'v3lite2'
                    },
                    {
                        id: 'CC',
                        recorderType: 'cvr',
                        recordType: '24h',
                        streamStatusConfig: 'on',
                        controlStatus: 'on',
                        streamStatus: 'on',
                        thumbnailPath: 'https://dev-bizcam.toast.com/AAAAAA',
                        labelName: 'v3lite3'
                    }
                ],
                focusId: 'BB',
                eventHandler: (event) => {
                    console.log('event : ' + JSON.stringify(event));
                }
            });
        }
    }
</script>
<style lang="less">
    .camlist_test {
        position: relative;
        margin: 0 auto;
        padding: 0 0px;
        width: 1400px;
        border: 1px solid;
    }
</style>