import Vue from "vue";
import Router from "vue-router";
import TheProjects from "./views/TheProjects";
import VProject from "./views/VProject";
import VProjectDashboard from "./views/VProjectDashboard";
import VProjectDataset from "./views/VProjectDataset";
import VProjectLabels from "./views/VProjectLabels";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/projects",
      name: "projects",
      component: TheProjects
    },
    {
      path: "/projects/:id/",
      props: route => ({ projectId: parseInt(route.params.id) }),
      component: VProject,
      children: [
        {
          path: "",
          name: "project",
          component: VProjectDashboard
        },
        {
          path: "dataset",
          component: VProjectDataset
        },
        {
          path: "labels",
          component: VProjectLabels
        }
      ]
    }
  ]
});
