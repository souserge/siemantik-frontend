<template>
<v-navigation-drawer v-model="isOpened" app>
    <v-list>
      <v-list-tile
        v-for="(item, idx) in items"
        :key="idx"
      >
        <v-list-tile-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title>
            <router-link :to="item.linkTo">
              {{ item.title }}
            </router-link>
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>

export default {
  props: {
    isOpened: Boolean,
  },

  data() {
    return {
      items: [
        { title: 'Projects', linkTo: { name: 'projects' } },
        { title: 'Settings', linkTo: { name: 'settings' } },
        { title: 'About the service', linkTo: { name: 'about' } },
      ],
    };
  },
};
</script>
