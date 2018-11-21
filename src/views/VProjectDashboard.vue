<template>
  <v-layout row wrap>
    <v-flex xs12>
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
    >
      Are you sure you want to delete "{{ project.name }}" project?<br/>
      This action is is irreversible!
    </v-confirm-dialog>
    <v-confirm-dialog
      :dialog="deleteDeleteDialog"
      reverse-colors
    >
      Are you really sure?<br/>
      <strong> All project data will be lost!</strong>
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
      deleteDeleteDialog: true,
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
    openEditDialog() {
      this.editDialog = true;
    },

    closeEditDialog() {
      this.editDialog = false;
    },

    saveEdit() {
      store.dispatch("editProject", this.project);

      this.closeEditDialog();
    }
  }
};
</script>

<style>
</style>
