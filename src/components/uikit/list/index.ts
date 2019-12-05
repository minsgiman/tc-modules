import createComponent from './../create_vue_comp';
import list from './list.vue';

export default function(parentId: string) {
    return createComponent(parentId, list);
}
