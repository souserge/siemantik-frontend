<template>
  <v-layout grid-list-md column>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex v-for="project in projects" xs4 :key="project.name">
          <router-link :to="{ name: 'project', params: { id: project.id }}">
            <v-card @click="openProject(project)">
              <v-container fill-height fluid pa-2>
                <v-layout fill-height>
                  <v-flex xs12 align-end flexbox>
                    <h3 class="headline">{{ project.name }}</h3>
                    <h4>Language: {{ $store.state.languages[project.language] }}</h4>
                    <h4>No. classes: {{ project.labels.length }}</h4>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </router-link>
        </v-flex>

        <v-create-project-dialog
          :dialog="createProjectDialog"
          @cancel="createProjectDialog = false"
          @create="createNewProject"
        />

        <v-flex xs4 align-center>
          <v-container fill-height>
            <v-layout row wrap align-center>
              <v-flex class="text-xs-center">
                <v-btn icon dark x-large @click="createProjectDialog = true">
                  <v-icon dark x-large>add</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
  </v-layout>
</template>

<script>
import VCreateProjectDialog from "@/components/VCreateProjectDialog";

export default {
  components: {
    VCreateProjectDialog
  },

  data: () => ({
    projects: [],
    createProjectDialog: false
  }),

  methods: {
    createNewProject(project) {
      this.axios.post("projects/", project).then(({ data }) => {
        this.projects.push(data);
        this.createProjectDialog = false;
      });
    }
  },

  mounted() {
    this.axios.get("projects/").then(({ data }) => {
      this.projects.push(...data);
    });
  }
};
</script>