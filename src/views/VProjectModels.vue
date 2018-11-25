<template>
<v-layout column>
  <v-toolbar flat color="white">
    <v-spacer></v-spacer>
    <v-btn
      class="mb-2"
      color="primary"
      @click.stop="openNewLabelDialog"
    >
      New Model
    </v-btn>

    <v-edit-dialog
      :attributes="editableAttributes"
      :dialog="newEditLabelDialog"
      @save="saveNewEdit"
      @cancel="closeNewEditDialog"
      :item="newEditLabelItem"
    >
      Create new model
    </v-edit-dialog>
    
    <v-confirm-dialog
      :dialog="deleteLabelDialog"
      @confirm="deleteLabel"
      @cancel="closeDeleteDialog"
    >
      Are you sure you want to delete this Model?
      <template v-if="deleteLabelItem !== null" slot="additional-info">
        Classname: {{ deleteLabelItem.classname }} <br/>
        Display name: {{ deleteLabelItem.display_name || "None" }}
      </template>
    </v-confirm-dialog>
  </v-toolbar>
  <v-data-table
    :headers="headers"
    :items="labels"
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.classname }}</td>
      <td>{{ props.item.display_name }}</td>
      <td>
        <v-icon
          small
          class="mr-2"
          @click.stop="openEditLabelDialog(props.item)"
        >
          edit
        </v-icon>
        <v-icon
          small
          @click.stop="openDeleteDialog(props.item)"
        >
          delete
        </v-icon>
      </td>
    </template>
    <template slot="no-data">
    </template>
  </v-data-table>
</v-layout>
</template>

<script>
import store from "@/store";

import VEditDialog from "@/components/VEditDialog";
import VConfirmDialog from "@/components/VConfirmDialog";

export default {
  components: {
    VEditDialog,
    VConfirmDialog
  },

  data: () => ({
    attributes: [
      { text: "ID", value: "id", visible: true, editable: false },
      { text: "Class name", value: "classname" },
      { text: "Display name", value: "display_name" }
    ],
    newEditLabelDialog: false,
    newEditLabelItem: {},
    newEditLabelDialogIsNew: false,
    deleteLabelDialog: false,
    deleteLabelItem: null,
    additionalHeaders: [{ text: "Actions", value: "actions", sortable: false }]
  }),

  computed: {
    labels: () => store.getters.currentProjectLabels,

    visibleAttributes() {
      return this.attributes.filter(attr => attr.visible !== false);
    },

    editableAttributes() {
      return this.attributes.filter(attr => attr.editable !== false);
    },

    headers() {
      return this.visibleAttributes.concat(this.additionalHeaders);
    }
  },

  methods: {
    openNewLabelDialog() {
      this.newEditLabelDialog = true;
      this.newEditLabelDialogIsNew = true;
    },

    openEditLabelDialog(label) {
      this.newEditLabelItem = label;
      this.newEditLabelDialog = true;
      this.newEditLabelDialogIsNew = false;
    },

    closeNewEditDialog() {
      this.newEditLabelDialog = false;
      if (!this.newEditLabelDialogIsNew) {
        this.newEditLabelItem = {};
      }
    },

    saveNewEdit() {
      if (this.newEditLabelDialogIsNew) {
        store
          .dispatch("addNewLabelToProject", this.newEditLabelItem)
          .then(() => (this.newEditLabelItem = {}));
      } else {
        store.dispatch("editLabelInProject", this.newEditLabelItem);
      }
      this.closeNewEditDialog();
    },

    openDeleteDialog(label) {
      this.deleteLabelDialog = true;
      this.deleteLabelItem = label;
    },

    closeDeleteDialog() {
      this.deleteLabelDialog = false;
      this.deleteLabelItem = null;
    },

    deleteLabel() {
      store.dispatch("deleteLabelFromProject", this.deleteLabelItem.id);
      this.closeDeleteDialog();
    }
  }
};
</script>

<style>
</style>
