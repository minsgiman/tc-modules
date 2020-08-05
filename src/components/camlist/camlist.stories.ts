import { storiesOf } from '@storybook/vue';

import camlist from './camlist.vue';

storiesOf('components', module)
.add('camlist', () => ({
  components: { camlist },
  template: '<div class="camlist_test" :style="styleObj"><camlist :pList="pList" :pFocusId="pFocusId"/></div>',
  data: () => ({
    styleObj: {
      position: 'relative',
      margin: '0 auto',
      padding: '0 0px',
      width: '1400px',
      border: '1px solid'
    },
    pList: [
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
    pFocusId: 'BB'
  })
}));