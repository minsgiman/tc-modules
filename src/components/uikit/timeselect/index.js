import createComponent from './../create_vue_comp';
import timeselect from './timeselect';

export default function(parentId) {
    return createComponent(parentId, timeselect);
}