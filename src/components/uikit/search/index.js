import createComponent from './../create_vue_comp';
import search from './search';

export default function(parentId) {
    return createComponent(parentId, search);
}