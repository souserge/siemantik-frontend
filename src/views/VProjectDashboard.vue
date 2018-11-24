<template>
<v-layout row wrap style="background-color: white">
    <v-flex xs6>
      <v-card flat>
        <v-card-title style="font-weight: bold">
          Description:
        </v-card-title>
        <v-card-text>
          {{ description }}
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs6>
      <v-card flat>
        <table id="statsTable">
          <tr>
            <td class="statsTableHeader">Number of classes (labels):</td>
            <td>{{ numLabels }}</td>
          </tr>
          <tr>
            <td class="statsTableHeader">Number of documents:</td>
            <td>{{ numDocs }}</td>
          </tr>
          <tr>
            <td>... of which manually labelled:</td>
            <td>{{ numLabelledDocs }}</td>
          </tr>
          <tr>
            <td class="statsTableHeader">Number of documents by class</td>
            <td></td>
          </tr>
          <tr v-for="label in labels" :key="label.value">
            <td>- {{ label.text }}:</td>
            <td>{{ numDocsOfLabel(label.value) }}</td>
          </tr>
        </table>


        <v-card-text>
          <b></b> 
        </v-card-text>
        <v-card-text>
          <b></b> <br/>
          
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs6>
      <v-card flat text-xs-center>
        <v-card-text>
          <span style="font-weight: bold">Language: </span>
          {{ language }}
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs6>
      <v-card flat text-xs-center>
        <v-card-text>
          <span style="font-weight: bold">Classifier: </span>
          {{ classifier }}
        </v-card-text>
      </v-card>
    </v-flex>
    <v-toolbar flat color="white">
    <v-btn class="mb-2">
      Train classifier
    </v-btn>
    <v-btn class="mb-2">
      Classify unlabelled data
    </v-btn>
    <v-spacer></v-spacer>
    <!--
    <v-btn class="mb-2">
      Import model
    </v-btn>
    <v-btn class="mb-2">
      Export model
    </v-btn>
    -->
    <v-btn 
      @click.stop="openEditDialog"
      class="mb-2"
      color="primary"
    >
      Edit Project
    </v-btn>
    <v-btn 
      @click.stop="openDeleteDialog"
      class="mb-2"
      color="error"
      flat
    >
      Delete Project
    </v-btn>
    </v-toolbar>

    <v-edit-dialog
      :attributes="attributes"
      :dialog="editDialog"
      @save="saveEdit"
      @cancel="closeEditDialog"
      :item="project"
    >
      Edit Project
    </v-edit-dialog>

    <v-confirm-dialog
      :dialog="deleteDialog"
      @cancel="closeDeleteDialog"
      @confirm="openDeleteDeleteDialog"
    >
      <p>Are you sure you want to delete "{{ project.name }}" project?</p>
      <p>This action is irreversible!</p>
    </v-confirm-dialog>
    <v-confirm-dialog
      @cancel="closeDeleteDialog"
      @confirm="deleteProject"
      :dialog="deleteDeleteDialog"
      reverse-colors
    >
      <p>Are you really sure?</p>

      <p style="font-weight: bold;">All project data will be lost!</p>

      <template slot="cancel">
        Take me back to safety!
      </template>
      <template slot="action">
        yes, delete
      </template>
    </v-confirm-dialog>
  </v-layout>
</template>

<script>
import store from "@/store";
import VEditDialog from "@/components/VEditDialog";
import VConfirmDialog from "@/components/VConfirmDialog";

const keyValueObjToValueTextList = obj =>
  Object.keys(obj).map(k => ({
    text: obj[k],
    value: k
  }));

export default {
  props: {},

  components: {
    VEditDialog,
    VConfirmDialog
  },

  data() {
    return {
      attributes: [
        {
          value: "name",
          text: "Name"
        },
        {
          value: "description",
          text: "Description",
          type: "textarea"
        },
        {
          value: "classifier",
          text: "Classifier",
          type: "options",
          options: keyValueObjToValueTextList(store.state.classifiers)
        },
        {
          value: "language",
          text: "Language",
          type: "options",
          options: keyValueObjToValueTextList(store.state.languages)
        }
      ],
      editDialog: false,
      deleteDeleteDialog: false,
      deleteDialog: false
    };
  },

  watch: {
    classifierOptions(options) {
      const classifierAttr = this.attributes.find(
        attr => attr.value === "classifier"
      );
      classifierAttr.options = options;
    },

    languageOptions(options) {
      const languageAttr = this.attributes.find(
        attr => attr.value === "language"
      );
      languageAttr.options = options;
    }
  },

  computed: {
    documents: () => store.getters.currentProjectDocuments,

    labels: () => store.getters.currentProjectLabelsDisplay,

    numLabels() {
      return this.labels.length;
    },

    numDocs() {
      return this.documents.length;
    },

    labelledDocs() {
      return this.documents.filter(
        doc => doc.label !== null && doc.is_set_manually
      );
    },

    numLabelledDocs() {
      return this.labelledDocs.length;
    },

    project: () => Object.assign({}, store.state.currentProject.data),

    classifierOptions() {
      return keyValueObjToValueTextList(store.state.classifiers);
    },

    languageOptions() {
      return keyValueObjToValueTextList(store.state.languages);
    },

    language: () => store.getters.currentProjectLanguageDisplay || "Not set",

    classifier: () =>
      store.getters.currentProjectClassifierDisplay || "Not set",

    description: () =>
      store.getters.currentProjectDescriptionDisplay || "No description"
  },

  methods: {
    docsOfLabel(labelId) {
      return this.labelledDocs.filter(doc => doc.label === labelId);
    },

    numDocsOfLabel(labelId) {
      return this.docsOfLabel(labelId).length;
    },

    openEditDialog() {
      this.editDialog = true;
    },

    closeEditDialog() {
      this.editDialog = false;
    },

    saveEdit() {
      store.dispatch("editProject", this.project);

      this.closeEditDialog();
    },

    openDeleteDialog() {
      this.deleteDeleteDialog = false;
      this.deleteDialog = true;
    },

    openDeleteDeleteDialog() {
      this.deleteDialog = false;
      this.deleteDeleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.deleteDeleteDialog = false;
    },

    deleteProject() {
      store.dispatch("deleteProject").then(() => {
        this.$router.push({ name: "projects" });
      });
    }
  }
};
</script>

<style>
#statsTable {
  margin: auto;
}

#statsTable td {
  text-align: right;
  width: 50%;
  line-height: 1.8em;
}

#statsTable .statsTableHeader {
  font-weight: bold;
  text-align: left;
}

#statsTable tr td:last-child {
  text-align: center;
}
</style>
