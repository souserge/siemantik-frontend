<template>
  <v-app>
    <the-notification-handler></the-notification-handler>
    <v-toolbar app id="nav" dark>
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
import TheNotificationHandler from "@/components/TheNotificationHandler";

export default {
  name: "App",

  components: {
    TheNotificationHandler
  },

  data() {
    return {
      drawer: true
    };
  }
};
</script>

<style>
#content {
  background: linear-gradient(#fd746c, #2c3e50);
}

#nav {
  background: #2c3e50;
}

a {
  text-decoration: none;
}

body {
  font-size: 15px;
}
</style>