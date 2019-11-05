import createComponent from './../create_vue_comp';
import dropdown from './dropdown.vue';

export default function(parentId: string) {
    return createComponent(parentId, dropdown);
}