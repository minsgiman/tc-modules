import createComponent from './../create_vue_comp';
import radiobtn from './radiobtn.vue';

export default function(parentId: string) {
    return createComponent(parentId, radiobtn);
}
