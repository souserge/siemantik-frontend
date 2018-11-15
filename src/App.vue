<template>
  <v-app>
    <the-nav-drawer :is-opened="drawer"></the-nav-drawer>

    <v-toolbar app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="headline text-uppercase">
        <span>Siemantik</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        
        <v-slide-y-transition mode="out-in">
          <router-view/>
        </v-slide-y-transition>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import TheNavDrawer from '@/components/TheNavDrawer'

export default {
  name: 'App',
  components: {
    TheNavDrawer
  },

  data () {
    return {
      drawer: true,
    }
  }
}
</script>
