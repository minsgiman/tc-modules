import createComponent from './../create_vue_comp';
import daycheck from './daycheck.vue';

export default function(parentId: string) {
    return createComponent(parentId, daycheck);
}
