<template>
  <v-layout column>
    <v-toolbar flat color="white">
      <v-spacer></v-spacer>
      <v-btn class="mb-2" color="primary" @click.stop="openNewModelDialog">New Model</v-btn>

      <v-edit-dialog
        :attributes="editableAttributes"
        :dialog="newEditModelDialog"
        @save="saveNewEdit"
        @cancel="closeNewEditDialog"
        :item="newEditModelItem"
      >Create/Edit new model</v-edit-dialog>

      <v-confirm-dialog
        :dialog="deleteModelDialog"
        @confirm="deleteModel"
        @cancel="closeDeleteDialog"
      >
        Are you sure you want to delete model "{{
        deleteModelItem !== null ? deleteModelItem.name || deleteModelItem.id : ''
        }}"?
      </v-confirm-dialog>

      <v-pick-documents-dialog
        :actions="false"
        :select-all="true"
        :dialog="pickTrainDocsDialog"
        :documents="pickedTrainDocuments"
        :labels="labelsKV"
        @close="closeTrainDialog"
        @select="startTaining"
      ></v-pick-documents-dialog>
      <v-pick-documents-dialog
        :select-unlabelled="true"
        :select-all="false"
        :dialog="pickClassifyDocsDialog"
        :documents="pickedClassifyDocuments"
        :labels="labelsKV"
        @close="closeClassifyDialog"
        @select="startClassification"
      ></v-pick-documents-dialog>

      <v-classification-results-dialog
        :dialog="resultsDialog"
        :documents="classifiedDocuments"
        :labels="labelsKV"
        @close="closeResultsDialog"
        @saveLabels="saveLabels"
      ></v-classification-results-dialog>
    </v-toolbar>
    <v-data-table :headers="headers" :items="models">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ getAlgorithmName(props.item.used_algorithm) }}</td>
        <td>{{ props.item.cv_accuracy*100 }} %</td>
        <td>{{ getModelStatusName(props.item.model_status) }}</td>
        <td>
          <v-btn
            @click="train(props.item)"
            :disabled="props.item.model_status === MODEL_STATUSES.TRAINING"
          >train</v-btn>
          <v-btn
            @click="classify(props.item)"
            :disabled="props.item.model_status === MODEL_STATUSES.NOT_TRAINED"
          >classify</v-btn>
        </td>
        <td>
          <v-icon small class="mr-2" @click.stop="openEditModelDialog(props.item)">edit</v-icon>
          <v-icon small @click.stop="openDeleteDialog(props.item)">delete</v-icon>
        </td>
      </template>
      <template slot="no-data"></template>
    </v-data-table>
  </v-layout>
</template>

<script>
import * as R from "ramda";
import store from "@/store";
import { MODEL_STATUSES } from "@/store";
import VEditDialog from "@/components/VEditDialog";
import VConfirmDialog from "@/components/VConfirmDialog";
import VPickDocumentsDialog from "./../components/VPickDocumentsDialog";
import VClassificationResultsDialog from "@/components/VClassificationResultsDialog";

