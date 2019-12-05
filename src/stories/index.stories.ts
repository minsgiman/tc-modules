import { storiesOf } from '@storybook/vue';

import components from './components.vue';
import dialogs from './dialogs.vue';
import camlist from './camlist.vue';

storiesOf('components', module)
    .add('components', () => ({
        components: { components },
        template: `<components/>`,
    }))
    .add('dialogs', () => ({
        components: { dialogs },
        template: '<dialogs/>'
    }))
    .add('camlist', () => ({
        components: { camlist },
        template: '<camlist/>'
    }));