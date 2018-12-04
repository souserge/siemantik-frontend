<template>
  <v-dialog persistent v-model="dialog" max-width="1000px">
    <v-card>
      <v-card-title>
        <span class="headline">Select Documents</span>
      </v-card-title>

      <v-card-text>
        <v-toolbar flat color="white">
          <v-switch label="All" @click="addRemoveAll" v-model="allSwitch"></v-switch>
          <template v-if="actions">
            <v-switch label="Labelled" @click="addRemoveLabelled" v-model="labelledSwitch"></v-switch>
            <v-switch label="Unlabelled" @click="addRemoveUnlabelled" v-model="unlabelledSwitch"></v-switch>
          </template>
        </v-toolbar>
        <v-data-table :headers="headers" :items="documents" v-model="selected">
          <template slot="items" slot-scope="props">
            <td>
              <v-checkbox v-model="props.selected" hide-details></v-checkbox>
            </td>
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.title }}</td>
            <td>{{ getLabelText(props.item.label) }}</td>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="close">Close</v-btn>
        <v-btn color="primary" @click="select">Select</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import * as R from "ramda";
import Vue from "vue";

export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    selectAll: {
      type: Boolean,
      default: false
    },
    selectUnlabelled: {
      type: Boolean,
      default: false
    },
    actions: {
      type: Boolean,
      default: true
    },
    documents: Array,
    labels: Object
  },

  data() {
    return {
      selected: [],
      headers: [
        { text: "Include?", value: "selected" },
        { text: "Id", value: "id" },
        { text: "Title", value: "title" },
        { text: "Label", value: "label" }
      ],
      allSwitch: false,
      labelledSwitch: false,
      unlabelledSwitch: false
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

  watch: {
    documents() {
      if (this.allSwitch) {
        this.addRemoveAll();
      } else if (this.labelledSwitch) {
        this.addRemoveLabelled();
      } else if (this.unlabelledSwitch) {
        this.addRemoveUnlabelled();
      }
    }
  },

  methods: {
    addRemoveAll() {
      Vue.nextTick().then(() => {
        if (this.allSwitch) {
          this.selected = this.documents;
          this.labelledSwitch = true;
          this.unlabelledSwitch = true;
        } else {
          this.selected = [];
          this.labelledSwitch = false;
          this.unlabelledSwitch = false;
        }
      });
    },

    addRemoveLabelled() {
      Vue.nextTick().then(() => {
        if (this.labelledSwitch) {
          this.selected = this.selectDocs(this.labelledDocs);
          this.allSwitch = this.unlabelledSwitch;
        } else {
          this.selected = this.unselectDocs(this.labelledDocs);
          this.allSwitch = false;
        }
      });
    },

    addRemoveUnlabelled() {
      Vue.nextTick().then(() => {
        if (this.unlabelledSwitch) {
          this.selected = this.selectDocs(this.unlabelledDocs);
          this.allSwitch = this.labelledSwitch;
        } else {
          this.selected = this.unselectDocs(this.unlabelledDocs);
          this.allSwitch = false;
        }
      });
    },

    selectDocs(docs) {
      return R.unionWith(R.eqProps("id"), this.selected, docs);
    },

    unselectDocs(docs) {
      return R.differenceWith(R.eqProps("id"), this.selected, docs);
    },

    close() {
      this.$emit("close");
    },

    select() {
      this.$emit("select", this.selected);
    },

    getLabelText(label) {
      return label === null ? `--` : `${this.labels[label]} (${label})`;
    }
  },

  mounted() {
    if (this.selectAll) {
      this.allSwitch = true;
      this.selected = this.documents;
    } else if (this.selectUnlabelled) {
      this.unlabelledSwitch = true;
      this.selected = this.selectDocs(this.unlabelledDocs);
    }
  }
};
</script>

<style>
</style>
