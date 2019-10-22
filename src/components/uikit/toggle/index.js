import createComponent from './../create_vue_comp';
import toggle from './toggle.vue';

export default function(parentId) {
    return createComponent(parentId, toggle);
}