<template>
<v-layout column>
  <v-toolbar flat color="white">
    <v-spacer></v-spacer>
    <v-btn class="mb-2">
      New Label
    </v-btn>
  </v-toolbar>
  <v-data-table
    :headers="visibleAttributes"
    :items="labels"
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.classname }}</td>
      <td>{{ props.item.display_name }}</td>
    </template>
    <template slot="no-data">
    </template>
  </v-data-table>
</v-layout>
</template>

<script>
import store from "@/store";

export default {
  data: () => ({
    attributes: [
      { text: "ID", value: "id", visible: true, editable: false },
      { text: "Class name", value: "classname" },
      { text: "Display name", value: "display_name" }
    ]
  }),

  computed: {
    labels: () => store.getters.currentProjectLabels,

    visibleAttributes() {
      return this.attributes.filter(attr => attr.visible !== false);
    },

    editableAttributes() {
      return this.attributes.filter(attr => attr.editable !== false);
    }
  }
};
</script>

<style>
</style>
