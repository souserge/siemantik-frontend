<template>
<v-layout column color="white">
  <v-toolbar flat color="white">
    <v-toolbar-title>
      {{ name }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-tabs
      style="max-width:50%"
      color="transparent"
      center
      slider-color="black"
    >
      <v-tab :to="{ name: 'project' }">
        Dashboard
      </v-tab>
      <v-tab :to="'dataset'">Dataset</v-tab>
      <v-tab :to="'labels'">Labels</v-tab>
    </v-tabs>
  </v-toolbar>
  <v-layout column color="white">
    <router-view></router-view>
  </v-layout>
</v-layout>
</template>

<script>
import store from "@/store";

export default {
  props: {
    projectId: Number
  },

  data: () => ({}),

  computed: {
    name: () => store.getters.currentProjectName
  },

  mounted() {
    store.dispatch("loadProject", this.projectId);
  },

  beforeDestroy() {
    store.dispatch("unloadProject");
  }
};
</script>

<style>
</style>
