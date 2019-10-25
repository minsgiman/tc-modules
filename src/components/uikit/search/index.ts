import createComponent from './../create_vue_comp';
import search from './search.vue';

export default function(parentId: string) {
    return createComponent(parentId, search);
}