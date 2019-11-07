import createComponent from './../create_vue_comp';
import timeselect from './timeselect.vue';

export default function(parentId: string) {
    return createComponent(parentId, timeselect);
}
