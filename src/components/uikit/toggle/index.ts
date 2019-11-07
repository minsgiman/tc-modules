import createComponent from './../create_vue_comp';
import toggle from './toggle.vue';

export default function(parentId: string) {
    return createComponent(parentId, toggle);
}
