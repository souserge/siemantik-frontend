<template>
<v-dialog
  persistent
  v-model="dialog"
  max-width="700px"
  @keydown.esc="cancel"
>
  <v-card>
    <v-card-title>
      <span class="headline">
        Import data
      </span>
    </v-card-title>

    <v-card-text>
      <v-form>
        <v-select
          :value="label"
          :items="labels"
          persistent-hint
          hint="Imported documents will have this label automatically assigned"
          label="Select label"
          class="mb-4"
        ></v-select>
        <!--UPLOAD-->
        <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
          <div class="dropbox">
            <input
              type="file"
              multiple
              :name="uploadFieldName"
              :disabled="isSaving"
              @change="filesChange($event.target.name, $event.target.files)"
              class="input-file"
            >
          </div>
        </form>
      </v-form>
      <v-progress-linear v-if="importProgress > 0" v-model="importProgressPercentage"></v-progress-linear>
      <span v-if="importProgress === numImportedDocs" class="headline">Upload done! {{ numImportedDocs }} documents were imported!</span>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="cancel">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
const processFileName = n => n.split(".")[0].trim();

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = r =>
      resolve({
        title: processFileName(file.name),
        text: r.target.result
      });

    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function filesToTexts(files) {
  return Array.from(files).map(fileToText);
}

export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    },

    labels: {
      type: Array
    },
    label: {
      type: Number,
      default: -1
    }
  },

  data() {
    return {
      fileCount: 0,
      isInitial: true,
      isSaving: false,
      uploadFieldName: "Import data",
      importProgress: 0,
      numImportedDocs: -1
    };
  },

  computed: {
    importProgressPercentage() {
      return (this.importProgress / this.numImportedDocs) * 100;
    }
  },

  methods: {
    cancel() {
      this.$emit("cancel");
    },

    filesChange(name, files) {
      this.numImportedDocs = files.length;
      Promise.all(
        filesToTexts(files).map(f =>
          f.then(t => {
            this.importProgress += 1;
            return t;
          })
        )
      ).then(data => {
        this.$emit("documentsLoaded", data, this.label);
      });
    }
  }
};
</script>

<style>
</style>
