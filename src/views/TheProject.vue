<template>
<v-layout column>
  <v-toolbar flat color="white">
    <v-toolbar-title>
      {{ name }} (lang: {{ language }})
    </v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <v-data-table
    :headers="documentHeaders"
    :items="documents"
    hide-actions
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.title }}</td>
      <td>
        <v-select
          v-model="props.item.label"
          :label="labels[pops.item.label]"
          :items="labels"
        ></v-select>
        {{ props.item.label }}
        </td>
      <td>{{ props.item.is_set_manually }}</td>

    </template>
    <template slot="no-data">
    </template>
  </v-data-table>
</v-layout>
</template>

<script>
export default {
  data: () => ({
    name: '',
    language: '',
    documentHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Title', value: 'title' },
      { text: 'Label', value: 'label' },
      { text: 'Set manually?', value: 'is_set_manually' }
    ],
    documents: [],
    labels: [],
  }),

  mounted() {
    const projectUrl = `projects/${this.$route.params.id}/`

    this.axios.get(projectUrl)
      .then(({ data: { name, language, document_set, label_set } }) => {
        this.name = name;
        this.language = language;
      })

    this.axios.get(`${projectUrl}labels/`)
      .then(({ data }) => 
        this.labels.push(...data.map(l => ({ value: l.id, text: l.classname}))))

    this.axios.get(`${projectUrl}documents/`)
      .then(({ data }) => this.documents.push(...data))
  }
}
</script>

<style>

</style>
