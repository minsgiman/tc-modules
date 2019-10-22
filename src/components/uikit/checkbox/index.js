import createComponent from './../create_vue_comp';
import checkbox from './checkbox.vue';

export default function(parentId) {
    return createComponent(parentId, checkbox);
}