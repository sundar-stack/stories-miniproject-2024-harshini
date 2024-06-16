import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/stories",
      name: "stories",
      component: () => import("./views/ManageStories.vue"),
    },
    {
      path: "/stories-meta/:metaType",
      name: "stories-meta",
      component: () => import("./views/ManageStoriesMeta.vue"),
    }
  ],
});

export default router;
