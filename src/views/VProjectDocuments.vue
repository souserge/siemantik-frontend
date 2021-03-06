<template>
  <v-layout column>
    <v-toolbar flat color="white">
      <v-select v-model="showLabel" label="Filter by label" :items="showLabelOptions"></v-select>
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="search" label="Search for docs" single-line></v-text-field>

      <v-spacer></v-spacer>

      <v-btn @click.stop="openNewDocDialog" color="primary" dark class="mb-2">New document</v-btn>

      <v-btn
        color="primary"
        dark
        class="mb-2"
        @click="openImportDialog"
        :loading="importLoading"
      >Bulk Upload</v-btn>

      <v-btn
        color="primary"
        dark
        class="mb-2"
        @click.stop="exportDocuments"
        :loading="exportLoading"
      >Export</v-btn>

      <v-edit-dialog
        :attributes="editableAttributes"
        :dialog="newEditDocDialog"
        :item="newEditDocItem"
        :max-width="800"
        @save="saveNewEditDoc"
        @cancel="closeNewEditDocDialog"
      >Create/Edit document</v-edit-dialog>

      <v-confirm-dialog
        :dialog="deleteDocDialog"
        @confirm="deleteDoc"
        @cancel="closeDeleteDialog"
      >Are you sure you want to delete this document?
        <template v-if="deleteDocItem !== null" slot="additional-info">
          Title: {{ deleteDocItem.title }}
          <br>
          Label: {{ getLabelText(deleteDocItem.label) }}
        </template>
      </v-confirm-dialog>

      <v-import-dialog
        :dialog="importDialog"
        :labels="labels"
        @cancel="closeImportDialog"
        @upload="saveImportedDocuments"
      ></v-import-dialog>
    </v-toolbar>

    <v-data-table
      :headers="headers"
      :items="documentsFilteredByLabel"
      :loading="isLoading"
      :search="search"
      expand
    >
      <template slot="items" slot-scope="props">
        <td @click="showText(props)">{{ props.item.id }}</td>
        <td @click="showText(props)">{{ props.item.title }}</td>
        <td @click="showText(props)" :style="props.item.label === null ? 'opacity: 0.4' : ''">
          {{ getLabelText(props.item.label) }}
          <v-tooltip
            v-if="props.item.label !== null 
              && props.item.label !== undefined
              && !props.item.is_set_manually"
            bottom
          >
            <v-icon slot="activator">notification_important</v-icon>
            <span>This document was labelled automatically</span>
          </v-tooltip>
        </td>
        <td>
          <v-icon small class="mr-2" @click.stop="openEditDocDialog(props.item)">edit</v-icon>
          <v-icon small @click.stop="openDeleteDialog(props.item)">delete</v-icon>
        </td>
      </template>
      <template slot="expand" slot-scope="props">
        <v-progress-circular
          v-if="!props.item.text"
          style="margin: auto; display: block;"
          indeterminate
        ></v-progress-circular>
        <v-card v-else flat>
          <v-card-text>{{ props.item.text }}</v-card-text>
        </v-card>
      </template>
      <template slot="no-data"></template>
    </v-data-table>
  </v-layout>
</template>

<script>
import VEditDialog from "@/components/VEditDialog";
import VConfirmDialog from "@/components/VConfirmDialog";
import VImportDialog from "@/components/VImportDialog";
import store from "@/store";
import JSZip from "jszip";

const saveBlob = (function() {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return (filename, blob) => {
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(a.href);
  };
})();

const addNoLabelOption = (labelOptions) =>
  [{ text: "Unlabelled", value: null }].concat(labelOptions)

const addAllOption = (labelOptions) =>
  [{text: "All", value: -1 }].concat(labelOptions)

