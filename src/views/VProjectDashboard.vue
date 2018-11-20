<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card flat>
        <v-card-title style="font-weight: bold">
          Description:
        </v-card-title>
        <v-card-text>
          {{ description }}
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs6>
      <v-card flat text-xs-center>
        <v-card-text>
          <span style="font-weight: bold">Language: </span>
          {{ language }}
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs6>
      <v-card flat text-xs-center>
        <v-card-text>
          <span style="font-weight: bold">Classifier: </span>
          {{ classifier }}
        </v-card-text>
      </v-card>
    </v-flex>
    <v-toolbar flat color="white">
    <v-btn class="mb-2">
      Train classifier
    </v-btn>
    <v-btn class="mb-2">
      Classify unlabelled data
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn class="mb-2">
      Import model
    </v-btn>
    <v-btn class="mb-2">
      Export model
    </v-btn>
    <v-btn class="mb-2">
      Settings
    </v-btn>
    </v-toolbar>
  </v-layout>
</template>

<script>
import store from "@/store";

export default {
  props: {},

  data: () => ({}),
  computed: {
    language: () => store.getters.currentProjectLanguage,
    classifier: () => store.getters.currentProjectClassifier,
    description: () => store.getters.currentProjectDescription
  }
};
</script>

<style>
</style>
