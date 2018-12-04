<template>
  <v-dialog persistent v-model="dialog" max-width="1000px">
    <v-card>
      <v-card-title>
        <span class="headline">Classified Documents</span>
      </v-card-title>

      <v-card-text>
        <span
          v-if="labelledDocs.length > 0"
        >Accuracy based on {{ labelledDocs.length }} labelled documents is: {{ score() }} %</span>
        <br>
        <br>
        <span
          v-if="unlabelledDocs.length > 0"
        >Labels of {{ unlabelledDocs.length }} unlabelled documents were predicted</span>
        <v-data-table :headers="headers" :items="documents">
          <template slot="items" slot-scope="props">
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.title }}</td>
            <td>{{ getLabelText(props.item.label) }}</td>
            <td>{{ getLabelText(props.item.predictedLabel) }}</td>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="close">Close</v-btn>
        <v-btn
          color="primary"
          v-if="unlabelledDocs.length > 0"
          class="ml-3"
          @click="saveLabels"
        >Save Labels</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    documents: Array,
    labels: Object
  },

  data() {
    return {
      headers: [
        { text: "Id", value: "id" },
        { text: "Title", value: "title" },
        { text: "Set Label", value: "label" },
        { text: "Predicted Label", value: "predictedLabel" }
      ]
    };
  },

  computed: {
    unlabelledDocs() {
      return this.documents.filter(d => !d.is_set_manually);
    },

    labelledDocs() {
      return this.documents.filter(d => d.is_set_manually);
    }
  },

  methods: {
    saveLabels() {
      this.$emit("saveLabels", this.unlabelledDocs);
    },

    score() {
      return (
        (this.labelledDocs.filter(d => d.label === d.predictedLabel).length /
          this.labelledDocs.length) *
        100
      );
    },

    close() {
      this.$emit("close");
    },

    getLabelText(label) {
      return label === null ? `--` : `${this.labels[label]} (${label})`;
    }
  }
};
</script>

<style>
</style>