export default {
  components: {
    VEditDialog,
    VConfirmDialog,
    VImportDialog
  },

  data() {
    return {
      search: '',
      showLabel: -1,
      showLabelOptions:
        addAllOption(
          addNoLabelOption(
            store.getters.currentProjectLabelsDisplay)),
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
          options: addNoLabelOption(store.getters.currentProjectLabelsDisplay)
        },
        {
          text: "Body",
          value: "text",
          type: "textarea",
          rules: [
            v => !!v || "The body of the doc must be specified",
            v =>
              (v && v.length >= 50) ||
              `The body must be at least 50 characters (${(v || "").length}/50)`
          ],
          visible: false
        }
      ],
      newEditDocDialog: false,
      newEditDocItem: {},
      newEditDocDialogIsNew: false,
      deleteDocDialog: false,
      deleteDocItem: null,
      additionalHeaders: [
        { text: "Actions", value: "actions", sortable: false }
      ],
      exportLoading: false,
      importDialog: false,
      importLoading: false
    };
  },

  watch: {
    labels(newLabels) {
      const labelAttr = this.attributes.find(attr => attr.value === "label");
      labelAttr.options = newLabels;
      this.showLabelOptions = addAllOption(newLabels);
    }
  },

  computed: {
    labels: () => addNoLabelOption(store.getters.currentProjectLabelsDisplay),

    documents: () => store.getters.currentProjectDocuments,

    isLoading: () => store.getters.isCurrentProjectDocumentsLoading,

    documentsFilteredByLabel() {
      return this.showLabel === -1
        ? this.documents
        : this.documents.filter(d => d.label === this.showLabel)
    },

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
    },
  },

  methods: {
    openImportDialog() {
      this.importDialog = true;
    },

    getLabelText(labelId) {
      const label = this.labels.find(l => l.value === labelId);
      return label !== null && label !== undefined ? label.text : "–";
    },

    openNewDocDialog() {
      this.newEditDocDialog = true;
      this.newEditDocDialogIsNew = true;
    },

    openEditDocDialog(doc) {
      this.loadDocText(doc)
        .catch(msg => {
          store.commit("enqueueNotification", {
            type: "error",
            text: msg
          });
        })
        .then(() => {
          this.newEditDocItem = doc;
          this.newEditDocDialog = true;
          this.newEditDocDialogIsNew = false;
        });
    },

    loadDocText(doc) {
      return store.dispatch("getDocTextInProject", doc.id);
    },

    closeNewEditDocDialog() {
      this.newEditDocDialog = false;
      if (!this.newEditDocDialogIsNew) {
        this.newEditDocItem = {};
      }
    },

    saveNewEditDoc(doc) {
      const { title, text, label } = doc;
      if (this.newEditDocDialogIsNew) {
        store
          .dispatch("addNewDocToProject", { title, text, label })
          .then(() => {
            this.newEditDocItem = {};
          });
      } else {
        store
          .dispatch("editDocInProject", { id: doc.id, title, text, label })
          .then(() => {
            this.newEditDocItem = {};
          });
      }
      this.closeNewEditDocDialog();
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
    },

    showText(props) {
      if (props.expanded) {
        props.expanded = false;
      } else {
        props.expanded = true;
        this.loadDocText(props.item).catch(msg => {
          props.expanded = false;
          store.commit("enqueueNotification", {
            type: "error",
            text: msg
          });
        });
      }
    },

    exportDocuments() {
      this.exportLoading = true;
      const labelObj = {};
      const labelMeta = {};
      store.getters.currentProjectLabels.forEach(l => {
        labelObj[l.id] = [];
        labelMeta[l.id] = l;
      });
      labelObj["other"] = [];

      this.documents.forEach(d => {
        if (d.label === null || d.label === undefined) {
          labelObj["other"].push(d);
        } else {
          labelObj[d.label].push(d);
        }
      });

      const zip = new JSZip();

      const promiseArr = [];
      Object.keys(labelObj).forEach(key => {
        const foldername =
          key === "other" ? "unlabelled" : labelMeta[key].classname;
        const folder = zip.folder(foldername);
        labelObj[key].forEach(d => {
          const prom = this.loadDocText(d).then(text => {
            folder.file(`${d.title.replace("/", " ")}.txt`, text);
          });
          promiseArr.push(prom);
        });
      });

      Promise.all(promiseArr).then(() => {
        zip.generateAsync({ type: "blob" }).then(content => {
          saveBlob(`exported-data.zip`, content);
          this.exportLoading = false;
          store.commit("enqueueNotification", {
            type: "success",
            text: `${this.documents.length} documents were exported!`
          });
        });
      });
    },

    saveImportedDocuments(documents, label) {
      this.closeImportDialog();
      this.importLoading = true;

      store
        .dispatch("importDocumentsToProject", { documents, label })
        .then(() => {
          this.importLoading = false;
        });
    },

    closeImportDialog() {
      this.importDialog = false;
    }
  }
};
</script>

<style>
</style>
