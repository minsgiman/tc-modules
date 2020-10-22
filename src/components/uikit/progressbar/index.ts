import createComponent from './../create_vue_comp';
import progressbar from './progressbar.vue';

export default function(parentId: string) {
  return createComponent(parentId, progressbar);
}
