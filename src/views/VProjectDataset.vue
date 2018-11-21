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
      :max-width="800"
      @save="saveNewDoc"
      @cancel="closeNewDocDialog"
      ref="editDialog"
    >
      Create/Edit document
    </v-edit-dialog>

    <v-confirm-dialog
      :dialog="deleteDocDialog"
      @confirm="deleteDoc"
      @cancel="closeDeleteDialog"
    >
      Are you sure you want to delete this document?
      <template v-if="deleteDocItem !== null" slot="additional-info">
        Title: {{ deleteDocItem.title }} <br/>
        Label: {{ getLabel(deleteDocItem.label) }}
      </template>
    </v-confirm-dialog>

  </v-toolbar>


  <v-data-table
    :headers="headers"
    :items="documents"
    :loading="isLoading"
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.title }}</td>
      <td>
        <v-select
          :value="props.item.label"
          :items="labels"
          @change="newLabel => changeLabel(props.item, newLabel)"
        ></v-select>
        </td>
      <td>{{ props.item.is_set_manually }}</td>
      <td>
        <v-icon
          small
          class="mr-2"
          @click.stop="editDoc(props.item)"
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
import VEditDialog from "@/components/VEditDialog";
import VConfirmDialog from "@/components/VConfirmDialog";
import store from "@/store";

export default {
  components: {
    VEditDialog,
    VConfirmDialog
  },

  data() {
    return {
      attributes: [
        { text: "ID", value: "id", visible: true, editable: false },
        {
          text: "Title",
          value: "title",
          rules: [
            v =>
              !v ||
              v.length <= 100 ||
              "Tilte cannot be longer than 100 characters"
          ]
        },
        {
          text: "Label",
          value: "label",
          type: "options",
          options: store.getters.currentProjectLabels
        },
        {
          text: "Body",
          value: "text",
          type: "textarea",
          rules: [
            v => !!v || "The body of the doc must be specified",
            v =>
              (v && v.length >= 50) || "The body must be at least 50 characters"
          ],
          visible: false
        },
        { text: "Set manually?", value: "is_set_manually", editable: false }
      ],
      newDocDialog: false,
      deleteDocDialog: false,
      deleteDocItem: null,
      additionalHeaders: [
        { text: "Actions", value: "actions", sortable: false }
      ]
    };
  },

  watch: {
    labels(newLabels) {
      const labelAttr = this.attributes.find(attr => attr.value === "label");
      labelAttr.options = newLabels;
    }
  },

  computed: {
    labels: () =>
      store.getters.currentProjectLabels.map(
        ({ id, classname, display_name }) => ({
          value: id,
          text: display_name ? `${display_name} (${classname})` : classname
        })
      ),

    documents: () => store.getters.currentProjectDocuments,

    isLoading: () => store.getters.isCurrentProjectDocumentsLoading,

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
    },

    headers() {
      return this.visibleAttributes.concat(this.additionalHeaders);
    }
  },

  methods: {
    changeLabel(doc, newLabel) {
      store.dispatch("editDocInProject", { id: doc.id, label: newLabel });
    },

    getLabel(labelId) {
      const label = this.labels.find(l => l.value === labelId);
      return label ? label.text : "None";
    },

    openNewDocDialog() {
      this.newDocDialog = true;
    },

    closeNewDocDialog() {
      this.newDocDialog = false;
    },

    saveNewDoc(newDoc) {
      const { title, text, label } = newDoc;
      store.dispatch("addNewDocToProject", { title, text, label }).then(() => {
        this.$refs.editDialog.item = {};
      });
      this.closeNewDocDialog();
    },

    openDeleteDialog(doc) {
      this.deleteDocDialog = true;
      this.deleteDocItem = doc;
    },

    closeDeleteDialog() {
      this.deleteDocDialog = false;
      this.deleteDocItem = null;
    },

    deleteDoc() {
      store.dispatch("deleteDocumentFromProject", this.deleteDocItem.id);
      this.closeDeleteDialog();
    }
  }
};
</script>

<style>
</style>
