<template>
<v-layout column>
  <v-toolbar flat color="white">
    <v-toolbar-title>
      <span class="px-2">#documents: {{ numberOfDocuments }},</span>
      <span> #labeled (manually): {{ numberOfLabeledDocuments }}</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn
      @click.stop="openNewDocDialog"
      color="primary"
      dark
      class="mb-2"
    >
      New document
    </v-btn>

    <v-btn
      color="primary"
      dark
      class="mb-2"
    >
      Label data
    </v-btn>

    <v-btn
      color="primary"
      dark
      class="mb-2"
    >
      Import
    </v-btn>

    <v-btn
      color="primary"
      dark
      class="mb-2"
    >
      Export
    </v-btn>


    <v-edit-dialog
      :attributes="editableAttributes"
      :dialog="newDocDialog"
      @save="saveNewDoc"
      @cancel="closeNewDocDialog"
    >
      Create new document
    </v-edit-dialog>

  </v-toolbar>


  <v-data-table
    :headers="visibleAttributes"
    :items="documents"
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.title }}</td>
      <td>
        <v-select
          v-model="props.item.label"
          :items="labels"
        ></v-select>
        </td>
      <td>{{ props.item.is_set_manually }}</td>

    </template>
    <template slot="no-data">
    </template>
  </v-data-table>
</v-layout>
</template>

<script>
import VEditDialog from "@/components/VEditDialog";
import store from "@/store";

export default {
  components: {
    VEditDialog
  },

  data() {
    return {
      attributes: [
        { text: "ID", value: "id", visible: true, editable: false },
        { text: "Title", value: "title" },
        {
          text: "Label",
          value: "label",
          type: "options",
          options: store.getters.currentProjectLabels
        },
        { text: "Body", value: "text", visible: false, type: "textarea" },
        { text: "Set manually?", value: "is_set_manually", editable: false }
      ],
      documents: [],
      newDocDialog: false
    };
  },

  watch: {
    labels(newLabels) {
      const labelAttr = this.attributes.find(attr => attr.value === "label");
      labelAttr.options = newLabels;
    }
  },

  computed: {
    labels: () => store.getters.currentProjectLabels,

    numberOfDocuments() {
      return this.documents.length;
    },

    numberOfLabeledDocuments() {
      return this.documents.filter(
        doc => doc.label !== null && doc.is_set_manually
      ).length;
    },

    visibleAttributes() {
      return this.attributes.filter(attr => attr.visible !== false);
    },

    editableAttributes() {
      return this.attributes.filter(attr => attr.editable !== false);
    }
  },

  methods: {
    openNewDocDialog() {
      this.newDocDialog = true;
    },

    closeNewDocDialog() {
      this.newDocDialog = false;
    },

    saveNewDoc(newDoc) {
      // if (this.editContext.isNew) {
      //   this.emitEvent("create", [], this.editContext.item);
      // } else {
      //   this.emitEvent(
      //     "update",
      //     [this.editContext.item.id],
      //     this.editContext.item
      //   );
      // }
      // this.closeEditDialog();
    }

    // deleteItem(item) {
    //   this.deleteContext.item = item;
    //   this.openDeleteDialog();
    // },

    // openDeleteDialog() {
    //   this.deleteContext.dialog = true;
    // },

    // closeDeleteDialog() {
    //   this.deleteContext.dialog = false;
    //   this.deleteContext.item = null;
    // },

    // confirmDelete() {
    //   this.emitEvent(
    //     "delete",
    //     [this.deleteContext.item.id],
    //     this.deleteContext.item
    //   );
    //   this.closeDeleteDialog();
    // }
  },

  mounted() {
    const projectUrl = `projects/${this.$route.params.id}/`;

    this.axios
      .get(`${projectUrl}documents/`)
      .then(({ data }) => this.documents.push(...data));
  }
};
</script>

<style>
</style>
