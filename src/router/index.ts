import { createRouter, createWebHistory } from 'vue-router';
import EditorView from '@/views/EditorView.vue';
import ReaderView from '@/views/ReaderView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'reader',
      component: ReaderView,
    },
    {
      path: '/editor',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/read/:id',
      redirect: '/',
    },
    {
      path: '/editor/:id',
      redirect: '/editor',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
