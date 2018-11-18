<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline">
        <span>Semantic Text Classification Service</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn :to="{ name: 'projects' }" flat>Projects</v-btn>
        <v-btn flat>About</v-btn>
        <v-btn class="text-small" flat>Hello, admin!</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content id="content">
      <v-container fluid>
        
        <v-slide-y-transition mode="out-in">
          <router-view/>
        </v-slide-y-transition>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data() {
    return {
      drawer: true
    };
  }
};
</script>

<style>
#content {
  background: url("./assets/pattern.jpg") repeat;
}

a {
  text-decoration: none;
}
</style>