export default {
  components: {
    VEditDialog,
    VConfirmDialog,
    VPickDocumentsDialog,
    VClassificationResultsDialog
  },

  data: () => ({
    attributes: [
      { text: "ID", value: "id", editable: false },
      { text: "Name", value: "name" },
      {
        text: "Used algorithm",
        value: "used_algorithm",
        type: "options",
        options: store.getters.algorithmChoicesDisplay,
        editable: false
      },
      {
        text: "Cross validation accuracy",
        value: "cv_accuracy",
        editable: false
      },
      {
        text: "Status",
        value: "model_status",
        editable: false
      }
    ],
    newEditModelDialog: false,
    newEditModelItem: {},
    newEditModelDialogIsNew: false,
    deleteModelDialog: false,
    deleteModelItem: null,
    additionalHeaders: [
      { text: "Classifier", value: "classifier", sortable: false },
      { text: "Actions", value: "actions", sortable: false }
    ],
    MODEL_STATUSES,
    pickTrainDocsDialog: false,
    pickClassifyDocsDialog: false,
    selectedModel: null,
    classifiedDocuments: [],
    resultsDialog: false
  }),

  computed: {
    models: () => store.getters.currentProjectModels,

    visibleAttributes() {
      return this.attributes.filter(attr => attr.visible !== false);
    },

    editableAttributes() {
      return this.attributes.filter(attr => attr.editable !== false);
    },

    headers() {
      return this.visibleAttributes.concat(this.additionalHeaders);
    },

    pickedTrainDocuments() {
      return store.getters.currentProjectDocuments.filter(
        d => d.is_set_manually
      );
    },

    pickedClassifyDocuments() {
      return store.getters.currentProjectDocuments;
    },

    labelsKV() {
      return store.getters.currentProjectLabels.reduce(
        (acc, el) => R.set(R.lensProp(el.id), el.classname, acc),
        {}
      );
    }
  },

  methods: {
    saveLabels(docs) {
      store.dispatch("setLabelsForDocsInProject", {
        documents: docs.map(d => ({
          id: d.id,
          label: d.predictedLabel
        }))
      });
      this.closeResultsDialog();
    },

    startTaining(selectedDocuments) {
      const acc = {};
      selectedDocuments.forEach(doc => {
        if (acc[doc.label]) {
          acc[doc.label] += 1;
        } else {
          acc[doc.label] = 1;
        }
      });

      if (R.any(v => v < 3, Object.values(acc))) {
        store.commit("enqueueNotification", {
          type: "error",
          text: "Number of documents of each label has to be at least 3",
          timeout: 10000
        });
        return;
      }

      store.dispatch("trainModel", {
        id: this.selectedModel.id,
        documents: selectedDocuments.map(d => d.id)
      });
      this.closeTrainDialog();
    },

    closeTrainDialog() {
      this.pickTrainDocsDialog = false;
      this.selectedModel = null;
    },

    closeResultsDialog() {
      this.resultsDialog = false;
      this.classifiedDocuments = [];
    },

    closeClassifyDialog() {
      this.pickClassifyDocsDialog = false;
      this.selectedModel = null;
    },

    openResultsDialog(classifiedDocs, results) {
      this.classifiedDocuments = classifiedDocs.map(d => ({
        predictedLabel: results.find(r => r.id === d.id).label,
        ...d
      }));
      this.resultsDialog = true;
    },

    train(model) {
      this.selectedModel = model;
      this.pickTrainDocsDialog = true;
    },

    startClassification(selectedDocuments) {
      this.pickClassifyDocsDialog = false;
      store
        .dispatch("classifyDocuments", {
          id: this.selectedModel.id,
          documents: selectedDocuments.map(d => d.id)
        })
        .then(results => {
          this.openResultsDialog(selectedDocuments, results);
        });
    },

    classify(model) {
      this.selectedModel = model;
      this.pickClassifyDocsDialog = true;
    },

    getAlgorithmName(alg) {
      return store.state.algorithms[alg];
    },

    getModelStatusName(status) {
      return store.state.modelStatuses[status];
    },

    openNewModelDialog() {
      this.newEditModelDialog = true;
      this.newEditModelDialogIsNew = true;
      this.attributes.find(a => a.value === "used_algorithm").editable = true;
    },

    openEditModelDialog(model) {
      this.newEditModelItem = model;
      this.newEditModelDialog = true;
      this.newEditModelDialogIsNew = false;
    },

    closeNewEditDialog() {
      this.newEditModelDialog = false;
      this.attributes.find(a => a.value === "used_algorithm").editable = false;
      if (!this.newEditModelDialogIsNew) {
        this.newEditModelItem = {};
      }
    },

    saveNewEdit() {
      if (this.newEditModelDialogIsNew) {
        store
          .dispatch("addNewModelToProject", this.newEditModelItem)
          .then(() => (this.newEditModelItem = {}));
      } else {
        store.dispatch("editModelInProject", this.newEditModelItem);
      }
      this.closeNewEditDialog();
    },

    openDeleteDialog(model) {
      this.deleteModelDialog = true;
      this.deleteModelItem = model;
    },

    closeDeleteDialog() {
      this.deleteModelDialog = false;
      this.deleteModelItem = null;
    },

    deleteModel() {
      store.dispatch("deleteModelFromProject", this.deleteModelItem.id);
      this.closeDeleteDialog();
    }
  }
};
</script>

<style>
</style>
